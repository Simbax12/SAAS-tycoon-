---
id: TASK-0012
title: No pure white behind text in the Incident window
zone: ""
domain: windows
size: standard
status: todo
milestone: ""
depends_on: [TASK-0011]
plan: ""
blocked_reason: ""
outcome: ""
---

# TASK-0012 — No pure white behind text in the Incident window

## Goal

Dana's call panel, the solved boxes and the Seen before stamp follow docs/UI_THEME.md > Readability rules: "Never pure white behind text. Use the version's window body colour."

## Done when

- No text in `components/windows/Calls.tsx` or `components/windows/Solved.tsx` sits on `bg-paper`; it uses the BlipOS version's window body colour instead
- Before/After shots at 1440 and 375, on BlipOS 1 and a later version, for the owner to review
- Text still passes 4.5 to 1 contrast

## Spec links

- `docs/UI_THEME.md` → Readability rules, BlipOS versions

## Notes

Owner decision 2026-10-20. This is a visible change, unlike TASK-0005. Other windows (e.g. Blueprint, Shop) may break the same rule; list them for the owner rather than widening this task.
