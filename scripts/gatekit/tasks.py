"""Tasks: the DAG, status / next, zone locks, and done."""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from dataclasses import dataclass
from pathlib import Path

from . import checks, core, memory, worktree, zones

STATUSES = ("todo", "in-progress", "blocked", "parked", "done")  # parked: deferred by the owner, never ready
SIZES = ("tiny", "standard", "risky")
ORDER = {"in-progress": 0, "ready": 1, "waiting": 2, "blocked": 3, "parked": 4, "done": 5}


@dataclass
class Task:
    path: Path
    meta: dict

    def get(self, key: str, default: str = "") -> str:
        value = self.meta.get(key, default)
        return value if isinstance(value, str) else default

    def get_list(self, key: str) -> list[str]:
        value = self.meta.get(key, [])
        return value if isinstance(value, list) else ([value] if value else [])

    @property
    def id(self) -> str:
        m = re.match(r"(TASK-\d+)", self.path.name)
        return (self.get("id") or (m.group(1) if m else self.path.stem)).upper()

    @property
    def title(self) -> str:
        return self.get("title", self.path.stem)

    @property
    def zone(self) -> str:
        return self.get("zone")

    @property
    def domain(self) -> str:
        return self.get("domain")

    @property
    def size(self) -> str:
        return self.get("size").lower()

    @property
    def status(self) -> str:
        return self.get("status").lower() or "todo"

    @property
    def deps(self) -> list[str]:
        return [d.upper() for d in self.get_list("depends_on")]

    @property
    def verify(self) -> list[str] | None:
        return self.get_list("verify") if "verify" in self.meta else None

    def set(self, key: str, value: str | list[str]) -> None:
        core.set_field(self.path, key, value)
        self.meta[key] = value


def load_tasks(folder: Path | None = None) -> list[Task]:
    folder = folder or core.TASKS_DIR
    tasks = []
    if folder.is_dir():
        for path in sorted(folder.glob("TASK-*.md")):
            meta = core.parse_frontmatter(core.read_text(path))
            if meta is None:
                print(f"WARN: {core.rel(path)} has no frontmatter - skipped")
                continue
            tasks.append(Task(path, meta))
    return tasks


def archived_ids() -> set[str]:
    folder = core.ARCHIVE_DIR / "tasks"
    if not folder.is_dir():
        return set()
    return {m.group(1).upper() for p in folder.rglob("TASK-*.md") if (m := re.match(r"(TASK-\d+)", p.name))}


def finished_ids() -> set[str]:
    """Done tasks, live or archived. A zone lock still held by one is only waiting for its commit."""
    return {t.id for t in load_tasks() if t.status == "done"} | archived_ids()


def find_task(task_id: str, required: bool = True) -> Task | None:
    for task in load_tasks():
        if task.id == task_id.upper():
            return task
    if required:
        die_msg = f"ERROR: no task {task_id} in .agents/tasks/"
        if task_id.upper() in archived_ids():
            die_msg += " (it is done and archived - see `python scripts/gate.py search " + task_id + "`)"
        core.die(die_msg)
    return None


def analyse(tasks: list[Task], zm) -> tuple[list, list[str], dict]:
    by_id: dict[str, Task] = {}
    problems: list[str] = []
    done_ids = archived_ids()
    for task in tasks:
        if task.id in by_id:
            problems.append(f"duplicate task id {task.id} ({core.rel(task.path)})")
        by_id[task.id] = task
        if task.status not in STATUSES:
            problems.append(f"{task.id}: unknown status {task.status!r} ({' | '.join(STATUSES)})")
        if task.size and task.size not in SIZES:
            problems.append(f"{task.id}: unknown size {task.size!r} ({' | '.join(SIZES)})")
        if task.zone and zm and zm.canon(task.zone) is None:
            problems.append(f"{task.id}: unknown zone {task.zone!r}")
    known = set(by_id) | done_ids
    for task in tasks:
        problems += [f"{task.id}: depends on unknown {d}" for d in task.deps if d not in known]

    state: dict[str, int] = {}

    def visit(tid: str, stack: list[str]) -> None:
        state[tid] = 1
        stack.append(tid)
        for dep in by_id[tid].deps:
            if dep in by_id and state.get(dep) == 1:
                problems.append("cycle: " + " -> ".join(stack[stack.index(dep):] + [dep]))
            elif dep in by_id and dep not in state:
                visit(dep, stack)
        stack.pop()
        state[tid] = 2

    for tid in by_id:
        if tid not in state:
            visit(tid, [])

    locks = core.load_locks()
    finished = done_ids | {t.id for t in tasks if t.status == "done"}
    holders = core.lock_holders() - finished
    rows = []
    for task in tasks:
        if task.status != "todo":
            rows.append((task.status if task.status in STATUSES else "blocked", task, ""))
            continue
        if task.id in holders:
            rows.append(("in-progress", task, "(in a worktree)"))
            continue
        pending = [d for d in task.deps if d not in done_ids and (d not in by_id or by_id[d].status != "done")]
        if pending:
            rows.append(("waiting", task, "<- " + ", ".join(pending)))
            continue
        zone = zones.soft_canon(task.zone, zm)
        holder = str(locks.get(zone, {}).get("task", "")) if zone in locks else ""
        if zone in locks and holder.upper() != task.id and holder.upper() not in finished:
            rows.append(("waiting", task, f"<- zone {zone} locked by {holder or 'unknown'}"))
            continue
        rows.append(("ready", task, ""))
    return rows, problems, locks


def cmd_status(args: argparse.Namespace) -> None:
    from . import roadmap
    zm = zones.load_zones()
    rows, problems, locks = analyse(load_tasks(), zm)
    counts = Counter(s for s, _, _ in rows)
    archived = len(archived_ids())
    print(f"TASKS  {len(rows)} live | " + " | ".join(f"{counts.get(k, 0)} {k}" for k in ORDER)
          + (f" | {archived} archived" if archived else ""))
    for status, task, note in sorted(rows, key=lambda r: (ORDER[r[0]], r[1].id)):
        zone = f"[{task.zone}] " if task.zone else ""
        print(f"  {status:<11} {task.id}  {zone}{task.title}" + (f"  {note}" if note else ""))
    stale_after = float(core.load_gate(required=False).get("stale_lock_hours", 24))
    print("LOCKS" + ("" if locks else "  none"))
    finished = finished_ids()
    for zone, data in locks.items():
        hours = core.age_hours(data.get("started"))
        stale = hours is None or hours > stale_after
        age = f"{hours:.0f}h" if hours is not None else "unknown age"
        if str(data.get("task", "")).upper() in finished:
            print(f"  zone {zone}  {data.get('task')}  done - released after its files are committed (doesn't block other tasks)")
            continue
        print(f"  {'STALE ' if stale else ''}zone {zone}  {data.get('task') or '-'}  since {data.get('started', '?')} ({age})")
    worktree.print_summary()
    lines, roadmap_problems = roadmap.status_lines()
    for line in lines:
        print(line)
    problems += roadmap_problems
    if core.in_git() and not zones.hook_installed():
        print("WARN: pre-commit hook not installed - run `python scripts/gate.py install-hooks`")
    if problems:
        print("PROBLEMS")
        for problem in problems:
            print(f"  {problem}")
        sys.exit(1)


def cmd_next(args: argparse.Namespace) -> None:
    from . import roadmap
    rows, problems, _ = analyse(load_tasks(), zones.load_zones())
    if problems:
        print("WARN: the task DAG has problems - run `python scripts/gate.py status`")
    for line in roadmap.status_lines()[0]:
        if line.startswith("WARN"):
            print(line)
    for status, task, note in rows:
        if status == "in-progress":
            print(f"IN PROGRESS: {task.id}  {task.title}  {note or '(resume or finish first)'}")
    ready = [task for status, task, _ in rows if status == "ready"]
    if not ready:
        core.die("NONE READY - see `python scripts/gate.py status`")
    task = ready[0]
    zone = f"[zone {task.zone}] " if task.zone else ""
    print(f"NEXT: {task.id}  {zone}{task.title}  ({core.rel(task.path)})")


def take_lock(task: Task, zm) -> str | None:
    """Lock the task's zone (if it has one). Returns the zone id, dies if held by another task."""
    if not task.zone:
        return None
    zone = zones.canon_zone(task.zone, zm)
    core.locks_dir().mkdir(parents=True, exist_ok=True)
    holder = str(core.load_locks().get(zone, {}).get("task", "")).upper()
    if holder and holder != task.id and holder in finished_ids():
        core.lock_path(zone).unlink(missing_ok=True)  # its task is done; the lock was only waiting for the commit
    try:
        with open(core.lock_path(zone), "x", encoding="utf-8", newline="\n") as fh:
            json.dump({"zone": zone, "task": task.id, "started": core.now()}, fh, indent=2)
            fh.write("\n")
    except FileExistsError:
        held = core.load_locks().get(zone, {})
        if str(held.get("task", "")).upper() != task.id:
            core.die(f"LOCKED: zone {zone} is held by {held.get('task') or 'unknown'} since "
                     f"{held.get('started', '?')}. Pick another ready task, or ask the owner - never break a lock.")
    return zone


def release_locks(task_id: str) -> list[str]:
    released = []
    for zone, data in core.load_locks().items():
        if str(data.get("task", "")).upper() == task_id.upper():
            core.lock_path(zone).unlink()
            released.append(zone)
    return released


def cmd_lock(args: argparse.Namespace) -> None:
    zm = zones.load_zones()
    zone = zones.canon_zone(args.zone, zm)
    task = find_task(args.task)
    if task.status == "done":
        core.die(f"REFUSED: {task.id} is already done")
    if task.zone and zones.soft_canon(task.zone, zm) != zone:
        core.die(f"REFUSED: {task.id} belongs to zone {task.zone}, not {zone}")
    if core.is_main_checkout() and worktree.active_task_ids():
        core.die("REFUSED: task worktrees are active, so every task runs in its own worktree - "
                 f"use `python scripts/gate.py worktree start {task.id}`")
    if not task.zone:
        task.set("zone", zone)
    take_lock(task, zm)
    core.write_marker(task.id)
    if task.status != "in-progress":
        task.set("status", "in-progress")
    print(f"LOCKED: zone {zone} for {task.id}")


def cmd_unlock(args: argparse.Namespace) -> None:
    zone = zones.canon_zone(args.zone, zones.load_zones())
    path = core.lock_path(zone)
    if not path.exists():
        print(f"NOT LOCKED: zone {zone}")
        return
    holder = str(core.load_locks().get(zone, {}).get("task", ""))
    if args.task and holder.upper() != args.task.upper():
        core.die(f"REFUSED: zone {zone} is held by {holder or 'unknown'}, not {args.task}")
    path.unlink()
    if (core.read_marker() or "").upper() == holder.upper():
        core.clear_marker()
    print(f"UNLOCKED: zone {zone} (was {holder or 'unknown'})")


def cmd_release_done(args: argparse.Namespace) -> None:
    """Post-commit hook: free the zone locks of done tasks once nothing in their zone is left uncommitted."""
    if not core.is_main_checkout():
        return  # a worktree's lock stays until `worktree finish`
    zm, finished, released = zones.load_zones(), finished_ids(), []
    for zone, data in core.load_locks().items():
        if str(data.get("task", "")).upper() not in finished:
            continue
        folders = [f["path"] for f in zm.folders if f["zone"] == zone] if zm else []
        if folders and core.git_lines("status", "--porcelain", "--", *folders):
            continue  # some of the task's files are still uncommitted: keep the lock for them
        core.lock_path(zone).unlink(missing_ok=True)
        released.append(zone)
    held = {str(d.get("task", "")).upper() for d in core.load_locks().values()}
    if (marker := (core.read_marker() or "").upper()) and marker in finished and marker not in held:
        core.clear_marker()
    if released:
        print(f"RELEASED: zone {', '.join(released)} (task done and committed)")


def cmd_done(args: argparse.Namespace) -> None:
    task = find_task(args.task)
    if task.status == "done":
        print(f"ALREADY DONE: {task.id}")
        return
    if getattr(args, "outcome", None):
        task.set("outcome", args.outcome.replace("\n", " ").strip())
    if task.size not in SIZES:
        core.die(f"REFUSED: {task.id} has no size - set `size: tiny | standard | risky` (when unsure, size up)")
    if not task.domain:
        core.die(f"REFUSED: {task.id} has no domain - set `domain:` (use `project` for docs and tooling tasks)")
    if task.size != "tiny":
        plan = task.get("plan")
        if not plan:
            core.die(f"REFUSED: {task.id} is {task.size} but has no `plan:` - write the plan and run /critique first")
        plan_path = core.ROOT / plan
        ledger = plan_path.with_name(plan_path.name.removesuffix(".md") + ".critique.md")
        missing = [core.rel(p) for p in (plan_path, ledger) if not p.exists()]
        if missing:
            core.die("REFUSED: missing " + ", ".join(missing) + " - Standard and Risky tasks need a plan and its critique ledger")
    main_mode = core.is_main_checkout()
    pre_archived = memory.run_archive() if main_mode else []  # roll old history first, so caps never block done
    if not checks.run_verify(task):
        core.stage(pre_archived)
        core.die(f"REFUSED: verify failed - {task.id} stays {task.status}")
    task.set("status", "done")
    task.set("done", core.today())
    if not main_mode:
        print(f"DONE: {task.id} (worktree) - the zone lock stays until the merge.")
        print(f"Commit your work here, then from the main checkout run: python scripts/gate.py worktree finish {task.id}")
        return
    from . import roadmap
    written = pre_archived + memory.record_outcome(task) + memory.run_archive()
    checklist = roadmap.write()
    core.stage([task.path, *written, *checklist])
    # The zone lock stays until the task's files are committed (the pre-commit zone check needs it).
    # The post-commit hook (`release-done`) frees it; a lock held by a done task never blocks other tasks.
    held = [z for z, d in core.load_locks().items() if str(d.get("task", "")).upper() == task.id]
    print(f"DONE: {task.id}" + (f" - zone {', '.join(held)} is released once you commit" if held else ""))
    print("Recorded: CHANGELOG entry, domain history, archive" + (", master checklist" if checklist else "") + " (staged). "
          "Next: overwrite ai-context/next-steps.md and the domain's Current state, then commit the task's files.")
