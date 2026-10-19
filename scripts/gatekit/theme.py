"""Theme tokens: show and set token values in the theme CSS files or the brand presets.

A look change ("rounder", "warmer", "denser") is one checked command, not edits across screens.
Values are format-checked, and colour/foreground pairs must keep WCAG AA contrast.
"""
from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from functools import lru_cache

from . import colour, core, tokens

BLOCK_RE = re.compile(r"(?m)^[ \t]*(:root|\.dark|@theme(?:[ \t]+inline)?)[ \t]*\{")
VAR_DEF = re.compile(r"--([A-Za-z0-9-]+)\s*:\s*([^;{}]+?)\s*;")
MODES = {":root": "light", "@theme": "light", "@theme inline": "light", ".dark": "dark"}


@dataclass
class Def:
    file: str
    block: str
    name: str
    value: str
    start: int
    end: int

    @property
    def mode(self) -> str:
        return MODES[self.block]


def parse_defs(path: str, text: str) -> list[Def]:
    defs = []
    for m in BLOCK_RE.finditer(text):
        depth, i = 1, m.end()
        while i < len(text) and depth:
            depth += {"{": 1, "}": -1}.get(text[i], 0)
            i += 1
        block = re.sub(r"\s+", " ", m.group(1))
        defs += [Def(path, block, v.group(1), v.group(2), v.start(2), v.end(2)) for v in VAR_DEF.finditer(text, m.end(), i - 1)]
    return defs


@lru_cache(maxsize=1)
def theme_files() -> tuple[str, ...]:
    configured = tokens.settings().get("theme_files")
    if configured:
        return tuple(configured)
    return tuple(p for p in core.repo_files() if p.endswith(".css") and not p.startswith(core.SHARED_PREFIXES)
                 and not core.matches(p, tokens.SKIP) and BLOCK_RE.search(core.read_text(core.ROOT / p)))


def all_defs() -> list[Def]:
    return [d for f in theme_files() for d in parse_defs(f, core.read_text(core.ROOT / f))]


def mode_values(defs: list[Def], mode: str) -> dict[str, str]:
    return {d.name: d.value for d in defs if d.mode == mode and not d.value.startswith("var(")}


def preset_files() -> list[str]:
    return [p for p in core.repo_files() if core.matches(p, tokens.settings().get("presets", tokens.DEFAULT_PRESETS))]


def cmd_theme(args: argparse.Namespace) -> None:
    (theme_show if args.action == "show" else theme_set)(args)


def theme_show(args: argparse.Namespace) -> None:
    words = [w.lower() for w in args.words]
    rows: dict[str, dict[str, str]] = {}
    for d in all_defs():
        if d.value.startswith("var(") and not args.all:
            continue  # @theme inline mappings like --color-primary: var(--primary)
        rows.setdefault(d.name, {})[d.mode] = d.value
    names = [n for n in rows if not words or any(w in n for w in words)]
    if not theme_files():
        core.die("NO THEME FILES: no CSS file with :root / .dark / @theme blocks yet (set tokens.theme_files in gate.json)")
    print(f"THEME {', '.join(theme_files())} - {len(names)} token(s)" + (" (filtered)" if words else ""))
    for n in names[:args.limit]:
        light, dark = rows[n].get("light"), rows[n].get("dark")
        print(f"  {n:<26} {light or '-'}" + (f"  | dark {dark}" if dark and dark != light else ""))
    if len(names) > args.limit:
        print(f"  ...{len(names) - args.limit} more - add words to filter, e.g. `theme show primary radius`")
    if preset_files():
        print(f"  presets: {', '.join(preset_files())} (edit with --preset <id>)")


def contrast_fix(token: str, value: str, values: dict[str, str], fix: bool) -> tuple[str, str] | None:
    """Refuse an unreadable pair; with --fix-foreground, return (foreground token, new value)."""
    values = {**values, token: value}
    pair = colour.partner(token, set(values))
    if not pair:
        return None
    ratio = colour.contrast(values[pair[0]], values[pair[1]])
    if ratio is None or ratio >= colour.MIN_CONTRAST:
        return None
    if fix and token == pair[0]:
        return pair[1], colour.readable_text_for(value)
    core.die(f"REFUSED: {pair[0]} / {pair[1]} would have contrast {ratio:.2f}:1 (needs {colour.MIN_CONTRAST}:1). "
             + ("Re-run with --fix-foreground to pick a readable text colour." if token == pair[0]
                else "Pick a lighter or darker text colour."))


def theme_set(args: argparse.Namespace) -> None:
    token, value = args.token.removeprefix("--"), args.value.strip()
    if (why := colour.check_value(token, value)):
        core.die(f"REFUSED: {token} = {value!r}: {why}")
    modes = ["light", "dark"] if args.both else ["dark"] if args.dark else ["light"]
    if args.preset:
        return set_preset(args.preset, token, value, modes, args.fix_foreground)
    defs = all_defs()
    edits: list[tuple[Def, str]] = []
    for mode in modes:
        targets = [d for d in defs if d.name == token and d.mode == mode and (not args.file or d.file == args.file)]
        if not targets:
            core.die(f"NOT A TOKEN: --{token} isn't defined for {mode} in {', '.join(theme_files()) or 'any theme file'}. "
                     "New tokens go into the theme CSS (:root, .dark and the @theme inline mapping) in a Standard task; "
                     "see `gate.py theme show`.")
        values = [d for d in targets if not d.value.startswith("var(")]  # skip @theme inline mappings
        if not values:
            core.die(f"MAPPING: --{token} only points at {targets[0].value} - set that token instead")
        targets = values
        if len({d.file for d in targets}) > 1:
            core.die(f"AMBIGUOUS: --{token} is defined in {', '.join(sorted({d.file for d in targets}))} - add --file")
        edits += [(d, value) for d in targets]
        if colour.kind_of(token) == "colour":
            fix = contrast_fix(token, value, mode_values(defs, mode), args.fix_foreground)
            if fix:
                fg = [d for d in defs if d.name == fix[0] and d.mode == mode and not d.value.startswith("var(")]
                edits += [(d, fix[1]) for d in fg]
    by_file: dict[str, list[tuple[Def, str]]] = {}
    for d, v in edits:
        by_file.setdefault(d.file, []).append((d, v))
    for path, items in by_file.items():
        text = core.read_text(core.ROOT / path)
        for d, v in sorted(items, key=lambda e: -e[0].start):
            text = text[:d.start] + v + text[d.end:]
        core.write_text(core.ROOT / path, text)
    for d, v in edits:
        print(f"SET --{d.name} ({d.mode}, {d.file}): {d.value} -> {v}")


def set_preset(preset_id: str, token: str, value: str, modes: list[str], fix: bool) -> None:
    files = preset_files()
    if not files:
        core.die("NO PRESETS: no brand-presets.json in this project")
    path = files[0]
    data = json.loads(core.read_text(core.ROOT / path))
    preset = next((p for p in data.get("presets", []) if p.get("id") == preset_id), None)
    if preset is None:
        core.die(f"NOT FOUND: no preset {preset_id!r} - presets: {', '.join(p.get('id', '?') for p in data.get('presets', []))}")
    changed = []
    if colour.kind_of(token) != "colour":
        if token not in preset.get("tokens", {}):
            core.die(f"NOT A TOKEN: preset {preset_id} has no tokens.{token}")
        changed.append((f"tokens.{token}", preset["tokens"][token], value))
        preset["tokens"][token] = value
    else:
        for mode in modes:
            values = preset.get(mode, {})
            if token not in values:
                core.die(f"NOT A TOKEN: preset {preset_id} has no {mode}.{token}")
            extra = contrast_fix(token, value, values, fix)
            changed.append((f"{mode}.{token}", values[token], value))
            values[token] = value
            if extra:
                changed.append((f"{mode}.{extra[0]}", values[extra[0]], extra[1]))
                values[extra[0]] = extra[1]
    core.save_json(core.ROOT / path, data)
    for where, old, new in changed:
        print(f"SET preset {preset_id} {where}: {old} -> {new}")
