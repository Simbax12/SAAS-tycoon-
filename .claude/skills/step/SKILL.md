---
name: step
description: Run the next ready task (or a named TASK id) from .agents/tasks/ through the 7-stage pipeline in ai-context/pipeline.md - zone lock, plan, critique, code, gates, live verification, done, next-steps. Use when the owner says "/step", "next step", "do the next task", "carry on", or names a TASK id.
---

# /step — one task through the pipeline

One `/step` = one task = one verified step. This is the running order. The full
rules live in `ai-context/pipeline.md`: **don't read that file whole**. Open a
single section by its heading only when you need a rule (e.g. "Loopback rule").
Narrate a short status checkpoint before each stage, and keep moving unless you
hit a Hard Stop.

## 0. Pick, size, look up

1. Check for unfinished work first: the resume notes the startup hook printed,
   and `python scripts/gate.py next` (it lists IN PROGRESS before NEXT).
2. Take the named task or the one `next` prints. Read the task file only.
3. Run `python scripts/gate.py where <domain>` for the task's domain: exact files,
   contract, tables, specs, and which files to read by range. Then read the
   domain's state file and only the spec sections the task links. If the task
   starts a new feature area, add its domain to `.agents/domains.json` first.
   Any task you create along the way gets a `milestone:` (`/roadmap` explains how).
   If a task has to wait on the owner, set `status: blocked` with a one-line `blocked_reason:`.
4. Size it Tiny, Standard or Risky (pipeline: "Size the task first") and say the
   size in one line in chat. When unsure, size up. A small visual change to an
   existing screen is Tiny: find it with `gate.py ui`, change it with `gate.py swap`
   or `theme set`, and never read the whole page.

## 1. Lock

- **In a task worktree** (opened after `gate.py worktree start`): the lock is already held.
- **In the main checkout**, if the task has a zone: `python scripts/gate.py lock <zone> --task <ID>`.
  If it's LOCKED, or worktrees are active, take another ready task or ask the owner
  through the pop-up questionnaire. Never break a lock.

## 2. Plan (Stages 1–2)

- **Tiny:** a one-line plan in the resume note.
- **Standard / Risky:** copy `.agents/plans/_plan-template.md` to
  `.agents/plans/PLAN-<ID>-<slug>.md`, fill in the 3-line plan, the files and line
  ranges expected to change, and what "working" means. Set the task's `plan:`.
  Check past decisions with `gate.py search`. Do the Stage 2 prior-art check inline.
- Missing logic in the spec, or a Hard Stop: pop-up questionnaire now.

## 3. Critique and Before shot (Stage 3)

- Run `/critique` (it skips Tiny tasks by itself).
- UI change, in the same step:
  - A view with fixtures: `node testing/macros/shot.mjs <view> --out before`.
  - Otherwise: `live-verify` in baseline mode for `before-<feature>.png`.

## 4. Code (Stage 4)

- Read big files by range, never whole. Check `docs/stack-cheat-sheet.md` for each library you touch.
- UI: follow `/ui` (screen split, tokens, all states in the first write).
- Stay inside the locked zone (plus shared folders), and within the size budget
  (legacy files may not grow; `budget_override` with a reason only if truly needed).
- Register new interactive elements in `testing/TAP_SIGNALS.md`, then `python scripts/gate.py signals`.

## 5. Gates (Stages 5–6, in parallel)

Start these together and don't edit files while they run. Brief each agent in
3–5 lines with file:line ranges.
- `verify-gate` with the task id (every size; for Tiny, put `01-smoke` in the task's verify list;
  a suite with no tests yet shows NO TESTS: tell the owner it wasn't verified)
- `critic` in code mode (Standard and Risky; for Tiny, do the audit inline)
- `security-review` and/or `db-migration-guard` when the change touches what
  pipeline Stage 6 lists

Read the verdicts first. On anything other than a pass, follow the Loopback rule,
then re-run only the gates the fix could affect.

## 6. Prove it (Stage 7)

- `live-verify` in verify mode (After shot for UI, same viewport as Before; a workbench
  Before shot gets its After from `shot.mjs <view> --out after` with the same options).
- `suite-runner`: `01-smoke 02-core-flows 03-permissions` for Standard and Risky;
  for Tiny, only if the smoke run inside `verify-gate` failed.
- If this fixed a bug: `bug-logger`, once the root cause and fix are confirmed.

## 7. Close

1. Write one plain-English line in the task's `outcome:` field.
2. `python scripts/gate.py done <ID>`. It re-runs verify and marks the task done.
   - **In the main checkout** it also writes the CHANGELOG entry and the domain
     History line from the task file, archives old history, regenerates the master
     checklist (`ai-context/roadmap.md` / `.json`), and stages all of that. Never edit
     CHANGELOG.md or the roadmap files by hand. **The zone lock stays until you commit**
     (the pre-commit zone check needs it); the post-commit hook then releases it.
   - **In a worktree** it keeps the lock: commit your work there, then the main
     checkout runs `python scripts/gate.py worktree finish <ID>`.
3. On the work branch (`develop`): overwrite `ai-context/next-steps.md` (3–7 items, from `gate.py next`, with
   the ROADMAP line from `gate.py status` as its **Roadmap:** line) and the domain's
   **Current state** (20 lines max).
4. Overwrite the resume note, then commit only your own files (`done` already
   staged its bookkeeping). Never `git add -A`, never `--no-verify`. Then push `develop`
   (pipeline: "Branches and pushing"). Releasing to `main` is a separate, owner-approved step.
5. Give the owner the plain-English walkthrough (pipeline Stage 7): what changed and
   why, Before/After photos, what was tested live, obstacles and tradeoffs, and
   any budget override used. Follow-up decisions go through the pop-up questionnaire.

Stop after one task. The owner says `/step` again for the next one.
