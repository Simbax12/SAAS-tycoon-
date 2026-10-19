---
id: TASK-0004
title: Split game/reducer.test.ts under 400 lines
zone: ""
domain: engine
size: standard
status: done
milestone: ""
depends_on: [TASK-0003]
plan: ".agents/plans/PLAN-TASK-0004-split-reducer-tests.md"
blocked_reason: ""
outcome: "game/reducer.test.ts (1,035 lines) is split by milestone into five test files with shared helpers in game/testHelpers.ts; the same 58 tests pass"
done: 2026-10-19
---

# TASK-0004 — Split game/reducer.test.ts under 400 lines

## Goal

Tests stay readable and Milestone 7 can add tests for Stages 3 to 5.

## Done when

- Every test file is under 400 lines
- `npm test` still runs all 46 tests and they pass (58 since Milestone 7 came in)

## Spec links

- `docs/GAME_LOGIC.md` → worked examples

## Notes

`npm test` globs `.test-build/game/*.test.js`, so new test files stay in `game/`.
