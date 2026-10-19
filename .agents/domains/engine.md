---
type: domain
domain: engine
---

# Domain — engine

Files, tables and specs: `python scripts/gate.py where engine`.

## Current state

<!-- At most 20 lines. Overwritten (never appended) on main after each task in this domain: what the feature does now, its key files, its edge rules. -->
- Runs the whole game, Stages 1 to 5 and the win: new incidents, repeats, Builds, Triage and Tune steps, calls, Victor, Test first, loans, the Standby server, late items and the new computer before each stage.
- Key files: `game/reducer.ts` (save version, fresh state, the action switch), split by action group into `game/flow.ts` (start, solve, Next, email and cash helpers), `game/choices.ts` (picks, Test first, Triage, Tune), `game/spending.ts` (calls, Victor, Shop) and `game/drawing.ts` (Blueprint canvas, deploy). Also `game/types.ts`, `game/save.ts` (save version 4, migrates 1 to 3), `game/blueprint.ts`, `game/terminal.ts` (Terminal lesson commands), `game/patternBook.ts`.
- Edge rules: never names a single incident, email or upgrade; item effects come from `itemEffects` in `data/upgrades.ts`.
- Tests: `npm test` runs `game/reducer.test.ts` (58 pass after Milestone 7).
- Oversized: `reducer.test.ts` 1,035 lines (TASK-0004). Every other engine file is under 400 lines.

## History

Newest first, one line per finished task, written by `gate.py`. Older lines: `python scripts/gate.py search "<words>"`.

<!-- history:start -->
- 2026-10-19 · TASK-0003 · Split game/reducer.ts under 400 lines — Four files by action group, following the GAME_LOGIC.md player action groups. `freshRun` moves to `flow.ts` (used by `startIncident`), which avoids a reducer ↔ flow import cycle.
<!-- history:end -->
