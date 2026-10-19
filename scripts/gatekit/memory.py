"""Memory, Hot / Warm / Cold, all written by script (zero AI tokens).

Hot  = live files (next-steps, newest CHANGELOG entries, newest done tasks, open bugs, patterns).
Warm = each domain file's History section (one verbatim line per finished task).
Cold = .agents/archive/, kept out of search by .ignore and queried with `gate.py search`.
"""
from __future__ import annotations

import argparse
import os
import re
import shutil
import sys
from datetime import date, timedelta
from pathlib import Path

from . import core, domains, tasks

ENTRY_RE = re.compile(r"(?m)^## (\d{4})-\d{2}-\d{2}")
DATE_RE = re.compile(r"(\d{4}-\d{2}-\d{2})")
INDEX_DB = core.AGENTS_DIR / "search-index.db"
ARCHIVE_DEFAULTS = {"keep_done_tasks": 20, "keep_changelog_entries": 30, "keep_fixed_bugs": 50,
                    "keep_history_lines": 40, "keep_redteam_days": 90}


def archive_cfg() -> dict:
    return {**ARCHIVE_DEFAULTS, **core.load_gate(required=False).get("archive", {})}


def move(src: Path, dst: Path) -> Path:
    """Move a file, with `git mv` when it is tracked so the move is already staged."""
    dst.parent.mkdir(parents=True, exist_ok=True)
    tracked = core.in_git() and core.git_lines("ls-files", "--error-unmatch", core.rel(src)) is not None
    if not (tracked and core.git("mv", core.rel(src), core.rel(dst)).returncode == 0):
        shutil.move(str(src), str(dst))
    return dst


# ---------------------------------------------------------------- recording a finished task

def section(text: str, heading: str) -> str:
    m = re.search(rf"(?ms)^##+ {re.escape(heading)}[^\n]*\n(.*?)(?=^##|\Z)", text)
    lines = [l.strip(" -*\t") for l in (m.group(1) if m else "").splitlines()]
    return " ".join(l for l in lines if l and not l.startswith("<!--"))


def decision_line(task) -> str:
    plan = core.ROOT / task.get("plan") if task.get("plan") else None
    text = section(core.read_text(plan), "Decision") if plan and plan.exists() else ""
    text = text or task.get("outcome") or "(no plan - see the task file)"
    return text[:220] + ("..." if len(text) > 220 else "")


def add_changelog_entry(entry: str) -> Path:
    text = core.read_text(core.CHANGELOG) if core.CHANGELOG.exists() else "# Changelog\n\n---\n"
    m = ENTRY_RE.search(text)
    new = text[:m.start()] + entry + "\n" + text[m.start():] if m else text.rstrip("\n") + "\n\n" + entry
    core.write_text(core.CHANGELOG, new)
    return core.CHANGELOG


def record_outcome(task) -> list[Path]:
    """Single writer: the CHANGELOG entry and the domain History line come from the task file."""
    extras = []
    if task.get_list("budget_override"):
        extras.append("budget override: " + ", ".join(task.get_list("budget_override")))
    body = (task.get("outcome") or task.title) + (f" ({'; '.join(extras)})" if extras else "")
    written = [add_changelog_entry(f"## {core.today()} — {task.id} {task.title}\n{body}\n")]
    line = f"- {core.today()} · {task.id} · {task.title} — {decision_line(task)}"
    written += domains.append_history(task.domain, line, archive_cfg()["keep_history_lines"])
    written += domains.activate(task.domain)
    return written


# ---------------------------------------------------------------- archive

def prepend_archive(path: Path, title: str, block: str) -> Path:
    head = (f"# {title}\n\nRolled out of the live files by `python scripts/gate.py archive`. "
            "Search it with `python scripts/gate.py search \"<words>\"`.\n\n")
    old = core.read_text(path)[len(head):] if path.exists() else ""
    core.write_text(path, head + block.strip("\n") + "\n\n" + old.lstrip("\n"))
    return path


def roll_changelog(keep: int) -> list[Path]:
    if not core.CHANGELOG.exists():
        return []
    text = core.read_text(core.CHANGELOG)
    starts = [m.start() for m in ENTRY_RE.finditer(text)]
    if len(starts) <= keep:
        return []
    overflow = text[starts[keep]:]
    core.write_text(core.CHANGELOG, text[:starts[keep]].rstrip("\n") + "\n")
    by_year: dict[str, list[str]] = {}
    marks = [(m.start(), m.group(1)) for m in ENTRY_RE.finditer(overflow)] + [(len(overflow), "")]
    for (start, year), (end, _) in zip(marks, marks[1:]):
        by_year.setdefault(year, []).append(overflow[start:end].strip("\n"))
    written = [core.CHANGELOG]
    for year, entries in by_year.items():
        path = core.ARCHIVE_DIR / "changelog" / f"CHANGELOG-{year}.md"
        written.append(prepend_archive(path, f"Changelog archive {year}", "\n\n".join(entries)))
    return written


def run_archive() -> list[Path]:
    cfg, written = archive_cfg(), []
    done = sorted((t for t in tasks.load_tasks() if t.status == "done"), key=lambda t: (t.get("done") or "0", t.id))
    for task in done[:max(0, len(done) - cfg["keep_done_tasks"])]:
        month = (task.get("done") or core.today())[:7]
        if task.get("plan"):
            plan = core.ROOT / task.get("plan")
            ledger = plan.with_name(plan.name.removesuffix(".md") + ".critique.md")
            new_plan = core.ARCHIVE_DIR / "plans" / month / plan.name
            for path, dest in ((plan, new_plan), (ledger, new_plan.with_name(ledger.name))):
                if path.exists():
                    written.append(move(path, dest))
            task.set("plan", core.rel(new_plan))
        written.append(move(task.path, core.ARCHIVE_DIR / "tasks" / month / task.path.name))
    written += roll_changelog(cfg["keep_changelog_entries"])
    fixed = sorted((core.AGENTS_DIR / "bugs" / "fixed").glob("BUG-*.md"))
    for bug in fixed[:max(0, len(fixed) - cfg["keep_fixed_bugs"])]:
        year = (DATE_RE.search(bug.name) or [None, "undated"])[1][:4]
        written.append(move(bug, core.ARCHIVE_DIR / "bugs" / year / bug.name))
    cutoff = (date.today() - timedelta(days=cfg["keep_redteam_days"])).isoformat()
    for ledger in sorted(core.PLANS_DIR.glob("SPEC-REDTEAM-*.critique.md")):
        if (m := DATE_RE.search(ledger.name)) and m.group(1) < cutoff:
            written.append(move(ledger, core.ARCHIVE_DIR / "plans" / "redteam" / ledger.name))
    return written


def cmd_archive(args: argparse.Namespace) -> None:
    written = run_archive()
    core.stage(written)
    moved = [core.rel(p) for p in written if core.ARCHIVE_DIR in p.parents]
    print(f"ARCHIVE: {len(moved)} file(s) moved or updated in .agents/archive/" if moved else "ARCHIVE: nothing to roll")
    for name in moved[:10]:
        print(f"  {name}")


# ---------------------------------------------------------------- search (SQLite FTS5, plain-scan fallback)

def history_files() -> list[Path]:
    roots = [core.ARCHIVE_DIR, core.AGENTS_DIR / "bugs", core.PLANS_DIR, core.DOMAINS_DIR, core.TASKS_DIR]
    files = [core.CHANGELOG] if core.CHANGELOG.exists() else []
    for root in roots:
        if root.is_dir():
            files += [p for p in sorted(root.rglob("*.md")) if not p.name.startswith("_") and p.name != "CONTEXT.md"]
    return files


def chunks(path: Path) -> list[tuple[str, str, str]]:
    """Split a file into (heading, date, body) sections at its `## ` headings."""
    text = core.read_text(path)
    meta = core.parse_frontmatter(text) or {}
    file_date = str(meta.get("done") or meta.get("date") or "") or ((DATE_RE.search(path.name) or [None, ""])[1])
    parts = re.split(r"(?m)^(?=## )", core.FRONTMATTER.sub("", text, count=1))
    out = []
    for part in parts:
        if part.strip():
            heading = part.splitlines()[0].strip("# ").strip()
            m = DATE_RE.match(heading)
            out.append((heading, m.group(1) if m else file_date, part))
    return out


def fts_available() -> bool:
    if os.environ.get("GATE_SEARCH_PLAIN"):
        return False
    try:
        import sqlite3
        sqlite3.connect(":memory:").execute("create virtual table t using fts5(x)")
        return True
    except Exception:
        return False


def ensure_index(files: list[Path]):
    import sqlite3
    stamp = f"{len(files)}:{max((p.stat().st_mtime_ns for p in files), default=0)}"
    if INDEX_DB.exists():
        try:
            conn = sqlite3.connect(INDEX_DB)
            if conn.execute("select value from meta where key = 'stamp'").fetchone() == (stamp,):
                return conn
            conn.close()
        except sqlite3.Error:
            pass
    tmp = INDEX_DB.with_name(f"search-index.{os.getpid()}.tmp")
    conn = sqlite3.connect(tmp)
    conn.execute("create virtual table docs using fts5(path unindexed, date unindexed, heading, body, "
                 "tokenize='porter unicode61')")
    conn.execute("create table meta (key text primary key, value text)")
    for path in files:
        conn.executemany("insert into docs values (?, ?, ?, ?)", [(core.rel(path), d, h, b) for h, d, b in chunks(path)])
    conn.execute("insert into meta values ('stamp', ?)", (stamp,))
    conn.commit()
    conn.close()
    try:
        os.replace(tmp, INDEX_DB)
        return sqlite3.connect(INDEX_DB)
    except PermissionError:  # another session has the index open: use this fresh copy once
        return sqlite3.connect(tmp)


def search_fts(terms: list[str], limit: int, files: list[Path]) -> list[tuple]:
    conn = ensure_index(files)
    sql = ("select path, date, heading, snippet(docs, 3, '[', ']', ' ... ', 14) from docs "
           "where docs match ? order by bm25(docs, 0, 0, 5.0, 1.0) limit ?")
    quoted = ['"' + t.replace('"', "") + '"' for t in terms]
    rows = conn.execute(sql, (" ".join(quoted), limit)).fetchall()
    rows = rows or conn.execute(sql, (" OR ".join(quoted), limit)).fetchall()
    conn.close()
    return rows


def search_plain(terms: list[str], limit: int, files: list[Path]) -> list[tuple]:
    scored = []
    for path in files:
        for heading, when, body in chunks(path):
            low = body.lower()
            hits = [low.count(t.lower()) for t in terms]
            if any(hits):
                line = next((l for l in body.splitlines() if any(t.lower() in l.lower() for t in terms)), "")
                scored.append((all(hits), sum(hits), (core.rel(path), when, heading, line.strip()[:160])))
    scored.sort(key=lambda s: (s[0], s[1]), reverse=True)
    return [row for *_, row in scored[:limit]]


def cmd_search(args: argparse.Namespace) -> None:
    terms = re.findall(r"[\w-]+", " ".join(args.words))
    if not terms:
        core.die("ERROR: give some words to search for")
    files = history_files()
    engine = "fts5" if fts_available() else "plain"
    rows = search_fts(terms, args.limit, files) if engine == "fts5" else search_plain(terms, args.limit, files)
    print(f"SEARCH \"{' '.join(terms)}\": {len(rows)} match(es) [{engine}, {len(files)} history files]")
    for i, (path, when, heading, snippet) in enumerate(rows, 1):
        print(f"{i}. {path}" + (f" ({when})" if when else "") + (f" - {heading[:80]}" if heading else ""))
        print(f"   {' '.join(str(snippet).split())[:180]}")
    if not rows:
        sys.exit(1)
