---
id: TASK-0003
title: Split game/reducer.ts under 400 lines
zone: ""
domain: engine
size: standard
status: done
milestone: ""
depends_on: [TASK-0001]
plan: ".agents/plans/PLAN-TASK-0003-split-reducer.md"
blocked_reason: ""
outcome: "game/reducer.ts (512 lines after Milestone 7) is now 133 lines: its actions moved unchanged into game/flow.ts, choices.ts, spending.ts and drawing.ts, by action group"
done: 2026-10-19
---

# TASK-0003 — Split game/reducer.ts under 400 lines

## Goal

Milestone 7 can add Stage 3 to 5 rules without growing an oversized file.

## Done when

- `game/reducer.ts` and every new file are under 400 lines
- No behaviour change: `npm test` passes with the same 46 tests (58 once main's Milestone 7 was brought in, owner decision 2026-10-19)
- CLAUDE.md > Code map lists the new files

## Spec links

- `docs/GAME_LOGIC.md` → player actions

## Notes

Pure refactor. Split by action group, not by stage: game logic must never hard-code a single incident.
