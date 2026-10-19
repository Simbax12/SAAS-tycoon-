---
type: plan
task: TASK-0001
size: risky
status: critiqued
supersedes: ""
last_updated: 2026-10-19
---

# PLAN — TASK-0001 Add ESLint and a lint script

`status` moves draft → critiqued → approved. Set it to superseded if a newer plan replaces this one.

## Plan (3 lines — agents are briefed from this)

1. Setup commit: exact dev deps `eslint@9.39.5` + `eslint-config-next@16.3.8`, a flat `eslint.config.mjs` (Next `core-web-vitals` + `typescript`), `"lint": "eslint ."`, docs rows. No gate.json change yet.
2. Run lint read-only and list findings with a count per rule. Mechanical, behaviour-free fixes go in separate commits by rule. Every react-hooks v7 finding (`set-state-in-effect`, `refs`, `purity`, …) and any judgement call goes to the owner first, as one pop-up: fix / per-line disable with reason / rule set to warn.
3. Only in the commit where `npm run lint` first exits 0: add the `lint` check to `.agents/gate.json`. Until then the task stays in progress.

## Scope

- **Linted:** `app/`, `components/`, `data/`, `game/`, and root config files (`next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`).
- **Ignored:** `.next/`, `out/`, `.test-build/`, `node_modules/`, `next-env.d.ts`, `public/`, `scripts/` (docs check + kit tooling), `.agents/`, `.claude/`, `testing/`.

## Files expected to change

- `package.json`, `package-lock.json` (two devDependencies, one script)
- `eslint.config.mjs` (new, about 25 lines)
- `.agents/gate.json` (one check, last commit only)
- `CLAUDE.md` > Commands (one `npm run lint` row) and > Code map "Other code" (one line for `eslint.config.mjs`)
- `docs/START_HERE.md` > Tech (one ESLint line), then `node scripts/check-docs.mjs`
- Lint fixes: unknown until the first run, listed per rule in the walkthrough
- CHANGELOG: written by `gate.py done`, not by hand

## What "working" means

- `npm run lint` exits 0 on the scope above.
- `python scripts/gate.py verify` shows `lint: PASS` alongside docs, tsc, test, build.
- The 46 tests pass and the game builds: no behaviour change from fixes, unless the owner chose one.

## Options considered and rejected

| Option | Why rejected |
|---|---|
| `next lint` | Removed in Next.js 16; the CLI is now plain `eslint` |
| ESLint 10 (latest) | `eslint-plugin-react` 7.37.5, pulled in by `eslint-config-next`, only supports up to `^9.7`; would need `--legacy-peer-deps` |
| `^` ranges | Owner wants deliberate dependency changes; exact pins match `next@16.3.8`. `next` and `eslint-config-next` must be bumped together |
| Gate check in the setup commit | Makes `verify` and `done` red for every task until lint is clean (critique rows 1, 7) |
| Disabling rules silently | Hides real problems; only the owner picks a disable or warn, per rule |

## Decision and why

ESLint 9 with Next's own flat config is the supported path for Next 16 and needs no peer-dep overrides. The gate only learns about lint once lint is green.

## Revisions after critique

- Rows 1, 7 → gate.json check moved to the commit where lint first passes (step 3).
- Rows 2, 8 → explicit scope and ignore list; `scripts/` and `.claude/` are out.
- Rows 3, 6 → step 2 lists findings first; react-hooks v7 and judgement calls go to the owner with named fallbacks.
- Rows 4, 9 → docs edits decided up front (START_HERE Tech, CLAUDE Commands + Code map), check-docs after.
- Row 10 → bump-together note; pinning `next` is a follow-up question for the owner.
