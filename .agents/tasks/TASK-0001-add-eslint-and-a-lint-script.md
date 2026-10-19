---
id: TASK-0001
title: Add ESLint and a lint script
zone: ""
domain: project
size: risky
status: in-progress
milestone: ""
depends_on: []
plan: ".agents/plans/PLAN-TASK-0001-eslint.md"
blocked_reason: ""
outcome: ""
---

# TASK-0001 — Add ESLint and a lint script

## Goal

Typecheck, lint and build can all be gated, as the owner requires on every project.

## Done when

- `npm run lint` exists and passes with `eslint-config-next`
- `lint` is a check in `.agents/gate.json`
- Any existing warnings are fixed or listed for the owner

## Spec links

- `docs/START_HERE.md` → tech stack

## Notes

New dev dependency approved by the owner on 2026-10-19. Fix lint findings in their own commits, not bundled with the setup.
