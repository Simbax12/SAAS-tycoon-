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
- Styles: `app/globals.css` holds the `@theme` tokens, the focus ring and the animations, and imports `app/theme/blipos.css`, which holds every `os-*` rule per BlipOS look. Both are tokens-guard definition files.

## History

Newest first, one line per finished task, written by `gate.py`. Older lines: `python scripts/gate.py search "<words>"`.

<!-- history:start -->
- 2026-10-19 · TASK-0009 · Split app/globals.css under 400 lines — Move the `os-*` block into `app/theme/blipos.css`. It is one self-contained section about the BlipOS looks, and the theme folder is where the tokens guard expects colour definitions. The cascade order is safe. The moved ...
<!-- history:end -->
