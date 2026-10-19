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
| `app.shell.ready` | any | Root element, once the app has finished loading | `01-smoke` waits on this |
