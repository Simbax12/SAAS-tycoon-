# Progress

What is built, what is next, and the decisions made. Keep this short and current.

## Done

- Game design docs in `docs/`, with CLAUDE.md as the hub.
- `scripts/check-docs.mjs` checks that the docs agree. It prints "0 problems".
- 35 incidents written: 20 new, 10 repeats, 5 Builds. Also 10 Triage steps, 5 Tune steps and 19 Shop items.
- No game code yet.

## Next

- Milestone 1: Desktop. See the build order in docs/START_HERE.md.

## Decisions

| Date | Decision | Why |
|---|---|---|
| 2026-10-02 | Added five new incidents, one per stage: 1.4 The Key in the Code, 2.4 The Chatty Feed, 3.4 The Domino Effect, 4.4 The Search That Gave Up, 5.4 The Bad Update | Asked for new challenges. They are drawn from the "60 Days of System Design Questions" PDFs in docs/ (Days 32, 2, 20, 45 and 14) |
| 2026-10-02 | They teach five new patterns: Secrets manager, Eager loading, Circuit breaker, Search engine, Feature flags | Each fills a gap that the first 15 patterns do not cover |
| 2026-10-02 | Users gained were moved between incidents within the same stage | Keeps the total at exactly 1 billion. Each stage's total is unchanged, so Shop prices still follow the price rule |
| 2026-10-02 | 5.4 is played before 5.3 | 5.3 must stay the final incident. Ids are names, not places in the order. Renumbering would touch many files |
| 2026-10-02 | The bad option in 2.4 copies author names into every post | At Blip's size it leaves old names on years of posts. The workbook says this only pays off at very large scale |
| 2026-10-02 | All five new incidents get a Triage step. Only 3.4 and 5.4 get a Tune step | A dial teaches something real for timeouts (3.4) and rollout size (5.4). The other three have no natural dial |
| 2026-10-02 | New steps are numbered T6 to T10 and U4 to U5, after the old ones | Ids are names, not places in the order. Renumbering would touch many files |
| 2026-10-02 | PROGRESS.md was created before Milestone 1 | Asked for a change log now |

## Change log

| Date | Change |
|---|---|
| 2026-10-02 | Added incidents 1.4, 2.4, 3.4, 4.4 and 5.4, with five new patterns, icons and familiar tools. Rebalanced users gained in 1.2, 1.3, 2.2, 2.3, 3.2, 3.3, 4.2, 4.3 and 5.2. Play order is now 35 incidents |
| 2026-10-02 | Created PROGRESS.md |
| 2026-10-02 | Added Triage steps T6 to T10 for 1.4, 2.4, 3.4, 4.4 and 5.4. Added Tune steps U4 for 3.4 and U5 for 5.4 |

## On-screen text to check

None yet. All new text so far comes from the docs.
