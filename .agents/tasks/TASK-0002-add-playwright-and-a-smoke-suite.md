---
id: TASK-0002
title: Add Playwright and a smoke suite
zone: ""
domain: project
size: risky
status: in-progress
milestone: ""
depends_on: [TASK-0001]
plan: ".agents/plans/PLAN-TASK-0002-playwright-smoke.md"
blocked_reason: ""
outcome: ""
---

# TASK-0002 — Add Playwright and a smoke suite

## Goal

The live-verify agent can take Before and After screenshots, and suite 01-smoke proves the game loads and 1.1 can be played.

## Done when

- Playwright is a dev dependency and its Chromium installs with one command
- `testing/suites/01-smoke` has a test that loads the desktop and opens the Incident window
- `01-smoke` is wired in `.agents/gate.json` suites

## Spec links

- `docs/START_HERE.md` → tech stack
- `docs/GAME_DESIGN.md` → tutorial

## Notes

`testing/` was held back from the 2026-10-19 restructure because `testing/macros/flows.ts` imports `@playwright/test` and broke typecheck and build. Copy it from the New-App skill's `assets/scaffold/testing/` in this task. New dev dependency approved by the owner on 2026-10-19. Earlier milestones were played in Chromium at 1440, 1024 and 375 pixels wide: keep those viewports in `testing/registry/viewports.ts`.
