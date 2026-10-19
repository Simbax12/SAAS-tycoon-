---
id: TASK-0010
title: Token for the desktop backdrop colour
zone: ""
domain: desktop
size: tiny
status: todo
milestone: ""
depends_on: []
plan: ""
blocked_reason: ""
outcome: ""
---

# TASK-0010 — Token for the desktop backdrop colour

## Goal

Milestone 7 added a one-off colour, `bg-[#111111]`, on the desktop root in `components/desktop/Desktop.tsx`. Replace it with a theme token so the tokens guard passes when the file is next touched.

## Done when

- No `bg-[#111111]` left in `components/desktop/Desktop.tsx`
- The backdrop looks the same at 1440 and 375 pixels

## Spec links

- `docs/UI_THEME.md` → colours

## Notes

Found while rebasing the Agent OS branch onto main (TASK-0003). Use `gate.py theme set`, or add a token pair to the theme file. Check the contrast rule if the colour sits behind text.
