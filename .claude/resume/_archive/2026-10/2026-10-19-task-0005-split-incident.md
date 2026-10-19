---
title: Split Incident.tsx under 400 lines
status: done
updated: 2026-10-19
next: TASK-0006 (Split Blueprint.tsx)
---

## Goal
- Split components/windows/Incident.tsx under 400 lines with no visible change (TASK-0005).

## Plan (3 lines; agents are briefed from this)
1. Move helpers to incidentBits.tsx, Calls.tsx, Solved.tsx; Incident.tsx re-exports what other windows use.
2. Swap the 23 hard-coded colours on moved lines for same-value @theme tokens.
3. Code map + windows domain; verify, smoke, Before/After shots, token probe.

## Done (verified)
- Script: every token equals the old hex; moved code identical apart from imports, export keywords and colour swaps.
- gate.py verify: all 11 guards and checks pass. 01-smoke passes (desktop and phone).
- 96 Before/After pairs: 95 byte-identical; 1 full-page shot differs by 22 px on the wallpaper outside the window (flaky, rerun identical).
- Browser probe: all 18 tokens match the old colours, hovers included; greyed Call Dana, Victor's lifeline and No more calls checked.

## Next steps
1. TASK-0006.

## Waiting on the owner
- Shots folder: commit or gitignore. Undocumented window colours. White behind text vs the readability rule.

## Live state to clean up
- The dev server on :3000 is left running. scratchpad split0005.py only.

## Files changed
- components/windows/Incident.tsx, incidentBits.tsx, Calls.tsx, Solved.tsx; app/globals.css @theme; CLAUDE.md "Other code"; .agents/domains/windows.md
