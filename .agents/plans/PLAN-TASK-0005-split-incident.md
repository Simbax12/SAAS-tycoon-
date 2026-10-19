---
type: plan
task: TASK-0005
size: standard
status: critiqued
supersedes: ""
last_updated: 2026-10-19
---

# PLAN — TASK-0005 Split Incident.tsx under 400 lines

`status` moves draft → critiqued → approved. Set it to superseded if a newer plan replaces this one.

## Plan (3 lines — agents are briefed from this)

1. Move the helpers out of `components/windows/Incident.tsx` unchanged except for colours. `incidentBits.tsx` gets `button`, Stars, MayaSays, StandbyLine, OpenAppHint, Fixed and PatternName. `Calls.tsx` gets Calls. `Solved.tsx` gets Solved and Practised. Incident.tsx keeps Incident, Choice, choicesOf and BuildIncident, and re-exports Stars, MayaSays, OpenAppHint, Calls and Solved, so Blueprint, Shop, SysDash, Terminal and Win import exactly as before.
2. On the moved lines only, swap each hard-coded colour (23 guard hits: 16 `#hex` classes, 6 `bg-white` and 1 `text-white`; whites become `bg-paper` and `text-paper`) for a new `@theme` token in `app/globals.css` with the same value. Doc names where UI_THEME.md has them: `maya`, `dana`, `pattern` (#6B3FA0, Team badge and Pattern Book purple), `muted` (#4A4A4A, Victor). Otherwise `maya-soft`, `hint`, `hint-edge`, `ok-soft`, `dana-soft`, `off`, `off-edge`, `grey-soft`, `action`, `action-hover`, `pattern-ink`, `paper` (#ffffff).
3. Update CLAUDE.md > Code map and the windows domain. Prove it with typecheck, lint, test, build, `gate.py verify`, and Before/After shots of the new, repeat and Build flows at 1440 and 375.

## Files expected to change

- `components/windows/Incident.tsx` (565 lines; becomes ~330)
- `components/windows/incidentBits.tsx` (new, ~95), `components/windows/Calls.tsx` (new, ~85), `components/windows/Solved.tsx` (new, ~80)
- `app/globals.css` (`@theme` block, +~18 lines; 211 → ~229)
- `CLAUDE.md` (Code map, the "Other code" paragraph), `.agents/domains/windows.md` (Current state)

## What "working" means

- Each Incident window state looks and plays the same at 1440 and 375:
  - arrived (Investigate)
  - choosing a new incident (Maya bubble, option cards, a wrong-pick box, Dana's call window with clues, Test first)
  - choosing a repeat (pattern cards, Remind me)
  - guided (Victor)
  - solved for a new incident, a repeat (Seen before stamp) and a Build
  - the Triage and Tune hints, and a Build's "open Blueprint" hint
- Before and After shots match pixel for pixel. Tokens resolve to the same values as the old hex.
- A script proves each new token's value equals the old hex it replaces. In the browser, a probe element with every new class (hover included) computes the same colour as the old class, covering states the shots can't reach: Call Dana greyed out, Victor's lifeline, No more calls, and Buy the new computer.
- `gate.py verify` passes: the budget guard (no file grows past 400, and no legacy file grows) and the tokens guard (no new hard-coded styles).

## Options considered and rejected

| Option | Why rejected |
|---|---|
| Repoint the five importers to the new files | Blueprint.tsx (735, legacy) would grow by 2 import lines and fail the budget. Re-exports keep every importer untouched. TASK-0006 can repoint Blueprint when it splits it |
| `tokens-ok:` markers on moved lines | The task note says touched lines must use tokens. The owner chose real tokens on 2026-10-19 |
| Reuse `start` (#2e7d32) for Maya's green | Same value, but a different meaning. A future change to Start would recolour Maya |
| Also extract the choice-card list into its own component | Needs new props and moves screen state, which is more than a cut and paste. Incident.tsx is already under the cap without it |
| Fix `bg-white` behind text (UI_THEME.md > Readability rules) | It would change how things look, and this task is a pure refactor. Flagged to the owner instead |

## Decision and why

Three new files by role: small shared pieces (`incidentBits.tsx`), the Dana call panel (`Calls.tsx`) and the solved summary (`Solved.tsx`). These are exactly the parts other windows reuse. Incident.tsx re-exports them, so no importer changes. Colour tokens carry the old values unchanged, and are named after the UI_THEME.md sender badges where they exist.

## Revisions after critique

- Ledger row #1 → plan line 2 counts the white classes and says they become `paper`.
- Ledger row #2 → "working" adds the token-value script and the browser probe for states and hovers the shots can't reach.
- Ledger row #3 → the split script gives each new file its own imports and `"use client"`, exports `button` from incidentBits.tsx, and trims Incident.tsx's imports. Lint proves no unused import is left.
- Ledger row #4 → covered by the token-value script (row #2).
