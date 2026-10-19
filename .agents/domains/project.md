---
type: domain
domain: project
---

# Domain — project

Files, tables and specs: `python scripts/gate.py where project`.

## Current state

<!-- At most 20 lines. Overwritten (never appended) on main after each task in this domain: what the feature does now, its key files, its edge rules. -->
- Ten game docs in `docs/`, routed by `CLAUDE.md`. `node scripts/check-docs.mjs` must print "0 problems".
- Agent OS added 2026-10-19: `AGENTS.md`, `ai-context/`, `.agents/`, `scripts/gate.py`. No zones, one branch (`main`).
- ESLint 9 (`eslint.config.mjs`, Next.js rules) lints app/, components/, data/, game/. `lint` is a gate check. 7 per-line disables, each with a reason; the Blueprint refs pair goes in TASK-0006.
- Playwright 1.63.0 (`playwright.config.ts`): Chromium, desktop 1440 and phone 375 projects, reduced motion, reuses a running `npm run dev` on 3000. `01-smoke` is a gate suite; 02 to 05 are empty.
- Tests tap only `data-tap` names from `testing/TAP_SIGNALS.md` (27 signals). Add new ones there, then `gate.py signals`.
- npm audit: braces <=3.0.3 advisory accepted as dev-only (no patch exists).
- PROGRESS.md keeps Done and the on-screen text to check. Decisions and changes go to `.agents/changelogs/CHANGELOG.md`.

## History

Newest first, one line per finished task, written by `gate.py`. Older lines: `python scripts/gate.py search "<words>"`.

<!-- history:start -->
- 2026-10-19 · TASK-0002 · Add Playwright and a smoke suite — Playwright in Chromium, driven only by TAP signals, gives `live-verify` and the suites one shared, stable way into the game. Pinned at 1.63.0 under the two-week age rule; adds no audit findings and no install scripts. Th...
- 2026-10-19 · TASK-0001 · Add ESLint and a lint script — ESLint 9 with Next's own flat config is the supported path for Next 16 and needs no peer-dep overrides. The gate only learns about lint once lint is green. Owner decisions on the 21 first-run findings (2026-10-19): set-s...
<!-- history:end -->
