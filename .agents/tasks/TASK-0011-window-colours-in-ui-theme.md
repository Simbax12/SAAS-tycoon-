---
id: TASK-0011
title: Write the window colours into UI_THEME.md
zone: ""
domain: desktop
size: tiny
status: todo
milestone: ""
depends_on: [TASK-0005]
plan: ""
blocked_reason: ""
outcome: ""
---

# TASK-0011 — Write the window colours into UI_THEME.md

## Goal

The window colour tokens added in TASK-0005 have a home in the docs, so the docs stay the source of truth for every colour.

## Done when

- `docs/UI_THEME.md` > Colours lists maya-soft, dana-soft, pattern-ink, muted, grey-soft, off, off-edge, hint, hint-edge, ok-soft, action, action-hover and paper, each with its use and value, copied from `app/globals.css`
- The comment above them in `app/globals.css` no longer says "not in the docs yet"
- `node scripts/check-docs.mjs` prints "0 problems"

## Spec links

- `docs/UI_THEME.md` → Colours

## Notes

Owner decision 2026-10-20. Values stay exactly as they are, so no colour changes. Plain words, per the readability rules.
