---
title: Split app/globals.css under 400 lines
status: done
updated: 2026-10-19
next: TASK-0005 (Split Incident.tsx), now unblocked
---

## Goal
- Split app/globals.css under 400 lines with no visual change (TASK-0009). Taken before TASK-0005 by owner decision: TASK-0005's new files need colour tokens, and globals.css was too big to grow.

## Plan (3 lines; agents are briefed from this)
1. Cut globals.css lines 212-486 (every os-* rule) word for word into app/theme/blipos.css.
2. Import it on globals.css line 2; tokens, focus ring and animations stay.
3. Code map + desktop domain; verify, smoke, Before/After shots.

## Done (verified)
- Split: the two files rebuild the old globals.css byte for byte without the import line.
- gate.py verify: all 11 guards and checks pass. 01-smoke passes (desktop and phone).
- 22 Before/After pairs (classic, rounded, glass, flat at 1440 and 375) byte-identical.

## Next steps
1. TASK-0005.

## Waiting on the owner
- Commit or gitignore testing/registry/shots/.

## Live state to clean up
- The dev server on :3000 is left running. The scratchpad scripts were deleted.

## Files changed
- app/globals.css, app/theme/blipos.css, CLAUDE.md:191, .agents/domains/desktop.md, TASK-0005 (now depends on TASK-0009)
