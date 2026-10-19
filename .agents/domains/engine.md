---
type: domain
domain: engine
---

# Domain — engine

Files, tables and specs: `python scripts/gate.py where engine`.

## Current state

<!-- At most 20 lines. Overwritten (never appended) on main after each task in this domain: what the feature does now, its key files, its edge rules. -->
- Runs every flow through Stage 2 plus B1, B2 and the Triage and Tune steps: new incidents, repeats, Builds, calls, Victor, Test first, loans.
- Key files: `game/reducer.ts` (actions), `game/types.ts`, `game/save.ts` (save version 2, migrates version 1), `game/blueprint.ts`, `game/patternBook.ts`.
- Edge rules: never names a single incident, email or upgrade; item effects come from `itemEffects` in `data/upgrades.ts`.
- Tests: `npm test` runs `game/reducer.test.ts` (46 pass at Milestone 6).
- Oversized: `reducer.ts` 498 lines and `reducer.test.ts` 823 lines. Split before Milestone 7 adds to them.

## History

Newest first, one line per finished task, written by `gate.py`. Older lines: `python scripts/gate.py search "<words>"`.

<!-- history:start -->
<!-- history:end -->
