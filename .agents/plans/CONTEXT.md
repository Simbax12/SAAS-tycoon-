---
type: contract
folder: ".agents/plans"
role: product
---

# CONTEXT.md — .agents/plans

Decision lineage: why each task was built the way it was, and what the critics
said about it. A future session reads this instead of re-deriving the reasoning.

## What belongs here

For each Standard or Risky task, two files:

- `PLAN-TASK-NNNN-<slug>.md`: copy `_plan-template.md`. It holds the 3-line plan
  (agents are briefed from it), what "working" means, options rejected, and the
  decision. Point the task's `plan:` field at it.
- `PLAN-TASK-NNNN-<slug>.critique.md`: the critique ledger. Copy
  `_critique-ledger-template.md`. `gate.py done` refuses a Standard or Risky
  task without one.

Tiny tasks need neither. A one-line plan in the resume note is enough.

The spec red-team (onboarding, and every re-scope) writes one ledger per run:
`SPEC-REDTEAM-YYYY-MM-DD.critique.md`. Ledgers older than 90 days, and the plans of
archived tasks, move to `.agents/archive/plans/` automatically.

## Rules

- **Plans are never rewritten after code starts.** If the approach changes
  mid-task, write a new plan with `supersedes:` pointing at the old one, and set
  the old one's `status: superseded`.
- **The ledger is append-only.** `critic` adds rows at Stage 3 (plan mode) and
  Stage 5 (code mode). The main session fills in each row's Resolution after
  revising the plan or the code.

## Inputs, outputs, human check

- **Reads:** the task file, the `docs/specs/` sections it links, and past decisions through `python scripts/gate.py search`.
- **Produces:** the plan agents are briefed from; the ledger `gate.py done` checks.
- **The owner checks:** any BLOCK finding (it's a Hard Stop) and the tradeoffs in the
  Stage 7 walkthrough. The owner never has to read these files directly.
