---
type: plan
task: TASK-0002
size: risky
status: critiqued
supersedes: ""
last_updated: 2026-10-19
---

# PLAN — TASK-0002 Add Playwright and a smoke suite

`status` moves draft → critiqued → approved. Set it to superseded if a newer plan replaces this one.

## Plan (3 lines — agents are briefed from this)

1. Setup commit: exact dev dep `@playwright/test@1.63.0`; `playwright.config.ts` with testDir `testing/suites`, `use.reducedMotion: 'reduce'`, two Chromium projects `desktop` (1440×900) and `phone` (375×812) built from `VIEWPORTS`, `webServer` = `npm run dev` on http://localhost:3000 with `reuseExistingServer: !process.env.CI` (Next 16 allows one dev server per folder); scripts `e2e` and `e2e:install`; `testing/` from the kit with viewports `desktop` 1440×900, `laptop` 1024×768, `phone` 375×812; ignore `test-results/`, `playwright-report/`.
2. Signals commit, data attributes only: `app.shell.ready` on the Desktop root **only once its size is measured** (`area.width > 0`); `app.room.sit-down`; `app.desktop.open-<id>` and `app.window.<id>`, each built once from `id.toLowerCase()`; `app.guide.skip-tutorial` via an optional `tap` on Guide's button type. Registered in TAP_SIGNALS.md; `gate.py signals` regenerates the registry.
3. Smoke commit: `testing/suites/01-smoke/desktop.spec.ts`, run by both projects: wait for and tap sit-down → wait for shell.ready → wait for and tap skip-tutorial, then wait for it to detach → tap open-incident → `app.window.incident` is visible and contains 1.1's title, imported from `data/challenges.ts`; fails on any page error. gate.json suite `01-smoke` = `npx --no playwright test testing/suites/01-smoke`.

## Files expected to change

- `package.json`, `package-lock.json` (one devDependency, two scripts); `.gitignore` (two lines)
- `playwright.config.ts` (new, ~30 lines); `testing/**` (new, from the kit; `shot.mjs` left out: it needs a component workbench this game doesn't have)
- `components/desktop/Desktop.tsx` ~146, `components/room/RoomFrame.tsx` ~163, `components/desktop/DesktopIcons.tsx` ~24, `components/desktop/WindowFrame.tsx` ~69, `components/desktop/Guide.tsx` ~36, 122, 140, 267
- No tsconfig or ESLint change: `tsconfig.json` already includes `**/*.ts`, ESLint already ignores `testing/**`, `tsconfig.test.json` covers only `game/` and `data/`
- `.agents/gate.json` (suite `01-smoke`); `CLAUDE.md` > Commands (e2e rows) and Code map line; `docs/START_HERE.md` > Tech (one Playwright line); `.agents/domains.json` (`playwright.config.ts` in project); `AGENTS.md` `testing/` row

## What "working" means

- `npm run e2e:install` then `python scripts/gate.py suite 01-smoke` prints PASS in both projects (desktop 1440, phone 375), with or without the owner's own `npm run dev` already running.
- The test fails if 1.1 doesn't arrive (it checks 1.1's title, not the title bar).
- `python scripts/gate.py verify` still passes (docs, tsc, lint, test, build), with `testing/` typechecked.
- The game looks and plays the same: the signals are data attributes only.
- Not covered yet: playing 1.1 through to a fix. That belongs in `02-core-flows`.

## Options considered and rejected

| Option | Why rejected |
|---|---|
| `@playwright/test@1.64.x` (latest) | Released 2026-10-07, under the two-week age rule |
| Firefox / WebKit too | Earlier milestones were checked in Chromium only; three browsers triple the download for no current need |
| Role/text selectors (`getByRole`) | `testing/CONTEXT.md` rule: tests use TAP names only |
| `webServer` on its own port (`-p 3100`) | Next 16 refuses a second dev server in the same folder, so it fails whenever the owner's dev server runs (critique rows 3, 7) |
| `webServer` on a production build | `next build` adds about a minute to every run; dev is enough for smoke |
| Keep `shot.mjs` | Needs a `dev-ui.html` workbench with view fixtures; this game has none. `live-verify` takes Before/After shots against the real game instead |

## Decision and why

Playwright in Chromium, driven only by TAP signals, gives `live-verify` and the suites one shared, stable way into the game.

## Revisions after critique

- Rows 3, 7 → webServer reuses `npm run dev` on 3000 locally; CI starts its own.
- Rows 1, 5 → wait for each signal before tapping; wait for the skip dialog to detach before opening Incident.
- Row 2 → `reducedMotion: 'reduce'` set in the config, before first paint.
- Rows 4, 8 (passes disagreed; took the stricter) → window found by TAP name, asserted to contain 1.1's title from the data file.
- Row 9 → two Playwright projects from VIEWPORTS; gate.json command written down.
- Row 10 → `app.shell.ready` only once the desktop has its size.
- Row 6 → SIGNAL_RE accepts lowercased ids (opus checked); lowercasing done once per component; no tsconfig change needed.
