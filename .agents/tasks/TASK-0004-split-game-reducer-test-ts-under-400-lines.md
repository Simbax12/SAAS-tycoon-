---
id: TASK-0004
title: Split game/reducer.test.ts under 400 lines
zone: ""
domain: engine
size: standard
status: todo
milestone: ""
depends_on: [TASK-0003]
plan: ""
blocked_reason: ""
outcome: ""
---

# TASK-0004 — Split game/reducer.test.ts under 400 lines

## Goal

Tests stay readable and Milestone 7 can add tests for Stages 3 to 5.

## Done when

- Every test file is under 400 lines
- `npm test` still runs all 46 tests and they pass

## Spec links

- `docs/GAME_LOGIC.md` → worked examples

## Notes

`npm test` globs `.test-build/game/*.test.js`, so new test files stay in `game/`.
