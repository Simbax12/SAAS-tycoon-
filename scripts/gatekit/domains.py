"""Domains: the Lookup Router (.agents/domains.json), `where`, `map --check`, and per-domain state files."""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

from . import core

HISTORY_START, HISTORY_END = "<!-- history:start -->", "<!-- history:end -->"
STATUSES = ("planned", "active")
FALLBACK_TEMPLATE = (
    "---\ntype: domain\ndomain: <name>\n---\n\n# Domain — <name>\n\n## Current state\n\n"
    "<!-- At most 20 lines, overwritten (never appended) on main after each task in this domain. -->\n"
    "- (not built yet)\n\n## History\n\nNewest first, one line per finished task, written by `gate.py`. "
    "Older lines: `python scripts/gate.py search \"<words>\"`.\n\n"
    f"{HISTORY_START}\n{HISTORY_END}\n"
)


def load_domains() -> dict:
    data = core.load_json(core.DOMAINS_JSON) if core.DOMAINS_JSON.exists() else {}
    data.setdefault("domains", {})
    data.setdefault("unmapped_ok", [])
    errors = []
    for name, d in data["domains"].items():
        if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", name):
            errors.append(f"bad domain name {name!r} (lowercase, digits and -)")
        if d.get("status", "planned") not in STATUSES:
            errors.append(f"{name}: status must be planned or active")
    if errors:
        core.die("ERROR: .agents/domains.json has problems:\n  " + "\n  ".join(errors))
    return data


def patterns(d: dict) -> list[str]:
    return list(d.get("files", [])) + list(d.get("contract", []))


def expand(d: dict) -> list[str]:
    pats = patterns(d)
    return [f for f in core.repo_files() if core.matches(f, pats)] if pats else []


def domain_files() -> list[Path]:
    if not core.DOMAINS_DIR.is_dir():
        return []
    return [p for p in sorted(core.DOMAINS_DIR.glob("*.md")) if not p.name.startswith("_") and p.name != "CONTEXT.md"]


def state_path(name: str) -> Path:
    return core.DOMAINS_DIR / f"{name}.md"


def ensure_state_file(name: str) -> Path:
    path = state_path(name)
    if not path.exists():
        template = core.DOMAINS_DIR / "_domain-template.md"
        text = core.read_text(template) if template.exists() else FALLBACK_TEMPLATE
        core.write_text(path, text.replace("<name>", name))
    return path


def append_history(name: str, line: str, keep: int) -> list[Path]:
    if not name:
        return []
    if name not in load_domains()["domains"]:
        print(f"WARN: domain {name!r} is not in .agents/domains.json - add it so `where` can find its files")
    path = ensure_state_file(name)
    text = core.read_text(path)
    if HISTORY_START not in text or HISTORY_END not in text:
        text = text.rstrip("\n") + f"\n\n## History\n\n{HISTORY_START}\n{HISTORY_END}\n"
    head, rest = text.split(HISTORY_START, 1)
    body, tail = rest.split(HISTORY_END, 1)
    lines = [line] + [l for l in body.strip("\n").splitlines() if l.strip()]
    room = core.budgets().get("domain_file", 100) - core.line_count(head + HISTORY_START + "\n" + HISTORY_END + tail)
    keep = max(5, min(keep, room))  # History never pushes the file past its cap (a long Current state still can)
    kept, overflow = lines[:keep], lines[keep:]
    core.write_text(path, f"{head}{HISTORY_START}\n" + "\n".join(kept) + f"\n{HISTORY_END}{tail}")
    written = [path]
    if overflow:
        from . import memory
        written.append(memory.prepend_archive(core.ARCHIVE_DIR / "domains" / f"{name}-history.md",
                                              f"Domain history archive: {name}", "\n".join(overflow)))
    return written


def activate(name: str) -> list[Path]:
    """A planned domain becomes active (and so checked by `map --check`) once its files exist."""
    data = load_domains()
    d = data["domains"].get(name)
    if not d or d.get("status", "planned") != "planned" or not expand(d):
        return []
    d["status"] = "active"
    core.save_json(core.DOMAINS_JSON, data)
    return [core.DOMAINS_JSON]


def find(query: str, data: dict) -> list[str]:
    q = query.lower()
    names = data["domains"]
    if q in names:
        return [q]
    hits = [n for n, d in names.items()
            if q in n or any(q in str(t).lower() for t in d.get("db_tables", []) + d.get("specs", []))]
    if hits:
        return hits[:3]
    return [n for n, d in names.items() if any(q in f.lower() for f in expand(d))][:3]


def describe(name: str, d: dict) -> list[str]:
    cap = core.budgets().get("code_max_lines", 400)
    files = expand(d)

    def label(f: str) -> str:
        n = core.line_count(core.read_text(core.ROOT / f)) if (core.ROOT / f).is_file() else 0
        return f"{f} ({n}{' - read by range' if n > cap else ''})"

    out = [f"WHERE {name} [{d.get('status', 'planned')}]" + (f" zones {', '.join(d.get('zones', []))}" if d.get("zones") else ""),
           f"  state:    {core.rel(state_path(name))}"]
    for key in ("specs", "db_tables"):
        if d.get(key):
            out.append(f"  {key + ':':<9} {', '.join(d[key])}")
    contract = [f for f in files if core.matches(f, d.get("contract", []))]
    if contract:
        out.append(f"  contract: {', '.join(label(f) for f in contract)}")
    code = [f for f in files if f not in contract and Path(f).name not in core.ZONE_META_FILES]
    out.append(f"  files ({len(code)}):" + ("" if code else " none yet"))
    out += [f"    {label(f)}" for f in code[:25]]
    if len(code) > 25:
        out.append(f"    ...and {len(code) - 25} more")
    return out


def cmd_where(args: argparse.Namespace) -> None:
    data = load_domains()
    names = find(" ".join(args.query), data)
    if not names:
        core.die(f"NOT FOUND: no domain matches {' '.join(args.query)!r} - domains: {', '.join(data['domains']) or 'none'}")
    for name in names:
        print("\n".join(describe(name, data["domains"][name])))


def map_check(base: str | None = None) -> tuple[bool, str, list[str], list[str]]:
    data = load_domains()
    problems, warnings = [], []
    for name, d in data["domains"].items():
        if d.get("status") == "active" and patterns(d) and not expand(d):
            problems.append(f"domain {name} is active but its globs match no files - update .agents/domains.json")
    if core.in_git():
        from . import checks
        cfg = core.budgets()
        code_exts = set(cfg.get("code_exts", checks.DEFAULT_CODE_EXTS))
        exempt = cfg.get("exempt", checks.DEFAULT_EXEMPT) + data["unmapped_ok"]
        every = [p for d in data["domains"].values() for p in patterns(d)]
        for path in core.changed_files(core.resolve_base(base)):
            if Path(path).suffix.lower() in code_exts and (core.ROOT / path).is_file() \
                    and not path.startswith(core.SHARED_PREFIXES) \
                    and not core.matches(path, exempt) and not core.matches(path, every):
                warnings.append(f"{path} belongs to no domain - add it to a domain's files (or to unmapped_ok)")
    return not problems, f"{len(data['domains'])} domain(s) mapped", problems, warnings


def cmd_map(args: argparse.Namespace) -> None:
    from . import zones
    if args.check:
        ok, summary, problems, warnings = map_check(args.base)
        zones.print_result(ok, summary, problems, warnings)
        sys.exit(0 if ok else 1)
    data = load_domains()
    print(f"DOMAINS ({len(data['domains'])})")
    for name, d in data["domains"].items():
        print(f"  {name:<28} {d.get('status', 'planned'):<8} {len(expand(d)):>4} file(s)")
