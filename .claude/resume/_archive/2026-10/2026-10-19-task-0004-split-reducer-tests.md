---
title: Split game/reducer.test.ts
status: done
updated: 2026-10-19
next: TASK-0005, split Incident.tsx
---

## Goal
- Split game/reducer.test.ts under 400 lines, same tests passing (TASK-0004)

## Plan (3 lines; agents are briefed from this)
1. Cut at the milestone markers into five *.test.ts files, no test edited.
2. Helpers used by more than one file go to game/testHelpers.ts, placed by measured use.
3. Same 58 test names pass; Code map and engine domain updated.

## Done (verified)
- Five test files (181 to 222 lines) and testHelpers.ts (78): all 915 old lines carried over unchanged (script check)
- Same 58 sorted test names before and after, all pass; typecheck, lint (zero warnings), build, gate PASS; 01-smoke PASS

## Next steps
1. TASK-0005

## Waiting on the owner
- nothing

## Live state to clean up
- The dev server on port 3000 started earlier is still running
