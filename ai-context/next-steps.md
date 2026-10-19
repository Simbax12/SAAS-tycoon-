---
type: status
project: "Zero to a Billion"
last_updated: "2026-10-19"
---

# Next steps — Zero to a Billion

Live priority list. **Overwritten in place** after every verified step (by
`/step`), never appended. History lives in `../.agents/changelogs/CHANGELOG.md`.
The full task DAG lives in `../.agents/tasks/` (`python scripts/gate.py status`).

**Roadmap:** none yet. `/roadmap` builds it once the deadline is set in `5w.md`.

## Now

1. **TASK-0001** — Add ESLint and a lint script. Waiting on: nothing, ready.
2. **TASK-0002** — Add Playwright and a smoke suite. Waiting on: TASK-0001.
3. **TASK-0003 to TASK-0006** — Split the four oversized code files before Milestone 7. Waiting on: TASK-0001.
4. **TASK-0007** — Milestone 7: Stages 3 to 5. Waiting on: the splits.

## Waiting on the owner

- Play Milestone 6: `npm run dev`, then http://localhost:3000. An old save that stopped after 2.4 carries on: tap Next and B2 arrives from Zoe. Settings > Reset game plays T1 on 1.2 and B1 after 1.4. Play stops after B2.
- Check the new on-screen text listed at the end of `../PROGRESS.md`.
- Set the deadline, what is due by then and the cadence in `5w.md`, then run `/roadmap`.
- TASK-0008 (Monitoring numbers, part of Milestone 8) is blocked: no doc says which live numbers Monitoring shows on each System Map box.

## Parked

- No Tune step can be reached until Stage 3. SysDash's Tune flow was checked with a stand-in step that was then removed, and in the reducer tests.
