---
type: status
project: "Zero to a Billion"
last_updated: "2026-10-19"
---

# Next steps — Zero to a Billion

Live priority list. **Overwritten in place** after every verified step (by
`/step`), never appended. History lives in `../.agents/changelogs/CHANGELOG.md`.
The full task DAG lives in `../.agents/tasks/` (`python scripts/gate.py status`).

**Roadmap:** none yet - run /roadmap (onboarding step 9).

## Now

1. **TASK-0005** — Split Incident.tsx (565 lines). Ready now that TASK-0009 is done. The moved helpers hold 23 hard-coded colours: add tokens with the same values (to `app/globals.css` or a file in `app/theme/`) and use them on the moved lines.
2. **TASK-0006** — Split Blueprint.tsx (735 lines). Expect the same hard-coded colour problem as TASK-0005; reuse its tokens. Also removes the Blueprint refs disable.
3. **TASK-0010** — A theme token for the desktop's `#111111` backdrop. Waiting on: nothing, ready. Tiny.
4. **Milestone 8: Polish.** See the build order in docs/START_HERE.md. The System Map's words shrink on wide maps; at 375 pixels the map scrolls sideways, as agreed in Milestone 2. Check readability again.

## Waiting on the owner

- Play the game at https://zero-to-a-billion.vercel.app/, or locally with `npm run dev` and http://localhost:3000. An old save carries on. A save that finished a stage gets Maya's new computer email.
- Decide whether screenshot folders (`testing/registry/shots/`) are committed or gitignored. TASK-0009's 44 shots are untracked for now.
- Check the new on-screen text listed at the end of `../PROGRESS.md`.
- Set the deadline, what is due by then and the cadence in `5w.md`, then run `/roadmap`.
- TASK-0008 (Monitoring's live numbers, Milestone 8) is blocked: no doc says which live numbers Monitoring shows on each System Map box.

## Parked

- Suites 02-core-flows and 03-permissions do not exist yet, so Standard tasks are checked by 01-smoke and a live run only.
