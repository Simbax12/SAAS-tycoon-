---
name: critique
description: Stage 3 pre-code critique. Runs the critic agent in plan mode on a plan in .agents/plans/ - one Sonnet pass covering 4 lenses for Standard tasks, Sonnet and Opus passes in parallel for Risky tasks - then revises the plan and records how each finding was resolved in the critique ledger. "/critique spec" runs the spec red-team instead. Use when the owner says "/critique", during onboarding's red-team step, or from /step at Stage 3.
---

# /critique — Stage 3, before any code

Opus plans and Sonnet critiques, so every critique is cross-model without paying
for four models. Risky tasks add a second, independent Opus pass.

## 1. Find the plan and size

Use the plan path given, or the `plan:` field of the current task. Read the
task's `size:`.

| Size | What runs |
|---|---|
| Tiny | Nothing. Add one ledger row: `skipped: Tiny`. (No ledger is needed for Tiny, but the row keeps the lineage clear if one exists.) |
| Standard | `critic`, plan mode, one Sonnet pass |
| Risky | `critic`, plan mode, a Sonnet pass **and** an Opus pass, started together in the same step |

## 2. Brief the critic (3–5 lines, never paste the plan)

```
mode: plan · task: TASK-NNNN · plan: .agents/plans/PLAN-TASK-NNNN-<slug>.md
pass: sonnet            (or: opus, with the Agent model override set to opus)
Working means: <one line from the plan>
```

The agent's own model is Sonnet. For the Risky Opus pass, launch the same
`critic` agent with the model override set to `opus`.

## 3. Act on the verdicts

- **SOUND** from every pass: set the plan's `status: critiqued` and move on to Stage 4.
- **REVISE:** fix the plan. Add a "Revisions after critique" line per change, and
  fill in each ledger row's Resolution (what changed, or why the finding was
  rejected). Re-run the critic only if the revision changed the approach, not
  for wording fixes.
- **BLOCK:** this is a Hard Stop. Put each BLOCK finding to the owner as its own
  pop-up question card, with the options and a one-line tradeoff for each.
  Record the answer in the ledger's Resolution and in the plan's "Decision and
  why", which `gate.py` copies into the domain History when the task is done.
  Never hand-edit CHANGELOG.md for a task.
- **Passes disagree** (Risky): take the stricter verdict, and note the
  disagreement in the ledger.

## 4. Narrate

Output the compact `[STAGE 1–3: LOGIC & REASONING CHECK]` block (pipeline Stage 3): the approach chosen, the holes caught and how they
were fixed, and the tradeoffs. Then continue straight to Stage 4, unless a BLOCK
is waiting on the owner.

Fill in every finding's Resolution before running `gate.py done`. A blank
Resolution means the critique wasn't finished.

## `/critique spec`: the spec red-team

Run during onboarding (after the specs are confirmed, before the zone map) and
on every re-scope. Brief `critic` in **spec** mode, one Sonnet pass:

```
mode: spec · ledger: .agents/plans/SPEC-REDTEAM-<today>.critique.md
Specs to check: the confirmed files in docs/specs/ (list them)
```

Then put each finding to the owner as a pop-up card. Every S1 scope cut is the owner's
call ("keep in MVP" / "move to later"). Update the specs from the answers (a
spec back in `draft` gets re-confirmed), and fill in each ledger Resolution.

