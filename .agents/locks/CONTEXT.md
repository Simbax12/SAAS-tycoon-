---
type: contract
folder: ".agents/locks"
role: product
---

# CONTEXT.md — .agents/locks

Zone locks: proof that a task is editing a zone right now, so two sessions never
edit the same zone at once.

- **Files:** `zone-<ID>.lock`, a small JSON file holding `zone`, `task` and
  `started` (UTC). **Written and removed only by `scripts/gate.py`** (`lock`,
  `unlock`, `done`, `worktree start | finish | abandon`). Never by hand.
- **Local and gitignored.** Locks coordinate the sessions and worktrees on this
  machine. Every worktree uses the **main checkout's** `.agents/locks/`, so they
  all see the same locks. Sessions on other machines coordinate through GitHub:
  fetch first, and stop if the copies have split.
- **Which task is "mine":** `lock` and `worktree start` also write a small marker
  inside the checkout's own git folder (`agent-task`). `zone-check`, `budget` and
  the pre-commit hook use it, so another session's lock never confuses them.
- **Stale locks:** a lock older than `stale_lock_hours` in `gate.json` (default
  24) shows as STALE in `gate.py status`. Finish or archive its task. Ask the owner
  before unlocking a lock your session didn't take.
- **No lock needed** for shared folders: `.agents/`, `ai-context/`, `docs/`,
  `testing/`, `.claude/`, `scripts/`, `.github/`, and the `CONTEXT.md` /
  `CLAUDE.md` files inside zone folders.

Human check: none routinely. The owner decides what happens to stale locks.
