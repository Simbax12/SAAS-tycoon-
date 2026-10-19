---
title: Split game/reducer.ts
status: done
updated: 2026-10-19
next: TASK-0004, split reducer.test.ts
---

## Goal
- Split game/reducer.ts under 400 lines with no behaviour change (TASK-0003)

## Plan (3 lines; agents are briefed from this)
1. Move actions by group into game/flow.ts, choices.ts, spending.ts, drawing.ts, unchanged.
2. reducer.ts keeps the save version, fresh state and switch; re-exports startIncident.
3. Code map, engine domain, typecheck, lint, build, tests.

## Done (verified)
- Branch rebased onto main's Milestone 7 (owner decision); backup tag backup/agent-os-before-rebase
- Split redone on the 512-line reducer: every code and comment line carried over (script check), 58/58 tests, gate PASS, 01-smoke PASS
- Live: end of Stage 1 computer gate and buy, then Next to 2.1; Standby server saves 3.1's outage. No console errors.

## Next steps
1. TASK-0004

## Waiting on the owner
- Close TASK-0007 (Milestone 7 already on main) once played

## Live state to clean up
- The dev server on port 3000 started by the live-verify agent is still running
