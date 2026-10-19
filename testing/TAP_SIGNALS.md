# TAP signals — Zero to a Billion

The zero-discovery selector registry. Every element a test or `live-verify`
touches carries `data-tap="<zone>.<screen>.<action>"`, and tests use only names
from this table. They never hunt the DOM.

- **Naming:** lowercase, dot-separated, at least three parts. Start with the zone
  id (`0`, `a`, `c`, `e1`…) or `app` for app-wide elements. Examples:
  `c.job-card.start`, `d.dispatch.drag-job`.
- **New UI:** register its signals here in the same task. `critic` checks this
  in code mode.
- **After editing:** run `python scripts/gate.py signals` to regenerate
  `registry/tap-signals.ts`. Never edit that file by hand.
- **Renaming a signal:** grep `testing/` for the old name and update every use
  in the same task.

| Signal | Screen | Element | Notes |
|---|---|---|---|
| `app.shell.ready` | Desktop | Desktop root, once it has its size (`components/desktop/Desktop.tsx`) | `01-smoke` waits on this |
| `app.room.sit-down` | Room | "Tap the screen to sit down" (`components/room/RoomFrame.tsx`) | Shows on the desk still |
| `app.guide.skip-tutorial` | Tutorial | "Skip tutorial" in the tutorial box and its replay (`components/desktop/Guide.tsx`) | Shows once 1.1 has arrived |
| `app.desktop.open-inbox` | Desktop | The Inbox icon (`components/desktop/DesktopIcons.tsx`) | Opens the window |
| `app.desktop.open-incident` | Desktop | The Incident icon (`components/desktop/DesktopIcons.tsx`) | Opens the window |
| `app.desktop.open-systemmap` | Desktop | The System Map icon (`components/desktop/DesktopIcons.tsx`) | Opens the window |
| `app.desktop.open-blueprint` | Desktop | The Blueprint icon (`components/desktop/DesktopIcons.tsx`) | Opens the window |
| `app.desktop.open-terminal` | Desktop | The Terminal icon (`components/desktop/DesktopIcons.tsx`) | Opens the window |
| `app.desktop.open-sysdash` | Desktop | The SysDash icon (`components/desktop/DesktopIcons.tsx`) | Opens the window |
| `app.desktop.open-shop` | Desktop | The Shop icon (`components/desktop/DesktopIcons.tsx`) | Opens the window |
| `app.desktop.open-patternbook` | Desktop | The Pattern Book icon (`components/desktop/DesktopIcons.tsx`) | Opens the window |
| `app.desktop.open-stats` | Desktop | The Stats icon (`components/desktop/DesktopIcons.tsx`) | Opens the window |
| `app.desktop.open-howtoplay` | Desktop | The How to Play icon (`components/desktop/DesktopIcons.tsx`) | Opens the window |
| `app.desktop.open-settings` | Desktop | The Settings icon (`components/desktop/DesktopIcons.tsx`) | Opens the window |
| `app.desktop.open-recyclebin` | Desktop | The Recycle Bin icon (`components/desktop/DesktopIcons.tsx`) | Opens the window |
| `app.window.inbox` | Window | The Inbox window (`components/desktop/WindowFrame.tsx`) | |
| `app.window.incident` | Window | The Incident window (`components/desktop/WindowFrame.tsx`) | |
| `app.window.systemmap` | Window | The System Map window (`components/desktop/WindowFrame.tsx`) | |
| `app.window.blueprint` | Window | The Blueprint window (`components/desktop/WindowFrame.tsx`) | |
| `app.window.terminal` | Window | The Terminal window (`components/desktop/WindowFrame.tsx`) | |
| `app.window.sysdash` | Window | The SysDash window (`components/desktop/WindowFrame.tsx`) | |
| `app.window.shop` | Window | The Shop window (`components/desktop/WindowFrame.tsx`) | |
| `app.window.patternbook` | Window | The Pattern Book window (`components/desktop/WindowFrame.tsx`) | |
| `app.window.stats` | Window | The Stats window (`components/desktop/WindowFrame.tsx`) | |
| `app.window.howtoplay` | Window | The How to Play window (`components/desktop/WindowFrame.tsx`) | |
| `app.window.settings` | Window | The Settings window (`components/desktop/WindowFrame.tsx`) | |
| `app.window.recyclebin` | Window | The Recycle Bin window (`components/desktop/WindowFrame.tsx`) | |
