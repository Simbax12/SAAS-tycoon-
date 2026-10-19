---
id: TASK-0009
title: Split app/globals.css under 400 lines
zone: ""
domain: desktop
size: standard
status: todo
milestone: ""
depends_on: []
plan: ""
blocked_reason: ""
outcome: ""
---

# TASK-0009 — Split app/globals.css under 400 lines

## Goal

Milestone 7 grew `app/globals.css` to 486 lines, past the 400-line code cap. Split it so later styling work does not grow an oversized file.

## Done when

- `app/globals.css` and every new stylesheet are under 400 lines
- No visual change: Before and After shots match at 1440 and 375 pixels
- CLAUDE.md > Code map lists any new file

## Spec links

- `docs/UI_THEME.md` → colours and BlipOS versions

## Notes

Found while rebasing the Agent OS branch onto main (TASK-0003). Pure refactor. `app/globals.css` is a token definition file for the tokens guard, so the theme tokens must stay where `gate.py theme` expects them.
