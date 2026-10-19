---
type: contract
folder: ".agents/tasks"
role: product
---

# CONTEXT.md — .agents/tasks

The task roadmap as a DAG: each task says which tasks must finish before it can
start. One task per file. `scripts/gate.py` reads these files and is the only
thing that decides what's ready.

## What belongs here

`TASK-NNNN-<slug>.md` files, numbered in the order they were created (the run
order comes from `depends_on`). Copy `_task-template.md`. Files starting with
`_` are ignored. Done tasks beyond the newest 20 move to
`.agents/archive/tasks/` automatically, and still count as done for
dependencies.

## Frontmatter rules

- `size`: `tiny`, `standard` or `risky` (`ai-context/pipeline.md` → "Size the task
  first"). Size every task to **one verified step**. If it needs more, split it.
- `zone`: exactly one zone id from `AGENTS.md`, or `""` for docs-only tasks. A
  task that would touch two zones is two tasks, with the shared contract change
  first.
- `domain`: exactly one domain from `.agents/domains.json` (`project` for docs,
  tooling and CI). `gate.py done` refuses a task without one.
- `depends_on`: the TASK ids that must be `done` first, e.g. `[TASK-0002, TASK-0005]`.
- `verify`: names of checks or suites from `.agents/gate.json`. Leave the key out
  to run every check, or use `[]` for docs-only tasks. **The guards (gaps,
  budget, map, zone-check) always run, whatever this says.**
- `plan`: the path of this task's plan in `.agents/plans/`. Standard and Risky
  tasks need it, and the critique ledger next to it, before `done`.
- `outcome`: one plain-English line written at Stage 7. `gate.py` turns it into
  the CHANGELOG entry.
- `budget_override` (rare): paths of oversized legacy files this task may grow,
  with the reason in the task's "Budget override" section. It's reported to the owner.
- `status`: `gate.py lock` sets `in-progress` and `gate.py done` sets `done` (plus
  a `done:` date). Two statuses are set by hand:
  - `blocked`: only while waiting on the owner. Put a one-line reason in `blocked_reason:`; the master checklist and dashboards show it as "waiting on the owner".
  - `parked`: work the owner deferred to after launch. It's never ready; park the tasks that depend on it too.
- `milestone`: the milestone id from `.agents/milestones.json` (set by `/roadmap`).
  Every open task has one.

## Gate rules (enforced by gate.py)

- **Ready** means `todo`, every `depends_on` is done (live or archived), its zone
  isn't locked by another task, and no worktree is working on it.
- `gate.py done` re-runs verify and refuses on FAIL. Standard and Risky tasks
  also need their plan and critique ledger to exist.

## Inputs, outputs, human check

- **Reads:** `docs/specs/`, the Zones section of `AGENTS.md`, `.agents/domains.json`.
- **Produces:** the work order for `/step`. `ai-context/next-steps.md` shows the
  top of it in plain English, and `gate.py roadmap` turns it into the master
  checklist (`ai-context/roadmap.md` / `roadmap.json`).
- **The owner checks:** the roadmap order and milestones (onboarding step 9,
  `/roadmap`), and any task marked `blocked` or `parked`.
