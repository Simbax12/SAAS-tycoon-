---
id: TASK-0003
title: Split game/reducer.ts under 400 lines
zone: ""
domain: engine
size: standard
status: todo
milestone: ""
depends_on: [TASK-0001]
plan: ""
blocked_reason: ""
outcome: ""
---

# TASK-0003 — Split game/reducer.ts under 400 lines

## Goal

Milestone 7 can add Stage 3 to 5 rules without growing an oversized file.

## Done when

- `game/reducer.ts` and every new file are under 400 lines
- No behaviour change: `npm test` passes with the same 46 tests
- CLAUDE.md > Code map lists the new files

## Spec links

- `docs/GAME_LOGIC.md` → player actions

## Notes

Pure refactor. Split by action group, not by stage: game logic must never hard-code a single incident.
