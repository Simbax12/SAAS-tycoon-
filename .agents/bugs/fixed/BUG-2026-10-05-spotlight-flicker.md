---
id: BUG-2026-10-05-spotlight-flicker
type: ui
zone: ""
status: fixed
task: ""
pattern: ""
---

## Symptom
The tutorial spotlight flickered. On the step "Red means something is breaking.", the yellow outline on the failing
System Map box kept vanishing and the tutorial box jumped to the top of the screen, over and over.

## Root cause
The spotlight (`components/desktop/Guide.tsx`) decides whether its target is hidden under a
window by hit-testing the target's centre point. Each red traffic dot in
`components/windows/Diagram.tsx` ends its animated run at the centre of the failing box. The dots
caught the pointer, so whenever one passed the centre, the hit test found the dot instead of the
box, and the box counted as hidden.

## Fix
The traffic dots got `pointerEvents="none"`, so the hit test looks straight past them to the box.
This fixes the cause: decoration no longer counts as a covering window.

## Tradeoffs considered
None. The dots are decoration and never need the pointer.

## How it was verified
Not recorded: commit `13514b4` and the old change log describe the fix but not how it was
checked. Migrated from the PROGRESS.md change log on 2026-10-19.
