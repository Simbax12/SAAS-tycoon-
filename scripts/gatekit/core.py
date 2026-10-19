"""Shared helpers: paths, files, frontmatter, git, locks, the task marker, diff base and glob matching."""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from datetime import date, datetime, timezone
from functools import lru_cache
from pathlib import Path

from .globs import glob_regex, matches  # noqa: F401 - re-exported for the other modules

ROOT = Path(__file__).resolve().parent.parent.parent
AGENTS_DIR = ROOT / ".agents"
TASKS_DIR = AGENTS_DIR / "tasks"
PLANS_DIR = AGENTS_DIR / "plans"
ARCHIVE_DIR = AGENTS_DIR / "archive"
DOMAINS_DIR = AGENTS_DIR / "domains"
GATE_JSON = AGENTS_DIR / "gate.json"
ZONES_JSON = AGENTS_DIR / "zones.json"
DOMAINS_JSON = AGENTS_DIR / "domains.json"
CHANGELOG = AGENTS_DIR / "changelogs" / "CHANGELOG.md"
AGENTS_MD = ROOT / "AGENTS.md"
TIME_FMT = "%Y-%m-%dT%H:%M:%SZ"

SHARED_PREFIXES = (".agents/", "ai-context/", "docs/", "testing/", ".claude/", "scripts/", ".github/")
SHARED_FILES = {"AGENTS.md", "CLAUDE.md", ".gitignore", ".ignore", ".gitattributes"}
ZONE_META_FILES = {"CONTEXT.md", "CLAUDE.md"}


# ---------------------------------------------------------------- output and files

class AsciiStdout:
    """Prints typographic punctuation as ASCII, so output reads the same in every terminal and tool."""
    TABLE = str.maketrans({"—": "-", "–": "-", "·": "|", "→": "->", "‘": "'",
                           "’": "'", "“": '"', "”": '"', "…": "..."})

    def __init__(self, inner) -> None:
        self.inner = inner

    def write(self, text: str) -> int:
        return self.inner.write(text.translate(self.TABLE))

    def flush(self) -> None:
        self.inner.flush()

    def __getattr__(self, name: str):
        return getattr(self.inner, name)


def ascii_stdout() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(errors="replace")
    sys.stdout = AsciiStdout(sys.stdout)


def die(msg: str) -> None:
    print(msg)
    sys.exit(1)


def rel(path: Path) -> str:
    try:
        return path.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        return str(path)


def read_text(path: Path) -> str:
    return path.read_bytes().decode("utf-8", errors="replace")


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(text.encode("utf-8"))


def line_count(text: str | None) -> int:
    if not text:
        return 0
    return text.count("\n") + (0 if text.endswith("\n") else 1)


def load_json(path: Path) -> dict:
    try:
        return json.loads(read_text(path))
    except json.JSONDecodeError as e:
        die(f"ERROR: {rel(path)} is not valid JSON (line {e.lineno}): {e.msg}")


def save_json(path: Path, data: dict) -> None:
    write_text(path, json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def now() -> str:
    return datetime.now(timezone.utc).strftime(TIME_FMT)


def today() -> str:
    return date.today().isoformat()


def age_hours(stamp: object) -> float | None:
    try:
        started = datetime.strptime(str(stamp), TIME_FMT).replace(tzinfo=timezone.utc)
    except ValueError:
        return None
    return (datetime.now(timezone.utc) - started).total_seconds() / 3600


@lru_cache(maxsize=1)
def load_gate(required: bool = True) -> dict:
    if not GATE_JSON.exists():
        if required:
            die("ERROR: no .agents/gate.json - it is filled in onboarding step 8 (Gate commands).")
        return {}
    return load_json(GATE_JSON)


def budgets() -> dict:
    return load_gate(required=False).get("budgets", {})


ANSI = re.compile(r"\x1b\[[0-9;]*[A-Za-z]")
NOISE = re.compile(r"^\s*(>|\$ |npm (warn|notice)|warn(ing)?\b|info\b|\[\d+/\d+\])", re.I)
ERRORISH = re.compile(r"error|ERR!|fail|exception|cannot|not found|traceback", re.I)


def run_shell(cmd: str, timeout: int, cwd: Path = ROOT) -> tuple[int, str]:
    try:
        r = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True,
                           encoding="utf-8", errors="replace", timeout=timeout)
        return r.returncode, f"{r.stdout or ''}\n{r.stderr or ''}"
    except subprocess.TimeoutExpired:
        return 124, f"error: timed out after {timeout}s"


def first_error(output: str) -> str:
    lines = [l for l in (ANSI.sub("", l).strip() for l in output.splitlines()) if l]
    signal = [line for line in lines if not NOISE.match(line)]
    for line in signal:
        if ERRORISH.search(line):
            return line[:200]
    return (signal or lines or [""])[-1][:200]


# ---------------------------------------------------------------- frontmatter

FRONTMATTER = re.compile(r"\A---[ \t]*\r?\n(.*?)\r?\n---[ \t]*(?:\r?\n|\Z)", re.S)


def parse_value(raw: str) -> str | list[str]:
    raw = raw.strip()
    if raw[:1] in ("'", '"'):
        end = raw.find(raw[0], 1)
        return raw[1:end] if end != -1 else raw[1:]
    if raw.startswith("["):
        end = raw.find("]")
        inner = raw[1:end] if end != -1 else raw[1:]
        return [p.strip().strip("'\"") for p in inner.split(",") if p.strip()]
    return raw.split(" #", 1)[0].strip()


def parse_frontmatter(text: str) -> dict | None:
    m = FRONTMATTER.match(text)
    if not m:
        return None
    meta: dict = {}
    for line in m.group(1).splitlines():
        if line.strip() and not line.lstrip().startswith("#") and ":" in line:
            key, _, raw = line.partition(":")
            meta[key.strip()] = parse_value(raw)
    return meta


def set_field(path: Path, key: str, value: str | list[str]) -> None:
    """Set one frontmatter field in place, keeping the file's line endings."""
    text = read_text(path)
    m = FRONTMATTER.match(text)
    if not m:
        die(f"ERROR: {rel(path)} has no frontmatter")
    rendered = "[" + ", ".join(value) + "]" if isinstance(value, list) else str(value)
    if rendered != "" and not isinstance(value, list) and re.search(r"[:#\[]", rendered):
        rendered = '"' + rendered.replace('"', "'") + '"'
    block = m.group(1)
    pattern = rf"(?m)^{re.escape(key)}:[^\r\n]*"
    if re.search(pattern, block):
        block = re.sub(pattern, lambda _: f"{key}: {rendered}", block, count=1)
    else:
        block += ("\r\n" if "\r\n" in block else "\n") + f"{key}: {rendered}"
    write_text(path, text[:m.start(1)] + block + text[m.end(1):])


# ---------------------------------------------------------------- git

def git(*args: str, cwd: Path = ROOT) -> subprocess.CompletedProcess | None:
    try:
        return subprocess.run(["git", *args], cwd=cwd, capture_output=True, text=True,
                              encoding="utf-8", errors="replace")
    except FileNotFoundError:
        return None


def git_lines(*args: str, cwd: Path = ROOT) -> list[str] | None:
    r = git(*args, cwd=cwd)
    if r is None or r.returncode != 0:
        return None
    return [line.strip() for line in r.stdout.splitlines() if line.strip()]


@lru_cache(maxsize=1)
def in_git() -> bool:
    return git_lines("rev-parse", "--is-inside-work-tree") == ["true"]


@lru_cache(maxsize=1)
def git_dir() -> Path | None:
    out = git_lines("rev-parse", "--path-format=absolute", "--git-dir") if in_git() else None
    return Path(out[0]) if out else None


@lru_cache(maxsize=1)
def main_root() -> Path:
    """The main worktree's root, shared by every linked worktree."""
    out = git_lines("rev-parse", "--path-format=absolute", "--git-common-dir") if in_git() else None
    if out and Path(out[0]).name == ".git":
        return Path(out[0]).parent.resolve()
    return ROOT


def is_main_checkout() -> bool:
    return main_root() == ROOT.resolve()


def current_branch() -> str | None:
    out = git_lines("rev-parse", "--abbrev-ref", "HEAD")
    return out[0] if out and out[0] != "HEAD" else None


def git_show(spec: str) -> str | None:
    r = git("show", spec)
    return r.stdout if r is not None and r.returncode == 0 else None


def resolve_base(explicit: str | None = None) -> str | None:
    """Commit to diff against: --base, then $GATE_BASE, then merge-base with the main branch, then HEAD."""
    if not in_git():
        return None
    for ref in (explicit, os.environ.get("GATE_BASE")):
        if ref:
            mb = git_lines("merge-base", "HEAD", ref)
            return mb[0] if mb else ref
    main = load_gate(required=False).get("main_branch", "main")
    if current_branch() not in (None, main):
        for cand in (main, f"origin/{main}"):
            mb = git_lines("merge-base", "HEAD", cand)
            if mb:
                return mb[0]
    return "HEAD" if git_lines("rev-parse", "--verify", "-q", "HEAD") else None


def changed_files(base: str | None = None, staged: bool = False) -> list[str]:
    if not in_git():
        die("ERROR: this check needs git, and this folder is not a git repo")
    if staged:
        files = set(git_lines("diff", "--cached", "--name-only") or [])
        if git_lines("rev-parse", "-q", "--verify", "MERGE_HEAD"):  # finishing a merge: skip files taken as-is from the other side
            files &= set(git_lines("diff", "--cached", "--name-only", "MERGE_HEAD") or [])
    else:
        files = set(git_lines("diff", "--name-only", base) or []) if base else set()
        if not base:
            files |= set((git_lines("diff", "--name-only", "--cached") or []) + (git_lines("diff", "--name-only") or []))
        files |= set(git_lines("ls-files", "--others", "--exclude-standard") or [])
    return sorted(f.replace("\\", "/") for f in files)


def new_content(path: str, staged: bool) -> str | None:
    if staged:
        return git_show(f":{path}")
    full = ROOT / path
    return read_text(full) if full.is_file() else None


def old_content(path: str, base: str | None) -> str | None:
    return git_show(f"{base}:{path}") if base else None


@lru_cache(maxsize=1)
def repo_files() -> tuple[str, ...]:
    """Tracked + untracked-but-not-ignored files, so ignored folders (node_modules, android) never count."""
    out = git_lines("ls-files", "-co", "--exclude-standard") if in_git() else None
    if out is not None:
        return tuple(sorted(set(out)))
    skip = {"node_modules", ".git"}
    return tuple(sorted(p.relative_to(ROOT).as_posix() for p in ROOT.rglob("*")
                        if p.is_file() and not skip & set(p.relative_to(ROOT).parts)))


# ---------------------------------------------------------------- locks and the per-checkout task marker

def locks_dir() -> Path:
    return main_root() / ".agents" / "locks"


def lock_path(zone: str) -> Path:
    return locks_dir() / f"zone-{zone}.lock"


def load_locks() -> dict[str, dict]:
    locks: dict[str, dict] = {}
    if locks_dir().is_dir():
        for path in sorted(locks_dir().glob("zone-*.lock")):
            try:
                data = json.loads(read_text(path))
            except json.JSONDecodeError:
                data = {}
            locks[path.stem[len("zone-"):]] = data if isinstance(data, dict) else {}
    return locks


def lock_holders() -> set[str]:
    return {str(d.get("task", "")).upper() for d in load_locks().values() if d.get("task")}


def marker_path(worktree_git_dir: Path | None = None) -> Path:
    base = worktree_git_dir or git_dir()
    return (base / "agent-task") if base else (AGENTS_DIR / "locks" / ".agent-task")


def read_marker() -> str | None:
    path = marker_path()
    return read_text(path).strip() or None if path.exists() else None


def write_marker(task_id: str, worktree_git_dir: Path | None = None) -> None:
    write_text(marker_path(worktree_git_dir), task_id + "\n")


def clear_marker() -> None:
    path = marker_path()
    if path.exists():
        path.unlink()


def my_task_id(explicit: str | None = None) -> str | None:
    """Which task this checkout is working on: --task, the marker, a task/<ID> branch, or the only lock held."""
    if explicit:
        return explicit.upper()
    marker = read_marker()
    if marker:
        return marker.upper()
    branch = current_branch() or ""
    if branch.startswith("task/"):
        return branch[len("task/"):].upper()
    holders = lock_holders()
    return next(iter(holders)) if len(holders) == 1 else None


def stage(paths: list[Path]) -> None:
    """Stage script-written bookkeeping files so the step's commit includes them."""
    names = [rel(p) for p in paths if p.exists()]
    if names and in_git():
        git("add", "--", *names)
