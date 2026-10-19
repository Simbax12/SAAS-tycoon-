"""Checks: guards (always run), verify, gaps, budget, suites, TAP signals, agent mirrors."""
from __future__ import annotations

import argparse
import os
import re
import shutil
import sys
from pathlib import Path

from . import core, domains, zones

DEFAULT_GUARDS = ["gaps", "budget", "map", "zone-check", "tokens", "views"]
GAP_MARKERS = {"inferred": r"\[INFERRED", "gap": r"\[GAP", "{{}}": r"\{\{", "open-q": r"OPEN QUESTION"}
DEFAULT_CODE_EXTS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".sql", ".css", ".scss",
                     ".vue", ".svelte", ".kt", ".swift", ".go", ".rs"]
DEFAULT_EXEMPT = ["*.d.ts", "**/generated/**", "*.gen.*", "**/migrations/**", "**/__snapshots__/**",
                  ".agents/archive/**", "docs/reference/raw/**", "**/components/ui/**"]
SIGNAL_RE = re.compile(r"^[a-z0-9]+(?:\.[a-z0-9][a-z0-9-]*){2,}$")
SIGNALS_MD = core.ROOT / "testing" / "TAP_SIGNALS.md"
SIGNALS_TS = core.ROOT / "testing" / "registry" / "tap-signals.ts"


# ---------------------------------------------------------------- gaps

def gap_files() -> list[Path]:
    files = [core.ROOT / "ai-context" / "5w.md"]
    docs = core.ROOT / "docs"
    if docs.is_dir():
        files += [p for p in sorted(docs.rglob("*.md"))
                  if p.name != "CONTEXT.md" and "raw" not in p.relative_to(docs).parts]
    return [p for p in files if p.exists()]


def linked_docs(task) -> set[str]:
    """The docs a task links: paths in its own file, plus its domain's `specs` in domains.json."""
    refs = set(re.findall(r"docs/[\w./-]*[\w/]", core.read_text(task.path)))
    refs |= {str(s).split("#")[0] for s in domains.load_domains()["domains"].get(task.domain, {}).get("specs", [])}
    return {r.rstrip("/") for r in refs if r}


def gaps(strict: bool = True, linked: set[str] | None = None) -> tuple[bool, str, list[str], list[str], list[str]]:
    """Open items in confirmed docs. With `linked`, only those docs block; the rest are warnings."""
    rows, problems, warnings = [], [], []
    for path in gap_files():
        text = core.read_text(path)
        status = str((core.parse_frontmatter(text) or {}).get("status", "-"))
        index = path.parent / "index.md"
        if status == "-" and index.exists() and index != path:  # a part of a spec folder inherits its status
            status = str((core.parse_frontmatter(core.read_text(index)) or {}).get("status", "-"))
        counts = {k: len(re.findall(p, text)) for k, p in GAP_MARKERS.items()}
        if any(counts.values()):
            rows.append(f"{core.rel(path):<44} {status:<10} " + " ".join(f"{counts[k]:>8}" for k in GAP_MARKERS))
            if strict and status == "confirmed":
                name = core.rel(path)
                msg = f"{name} is confirmed but still has " + ", ".join(f"{v} {k}" for k, v in counts.items() if v)
                if linked is None or any(name == r or name.startswith(r + "/") for r in linked):
                    problems.append(msg)
                else:
                    warnings.append(msg + " - not linked to this task, but it blocks the tasks that link it and the Release Gate")
    summary = f"{len(rows)} file(s) with open items" if rows else "no open items"
    return not problems, summary, problems, warnings, rows


def cmd_gaps(args: argparse.Namespace) -> None:
    ok, summary, problems, _, rows = gaps(args.strict)
    if rows:
        print(f"{'file':<44} {'status':<10} " + " ".join(f"{k:>8}" for k in GAP_MARKERS))
        print("\n".join(rows))
    print(("PASS: " if ok else "FAIL: ") + summary)
    for problem in problems:
        print(f"  {problem}")
    sys.exit(0 if ok else 1)


# ---------------------------------------------------------------- budget

def changelog_entries(text: str) -> int:
    return len(re.findall(r"(?m)^## \d{4}-\d{2}-\d{2}", text))


def budget(task_id: str | None = None, base: str | None = None, staged: bool = False) -> tuple[bool, str, list[str], list[str]]:
    cfg = core.budgets()
    problems, notes = [], []
    fixed = cfg.get("fixed", {"AGENTS.md": 150, "ai-context/README.md": 60, "ai-context/next-steps.md": 40, "ai-context/5w.md": 80})
    for name, cap in fixed.items():
        path = core.ROOT / name
        if path.exists() and (n := core.line_count(core.read_text(path))) > cap:
            problems.append(f"{name}: {n} lines, cap {cap} - trim it (move detail to the file it routes to)")
    zm = zones.load_zones()
    for folder in (zm.folders if zm else []):
        path = core.ROOT / folder["path"] / "CLAUDE.md"
        cap = cfg.get("zone_claude_md", 30)
        if path.exists() and (n := core.line_count(core.read_text(path))) > cap:
            problems.append(f"{core.rel(path)}: {n} lines, cap {cap}")
    for path in domains.domain_files():
        cap = cfg.get("domain_file", 100)
        if (n := core.line_count(core.read_text(path))) > cap:
            problems.append(f"{core.rel(path)}: {n} lines, cap {cap} - shorten Current state; History is trimmed by archive")
    if core.CHANGELOG.exists() and (n := changelog_entries(core.read_text(core.CHANGELOG))) > cfg.get("changelog_entries", 30):
        problems.append(f"CHANGELOG.md: {n} entries - run `python scripts/gate.py archive`")

    if core.in_git():
        code_exts = set(cfg.get("code_exts", DEFAULT_CODE_EXTS))
        doc_exts = set(cfg.get("doc_exts", [".md", ".mdx"]))
        exempt = cfg.get("exempt", DEFAULT_EXEMPT)
        task_id = core.my_task_id(task_id)
        from . import tasks
        task = tasks.find_task(task_id, required=False) if task_id else None
        overrides = set(task.get_list("budget_override")) if task else set()
        old_base = "HEAD" if staged else core.resolve_base(base)
        for path in core.changed_files(None if staged else old_base, staged):
            ext = Path(path).suffix.lower()
            if core.matches(path, exempt) or (ext not in code_exts and ext not in doc_exts):
                continue
            new = core.new_content(path, staged)
            if new is None:
                continue
            cap = cfg.get("code_max_lines", 400) if ext in code_exts else cfg.get("doc_max_lines", 500)
            n_new, old = core.line_count(new), core.old_content(path, old_base)
            n_old = core.line_count(old) if old is not None else None
            if n_old is None and n_new > cap:
                problems.append(f"{path}: new file with {n_new} lines, cap {cap} - split it")
            elif n_old is not None and n_old <= cap < n_new:
                problems.append(f"{path}: grew to {n_new} lines, past the cap of {cap} - split it")
            elif n_old is not None and n_old > cap and n_new > n_old:
                if path in overrides:
                    notes.append(f"budget override used: {path} grew {n_old} -> {n_new} lines (reason in {task.id})")
                else:
                    problems.append(f"{path}: legacy oversized file grew {n_old} -> {n_new} lines - "
                                    "move code out instead, or add it to the task's budget_override with a reason")
            elif n_old is not None and n_old > cap:
                notes.append(f"legacy oversized: {path} ({n_new} lines) - split it in its own task")
    return not problems, "within budget", problems, notes


def cmd_budget(args: argparse.Namespace) -> None:
    ok, summary, problems, notes = budget(args.task, args.base, args.staged)
    zones.print_result(ok, summary, problems, notes)
    sys.exit(0 if ok else 1)


# ---------------------------------------------------------------- verify

def run_guard(name: str, task_id: str | None) -> tuple[bool, str, list[str], list[str]]:
    if name == "gaps":  # a task is blocked only by docs it links; onboarding (TASK-0001) and a full verify by all
        from . import tasks
        task = tasks.find_task(task_id, required=False) if task_id and task_id != "TASK-0001" else None
        ok, summary, problems, warnings, _ = gaps(strict=True, linked=linked_docs(task) if task else None)
        return ok, summary, problems, warnings
    if name == "budget":
        return budget(task_id)
    if name == "map":
        return domains.map_check()
    if name == "zone-check":  # CI has no local locks, so it checks import rules only
        return zones.zone_check(task_id, imports_only=bool(os.environ.get("CI")))
    if name in ("tokens", "views"):
        from . import tokens, views
        return (tokens if name == "tokens" else views).guard(task_id)
    return False, "", [f"unknown guard {name!r} in .agents/gate.json"], []


def run_verify(task=None) -> bool:
    gate = core.load_gate()
    timeout = int(gate.get("timeout_seconds", 900))
    results, notes = [], []
    task_id = task.id if task is not None else None
    for name in gate.get("guards", DEFAULT_GUARDS):
        ok, summary, problems, warnings = run_guard(name, task_id)
        results.append((name, "PASS" if ok else "FAIL", "" if ok else "- " + (problems[0] if problems else summary)))
        notes += [f"{name}: {w}" for w in warnings]
    checks = [(c["name"], c["cmd"], bool(c.get("stop_on_fail"))) for c in gate.get("checks", [])]
    suites = gate.get("suites", {})
    if task is not None and task.verify is not None:
        by_name = {c[0]: c for c in checks}
        checks = [by_name.get(n) or ((n, suites[n], False) if n in suites else (n, None, False)) for n in task.verify]
    blocked_by = None
    for name, cmd, stop in checks:
        if cmd is None:
            results.append((name, "FAIL", "- not a check or suite in .agents/gate.json"))
        elif blocked_by:
            results.append((name, "SKIPPED", f"(blocked by {blocked_by} failure)"))
        elif name in suites and not suite_has_tests(name):
            results.append((name, "NO TESTS", ""))
            notes.append(f"{name}: no tests yet, so not verified - tell the owner (a gap is not a pass)")
        else:
            code, out = core.run_shell(cmd, timeout)
            results.append((name, "PASS", "") if code == 0 else (name, "FAIL", "- " + (core.first_error(out) or f"exit code {code}")))
            blocked_by = name if code and stop else blocked_by
    ok = all(status in ("PASS", "NO TESTS") for _, status, _ in results)
    if ok:
        print("PASS: " + ", ".join(name + (" (no tests yet)" if status == "NO TESTS" else "") for name, status, _ in results))
    else:
        print("FAIL")
        for name, status, note in results:
            print(f"  {name}: {status}" + (f" {note}" if note else ""))
    for note in notes:
        print(f"  note: {note}")
    return ok


def suite_has_tests(name: str) -> bool:
    """False while testing/suites/<name>/ holds nothing but .gitkeep. A suite kept elsewhere is left to its command."""
    folder = core.ROOT / "testing" / "suites" / name
    if not folder.is_dir():
        return True
    return any(p.is_file() and p.name != ".gitkeep" for p in folder.rglob("*"))


def cmd_verify(args: argparse.Namespace) -> None:
    from . import tasks
    task = tasks.find_task(args.task) if args.task else None
    sys.exit(0 if run_verify(task) else 1)


def cmd_suite(args: argparse.Namespace) -> None:
    gate = core.load_gate()
    suites, ok = gate.get("suites", {}), True
    for name in args.names:
        if name not in suites:
            core.die(f"ERROR: no suite {name!r} in .agents/gate.json - suites: {', '.join(suites) or 'none'}")
        if not suite_has_tests(name):
            print(f"SUITE {name}: NO TESTS (testing/suites/{name}/ is empty) - not verified, report it as a gap")
            continue
        code, out = core.run_shell(suites[name], int(gate.get("timeout_seconds", 900)))
        lines = [core.ANSI.sub("", l) for l in out.strip().splitlines()]
        shown = lines if args.full else lines[-40:]
        if len(shown) < len(lines):
            print(f"... ({len(lines) - len(shown)} earlier lines hidden; --full shows all)")
        print("\n".join(shown))
        print(f"SUITE {name}: {'PASS' if code == 0 else 'FAIL'} (exit {code})")
        ok &= code == 0
    sys.exit(0 if ok else 1)


# ---------------------------------------------------------------- generated files and mirrors

def cmd_signals(args: argparse.Namespace) -> None:
    if not SIGNALS_MD.exists():
        core.die("ERROR: no testing/TAP_SIGNALS.md")
    names, errors = [], []
    for line in core.read_text(SIGNALS_MD).splitlines():
        line = line.strip()
        if not line.startswith("|"):
            continue
        cell = line.strip("|").split("|")[0].strip().strip("`").strip()
        if not cell or cell.lower() == "signal" or set(cell) <= set("-: "):
            continue
        if not SIGNAL_RE.match(cell):
            errors.append(f"bad signal name {cell!r} - use <zone>.<screen>.<action>, lowercase")
        elif cell not in names:
            names.append(cell)  # a duplicate row (e.g. after a union merge) is harmless
    if errors:
        core.die("FAIL\n  " + "\n  ".join(errors))
    body = "".join(f"  '{name}': '{name}',\n" for name in sorted(names))
    ts = ("// GENERATED by `python scripts/gate.py signals` from testing/TAP_SIGNALS.md.\n"
          "// Do not edit by hand: add the signal to TAP_SIGNALS.md and re-run.\n\n"
          "export const TAP = {\n" + body + "} as const;\n\n"
          "export type TapSignal = keyof typeof TAP;\n\n"
          "export const tapSelector = (signal: TapSignal): string => `[data-tap=\"${signal}\"]`;\n")
    old = core.read_text(SIGNALS_TS) if SIGNALS_TS.exists() else None
    if old != ts:
        core.write_text(SIGNALS_TS, ts)
    print(f"PASS: {len(names)} signal(s) -> testing/registry/tap-signals.ts ({'updated' if old != ts else 'unchanged'})")


def mirror_pairs() -> list[tuple[Path, Path]]:
    pairs = []
    qc_team = core.AGENTS_DIR / "qc-team"
    if qc_team.is_dir():
        pairs += [(p, core.ROOT / ".claude" / "agents" / p.name) for p in sorted(qc_team.glob("*.md")) if p.name != "CONTEXT.md"]
    skills = core.AGENTS_DIR / "skills"
    if skills.is_dir():
        for skill in sorted(d for d in skills.iterdir() if d.is_dir()):
            pairs += [(p, core.ROOT / ".claude" / "skills" / skill.name / p.relative_to(skill))
                      for p in sorted(skill.rglob("*")) if p.is_file()]
    return pairs


def cmd_check_agents(args: argparse.Namespace) -> None:
    pairs = mirror_pairs()
    if not pairs:
        core.die("ERROR: nothing to mirror - .agents/qc-team and .agents/skills are empty")
    def same(a: Path, b: Path) -> bool:  # line endings don't count as a difference
        return a.read_bytes().replace(b"\r\n", b"\n") == b.read_bytes().replace(b"\r\n", b"\n")

    bad = [("MISSING" if not d.exists() else "DIFFERS", s, d) for s, d in pairs if not d.exists() or not same(s, d)]
    if bad and args.sync:
        for state, src, dst in bad:
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src, dst)
            print(f"SYNCED  {core.rel(dst)} (was {state.lower()})")
        bad = []
    if bad:
        print("FAIL")
        for state, _, dst in bad:
            print(f"  {state:<8} {core.rel(dst)}")
        core.die("  Fix: python scripts/gate.py check-agents --sync  (.agents/ is the source of truth)")
    agents = sum(1 for s, _ in pairs if s.parent.name == "qc-team")
    skills = len({s.relative_to(core.AGENTS_DIR / "skills").parts[0] for s, _ in pairs if s.parent.name != "qc-team"})
    print(f"PASS: {agents} agent(s) and {skills} skill(s) mirrored into .claude/")
