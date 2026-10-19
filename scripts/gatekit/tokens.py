"""Tokens guard: no hard-coded colours, one-off values, raw radius/shadow in views, or hand-drawn SVG.

No-growth, like budget: a new file must be clean, and a changed file may not add new hits.
Old hits in untouched lines are only noted. A line with `tokens-ok: <reason>` is excused and reported.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter

from . import colour, core, zones

SCAN_EXTS = {".tsx", ".jsx", ".ts", ".js", ".mjs", ".html", ".vue", ".svelte", ".mdx", ".css", ".scss"}
MARKUP_EXTS = {".tsx", ".jsx", ".vue", ".svelte", ".html", ".mdx"}
STYLE_EXTS = {".css", ".scss"}
DEFAULT_DEFS = ["**/index.css", "**/globals.css", "**/theme/**", "**/themes/**", "**/theme-contract.css",
                "**/brand-presets.json", "**/brand-tokens.*"]
DEFAULT_PRESETS = ["**/brand-presets.json"]
VENDORED = ["**/components/ui/**", "**/components/icons/**"]  # filled by `shadcn add`, not hand-written
SKIP = ["*.d.ts", "**/generated/**", "*.gen.*", "**/migrations/**", "**/__snapshots__/**", "*.test.*", "*.spec.*"]
ESCAPE = "tokens-ok:"

PALETTE = ("slate|gray|zinc|neutral|stone|mauve|olive|mist|taupe|red|orange|amber|yellow|lime|green|emerald|"
           "teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose")
UTIL = (r"(?:bg|text|border(?:-[xytrblse])?|ring(?:-offset)?|outline|fill|stroke|from|via|to|decoration|"
        r"divide|placeholder|caret|accent|shadow|inset-shadow|drop-shadow)")
B = r"(?<![\w/\[-])"  # start of a class name; variants such as hover: end in a colon, so they still match
NOT_COLOUR = r"(?!#|var\(|(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\()"
CLASS_RULES = [
    ("palette colour", re.compile(rf"{B}{UTIL}-(?:{PALETTE})-(?:50|[1-9]00|950)(?:/\d+)?(?![\w-])")),
    ("black/white", re.compile(rf"{B}{UTIL}-(?:black|white)(?:/\d+)?(?![\w-])")),
    ("one-off colour", re.compile(rf"{B}{UTIL}-\[(?:#|(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\()", re.I)),
    ("one-off size", re.compile(rf"{B}-?(?:p[trblxyse]?|m[trblxyse]?|gap(?:-[xy])?|space-[xy]|"
                                rf"rounded(?:-[a-z]{{1,2}})?|size|stroke)-\[{NOT_COLOUR}")),
]
VIEW_RULES = [
    ("raw radius", re.compile(rf"{B}rounded(?:-(?:tl|tr|bl|br|ss|se|es|ee|[trblse]))?"
                              r"(?:-(?:xs|sm|md|lg|xl|2xl|3xl|4xl))?(?![\w-])")),
    ("raw shadow", re.compile(rf"{B}shadow(?:-(?:2xs|xs|sm|md|lg|xl|2xl))?(?![\w-])")),
]
LOOSE_FOR_VENDORED = {"black/white", "one-off size"}  # stock shadcn primitives use these
SVG_RE = re.compile(r"<(?:svg|path)\b")
STRING_RE = re.compile(r""""(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\\n]|\\.)*`""")
CLASSY = re.compile(r"^[!\w:/.\[\]()%#,*&>~+=-]+$")
HEX_LITERAL = re.compile(r"^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$")
COLOUR_FN = re.compile(r"\b(?:rgba?|hsla?|oklch|oklab)\(", re.I)
CSS_HEX = re.compile(r"(?<=[\s:,(])#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b")


def settings() -> dict:
    return core.load_gate(required=False).get("tokens", {})


def applies(path: str) -> bool:
    ext = "." + path.rsplit(".", 1)[-1].lower() if "." in path else ""
    return (ext in SCAN_EXTS and not path.startswith(core.SHARED_PREFIXES)
            and not core.matches(path, SKIP + settings().get("exempt", [])))


def looks_like_classes(literal: str) -> bool:
    words = literal.split()
    return bool(words) and all(CLASSY.match(w) for w in words) and any("-" in w or ":" in w for w in words)


def scan(path: str, text: str) -> tuple[list[tuple[str, int, str]], list[str]]:
    """Hits as (rule, line, snippet), plus excused lines (tokens-ok) for the report."""
    ext = "." + path.rsplit(".", 1)[-1].lower()
    is_defs = core.matches(path, settings().get("defs", DEFAULT_DEFS))
    vendored = core.matches(path, VENDORED)
    is_view = bool(re.search(r"\.view\.(tsx|jsx)$", path))
    rules = CLASS_RULES + (VIEW_RULES if is_view else [])
    hits, excused = [], []
    for n, line in enumerate(text.splitlines(), 1):
        found: list[tuple[str, str]] = []
        if ext in STYLE_EXTS:
            chunks = [line]
        else:
            chunks = [s[1:-1] for s in STRING_RE.findall(line)]
        for chunk in chunks:
            if ext in STYLE_EXTS or looks_like_classes(chunk):
                for name, rx in rules:
                    if vendored and name in LOOSE_FOR_VENDORED:
                        continue
                    found += [(name, m.group(0)) for m in rx.finditer(chunk)]
            if not is_defs and ext not in STYLE_EXTS:
                if HEX_LITERAL.match(chunk.strip()) or COLOUR_FN.search(chunk):
                    found.append(("colour literal", chunk.strip()[:40]))
        if ext in STYLE_EXTS and not is_defs:
            found += [("colour literal", m.group(0)) for m in CSS_HEX.finditer(line)]
            found += [("colour literal", m.group(0)) for m in COLOUR_FN.finditer(line)]
        if ext in MARKUP_EXTS and not vendored and SVG_RE.search(line):
            found.append(("hand-drawn svg", SVG_RE.search(line).group(0)))
        if not found:
            continue
        if ESCAPE in line:
            excused.append(f"{path}:{n} {line.split(ESCAPE, 1)[1].strip()[:80] or '(no reason given)'}")
            continue
        hits += [(rule, n, snippet) for rule, snippet in found]
    return hits, excused


def added_hits(path: str, old: str | None, new: str) -> list[tuple[str, int, str]]:
    """Hits in new that old didn't have (all of them for a new file)."""
    found, _ = scan(path, new)
    if old is None:
        return found
    extra = Counter((r, s) for r, _, s in found) - Counter((r, s) for r, _, s in scan(path, old)[0])
    out = []
    for rule, n, snippet in found:
        if extra[(rule, snippet)] > 0:
            extra[(rule, snippet)] -= 1
            out.append((rule, n, snippet))
    return out


FIX = {"palette colour": "a semantic token (bg-primary, text-muted-foreground, bg-success, text-warning-foreground)",
       "black/white": "text-primary-foreground / bg-background",
       "one-off colour": "a token, or add a token pair to the theme file",
       "one-off size": "the scale (p-4) or a semantic token (p-card, rounded-card, size-icon-md)",
       "raw radius": "rounded-card / rounded-control / rounded-pill",
       "raw shadow": "shadow-raised / shadow-elevated / shadow-overlay",
       "colour literal": "a CSS token in the theme file",
       "hand-drawn svg": "an icon component (lucide-react) or an image file"}


def config_problems() -> list[str]:
    problems = []
    for path in core.repo_files():
        if path.rsplit("/", 1)[-1] == "components.json" and not path.startswith(core.SHARED_PREFIXES):
            try:
                data = json.loads(core.read_text(core.ROOT / path))
            except (json.JSONDecodeError, OSError):
                continue
            if data.get("tailwind", {}).get("cssVariables") is False:
                problems.append(f"{path}: tailwind.cssVariables is false - client theming needs CSS variables "
                                "(shadcn can't change this after init; re-init with CSS variables)")
    for path in core.repo_files():
        if core.matches(path, settings().get("presets", DEFAULT_PRESETS)):
            problems += [f"{path}: {p}" for p in preset_problems(core.ROOT / path)]
    return problems


def preset_problems(path) -> list[str]:
    try:
        data = json.loads(core.read_text(path))
    except (json.JSONDecodeError, OSError) as e:
        return [f"not readable JSON ({e})"]
    problems = []
    for preset in data.get("presets", []):
        pid = preset.get("id", "?")
        for token, value in preset.get("tokens", {}).items():
            if (why := colour.check_value(token, str(value))):
                problems.append(f"preset {pid} {token}: {why}")
        for mode in ("light", "dark"):
            values = {k: str(v) for k, v in preset.get(mode, {}).items()}
            problems += [f"preset {pid} {mode} {k}: {why}" for k, v in values.items() if (why := colour.check_value(k, v))]
            problems += [f"preset {pid} {mode}: {p}" for p in colour.check_pairs(values)]
    return problems


def guard(task_id: str | None = None, base: str | None = None, staged: bool = False) -> tuple[bool, str, list[str], list[str]]:
    problems, notes = config_problems(), []
    if not core.in_git():
        return not problems, "not a git repo - only config and presets checked", problems, notes
    old_base = "HEAD" if staged else core.resolve_base(base)
    checked = 0
    for path in core.changed_files(None if staged else old_base, staged):
        if not applies(path) or (new := core.new_content(path, staged)) is None:
            continue
        checked += 1
        old = core.old_content(path, old_base)
        found, excused = scan(path, new)
        notes += [f"tokens-ok used: {e}" for e in excused]
        added = added_hits(path, old, new)
        for rule, n, snippet in added:
            problems.append(f"{path}:{n} {rule} '{snippet}' - use {FIX[rule]}")
        if found and not added:
            notes.append(f"legacy: {len(found)} hard-coded style(s) left in {path} - fix them when you next restyle it")
    return not problems, f"{checked} changed file(s), no new hard-coded styles", problems, notes


def cmd_tokens(args: argparse.Namespace) -> None:
    ok, summary, problems, notes = guard(args.task, args.base, args.staged)
    zones.print_result(ok, summary, problems, notes)
    sys.exit(0 if ok else 1)
