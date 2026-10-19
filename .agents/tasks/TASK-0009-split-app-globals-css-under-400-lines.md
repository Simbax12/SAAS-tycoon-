---
id: TASK-0009
title: Split app/globals.css under 400 lines
zone: ""
domain: desktop
size: standard
status: done
milestone: ""
depends_on: []
plan: .agents/plans/PLAN-TASK-0009-split-globals-css.md
blocked_reason: ""
outcome: "Moved the BlipOS window styles out of app/globals.css (486 to 211 lines) into app/theme/blipos.css; all four looks are pixel-identical at 1440 and 375."
done: 2026-10-19
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
