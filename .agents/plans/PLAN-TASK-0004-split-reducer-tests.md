---
type: plan
task: TASK-0004
size: standard
status: critiqued
supersedes: ""
last_updated: 2026-10-19
---

# PLAN — TASK-0004 Split game/reducer.test.ts under 400 lines

`status` moves draft → critiqued → approved. Set it to superseded if a newer plan replaces this one.

## Plan (3 lines — agents are briefed from this)

1. Cut `game/reducer.test.ts` (1,035 lines) along its existing milestone markers, with no test edited: `reducer.test.ts` keeps the first section (Stage 1 flow, money basics, saves, lines 46-220); `game/money.test.ts` gets Milestones 3 and 4 (calls, tutorial, Shop, lines 221-423); `game/repeats.test.ts` Milestone 5 (424-648); `game/workApps.test.ts` Milestone 6 (649-842); `game/laterStages.test.ts` Milestone 7 (843-1035).
2. A script places each top-level helper by real use, following helpers that call helpers: used by tests in more than one file → `game/testHelpers.ts` (known: play, begun, pick, look, solveBest, deploy, memoryStorage, call, buy, rightChoice, drawRight, solveNext, runTune, playTo); used in one file → stays there (`withTuneOn` stays in workApps.test.ts). `testHelpers.ts` is not a `*.test.ts` and never imports `node:test`. Each file imports only what it uses; lint must show zero warnings.
3. Prove it: the same 58 test names pass (compared before and after), typecheck, lint, build, gate; update CLAUDE.md > Code map and the engine domain.

## Files expected to change

- `game/reducer.test.ts` (shrinks to ~220 lines)
- `game/testHelpers.ts`, `game/money.test.ts`, `game/repeats.test.ts`, `game/workApps.test.ts`, `game/laterStages.test.ts` (new, each under 300 lines)
- `CLAUDE.md` (Code map row for GAME_LOGIC.md, the "Other code" paragraph and the `npm test` line if needed)
- `.agents/domains/engine.md` (Current state: tests and Oversized lines)

## What "working" means

- `npm test` runs 58 tests across five files and all pass; the list of test names is identical before and after.
- No game code changes, so the game plays the same (01-smoke).

## Options considered and rejected

| Option | Why rejected |
|---|---|
| Split by action group like TASK-0003 | Tests are already grouped by milestone with markers; regrouping would move tests between sections and make the diff hard to review |
| Copy helpers into each file | Same helper in up to five places; one home is the project rule |
| Put helpers in a `game/test/` folder | `npm test` globs `game/*.test.js` only; a subfolder needs a package.json change for no gain |

## Decision and why

Cut at the existing milestone markers and share helpers through one `testHelpers.ts`. It keeps every test byte-for-byte and needs no change to `npm test`.

## Revisions after critique

- Ledger row 1 → plan line 2 names the cross-section helpers and places them by measured use, not by hand.
- Ledger row 3 → imports trimmed per file; lint with zero warnings; testHelpers.ts has no `node:test` import.
