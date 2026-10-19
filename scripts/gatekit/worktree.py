"""Worktrees: one folder + branch per parallel task, sharing the main checkout's zone locks.

Single-writer rule: task branches never touch shared hot files (CHANGELOG, next-steps, domain
History, archive, ai-context/roadmap.md/.json). `worktree finish` writes those on the work branch (gate.json main_branch), after a clean merge.
"""
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

from . import core


def wt_root() -> Path:
    pattern = core.load_gate(required=False).get("worktree_dir", "../{repo}-worktrees")
    return (core.main_root() / pattern.format(repo=core.main_root().name)).resolve()


def wt_path(task_id: str) -> Path:
    return wt_root() / task_id.upper()


def branch(task_id: str) -> str:
    return f"task/{task_id.upper()}"


def list_worktrees() -> list[dict]:
    out = core.git_lines("worktree", "list", "--porcelain", cwd=core.main_root()) if core.in_git() else None
    entries, current = [], {}
    for line in out or []:
        key, _, value = line.partition(" ")
        if key == "worktree":
            current = {"path": value, "branch": ""}
            entries.append(current)
        elif key == "branch":
            current["branch"] = value.removeprefix("refs/heads/")
    return entries


def active_task_ids() -> set[str]:
    return {w["branch"][len("task/"):].upper() for w in list_worktrees() if w["branch"].startswith("task/")}


def print_summary() -> None:
    task_trees = [w for w in list_worktrees() if w["branch"].startswith("task/")]
    if task_trees:
        holders = core.lock_holders()
        print("WORKTREES")
        for w in task_trees:
            tid = w["branch"][len("task/"):]
            print(f"  {tid:<10} {w['path']}  {'(zone locked)' if tid.upper() in holders else '(no zone lock)'}")


def resolve_generated(path: Path) -> bool:
    """If only generated files conflict, regenerate them instead of hand-merging, and complete the merge."""
    from . import zones
    conflicted = set(core.git_lines("diff", "--name-only", "--diff-filter=U", cwd=path) or [])
    zm = zones.load_zones()
    generated = {"testing/registry/tap-signals.ts", ".agents/ZONES.md"}
    generated |= {f"{f['path']}/CLAUDE.md" for f in (zm.folders if zm else [])}
    if not conflicted or not conflicted <= generated:
        return False
    for name in conflicted:
        core.git("checkout", "--theirs", "--", name, cwd=path)
    gate = [sys.executable, str(path / "scripts" / "gate.py")]
    if "testing/registry/tap-signals.ts" in conflicted:
        subprocess.run(gate + ["signals"], cwd=path, capture_output=True)
    if conflicted - {"testing/registry/tap-signals.ts"}:
        subprocess.run(gate + ["zones"], cwd=path, capture_output=True)
    core.git("add", "--", *sorted(conflicted), cwd=path)
    r = core.git("commit", "--no-edit", cwd=path)
    if r.returncode == 0:
        print(f"MERGED main into {path.name}: regenerated {', '.join(sorted(conflicted))} instead of hand-merging")
    return r.returncode == 0


def require_main() -> None:
    if not core.is_main_checkout():
        core.die("REFUSED: run this from the main checkout, not from inside a worktree")


def cmd_start(args: argparse.Namespace) -> None:
    from . import tasks, zones
    require_main()
    task_id = args.task.upper()
    zm = zones.load_zones()
    rows, _, _ = tasks.analyse(tasks.load_tasks(), zm)
    row = next((r for r in rows if r[1].id == task_id), None)
    if row is None:
        core.die(f"ERROR: no task {task_id} in .agents/tasks/")
    if row[0] != "ready":
        core.die(f"REFUSED: {task_id} is {row[0]} {row[2]}".rstrip())
    path = wt_path(task_id)
    if path.exists():
        core.die(f"REFUSED: {path} already exists")
    tasks.take_lock(row[1], zm)
    r = core.git("worktree", "add", str(path), "-b", branch(task_id), cwd=core.main_root())
    if r is None or r.returncode:
        tasks.release_locks(task_id)
        core.die(f"ERROR: git worktree add failed: {(r.stderr if r else 'git not found').strip()}")
    git_dir = core.git_lines("rev-parse", "--path-format=absolute", "--git-dir", cwd=path)
    core.write_marker(task_id, Path(git_dir[0]))
    core.set_field(path / row[1].path.relative_to(core.ROOT), "status", "in-progress")
    gate = core.load_gate(required=False)
    if gate.get("worktree_setup"):
        code, out = core.run_shell(gate["worktree_setup"], int(gate.get("timeout_seconds", 900)), cwd=path)
        print(f"SETUP: {'PASS' if code == 0 else 'FAIL - ' + core.first_error(out)}")
    print(f"STARTED: {task_id} in {path} (branch {branch(task_id)}). Open that folder in its own session and run /step {task_id}.")


def cmd_finish(args: argparse.Namespace) -> None:
    from . import checks, memory, roadmap, tasks
    require_main()
    task_id, path = args.task.upper(), wt_path(args.task)
    main = core.load_gate(required=False).get("main_branch", "main")
    if not path.exists():
        core.die(f"ERROR: no worktree at {path}")
    if core.current_branch() != main:
        core.die(f"REFUSED: the main checkout must be on {main}")
    if core.git_lines("status", "--porcelain"):
        core.die("REFUSED: the main checkout has uncommitted changes - commit or stash them first")
    if core.git_lines("status", "--porcelain", cwd=path):
        core.die(f"REFUSED: commit the task's work inside {path} first")
    task_files = list((path / ".agents" / "tasks").glob(f"{task_id}-*.md")) + list((path / ".agents" / "tasks").glob(f"{task_id}.md"))
    meta = core.parse_frontmatter(core.read_text(task_files[0])) if task_files else None
    if not meta or str(meta.get("status", "")).lower() != "done":
        core.die(f"REFUSED: {task_id} is not done in its worktree - run /step to the end (gate.py done) there first")

    main_head = core.git_lines("rev-parse", "HEAD")[0]
    r = core.git("merge", "--no-edit", main_head, cwd=path)
    if r.returncode and not resolve_generated(path):
        conflicted = core.git_lines("diff", "--name-only", "--diff-filter=U", cwd=path) or []
        core.git("merge", "--abort", cwd=path)
        core.die(f"CONFLICT: main does not merge cleanly into {branch(task_id)} ({', '.join(conflicted) or 'see git'}). "
                 f"In {path}: run `git merge {main}`, resolve, commit, then run finish again. Main was not touched.")
    check = subprocess.run([sys.executable, str(path / "scripts" / "gate.py"), "verify", "--task", task_id], cwd=path)
    if check.returncode:
        core.die("REFUSED: verify failed in the worktree after merging main - fix it there. Main was not touched.")
    if core.git_lines("rev-parse", "HEAD")[0] != main_head:
        core.die("REFUSED: main moved while verifying - run finish again")
    r = core.git("merge", "--no-ff", "--no-edit", branch(task_id))
    if r.returncode:
        core.git("merge", "--abort")
        core.die(f"ERROR: merging into {main} failed unexpectedly: {r.stderr.strip()}")

    task = tasks.find_task(task_id)
    written = memory.record_outcome(task) + memory.run_archive() + roadmap.write()
    if checks.SIGNALS_MD.exists():
        checks.cmd_signals(argparse.Namespace())
        written.append(checks.SIGNALS_TS)
    core.stage(written)
    if core.git("diff", "--cached", "--quiet").returncode:
        r = core.git("commit", "-m", f"chore({task_id}): record outcome (gate.py)")
        if r.returncode:
            core.die(f"ERROR: the bookkeeping commit failed: {(r.stdout + r.stderr).strip()[:300]}")
    core.git("worktree", "remove", "--force", str(path))
    core.git("branch", "-d", branch(task_id))
    released = tasks.release_locks(task_id)
    print(f"FINISHED: {task_id} merged into {main}" + (f", released zone {', '.join(released)}" if released else ""))
    print("Next (on the work branch): overwrite ai-context/next-steps.md and the domain's Current state, then commit.")


def cmd_abandon(args: argparse.Namespace) -> None:
    from . import tasks
    require_main()
    task_id, path = args.task.upper(), wt_path(args.task)
    if not args.yes:
        core.die(f"REFUSED: abandoning deletes {task_id}'s unmerged work in {path}. "
                 "This is a Hard Stop - ask the owner, then re-run with --yes.")
    if path.exists():
        core.git("worktree", "remove", "--force", str(path))
    core.git("branch", "-D", branch(task_id))
    released = tasks.release_locks(task_id)
    print(f"ABANDONED: {task_id} - worktree and branch removed" + (f", released zone {', '.join(released)}" if released else "")
          + ". Its task file on main is unchanged (still todo).")


def cmd_list(args: argparse.Namespace) -> None:
    if not active_task_ids():
        print("WORKTREES  none")
    print_summary()
