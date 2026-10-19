"""Zones: the zone map, zone-check (lock + import rules), generated zone files, and the pre-commit hook."""
from __future__ import annotations

import argparse
import os
import posixpath
import re
import stat
import sys
from dataclasses import dataclass
from pathlib import Path

from . import core

CODE_IMPORT_EXTS = {".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"}
IMPORT_RE = re.compile(r"""(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)["']([^"'\n]+)["']""")
ZONES_START, ZONES_END = "<!-- zones:start -->", "<!-- zones:end -->"
ZONES_MD = core.AGENTS_DIR / "ZONES.md"
HOOK_MARK = "# installed by scripts/gate.py install-hooks"
HOOK = f"""#!/bin/sh
{HOOK_MARK}
# Zone, size, token, view and mirror guards. Never bypass them with --no-verify.
cd "$(git rev-parse --show-toplevel)" || exit 1
PY=python
command -v python >/dev/null 2>&1 || PY=python3
"$PY" scripts/gate.py zone-check --staged && "$PY" scripts/gate.py budget --staged \\
  && "$PY" scripts/gate.py tokens --staged && "$PY" scripts/gate.py views --staged && "$PY" scripts/gate.py check-agents
"""
POST_HOOK = f"""#!/bin/sh
{HOOK_MARK}
# Frees the zone lock of a task that `gate.py done` closed, once its files are committed.
cd "$(git rev-parse --show-toplevel)" || exit 0
PY=python
command -v python >/dev/null 2>&1 || PY=python3
"$PY" scripts/gate.py release-done || true
"""
HOOKS = {"pre-commit": HOOK, "post-commit": POST_HOOK}


@dataclass
class ZoneMap:
    zones: dict    # canonical zone id -> zone dict
    folders: list  # folder dicts: path, zone (canonical), purpose, package?, may_import?

    def canon(self, zone_id: str) -> str | None:
        for zid in self.zones:
            if zid.lower() == str(zone_id).strip().lower():
                return zid
        return None

    def owner(self, path: str) -> dict | None:
        best = None
        for folder in self.folders:
            if path == folder["path"] or path.startswith(folder["path"] + "/"):
                if best is None or len(folder["path"]) > len(best["path"]):
                    best = folder
        return best


def load_zones(required: bool = False) -> ZoneMap | None:
    if not core.ZONES_JSON.exists():
        if required:
            core.die("ERROR: no .agents/zones.json yet - it is written in onboarding step 7 (Zones + domains).")
        return None
    data = core.load_json(core.ZONES_JSON)
    errors: list[str] = []
    zm = ZoneMap({}, [])
    for zone in data.get("zones", []):
        zid = str(zone.get("id", "")).strip()
        if not re.fullmatch(r"[A-Za-z0-9_-]+", zid):
            errors.append(f"bad zone id {zid!r} (letters, digits, - and _ only)")
        elif zm.canon(zid):
            errors.append(f"duplicate zone id {zid}")
        else:
            zm.zones[zid] = zone
    seen = set()
    for folder in data.get("folders", []):
        path = str(folder.get("path", "")).strip().replace("\\", "/").strip("/")
        if not path or path.startswith(".") or ".." in path.split("/") or ":" in path or path in seen:
            errors.append(f"bad or duplicate folder path {path!r}")
            continue
        seen.add(path)
        zid = zm.canon(folder.get("zone", ""))
        if zid is None:
            errors.append(f"{path}: unknown zone {folder.get('zone')!r}")
            continue
        zm.folders.append({**folder, "path": path, "zone": zid})
    refs = [(f"zone {zid}", z.get("may_import", [])) for zid, z in zm.zones.items()]
    refs += [(f["path"], f["may_import"]) for f in zm.folders if "may_import" in f]
    errors += [f"{owner}: may_import names unknown zone {n!r}" for owner, names in refs for n in names if zm.canon(n) is None]
    if errors:
        core.die("ERROR: .agents/zones.json has problems:\n  " + "\n  ".join(errors))
    return zm


def soft_canon(zone_id: str, zm: ZoneMap | None) -> str | None:
    if not zone_id:
        return None
    return zm.canon(zone_id) if zm else zone_id.strip().upper()


def canon_zone(zone_id: str, zm: ZoneMap | None) -> str:
    if zm:
        zid = zm.canon(zone_id)
        if zid is None:
            core.die(f"ERROR: unknown zone {zone_id!r} - zones are: {', '.join(zm.zones)}")
        return zid
    if not re.fullmatch(r"[A-Za-z0-9_-]+", zone_id):
        core.die(f"ERROR: bad zone id {zone_id!r}")
    return zone_id.upper()


# ---------------------------------------------------------------- zone-check

def import_targets(path: str, text: str, zm: ZoneMap) -> list[tuple[str, dict]]:
    targets = []
    for spec in IMPORT_RE.findall(text):
        if spec.startswith("."):
            folder = zm.owner(posixpath.normpath(posixpath.join(posixpath.dirname(path), spec)))
        else:
            folder = next((f for f in zm.folders if f.get("package") and
                           (spec == f["package"] or spec.startswith(f["package"] + "/"))), None)
        if folder:
            targets.append((spec, folder))
    return targets


def import_rule(src: dict, dst: dict, zm: ZoneMap) -> str | None:
    if dst["path"] == src["path"]:
        return None
    if dst["path"].startswith("apps/"):
        return "apps are never imported"
    if src["zone"] == dst["zone"] or zm.zones[dst["zone"]].get("shared"):
        return None
    allowed = src["may_import"] if "may_import" in src else zm.zones[src["zone"]].get("may_import", [])
    if dst["zone"] in {zm.canon(a) for a in allowed}:
        return None
    return f"zone {src['zone']} may not import zone {dst['zone']}"


def held_zones(zm: ZoneMap, task_id: str | None) -> list[str]:
    """Zones this checkout may edit: the zone locked by this checkout's task."""
    if not task_id:
        return []
    return sorted(z for z, d in core.load_locks().items() if str(d.get("task", "")).upper() == task_id)


def zone_check(task_id: str | None = None, base: str | None = None, staged: bool = False,
               imports_only: bool = False) -> tuple[bool, str, list[str], list[str]]:
    zm = load_zones()
    if zm is None:
        return True, "no zones.json - nothing to check", [], []
    task_id = core.my_task_id(task_id)
    held = held_zones(zm, task_id)
    in_zone = shared = 0
    problems: list[str] = []
    warnings: list[str] = []
    files = core.changed_files(None if staged else core.resolve_base(base), staged)
    for path in files:
        folder = zm.owner(path)
        if folder and posixpath.basename(path) in core.ZONE_META_FILES:
            shared += 1
            continue
        if folder:
            if folder["zone"] in held:
                in_zone += 1
            elif not imports_only:
                why = f"held: {', '.join(held)}" if held else "no zone lock held by this checkout's task"
                problems.append(f"out of zone: {path} (zone {folder['zone']}; {why})")
            text = core.new_content(path, staged)
            if text and Path(path).suffix in CODE_IMPORT_EXTS:
                for spec, target in import_targets(path, text, zm):
                    why = import_rule(folder, target, zm)
                    if why:
                        problems.append(f"import: {path} -> {spec} ({why})")
        elif path.startswith(core.SHARED_PREFIXES) or path in core.SHARED_FILES:
            shared += 1
        elif not imports_only:
            warnings.append(f"root file changed: {path} - outside every zone, say why in the plan")
    summary = f"{in_zone} file(s) in zone {', '.join(held) or '-'}, {shared} shared, 0 import violations"
    return not problems, summary, problems, warnings


def print_result(ok: bool, summary: str, problems: list[str], warnings: list[str]) -> None:
    if not ok:
        print("FAIL")
        for problem in problems[:20]:
            print(f"  {problem}")
        if len(problems) > 20:
            print(f"  ...and {len(problems) - 20} more")
    else:
        print(("PASS WITH WARNINGS: " if warnings else "PASS: ") + summary)
    for warning in warnings:
        print(f"  warn: {warning}")


def cmd_zone_check(args: argparse.Namespace) -> None:
    ok, summary, problems, warnings = zone_check(args.task, args.base, args.staged, args.imports_only)
    print_result(ok, summary, problems, warnings)
    sys.exit(0 if ok else 1)


# ---------------------------------------------------------------- generated zone files

def zone_claude_md(folder: dict, zm: ZoneMap) -> str:
    zone = zm.zones[folder["zone"]]
    allowed = folder["may_import"] if "may_import" in folder else zone.get("may_import", [])
    shared = [z for z, d in zm.zones.items() if d.get("shared") and z not in allowed and z != folder["zone"]]
    imports = ", ".join(allowed) or "no other zone"
    return (
        "<!-- GENERATED by `python scripts/gate.py zones` from .agents/zones.json. "
        "Edit zones.json or CONTEXT.md, never this file. -->\n"
        f"# Zone {folder['zone']} ({zone.get('name', '')}): `{folder['path']}/`\n\n"
        "Loaded automatically when you work in this folder.\n\n"
        f"- **Lock first:** `python scripts/gate.py lock {folder['zone']} --task <TASK-ID>`, "
        "or work inside that task's worktree.\n"
        f"- **May import:** zone(s) {imports}" + (f", plus shared zone(s) {', '.join(shared)}" if shared else "")
        + ". Never import an app, or any other zone.\n"
        "- **Before coding:** check `docs/stack-cheat-sheet.md` for each library you touch. "
        "Read files over 400 lines by range, never whole.\n"
        "- **Find a feature:** `python scripts/gate.py where <domain>`. "
        "Its history: `python scripts/gate.py search \"<words>\"`.\n"
        "- **Small visual change?** A Tiny task: find it with `gate.py ui`, edit it with `gate.py swap` or "
        "`theme set`. Never read `*.container.tsx` or `api/` code for styling, and never rewrite a whole file "
        "for a class change.\n"
        "- **Never** commit with `--no-verify`.\n\n"
        "@CONTEXT.md\n"
    )


def folder_contract(folder: dict, zm: ZoneMap) -> str:
    zone = zm.zones[folder["zone"]]
    return (
        f"---\ntype: contract\nfolder: \"{folder['path']}\"\nzone: \"{folder['zone']}\"\n"
        f"role: product\nlast_updated: \"{core.today()}\"\n---\n\n"
        f"# CONTEXT.md — {folder['path']}\n\n"
        f"**Zone {folder['zone']} ({zone.get('name', '')}).** {folder.get('purpose', '')}\n\n"
        "## Zone rules\n\n"
        "{{Hand-written rules for this folder only, e.g. \"UI: design tokens only, no hex values\". "
        "Import rules are generated into CLAUDE.md.}}\n\n"
        "## What it reads (inputs)\n\n{{Which docs/specs sections and shared contracts this folder implements.}}\n\n"
        "## What it produces (outputs)\n\n{{A deployable app, a package other zones import, a background job.}}\n\n"
        "## What a human checks\n\n{{What the owner looks at before work here counts as ready.}}\n"
    )


def zone_table(zm: ZoneMap) -> str:
    def cell(text: object) -> str:
        return str(text).replace("|", "\\|")

    lines = ["_Generated from `.agents/zones.json` by `python scripts/gate.py zones`; never edit by hand. "
             "Folder-by-folder map: `.agents/ZONES.md`. Each zone folder's own CLAUDE.md repeats its rules._", "",
             "| Zone | Name | May import |", "|---|---|---|"]
    for zid, zone in zm.zones.items():
        name = cell(zone.get("name", "")) + (" (shared: every zone may import it)" if zone.get("shared") else "")
        lines.append(f"| {zid} | {name} | {', '.join(zone.get('may_import', [])) or 'nothing'} |")
    return "\n".join(lines)


def folders_md(zm: ZoneMap) -> str:
    lines = ["<!-- GENERATED by `python scripts/gate.py zones` from .agents/zones.json. Never edit by hand. -->",
             "# Folder → zone map", "", "| Folder | Zone | Purpose |", "|---|---|---|"]
    for folder in zm.folders:
        extra = f" _(stricter: imports only {', '.join(folder['may_import']) or 'nothing'})_" if "may_import" in folder else ""
        lines.append(f"| `{folder['path']}/` | {folder['zone']} | {str(folder.get('purpose', '')).replace('|', '/')}{extra} |")
    return "\n".join(lines) + "\n"


def write_generated(path: Path, text: str, dry: bool) -> None:
    old = core.read_text(path) if path.exists() else None
    if old == text:
        return
    print(f"{'CREATE' if old is None else 'UPDATE'}  {core.rel(path)}" + (" (dry run)" if dry else ""))
    if not dry:
        core.write_text(path, text)


def cmd_zones(args: argparse.Namespace) -> None:
    zm = load_zones(required=True)
    for folder in zm.folders:
        contract = core.ROOT / folder["path"] / "CONTEXT.md"
        if not contract.exists():
            write_generated(contract, folder_contract(folder, zm), args.dry_run)
        write_generated(core.ROOT / folder["path"] / "CLAUDE.md", zone_claude_md(folder, zm), args.dry_run)
    write_generated(ZONES_MD, folders_md(zm), args.dry_run)
    if not core.AGENTS_MD.exists():
        core.die("ERROR: no AGENTS.md at the repo root")
    text = core.read_text(core.AGENTS_MD)
    start, end = text.find(ZONES_START), text.find(ZONES_END)
    if start == -1 or end < start:
        core.die(f"ERROR: AGENTS.md has no {ZONES_START} ... {ZONES_END} markers")
    write_generated(core.AGENTS_MD, text[:start + len(ZONES_START)] + "\n" + zone_table(zm) + "\n" + text[end:], args.dry_run)
    print("ZONES: up to date")


# ---------------------------------------------------------------- pre-commit hook

def hook_path(name: str = "pre-commit") -> Path | None:
    out = core.git_lines("rev-parse", "--path-format=absolute", "--git-path", "hooks")
    return Path(out[0]) / name if out else None


def hook_installed() -> bool:
    """Both hooks are ours and current (an older pre-commit-only install counts as not installed)."""
    paths = [hook_path(name) for name in HOOKS]
    return all(p and p.exists() and core.read_text(p) == HOOKS[p.name] for p in paths)


def cmd_install_hooks(args: argparse.Namespace) -> None:
    paths = [hook_path(name) for name in HOOKS]
    if None in paths:
        core.die("ERROR: not a git repo - run `git init` first")
    for path in paths:
        if path.exists() and HOOK_MARK not in core.read_text(path):
            core.die(f"REFUSED: {path} already exists and was not written by gate.py. "
                     "Ask the owner before replacing it; to combine them, call `scripts/gate.py` from that hook.")
    for path in paths:
        core.write_text(path, HOOKS[path.name])
        os.chmod(path, os.stat(path).st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
        print(f"INSTALLED: {path.name} hook -> {path}")
