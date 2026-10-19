---
type: domain
domain: windows
---

# Domain — windows

Files, tables and specs: `python scripts/gate.py where windows`.

## Current state

<!-- At most 20 lines. Overwritten (never appended) on main after each task in this domain: what the feature does now, its key files, its edge rules. -->
- Incident, Inbox, Shop, Stats, Pattern Book, Recycle Bin, Settings, How to Play, System Map, and the three work apps: Blueprint, Terminal, SysDash.
- Incident window: `Incident.tsx` (new, repeat and Build flows) uses `Calls.tsx` (Dana's calls), `Solved.tsx` (solved summary, Next) and `incidentBits.tsx` (Maya's bubble, open-app hint, stars, small shared pieces). Incident.tsx re-exports the pieces other windows import from it.
- Window colours on moved lines use theme tokens in `app/globals.css` (maya, dana, pattern, muted, action, off, hint, paper and their soft/edge forms).
- Oversized: `Blueprint.tsx` 735 lines (TASK-0006).

## History

Newest first, one line per finished task, written by `gate.py`. Older lines: `python scripts/gate.py search "<words>"`.

<!-- history:start -->
- 2026-10-19 · TASK-0005 · Split Incident.tsx under 400 lines — Three new files by role: small shared pieces (`incidentBits.tsx`), the Dana call panel (`Calls.tsx`) and the solved summary (`Solved.tsx`). These are exactly the parts other windows reuse. Incident.tsx re-exports them, s...
<!-- history:end -->
