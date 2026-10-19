"""Roadmap: the master checklist (ai-context/roadmap.md) and the dashboard file (ai-context/roadmap.json).

Sources: ai-context/5w.md (deadline, phase, links), .agents/milestones.json (the plan, written by /roadmap)
and the task files, live and archived. Single writer: `done` in the main checkout, `worktree finish` and
`gate.py roadmap` write both files; task branches never do. roadmap.json is a contract that dashboards read
from every repo (.agents/skills/roadmap/format.md): changing its shape means a new format, roadmap/2.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path

from . import core, tasks

FORMAT = "roadmap/1"
MILESTONES_JSON = core.AGENTS_DIR / "milestones.json"
FIVE_W = core.ROOT / "ai-context" / "5w.md"
OUT_MD = core.ROOT / "ai-context" / "roadmap.md"
OUT_JSON = core.ROOT / "ai-context" / "roadmap.json"
DATE_RE = re.compile(r"\b\d{4}-\d{2}-\d{2}\b")
URL_RE = re.compile(r"https?://[^\s)>\]]+")
NEXT_UP = 3


class RoadmapError(Exception):
    pass


def valid_date(text: str) -> bool:
    try:
        date.fromisoformat(text)
        return True
    except ValueError:
        return False


def five_w_field(text: str, label: str) -> str | None:
    """The value after `- **<label>...:**`. None if the line is missing; "" if empty, a placeholder or `none`."""
    m = re.search(rf"(?mi)^\s*-\s*\*\*{label}[^*:]*:\*\*[ \t]*(.*)$", text)
    if not m:
        return None
    value = m.group(1).replace("★", "").strip()  # ★ marks the labels this module reads
    return "" if not value or "{{" in value or value.lower() in ("none", "n/a", "-", "tbc") else value


def read_five_w(problems: list[dict]) -> dict:
    text = core.read_text(FIVE_W) if FIVE_W.exists() else ""
    meta = core.parse_frontmatter(text) or {}
    deadline = {"date": None, "type": "none", "due": five_w_field(text, "Due by then") or ""}
    line = five_w_field(text, "Deadline")
    if line is None:
        problems.append({"code": "no_deadline_line", "detail": "ai-context/5w.md has no `- **Deadline:**` line - run /roadmap"})
    elif line:
        found = DATE_RE.search(line)
        if not found or not valid_date(found.group(0)):
            problems.append({"code": "bad_date", "detail": f"5w.md Deadline {line!r}: write YYYY-MM-DD (hard|soft), or none"})
        else:
            deadline["date"] = found.group(0)
            deadline["type"] = "hard" if re.search(r"\bhard\b", line, re.I) else "soft"

    def link(label: str) -> str | None:
        found = URL_RE.search(five_w_field(text, label) or "")
        return found.group(0) if found else None

    stack = meta.get("stack", [])
    return {"project": str(meta.get("project") or core.ROOT.name), "one_liner": five_w_field(text, "What this project is") or "",
            "phase": five_w_field(text, "Current phase") or "", "onboarded": meta.get("status") == "confirmed",
            "stack": stack if isinstance(stack, list) else [stack] if stack else [],
            "links": {"live": link("Live URL"), "preview": link("Preview URL")},
            "deadline": deadline, "cadence": five_w_field(text, "Cadence") or ""}


def load_plan() -> dict | None:
    if not MILESTONES_JSON.exists():
        return None
    try:
        plan = json.loads(core.read_text(MILESTONES_JSON))
    except json.JSONDecodeError as e:
        raise RoadmapError(f".agents/milestones.json is not valid JSON (line {e.lineno}): {e.msg}")
    if not isinstance(plan, dict) or not isinstance(plan.get("milestones", []), list):
        raise RoadmapError(".agents/milestones.json needs a `milestones` list")
    return plan


def all_tasks() -> list[tuple[tasks.Task, bool]]:
    """Live tasks, then archived ones (always done), each with an `archived` flag."""
    found = [(t, False) for t in tasks.load_tasks()]
    seen = {t.id for t, _ in found}
    folder = core.ARCHIVE_DIR / "tasks"
    for path in sorted(folder.rglob("TASK-*.md")) if folder.is_dir() else []:
        meta = core.parse_frontmatter(core.read_text(path))
        task = tasks.Task(path, meta) if meta is not None else None
        if task and task.id not in seen:
            found.append((task, True))
            seen.add(task.id)
    return found


def task_status(task: tasks.Task, archived: bool) -> str:
    if archived or task.status == "done":
        return "done"
    return task.status if task.status in ("blocked", "parked") else "todo"


def build() -> dict:
    """Everything both files show. Raises RoadmapError when milestones.json is unusable."""
    plan = load_plan() or {"milestones": [], "later": []}
    problems: list[dict] = []
    gate = core.load_gate(required=False)
    data = {"format": FORMAT, "generated_at": core.now(), "branch": gate.get("main_branch", "main")}
    data["release_branch"] = gate.get("release_branch", data["branch"])  # one-branch projects: the same branch
    data.update(read_five_w(problems))
    deadline = data["deadline"]["date"]

    milestones, order, last_target = [], {}, ""
    for i, m in enumerate(plan.get("milestones", [])):
        mid, target = str(m.get("id", "")).strip(), str(m.get("target") or "").strip()
        if not mid or mid in order:
            problems.append({"code": "unknown_milestone", "detail": f"milestone #{i + 1} has a missing or duplicate id {mid!r}"})
            continue
        if target and not valid_date(target):
            problems.append({"code": "bad_date", "detail": f"{mid} target {target!r} is not YYYY-MM-DD"})
            target = ""
        if target and target < last_target:
            problems.append({"code": "targets_out_of_order", "detail": f"{mid} target {target} is before {last_target}"})
        if target and deadline and target > deadline:
            problems.append({"code": "target_after_deadline", "detail": f"{mid} target {target} is after the deadline {deadline}"})
        last_target = max(last_target, target)
        order[mid] = len(milestones)
        milestones.append({"id": mid, "title": str(m.get("title", "")), "goal": str(m.get("goal", "")), "target": target or None,
                           "status": "not started", "done": 0, "total": 0, "finished": None})

    found = all_tasks()
    status = {t.id: task_status(t, archived) for t, archived in found}
    by_id = {t.id: t for t, _ in found}
    rows, counts = [], {"ready": 0, "waiting_on_tasks": 0, "blocked_on_owner": 0, "parked": 0}
    next_up, waiting, done_tasks = [], [], []
    for task, archived in found:
        st, mid = status[task.id], task.get("milestone") or None
        if mid and mid not in order:
            problems.append({"code": "unknown_milestone", "detail": f"{task.id} names milestone {mid!r}, which isn't in milestones.json"})
        if st == "done":
            done_tasks.append(task)
        if st in ("todo", "blocked") and not mid and plan.get("milestones"):
            problems.append({"code": "task_without_milestone", "detail": f"{task.id} is open but has no milestone"})
        for dep in task.deps if st != "done" else []:
            dep_ms = (by_id[dep].get("milestone") or None) if dep in by_id else None
            if mid in order and dep_ms in order and order[dep_ms] > order[mid]:
                problems.append({"code": "milestone_order", "detail": f"{task.id} ({mid}) depends on {dep} ({dep_ms})"})
            if st == "todo" and status.get(dep) == "parked":
                problems.append({"code": "depends_on_parked", "detail": f"{task.id} depends on parked {dep} - park it too, or un-park {dep}"})
        if st == "parked":
            counts["parked"] += 1
        elif st == "blocked":
            counts["blocked_on_owner"] += 1
            waiting.append({"id": task.id, "title": task.title, "reason": task.get("blocked_reason")})
        elif st == "todo":
            pending = [d for d in task.deps if status.get(d) != "done"]
            counts["waiting_on_tasks" if pending else "ready"] += 1
            if not pending:
                next_up.append(task)
        if mid in order and st != "parked":
            ms = milestones[order[mid]]
            ms["total"] += 1
            if st == "done":
                ms["done"] += 1
                ms["finished"] = max(ms["finished"] or "", task.get("done") or "") or None
        rows.append({"id": task.id, "title": task.title, "milestone": mid, "size": task.size, "status": st,
                     "done": (task.get("done") or None) if st == "done" else None, "blocked_reason": task.get("blocked_reason") or None})

    for ms in milestones:
        ms["status"] = "done" if ms["total"] and ms["done"] == ms["total"] else "started" if ms["done"] else "not started"
        ms["finished"] = ms["finished"] if ms["status"] == "done" else None
    rank = lambda t: (order.get(t.get("milestone"), len(order)), t.id)  # noqa: E731
    last = max(done_tasks, key=lambda t: (t.get("done"), t.id), default=None)
    total = sum(m["total"] for m in milestones)
    data.update({
        "current_milestone": next((m["id"] for m in milestones if m["total"] and m["status"] != "done"), None),
        "counts": {"tasks_done": sum(m["done"] for m in milestones), "tasks_total": total, **counts,
                   "later_ideas": len(plan.get("later", []))},
        "next_up": [{"id": t.id, "title": t.title, "milestone": t.get("milestone") or None} for t in sorted(next_up, key=rank)[:NEXT_UP]],
        "waiting_on_owner": waiting,
        "last_done": {"id": last.id, "title": last.title, "date": last.get("done") or None} if last else None,
        "milestones": milestones,
        "tasks": sorted(rows, key=lambda r: r["id"]),
        "later": [str(x) for x in plan.get("later", [])],
        "problems": problems})
    return data


def render_md(data: dict) -> str:
    c, dl = data["counts"], data["deadline"]
    out = ["---", "type: roadmap", f"format: {FORMAT}", f'project: "{data["project"]}"',
           f"updated: {data['generated_at'][:10]}", "---", "", f"# Master checklist — {data['project']}", "",
           "Generated by `python scripts/gate.py roadmap` from `5w.md`, `.agents/milestones.json` and the task files.",
           "Never edit it by hand: change the plan with `/roadmap`. Dashboards read `roadmap.json` next to this file.", ""]
    when = f"{dl['date']} ({dl['type']})" if dl["date"] else "none set"
    out.append(f"**Deadline:** {when}" + (f" — {dl['due']}" if dl["due"] else ""))
    out.append(f"**Up to:** {up_to(data)} — {c['tasks_done']} of {c['tasks_total']} tasks done")
    if data["next_up"]:
        out.append("**Next up:** " + "; ".join(f"{t['id']} {t['title']}" for t in data["next_up"]))
    if data["waiting_on_owner"]:
        out.append("**Waiting on the owner:** " + "; ".join(
            f"{t['id']} {t['title']}" + (f" ({t['reason']})" if t["reason"] else "") for t in data["waiting_on_owner"]))
    by_ms: dict = {}
    for t in data["tasks"]:
        by_ms.setdefault(t["milestone"] if t["status"] != "parked" else "__later", []).append(t)
    for m in data["milestones"]:
        out += ["", f"## {m['id']} — {m['title']} · target {m['target'] or 'not set'} · {m['status']}"]
        if m["goal"]:
            out.append(f"You'll be able to: {m['goal']}")
        if m["status"] == "done":
            out.append(f"- [x] All {m['total']} tasks done · finished {m['finished'] or '?'}")
            continue
        out += [tick(t) for t in by_ms.get(m["id"], [])] or ["- (no tasks yet)"]
    known = {m["id"] for m in data["milestones"]}
    loose = [t for t in data["tasks"] if t["status"] != "parked" and t["milestone"] not in known]
    if loose:
        out += ["", "## Not in a milestone"] + [tick(t) for t in loose if t["status"] != "done"]
        done_loose = sum(t["status"] == "done" for t in loose)
        out += [f"- [x] {done_loose} other task(s) done"] if done_loose else []
    if by_ms.get("__later") or data["later"]:
        out += ["", "## After launch (parked)"] + [tick(t) for t in by_ms.get("__later", [])] + [f"- {x}" for x in data["later"]]
    if data["problems"]:
        out += ["", "## Problems"] + [f"- `{p['code']}`: {p['detail']}" for p in data["problems"]]
    return "\n".join(out) + "\n"


def tick(t: dict) -> str:
    note = {"done": f" · done {t['done'] or '?'}", "blocked": " · blocked" + (f": {t['blocked_reason']}" if t["blocked_reason"] else ""),
            "parked": " · parked"}.get(t["status"], "")
    return f"- [{'x' if t['status'] == 'done' else ' '}] {t['id']} {t['title']}{note}"


def same(a: dict, b: dict) -> bool:
    return {**a, "generated_at": ""} == {**b, "generated_at": ""}


def current_json() -> dict | None:
    try:
        return json.loads(core.read_text(OUT_JSON)) if OUT_JSON.exists() else None
    except json.JSONDecodeError:
        return None


def is_stale(data: dict) -> bool:
    old = current_json()
    return old is None or not same(old, data) or not OUT_MD.exists()


def write(data: dict | None = None) -> list[Path]:
    """Regenerate both files if the content changed. Never raises: `done` must not break over the roadmap."""
    if not MILESTONES_JSON.exists():
        return []
    try:
        data = data or build()
    except RoadmapError as e:
        print(f"WARN: roadmap not updated - {e}")
        return []
    old = current_json()
    if old and same(old, data):
        data["generated_at"] = old.get("generated_at", data["generated_at"])
    written = []
    for path, text in ((OUT_JSON, json.dumps(data, indent=2, ensure_ascii=False) + "\n"), (OUT_MD, render_md(data))):
        if not path.exists() or core.read_text(path) != text:
            core.write_text(path, text)
            written.append(path)
    return written


def up_to(data: dict) -> str:
    ms = next((m for m in data["milestones"] if m["id"] == data["current_milestone"]), None)
    if ms:
        return f"{ms['id']} {ms['title']}"
    return "all milestones done" if data["counts"]["tasks_total"] else "no tasks in milestones yet"


def headline(data: dict) -> str:
    c, dl = data["counts"], data["deadline"]
    return (f"ROADMAP  up to {up_to(data)} | {c['tasks_done']}/{c['tasks_total']} tasks | deadline "
            + (f"{dl['date']} ({dl['type']})" if dl["date"] else "none"))


def local_warnings(data: dict) -> list[str]:
    """Checks that depend on this machine's clone, so they're printed, never written into roadmap.json."""
    origin = core.git_lines("symbolic-ref", "--short", "refs/remotes/origin/HEAD") if core.in_git() else None
    default = origin[0].removeprefix("origin/") if origin else None
    if default and default != data["branch"]:
        return [f"WARN: GitHub's default branch is {default}, but gate.json main_branch is {data['branch']}. "
                "Dashboards read the default branch first, then main - align them or tell the owner."]
    return []


def status_lines() -> tuple[list[str], list[str]]:
    """For `gate.py status` / `next`: (lines to print, problems). Quiet before any roadmap or real tasks exist."""
    if not MILESTONES_JSON.exists():
        if any(t.id != "TASK-0001" for t in tasks.load_tasks()):
            return ["ROADMAP  none yet - run /roadmap (onboarding step 9)"], []
        return [], []
    try:
        data = build()
    except RoadmapError as e:
        return [], [f"roadmap: {e}"]
    lines = [headline(data)] + local_warnings(data)
    if is_stale(data):
        lines.append("WARN: ai-context/roadmap.md/.json are out of date - run `python scripts/gate.py roadmap`")
    return lines, [f"roadmap {p['code']}: {p['detail']}" for p in data["problems"]]


def cmd_roadmap(args: argparse.Namespace) -> None:
    if not MILESTONES_JSON.exists():
        core.die("NO ROADMAP: .agents/milestones.json doesn't exist yet - run /roadmap (onboarding step 9)")
    try:
        data = build()
    except RoadmapError as e:
        core.die(f"ERROR: {e}")
    stale = False
    if args.check:
        stale = is_stale(data)
    else:
        written = write(data)
        print("WROTE: " + ", ".join(core.rel(p) for p in written) if written else "UNCHANGED: ai-context/roadmap.md, roadmap.json")
    print(headline(data))
    for line in local_warnings(data):
        print(line)
    if stale:
        print("STALE: ai-context/roadmap.md/.json don't match the task files - run `python scripts/gate.py roadmap`")
    if data["problems"]:
        print("PROBLEMS")
        for p in data["problems"]:
            print(f"  {p['code']}: {p['detail']}")
    sys.exit(1 if stale or data["problems"] else 0)
