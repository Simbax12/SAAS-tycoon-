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

1. **TASK-0006** — Split Blueprint.tsx (735 lines). Moved lines will need colour tokens: reuse the window tokens TASK-0005 added to `app/globals.css` (action, off, muted, paper...) and add any missing ones there. It can also import Calls, MayaSays, Solved and Stars from their own files instead of through Incident.tsx. Also removes the Blueprint refs disable.
2. **TASK-0011** — Write the window colours into UI_THEME.md. Tiny, docs only. Then **TASK-0012** — no pure white behind text in the Incident window (a visible change, reviewed with shots).
3. **TASK-0010** — A theme token for the desktop's `#111111` backdrop. Waiting on: nothing, ready. Tiny.
4. **Milestone 8: Polish.** See the build order in docs/START_HERE.md. The System Map's words shrink on wide maps; at 375 pixels the map scrolls sideways, as agreed in Milestone 2. Check readability again.

## Waiting on the owner

- Play the game at https://zero-to-a-billion.vercel.app/, or locally with `npm run dev` and http://localhost:3000. An old save carries on. A save that finished a stage gets Maya's new computer email.
- Check the new on-screen text listed at the end of `../PROGRESS.md`.
- Set the deadline, what is due by then and the cadence in `5w.md`, then run `/roadmap`.
- TASK-0008 (Monitoring's live numbers, Milestone 8) is blocked: no doc says which live numbers Monitoring shows on each System Map box.

## Parked

- Suites 02-core-flows and 03-permissions do not exist yet, so Standard tasks are checked by 01-smoke and a live run only.
