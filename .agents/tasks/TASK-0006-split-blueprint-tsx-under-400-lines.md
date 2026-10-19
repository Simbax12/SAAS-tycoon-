---
id: TASK-0006
title: Split Blueprint.tsx under 400 lines
zone: ""
domain: windows
size: standard
status: todo
milestone: ""
depends_on: [TASK-0001]
plan: ""
blocked_reason: ""
outcome: ""
---

# TASK-0006 — Split Blueprint.tsx under 400 lines

## Goal

Blueprint can take B3 to B5 without growing an oversized file.

## Done when

- `components/windows/Blueprint.tsx` and every new file are under 400 lines
- B1 plays the same by drag and by taps alone, at 1440 and 375 pixels wide
- CLAUDE.md > Code map lists the new files

## Spec links

- `docs/UI_THEME.md` → the three work apps
- `docs/BLUEPRINTS.md`

## Notes

Pure refactor. Touched lines must use colour tokens (tokens guard).
