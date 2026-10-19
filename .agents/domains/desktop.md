---
type: domain
domain: desktop
---

# Domain — desktop

Files, tables and specs: `python scripts/gate.py where desktop`.

## Current state

<!-- At most 20 lines. Overwritten (never appended) on main after each task in this domain: what the feature does now, its key files, its edge rules. -->
- BlipOS 1 and 2 desktops: wallpaper, icons, taskbar with Start menu, tabs and tray, windows that drag and stack, server alerts, balloons, loading bar.
- Tutorial spotlight, its replay and first-time tips: `components/desktop/Guide.tsx`.
- Game state and saving: `components/useGame.ts`. Phone or computer layout: `components/useScreen.ts`.
- Colours per BlipOS version come from `data/blipOs.ts` (the tokens guard treats it as a definitions file).

## History

Newest first, one line per finished task, written by `gate.py`. Older lines: `python scripts/gate.py search "<words>"`.

<!-- history:start -->
<!-- history:end -->
