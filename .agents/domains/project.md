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
- npm audit: braces <=3.0.3 advisory accepted as dev-only (no patch exists).
- PROGRESS.md keeps Done and the on-screen text to check. Decisions and changes go to `.agents/changelogs/CHANGELOG.md`.

## History

Newest first, one line per finished task, written by `gate.py`. Older lines: `python scripts/gate.py search "<words>"`.

<!-- history:start -->
- 2026-10-19 · TASK-0001 · Add ESLint and a lint script — ESLint 9 with Next's own flat config is the supported path for Next 16 and needs no peer-dep overrides. The gate only learns about lint once lint is green. Owner decisions on the 21 first-run findings (2026-10-19): set-s...
<!-- history:end -->
