"""Views guard: each screen is a data container, a small styling-only view, and fixtures for its states.

So a visual change only ever opens a short `.view.tsx`, never the data code. Applies to new and
changed files; old mixed pages are left alone until their own split task.
"""
from __future__ import annotations

import argparse
import re
import sys

from . import core, zones

VIEW_RE = re.compile(r"\.view\.(tsx|jsx)$")
CONTAINER_RE = re.compile(r"\.container\.(tsx|jsx)$")
FIXTURES_RE = re.compile(r"\.fixtures\.tsx?$")
DEFAULT_DATA_IMPORTS = ["@supabase/*", "@supabase/**", "**/supabase", "**/supabase/**", "**/api", "**/api/**",
                        "**/services/**", "*.container", "*.container.*", "@tanstack/react-query", "swr", "axios"]
DATA_CALL = re.compile(r"\bfetch\s*\(|\buse(?:Query|Mutation|InfiniteQuery|SuspenseQuery|SWR)\s*\(")
STATES = ("default", "empty", "loading", "error")
VIEW_MAX_LINES = 150


def settings() -> dict:
    return core.load_gate(required=False).get("views", {})


def fixture_text(view_path: str, staged: bool) -> tuple[str | None, str | None]:
    stem = VIEW_RE.sub("", view_path)
    for ext in (".fixtures.ts", ".fixtures.tsx"):
        text = core.new_content(stem + ext, staged)
        if text is not None:
            return stem + ext, text
    return None, None


def missing_states(fixtures: str) -> list[str]:
    return [s for s in STATES if not re.search(rf"(?m)^\s*(?:export\s+const\s+)?['\"]?{s}['\"]?\s*[:=]", fixtures)]


def check_view(path: str, new: str, old: str | None, staged: bool) -> list[str]:
    problems = []
    banned = settings().get("data_imports", DEFAULT_DATA_IMPORTS)
    for spec in zones.IMPORT_RE.findall(new):
        if core.matches(spec, banned):
            problems.append(f"{path}: imports {spec} - a view gets its data as props from its container")
    if (m := DATA_CALL.search(new)):
        problems.append(f"{path}: calls {m.group(0).rstrip('(').strip()} - data loading belongs in the container")
    cap = int(settings().get("view_max_lines", VIEW_MAX_LINES))
    n_new, n_old = core.line_count(new), core.line_count(old) if old is not None else None
    if (n_old is None and n_new > cap) or (n_old is not None and n_old <= cap < n_new) \
            or (n_old is not None and n_old > cap and n_new > n_old):
        problems.append(f"{path}: {n_new} lines, views stay under {cap} - move a section into its own view")
    fixture_path, fixtures = fixture_text(path, staged)
    if fixtures is None:
        problems.append(f"{path}: no {VIEW_RE.sub('', path)}.fixtures.ts - add typed props for "
                        + ", ".join(STATES) + " (the workbench renders them)")
    elif (gaps := missing_states(fixtures)):
        problems.append(f"{fixture_path}: missing state(s) {', '.join(gaps)}")
    return problems


def guard(task_id: str | None = None, base: str | None = None, staged: bool = False) -> tuple[bool, str, list[str], list[str]]:
    if not core.in_git():
        return True, "not a git repo - nothing to check", [], []
    old_base = "HEAD" if staged else core.resolve_base(base)
    problems, views = [], 0
    for path in core.changed_files(None if staged else old_base, staged):
        if path.startswith(core.SHARED_PREFIXES) or not path.endswith((".tsx", ".jsx", ".fixtures.ts")):
            continue
        if (new := core.new_content(path, staged)) is None:
            continue
        old = core.old_content(path, old_base)
        if VIEW_RE.search(path):
            views += 1
            problems += check_view(path, new, old, staged)
        elif FIXTURES_RE.search(path):
            if (gaps := missing_states(new)):
                problems.append(f"{path}: missing state(s) {', '.join(gaps)}")
        elif CONTAINER_RE.search(path):
            if (m := re.search(r"\bclassName\s*[=:]", new)):
                line = new[:m.start()].count("\n") + 1
                problems.append(f"{path}:{line} has className - containers hold data only; styling lives in the view")
        elif old is None and "data-screen=" in new and not core.matches(path, ["**/components/ui/**"]):
            problems.append(f"{path}: a new screen must be a .view.tsx (with a .container.tsx and .fixtures.ts)")
    return not problems, f"{views} view(s) checked: data-free, under the line cap, fixtures for every state", problems, []


def cmd_views(args: argparse.Namespace) -> None:
    ok, summary, problems, notes = guard(args.task, args.base, args.staged)
    zones.print_result(ok, summary, problems, notes)
    sys.exit(0 if ok else 1)
