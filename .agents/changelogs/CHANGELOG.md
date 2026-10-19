---
type: log
project: "Zero to a Billion"
---

# Changelog — Zero to a Billion

Append-only, newest at the top. Format and rules: `CONTEXT.md` in this folder.

---

## 2026-10-19 — Agent OS added, selectively
Added AGENTS.md, ai-context/, .agents/, .claude/, gate.py, testing/ and CI from the New-App kit. CLAUDE.md stays the hub. Skipped docs/specs, docs/security, docs/architecture, the cheat sheet, onboarding.md and db-migration-guard: the game docs are the specs and there is no backend. Owner's choice.

## 2026-10-19 — One branch, no zones
main_branch and release_branch are both `main`, matching CLAUDE.md rule 10. No zones.json: one Next.js app, worked one session at a time. Add zones if parallel sessions start.

## 2026-10-19 — Oversized files split before Milestone 7
Budget guard stays on. reducer.ts, reducer.test.ts, Incident.tsx and Blueprint.tsx get split tasks (TASK-0003 to TASK-0006) that Milestone 7 depends on. check-docs.mjs and docs/CHALLENGES.md are exempt: splitting CHALLENGES.md by stage needs check-docs.mjs to read folders first.

## 2026-10-19 — Tokens guard on; ESLint and Playwright approved
`data/blipOs.ts` and `app/globals.css` are token definition files. About 600 legacy colour literals are cleaned only when their lines are touched. The owner approved ESLint (TASK-0001) and Playwright (TASK-0002) as new dev dependencies.
