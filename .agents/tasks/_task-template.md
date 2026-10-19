---
id: TASK-NNNN
title: Short plain-English title
zone: ""
domain: ""
size: standard
status: todo
milestone: ""
depends_on: []
plan: ""
blocked_reason: ""
outcome: ""
---

# TASK-NNNN — Short plain-English title

## Goal

One or two sentences: what the app does differently once this is done, and why.

## Done when

- A checkable outcome the owner could see or test
- Another checkable outcome

## Spec links

- `docs/specs/NN-name.md` → the section this implements

(Open questions or gaps in a confirmed doc block this task only if the doc is linked here or in its domain's `specs`.)

## Notes

Anything the next session needs that isn't in the spec.

- Leave out `verify:` to run every check in gate.json, or narrow it, e.g. `verify: [tsc, lint, 01-smoke]`. The guards (gaps, budget, map, zone-check) always run anyway.
- `outcome:` is filled at Stage 7: one plain-English line saying what changed. `gate.py` turns it into the CHANGELOG entry, so never edit CHANGELOG.md for a task.
- Only if this task must grow an oversized legacy file: add `budget_override: [path/to/file.tsx]` and say why below.

## Budget override

(Delete this section unless `budget_override` is set: one line per file, with the reason.)
