#!/usr/bin/env python3
"""gate.py - task DAG, zone locks, verification gates, memory and lookup for this project.

Stdlib only (Python 3.10+), same on Windows, macOS and Linux. The logic lives in
scripts/gatekit/. Add -h to any command for details.

Tasks:    status | next | lock | unlock | done | release-done | roadmap [--check]
Gates:    verify | zone-check | budget | tokens | views | gaps | map --check | suite | check-agents | install-hooks
Memory:   archive | search "<words>"
Lookup:   where <domain or keyword> | map | ui <words> | ui --screen <name>
UI:       theme show | theme set | swap <file>:<line> "<old>" "<new>"
Files:    signals | zones
Parallel: worktree start | finish | abandon | list
"""
import sys

sys.dont_write_bytecode = True  # keep scripts/ free of __pycache__

import argparse  # noqa: E402

from gatekit import checks, core, domains, memory, roadmap, tasks, theme, tokens, ui, views, worktree, zones  # noqa: E402


def main() -> None:
    core.ascii_stdout()
    parser = argparse.ArgumentParser(prog="gate.py", description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True, metavar="command")

    def add(name: str, fn, help_text: str) -> argparse.ArgumentParser:
        p = sub.add_parser(name, help=help_text)
        p.set_defaults(fn=fn)
        return p

    add("status", tasks.cmd_status, "task DAG, locks, worktrees and problems")
    add("next", tasks.cmd_next, "first ready task")
    p = add("lock", tasks.cmd_lock, "take a zone lock for a task")
    p.add_argument("zone")
    p.add_argument("--task", required=True)
    p = add("unlock", tasks.cmd_unlock, "release a zone lock")
    p.add_argument("zone")
    p.add_argument("--task", help="refuse unless this task holds the lock")
    p = add("done", tasks.cmd_done, "verify, then mark a task done and record it")
    p.add_argument("task")
    p.add_argument("--outcome", help="set the task's one-line outcome first (it becomes the CHANGELOG entry)")
    add("release-done", tasks.cmd_release_done, "free the zone locks of done, committed tasks (run by the post-commit hook)")
    p = add("roadmap", roadmap.cmd_roadmap, "regenerate the master checklist (ai-context/roadmap.md + roadmap.json)")
    p.add_argument("--check", action="store_true", help="only check: problems, or files out of date with the tasks")

    p = add("verify", checks.cmd_verify, "guards + gate.json checks (or a task's verify list)")
    p.add_argument("--task")
    for name, fn, help_text in (("zone-check", zones.cmd_zone_check, "changed files vs this checkout's zone lock and import rules"),
                                ("budget", checks.cmd_budget, "fixed caps + no-growth rule for changed files"),
                                ("tokens", tokens.cmd_tokens, "no hard-coded colours, one-off sizes, raw radius/shadow in views, hand-drawn SVG"),
                                ("views", views.cmd_views, "screens split into container / view / fixtures")):
        p = add(name, fn, help_text)
        p.add_argument("--task", help="the task to check for (default: this checkout's task)")
        p.add_argument("--base", help="diff base (default: $GATE_BASE, merge-base with main, or HEAD)")
        p.add_argument("--staged", action="store_true", help="check the staged files (pre-commit hook)")
        if name == "zone-check":
            p.add_argument("--imports-only", action="store_true", help="import rules only (CI)")
    p = add("gaps", checks.cmd_gaps, "gap matrix: INFERRED / GAP / placeholders / open questions")
    p.add_argument("--strict", action="store_true", help="fail on open items in confirmed files")
    p = add("suite", checks.cmd_suite, "run testing suites from gate.json")
    p.add_argument("names", nargs="+", metavar="name")
    p.add_argument("--full", action="store_true", help="print the whole output")
    p = add("check-agents", checks.cmd_check_agents, "compare .claude/ mirrors with .agents/")
    p.add_argument("--sync", action="store_true", help="copy .agents/ sources over the mirrors")
    add("install-hooks", zones.cmd_install_hooks, "install the pre-commit guard hook")

    add("archive", memory.cmd_archive, "roll old tasks, CHANGELOG entries and bugs into .agents/archive/")
    p = add("search", memory.cmd_search, "search all project history (SQLite FTS5)")
    p.add_argument("words", nargs="+")
    p.add_argument("--limit", type=int, default=5)

    p = add("where", domains.cmd_where, "files, contract, tables and specs for a feature domain")
    p.add_argument("query", nargs="+")
    p = add("map", domains.cmd_map, "list domains; --check guards the Lookup Router")
    p.add_argument("--check", action="store_true")
    p.add_argument("--base")

    p = add("ui", ui.cmd_ui, "find a screen, control or visible text: file:line in a few lines")
    p.add_argument("words", nargs="*")
    p.add_argument("--screen", help="describe one screen: view, container, fixtures, components, signals")
    p.add_argument("--limit", type=int, default=8)
    p = add("swap", ui.cmd_swap, "replace exact text near file:line (refuses if not exactly one match)")
    p.add_argument("target", metavar="file:line")
    p.add_argument("old")
    p.add_argument("new")
    p = add("theme", theme.cmd_theme, "show or set design tokens (format and contrast checked)")
    tsub = p.add_subparsers(dest="action", required=True, metavar="action")
    tp = tsub.add_parser("show")
    tp.add_argument("words", nargs="*", help="only tokens whose name contains one of these")
    tp.add_argument("--all", action="store_true", help="include var() mappings")
    tp.add_argument("--limit", type=int, default=40)
    tp = tsub.add_parser("set")
    tp.add_argument("token")
    tp.add_argument("value")
    mode = tp.add_mutually_exclusive_group()
    mode.add_argument("--dark", action="store_true", help="set the dark-mode value only")
    mode.add_argument("--both", action="store_true", help="set light and dark")
    tp.add_argument("--file", help="which theme file, when the token is defined in more than one")
    tp.add_argument("--preset", help="edit this preset in brand-presets.json instead")
    tp.add_argument("--fix-foreground", action="store_true", help="also pick a readable text colour for the pair")

    add("signals", checks.cmd_signals, "regenerate testing/registry/tap-signals.ts")
    p = add("zones", zones.cmd_zones, "zone folders, zone CLAUDE.md files, ZONES.md and the AGENTS.md table")
    p.add_argument("--dry-run", action="store_true")

    p = add("worktree", lambda a: a.wt_fn(a), "parallel sessions: start | finish | abandon | list")
    wsub = p.add_subparsers(dest="wt_command", required=True, metavar="action")
    for name, fn in (("start", worktree.cmd_start), ("finish", worktree.cmd_finish), ("abandon", worktree.cmd_abandon)):
        wp = wsub.add_parser(name)
        wp.add_argument("task")
        wp.set_defaults(wt_fn=fn)
        if name == "abandon":
            wp.add_argument("--yes", action="store_true", help="confirmed with the owner: delete the unmerged work")
    wsub.add_parser("list").set_defaults(wt_fn=worktree.cmd_list)

    args = parser.parse_args()
    args.fn(args)


if __name__ == "__main__":
    main()
