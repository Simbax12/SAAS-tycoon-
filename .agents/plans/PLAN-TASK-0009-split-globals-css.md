---
type: plan
task: TASK-0009
size: standard
status: critiqued
supersedes: ""
last_updated: 2026-10-19
---

# PLAN — TASK-0009 Split app/globals.css under 400 lines

`status` moves draft → critiqued → approved. Set it to superseded if a newer plan replaces this one.

## Plan (3 lines — agents are briefed from this)

1. Cut lines 212–486 of `app/globals.css` (the BlipOS versions block and the Pop-ups and hint boxes block, every `os-*` rule) into a new `app/theme/blipos.css`, word for word, with no rule edits.
2. `app/globals.css` gains one line after `@import "tailwindcss";`: `@import "./theme/blipos.css";`. The `@theme` tokens, `html, body`, focus ring and every animation stay in `globals.css`, so `gate.py theme` still finds the tokens there.
3. Add `app/theme/blipos.css` to CLAUDE.md > Code map (UI_THEME.md row) and the desktop domain. Prove it with typecheck, lint, build, `gate.py verify`, and Before/After shots at 1440 and 375 for the classic (BlipOS 1) and a later (rounded, glass or flat) look.

## Files expected to change

- `app/globals.css` (486 lines; shrinks to ~213)
- `app/theme/blipos.css` (new, ~275 lines)
- `CLAUDE.md` (Code map, UI_THEME.md row)
- `.agents/domains/desktop.md` (Current state)

## What "working" means

- Every BlipOS look renders exactly as before: same window frames, title bars, taskbar, Start button, tabs, tray, dialogs and balloon notes.
- Before and After shots match at 1440 and 375.
- `gate.py verify` passes, including the budget and tokens guards.

## Options considered and rejected

| Option | Why rejected |
|---|---|
| Put the new file at `app/blipos.css` | Not a tokens-guard definitions path. Its 58 raw colours would all count as new hits. `app/theme/**` is a definitions path, and these rules are theme definitions per BlipOS look |
| Move the animations (lines 33–211) out instead | It works, but animations are not theme definitions, so `app/theme/` would be the wrong home for them |
| Put the `@import` at the bottom so the order stays the same | CSS needs `@import` before every other rule. Checked instead that the earlier position changes nothing (below) |

## Decision and why

Move the `os-*` block into `app/theme/blipos.css`. It is one self-contained section about the BlipOS looks, and the theme folder is where the tokens guard expects colour definitions.

The cascade order is safe. The moved rules now load before the animation rules. The only element carrying both kinds of class is the email balloon (`os-note balloon-rise`): `balloon-rise` sets only `animation`, and `os-note` sets background, border and shadow. The `app-glow` items carry no `os-*` class, and the moved block sets no `outline`, so the focus ring is unaffected.

## Revisions after critique

- Ledger row #3 → no plan change; the co-occurrence check was already done (see Decision and why).
