---
type: plan
task: TASK-0007
size: risky
status: approved
supersedes: ""
last_updated: 2026-10-19
---

# PLAN — TASK-0007 Milestone 7: Stages 3 to 5

A record, not a plan. Milestone 7 was built and merged on main (commits 294ac57 to db339bd, 2026-10-11) before the Agent OS branch joined main. No plan, critique or Agent OS gates ran for it at the time.

## What was built

- Stages 3 to 5 in `data/challenges.ts`, R3 to R10 in `data/repeats.ts`, B3 to B5 in `data/blueprints.ts`.
- The System Map through Stage 5 with the world view, and the win screen.
- Eight follow-up changes after play: new computers before each stage, apps never open by themselves, Terminal lessons and more (see PROGRESS.md > Done).

## What "working" means

- The game plays from 0 to 1 billion users and the win screen shows.
- The owner has played it: done on 2026-10-19, "all good".

## Checks after the fact

- After the rebase on 2026-10-19 (TASK-0003): typecheck, lint, build, 58 reducer tests, the docs check and `gate.py verify` all pass; 01-smoke passes.
- Gate findings in Milestone 7 code became their own tasks: TASK-0009 (globals.css size) and TASK-0010 (one-off backdrop colour).

## Decision and why

Close the task on the owner's play-through. A plan and critique written after the code would only describe what exists, so the critique is recorded as skipped.
