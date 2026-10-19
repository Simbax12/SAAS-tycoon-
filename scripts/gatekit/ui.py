"""UI lookup: find a screen, control or visible text by words; describe a screen; swap exact text at file:line.

Built for cheap UI changes: an agent gets file:line in ~150 tokens instead of grepping and
reading whole files. The index is rebuilt on every call (a regex pass, no cache to go stale).
"""
from __future__ import annotations

import argparse
import posixpath
import re

from . import core, tokens, zones

UI_EXTS = (".tsx", ".jsx", ".vue", ".svelte", ".html")
WEIGHT = {"screen": 5, "tap": 5, "label": 3, "text": 3, "component": 2, "route": 2}
PATTERNS = [
    ("screen", re.compile(r"""data-screen=\{?["']([^"']+)["']""")),
    ("tap", re.compile(r"""data-tap=\{?(?:TAP\[)?["']([a-z0-9][a-z0-9.-]*)["']""")),
    ("label", re.compile(r"""\b(?:aria-label|placeholder|alt|title)=\{?["']([^"'{}]{2,80})["']""")),
    ("component", re.compile(r"\bexport\s+(?:default\s+)?(?:async\s+)?(?:function|const|class)\s+([A-Z]\w*)")),
    ("route", re.compile(r"""\bpath\s*[:=]\s*\{?["'](/[^"']*)["']""")),
    ("text", re.compile(r"(?<![=\-])>\s*([^<>{}()=;\n]*[A-Za-z]{2}[^<>{}()=;\n]*?)\s*(?:<|$)")),
    ("text", re.compile(r"^\s*([A-Z][^<>{}()=;:\n]*[a-z][^<>{}()=;:\n]*)\s*$")),
]
STOP = {"the", "a", "an", "on", "in", "of", "to", "at", "for", "and", "my", "this", "that"}


def ui_files() -> list[str]:
    return [p for p in core.repo_files() if p.endswith(UI_EXTS) and not p.startswith(core.SHARED_PREFIXES)
            and not core.matches(p, tokens.SKIP)]


def index() -> list[tuple[str, str, int, str]]:
    """(kind, path, line, text) for every findable thing in the UI files."""
    entries = []
    for path in ui_files():
        try:
            lines = core.read_text(core.ROOT / path).splitlines()
        except OSError:
            continue
        for n, line in enumerate(lines, 1):
            for kind, rx in PATTERNS:
                for m in rx.finditer(line):
                    text = m.group(1).strip()
                    if text and not (kind == "text" and (text.startswith(("import ", "export ", "//")) or len(text) > 90)):
                        entries.append((kind, path, n, text))
    return entries


def score(words: list[str], kind: str, text: str, path: str) -> float:
    t, p = text.lower(), path.lower()
    in_text = sum(1 for w in words if w in t)
    if not in_text:
        return 0
    in_path = sum(1 for w in words if w not in t and w in p)
    s = in_text * WEIGHT[kind] + in_path * 1.5
    if in_text + in_path == len(words):
        s += 4
    return s + (1 if ".view." in p else 0)


def cmd_ui(args: argparse.Namespace) -> None:
    entries = index()
    if args.screen:
        return describe_screen(args.screen, entries)
    words = [w for w in re.findall(r"[a-z0-9]+", " ".join(args.words).lower()) if w not in STOP]
    if not words:
        core.die("Usage: python scripts/gate.py ui <words>   or   ui --screen <name>")
    ranked, seen = [], set()
    for kind, path, n, text in entries:
        s = score(words, kind, text, path)
        if s and (path, n) not in seen:
            seen.add((path, n))
            ranked.append((s, kind, path, n, text))
    ranked.sort(key=lambda r: (-r[0], r[2], r[3]))
    if not ranked:
        core.die(f"NOT FOUND: nothing matches {' '.join(words)!r} - try the words on screen, or `gate.py ui --screen <name>`")
    print(f"UI {' '.join(words)!r} - top {min(len(ranked), args.limit)} of {len(ranked)}")
    for _, kind, path, n, text in ranked[:args.limit]:
        print(f"  {path}:{n}  {kind:<9} {text[:70]}")
    unmarked = [p for p in ui_files() if re.search(r"\.view\.(tsx|jsx)$", p)
                and "data-screen=" not in core.read_text(core.ROOT / p)]
    if unmarked:
        print(f"  note: {len(unmarked)} view file(s) have no data-screen, so screen lookups miss them")


def resolve(spec: str, from_path: str) -> str | None:
    if spec.startswith("@/"):  # the alias points at the app's own src/, also inside apps/<name>/
        src = from_path[:from_path.index("/src/") + 5] if "/src/" in from_path else "src/"
        base = src + spec[2:]
    elif spec.startswith("."):
        base = posixpath.normpath(posixpath.join(posixpath.dirname(from_path), spec))
    else:
        return None
    files = set(core.repo_files())
    for suffix in ("", ".tsx", ".ts", ".jsx", ".js", "/index.tsx", "/index.ts"):
        if base + suffix in files:
            return base + suffix
    return None


def describe_screen(name: str, entries: list) -> None:
    screens = [(p, n, t) for k, p, n, t in entries if k == "screen" and name.lower() in t.lower()]
    if not screens:
        known = sorted({t for k, _, _, t in entries if k == "screen"})
        core.die(f"NOT FOUND: no data-screen matching {name!r} - screens: {', '.join(known) or 'none marked yet'}")
    screens.sort(key=lambda s: (s[2].lower() != name.lower(), s[0]))
    path, n, label = screens[0]
    text = core.read_text(core.ROOT / path)
    stem = re.sub(r"\.view\.(tsx|jsx)$", "", path)
    files = set(core.repo_files())
    print(f"SCREEN {label}")
    print(f"  view:      {path}:{n} ({core.line_count(text)} lines)")
    for role, exts in (("container", (".container.tsx", ".container.jsx")), ("fixtures", (".fixtures.ts", ".fixtures.tsx"))):
        found = next((stem + e for e in exts if stem + e in files), None)
        print(f"  {role + ':':<10} {found or '(none)'}")
    used = [r for spec in zones.IMPORT_RE.findall(text) if (r := resolve(spec, path)) and not r.startswith(stem)]
    if used:
        print("  uses:      " + ", ".join(sorted(set(used)))[:400])
    packages = sorted({s for s in zones.IMPORT_RE.findall(text) if not s.startswith((".", "@/"))})
    if packages:
        print("  packages:  " + ", ".join(packages)[:300])
    taps = [m.group(1) for m in PATTERNS[1][1].finditer(text)]
    if taps:
        print("  signals:   " + ", ".join(taps))
    if len(screens) > 1:
        print("  also:      " + ", ".join(f"{s[2]} ({s[0]})" for s in screens[1:4]))


def cmd_swap(args: argparse.Namespace) -> None:
    m = re.match(r"^(.+):(\d+)$", args.target.replace("\\", "/"))
    if not m:
        core.die("Usage: python scripts/gate.py swap <file>:<line> \"<old text>\" \"<new text>\"")
    path, line = m.group(1), int(m.group(2))
    full = core.ROOT / path
    if not full.is_file():
        core.die(f"ERROR: no file {path}")
    before = core.read_text(full)
    lines = before.splitlines(keepends=True)
    window = range(max(0, line - 4), min(len(lines), line + 3))
    count = sum(lines[i].count(args.old) for i in window)
    if count != 1:
        shown = lines[line - 1].rstrip() if 0 < line <= len(lines) else "(past the end of the file)"
        core.die(f"REFUSED: {args.old!r} appears {count} times within 3 lines of {path}:{line} (needs exactly 1). "
                 f"Line {line} is: {shown.strip()[:140]}")
    i = next(i for i in window if args.old in lines[i])
    lines[i] = lines[i].replace(args.old, args.new, 1)
    after = "".join(lines)
    added = tokens.added_hits(path, before, after) if tokens.applies(path) else []
    if added:
        rule, _, snippet = added[0]
        core.die(f"REFUSED: the new text adds a hard-coded style ({rule} '{snippet}') - use {tokens.FIX[rule]}")
    core.write_text(full, after)
    print(f"SWAPPED {path}:{i + 1}  {lines[i].strip()[:140]}")
