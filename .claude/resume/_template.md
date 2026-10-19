---
title: <short task name>
status: active
updated: YYYY-MM-DD HH:MM
next: <the very next action, one line>
---
<!-- Copy to .claude/resume/YYYY-MM-DD-<task-slug>.md. OVERWRITE it at each
checkpoint (never append). Keep it under ~40 lines. When the task is done,
set status: done and move it to .claude/resume/_archive/YYYY-MM/.
Files starting with _ are never loaded by the startup hook. -->

## Goal
- <what the owner asked for, in one or two lines> (TASK-NNNN)

## Plan (3 lines; agents are briefed from this)
1.
2.
3.

## Done (verified)
- <step>: <how it was verified> (<commit hash>)

## Next steps
1. <next action>

## Waiting on the owner
- <decision or approval needed, or "nothing">

## Live state to clean up
- <test data, servers on which ports, temp files, or "none">

## Files changed
- <path:line-range>, from `python scripts/gate.py where <domain>`
