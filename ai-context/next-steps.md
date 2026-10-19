---
type: status
project: "Zero to a Billion"
last_updated: "2026-10-19"
---

# Next steps — Zero to a Billion

Live priority list. **Overwritten in place** after every verified step (by
`/step`), never appended. History lives in `../.agents/changelogs/CHANGELOG.md`.
The full task DAG lives in `../.agents/tasks/` (`python scripts/gate.py status`).

**Roadmap:** none yet. `/roadmap` builds it (no deadline).

## Now

1. **TASK-0003, TASK-0005, TASK-0006** — Split reducer.ts, Incident.tsx and Blueprint.tsx under 400 lines. Waiting on: nothing, ready. `01-smoke` and live-verify now check them in the real game. TASK-0006 also removes the Blueprint refs disable.
2. **TASK-0004** — Split reducer.test.ts. Waiting on: TASK-0003.
3. **TASK-0007** — Milestone 7: Stages 3 to 5. Waiting on: the four splits.

## Waiting on the owner

- Play Milestone 6: `npm run dev`, then http://localhost:3000. An old save that stopped after 2.4 carries on: tap Next and B2 arrives from Zoe. Settings > Reset game plays T1 on 1.2 and B1 after 1.4. Play stops after B2.
- Check the new on-screen text listed at the end of `../PROGRESS.md`.
- Set the cadence in `5w.md` (no deadline, decided 2026-10-19), then run `/roadmap`.
- Pin `next` exactly too, or keep `^16.3.8`? `eslint-config-next` is pinned to 16.3.8, so the two must be bumped together.
- At 375 px wide the Incident window's System diagram is cut off on the right: Database doesn't show (seen in TASK-0002's shots, not caused by it). Bug or fine?
- TASK-0008 (Monitoring numbers, part of Milestone 8) is blocked: no doc says which live numbers Monitoring shows on each System Map box.

## Parked

- No Tune step can be reached until Stage 3. SysDash's Tune flow was checked with a stand-in step that was then removed, and in the reducer tests.
