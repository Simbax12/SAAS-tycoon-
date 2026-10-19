---
name: roadmap
description: Build or re-plan the project roadmap. It asks for the deadline if `5w.md` doesn't have one, groups the task DAG into dated milestones, writes `.agents/milestones.json`, and generates the master checklist (`ai-context/roadmap.md`) and the dashboard file (`ai-context/roadmap.json`). Use it at onboarding step 9, when `gate.py status` says "no roadmap yet", when the deadline or scope changes, or when the owner says "/roadmap", "make a roadmap", "re-plan", "the deadline moved", or asks where the project is up to overall.
---

# /roadmap: milestones, dates and the master checklist

The roadmap is the master checklist: Claude, a developer or the owner's dashboard can
open it and see where the project is up to. It's built from three sources:

| Source | Holds | Written by |
|---|---|---|
| `ai-context/5w.md` (labels marked ★) | Deadline, what's due, hard/soft, cadence, phase, one-liner, URLs, `stack` | Onboarding, or step 1 below |
| `.agents/milestones.json` | The milestones and the "later" ideas | This skill |
| Task files | `milestone:`, `status`, `blocked_reason`, `done:` | `/step`, `gate.py` |

`python scripts/gate.py roadmap` turns them into `ai-context/roadmap.md` and
`roadmap.json`. **Never edit those two by hand.** `gate.py done` and
`worktree finish` regenerate them automatically. `format.md`, next to this file, is the
contract dashboards read; keep it in step with `gatekit/roadmap.py`.

**Dates and ticks only:** the checklist never forecasts. The one judgment call
is the fit check in step 4, made once at planning time.

## 1. The deadline (only what `5w.md` doesn't already say)

Read the When section of `ai-context/5w.md`. If the ★ lines are missing (older
projects) or still placeholders, ask through one pop-up of up to 4 cards:
- **Date:** your best guess from the material first; "about 1 month", "about 3 months", "no fixed date". Turn a relative answer into an exact `YYYY-MM-DD` and read it back.
- **What must be ready by then:** e.g. live for real users, a demo, a pilot with one client.
- **Hard or soft:** hard = a fixed outside date (contract, launch event); soft = a target.
- **Cadence:** how often the project gets worked on.

Write the answers into `5w.md` with the exact ★ labels from the skill's template:
`- **Deadline:** 2027-01-31 (hard) ★`, or `none`.

## 2. Milestones

Run `python scripts/gate.py status` for the task DAG. Then group the open tasks into
**3–6 milestones** in dependency order:
- **A milestone ends in something the owner can see or try.** Its `goal` reads "You'll be able to…". Name what changes for the user, not the code.
- **Foundations come first:** stack setup, data, auth, the smoke suite, and the UI setup tasks.
- **The last milestone is `Launch`.** It holds a task "Run the Release Gate and deploy" (Standard, domain `project`). Create it if it's missing, with `depends_on` set to the last task of each other milestone.
- **TASK-0001** goes in the first milestone.
- **A task never depends on a task in a later milestone.** If one does, move one of them.

**Dates:** work back from the deadline. Keep about 15–20% of the time as buffer
between the Launch target and the deadline. Space the targets by how much work each
milestone holds (Tiny ≈ half a Standard, Risky ≈ two) and by the owner's cadence. With
no deadline, leave `target` empty.

## 3. Write

Write `.agents/milestones.json`:

```json
{
  "_comment": "The roadmap plan, written by /roadmap. Deadline, phase and links live in ai-context/5w.md; progress lives in the task files. Never put task lists here.",
  "milestones": [
    { "id": "M1", "title": "Foundations", "goal": "You'll be able to sign in and see an empty dashboard", "target": "2026-11-15" },
    { "id": "M4", "title": "Launch", "goal": "Real users can use it at the live URL", "target": "2027-01-10" }
  ],
  "later": ["Offline mode - moved after launch by the owner on 2026-10-15 (deadline)"]
}
```

- **Ids** are short and stable (`M1`, `M2`…). Never renumber them once the project is underway: add `M2b` instead.
- **Every open task gets `milestone: <id>`,** small visual changes included.
- **Work the owner defers:** set `status: parked` (never ready, listed under "After launch"), and park the tasks that depend on it too. Ideas that aren't tasks yet go in `later`.
- **Waiting on the owner:** a task waiting on the owner gets `status: blocked` and a one-line `blocked_reason:`. The dashboard shows it as "waiting on me".

Then run `python scripts/gate.py roadmap` and fix every problem it lists.

## 4. Confirm with the owner

Show the milestones as a few bullets: id, title, target date, goal and task count.
**Fit check, this once:** if the work clearly won't fit before the deadline, say so
plainly and give cards: park named tasks (most optional first), move the date, or
keep it and accept the risk. Every cut is the owner's call. Re-run `gate.py roadmap`
after any change.

If the repo is public, remind the owner that `roadmap.json` makes the deadline,
`Due by then` and the preview URL public. Keep client names out of it.

## Re-planning

When the date moves, scope changes (`onboarding.md` → re-scoping), or milestones drift:
1. Update `5w.md` (deadline lines) and `milestones.json`.
2. Re-assign `milestone:` on the tasks that moved.
3. Run `gate.py roadmap` and confirm with the owner as above.
4. Log the re-plan in `CHANGELOG.md` in one line: what moved and why.

Done milestones keep their id and their tasks; don't rewrite history.
