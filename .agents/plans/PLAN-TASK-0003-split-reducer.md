---
type: plan
task: TASK-0003
size: standard
status: critiqued
supersedes: ""
last_updated: 2026-10-19
---

# PLAN — TASK-0003 Split game/reducer.ts under 400 lines

`status` moves draft → critiqued → approved. Set it to superseded if a newer plan replaces this one.

## Plan (3 lines — agents are briefed from this)

1. Move the action handlers out of `game/reducer.ts` by action group, cut and paste with no logic edits: `game/flow.ts` (state helpers, freshRun, start, arrive, solve, fixChosen, next), `game/choices.ts` (pick, cards, Test first, Triage taps, Tune waves), `game/spending.ts` (calls, Victor, Shop buys), `game/drawing.ts` (Blueprint canvas edits and deploy).
2. `game/reducer.ts` keeps SAVE_VERSION, defaultSettings, freshState and the `reducer` switch, imports `freshRun` from `./flow`, and adds `export { startIncident } from "./flow"` so `game/save.ts` and the tests import exactly as before. Exported across files: sendEmail, readEmail, takeCash, receiveCash, arrive, sendRequests, solve, fixChosen, choicesShowing (plus each handler the switch calls). flow.ts imports none of the other three.
3. Update CLAUDE.md > Code map and the engine domain's file list; prove with typecheck, lint, build and `npm test` (same 46 tests).

## Files expected to change

- `game/reducer.ts` (512 lines on main; shrinks to ~130)
- `game/flow.ts`, `game/choices.ts`, `game/spending.ts`, `game/drawing.ts` (new, each under 200 lines)
- `CLAUDE.md` (Code map row for GAME_LOGIC.md and the "Other code" paragraph)
- `.agents/domains/engine.md` (key files and the "Oversized" line in Current state)

## What "working" means

- `npm test` passes the same 58 tests (46 before main's Milestone 7 was brought in); typecheck, lint, build and `gate.py verify` clean.
- The game plays the same: the 01-smoke suite passes against the dev server.

## Options considered and rejected

| Option | Why rejected |
|---|---|
| Split by stage | Task notes forbid it: game logic must never hard-code a single incident or stage |
| One file per action | 20 tiny files, harder to read than four groups |
| Put freshRun in its own file | Only flow.ts and freshState use it; flow.ts owns run start |

## Decision and why

Four files by action group, following the GAME_LOGIC.md player action groups. `freshRun` moves to `flow.ts` (used by `startIncident`), which avoids a reducer ↔ flow import cycle.

## Revisions after critique

- Ledger row #3 → plan line 2 names every helper that is exported across files.
- Ledger row #4 → engine.md added to files expected to change. PROGRESS.md has no oversized note; next-steps.md is rewritten at close.
- Ledger row #5 → plan line 2 states the freshRun import and the startIncident re-export.
- Owner decision 2026-10-19: the first split was cut from the Milestone 6 reducer, but main already had Milestone 7 (reducer 512 lines). The branch was rebased onto main (backup tag `backup/agent-os-before-rebase`) and the split redone by function name on the new reducer. Same four groups; `pick` now also needs `hasEffect` and `itemEffects`, `solve` and `next` need `computerNeeded`.
- Ledger row #8 → `gate.py` compares against local `main`, which was stale at Milestone 6. Fast-forwarded it to `origin/main`; the false budget and token failures went away.
