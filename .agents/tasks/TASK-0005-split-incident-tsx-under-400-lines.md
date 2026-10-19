---
id: TASK-0005
title: Split Incident.tsx under 400 lines
zone: ""
domain: windows
size: standard
status: todo
milestone: ""
depends_on: [TASK-0001, TASK-0009]
plan: ""
blocked_reason: ""
outcome: ""
---

# TASK-0005 — Split Incident.tsx under 400 lines

## Goal

The Incident window can gain Stage 3 to 5 features without growing an oversized file.

## Done when

- `components/windows/Incident.tsx` and every new file are under 400 lines
- The new, repeat and Build flows look and play the same at 1440 and 375 pixels wide
- CLAUDE.md > Code map lists the new files

## Spec links

- `docs/UI_THEME.md` → windows

## Notes

Pure refactor. Touched lines must use colour tokens (tokens guard).

Waits on TASK-0009 (owner decision 2026-10-19): the moved helpers hold 23 hard-coded colours. New files must be token-clean, and the tokens can't be added while `app/globals.css` is over budget. After TASK-0009, add tokens with the same values and use them on the moved lines.
