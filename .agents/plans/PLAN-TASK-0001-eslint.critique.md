---
type: ledger
plan: PLAN-TASK-0001-eslint.md
---

# Critique ledger — TASK-0001

Append-only. `critic` adds one row per finding, or one "no findings" row per
lens. The main session fills in Resolution after revising the plan or the code.

- **Stage:** 3 (plan mode) or 5 (code mode).
- **Lens:** L1 logic, L2 failure modes, L3 simplicity and side effects, L4 security and data boundaries, or `code`.
- **Verdict:** SOUND / REVISE / BLOCK for plan mode. MATCHES / DRIFT for code mode.

| # | Date | Stage | Model | Lens | Verdict | Finding | Resolution |
|---|---|---|---|---|---|---|---|
| 1 | 2026-10-19 | 3 | sonnet | L3 | REVISE | Step 2 commits the gate.json lint check before step 3 makes lint pass, so `gate.py verify` is red on that commit and any commit until the last fix. Add the gate check in the final fix commit (or note the red window). || Plan step 2 no longer touches gate.json; the lint check is added only in the commit where lint first exits 0. |
| 2 | 2026-10-19 | 3 | sonnet | L3 | REVISE | `eslint .` also lints scripts/*.mjs, postcss.config.mjs, public/ and .agents/ (tsconfig excludes scripts). Plan only lists .next/out/.test-build/next-env.d.ts; state whether scripts/check-docs.mjs is in scope (owner says never edit it to dodge problems) and add `public/**`, `node_modules` handling explicitly. || Scope is now explicit: app/, components/, data/, game/ and root config files. Ignored: public/, scripts/, .agents/, .claude/, testing/ and build output. |
| 3 | 2026-10-19 | 3 | sonnet | L2 | REVISE | eslint-config-next 16 bundles react-hooks v7 rules (set-state-in-effect, refs, purity) likely to fire in useGame/Game.tsx/windows. Fixes there are not 'no behaviour change'. Plan should say these go to the owner list, with a per-rule count, before any edit. || Step 3 now runs lint read-only first and lists the findings with a count per rule. Mechanical fixes only. Every react-hooks v7 finding goes to the owner before any edit. |
| 4 | 2026-10-19 | 3 | sonnet | L1 | REVISE | Docs: START_HERE.md tech stack/commands is the task's spec link but plan says 'only if it lists tooling'; check-docs.mjs may compare Commands rows. Decide up front and run check-docs after the CLAUDE.md edit. || Decided now: START_HERE.md > Tech gets an ESLint line, CLAUDE.md > Commands gets a lint row, and check-docs.mjs runs after the doc edits. |
| 5 | 2026-10-19 | 3 | sonnet | L4 | no findings | No secrets or data boundaries touched. || No action. |
| 6 | 2026-10-19 | 3 | opus | L1 | REVISE | Step 3's "stop and list" branch contradicts "Working means lint exits 0": components/useGame.ts:26-31 calls setHadSave inside useEffect (save-load hydration), which react-hooks v7 `set-state-in-effect` flags as an error. That fix touches save loading, so the stop branch is near certain and the task has no defined end state. Plan must name the fallback the owner picks: per-line disable with reason, rule set to warn, or task stays open. || Fallbacks are named in the plan and go to the owner in one pop-up: fix it, a per-line disable with a reason, or the rule set to warn. The task stays in progress until the owner chooses. |
| 7 | 2026-10-19 | 3 | opus | L2 | REVISE | Ordering: committing the gate.json lint check in step 2 (before lint is clean) makes `gate.py verify` and `gate.py done` fail for every task until the fixes land; if step 3 stops for the owner, the repo stays red indefinitely. Add the gate check only in the commit where lint first exits 0. || Same as row 1. |
| 8 | 2026-10-19 | 3 | opus | L3 | REVISE | `eslint .` also lints .claude/hooks/resume-context.mjs (agent tooling, outside the task) and scripts/check-docs.mjs (CLAUDE.md: do not edit it to make problems go away). Ignore list should add `.claude/**` and decide scripts/** explicitly; otherwise lint fixes spill into tooling files. || `.claude/**` and `scripts/**` are ignored. Both are tooling (kit copies, and the docs check) and outside this task. |
| 9 | 2026-10-19 | 3 | opus | L3 | REVISE | Files list misses the change log entry (.agents/changelogs/CHANGELOG.md, rule 7 now lives there after commit 18a4111) and the CLAUDE.md code map "Other code" line for the new eslint.config.mjs (rule: create a code file -> update the code map). || The CLAUDE.md code map line for eslint.config.mjs is added. The CHANGELOG entry is written by `gate.py done` (rule 7: tasks don't hand-edit it). |
| 10 | 2026-10-19 | 3 | opus | L2 | REVISE | eslint-config-next pinned exactly to 16.3.8 while package.json keeps `next: ^16.3.8`; a later `npm install`/update can move next to 16.4.x while @next/eslint-plugin-next stays 16.3.8. Note the pair must be bumped together (or pin next too, owner's call). Minor. || The plan notes that next and eslint-config-next are bumped together. Pinning next goes to the owner as a follow-up and is not done in this task. |
| 11 | 2026-10-19 | 3 | opus | L4 | no findings | Dev-only dependency, approved by owner 2026-10-19; versions verified on npm (eslint 9.39.5, eslint-config-next 16.3.8 peer eslint>=9). No zones, no data or secrets touched. || No action. |
