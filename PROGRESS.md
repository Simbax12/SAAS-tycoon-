# Progress

What is built, what is next, and the decisions made. Keep this short and current.

## Done

- Game design docs in `docs/`, with CLAUDE.md as the hub.
- `scripts/check-docs.mjs` checks that the docs agree. It prints "0 problems".
- 35 incidents written: 20 new, 10 repeats, 5 Builds. Also 10 Triage steps, 5 Tune steps and 19 Shop items.
- docs/GAME_LOGIC.md: the engine plan, from the first email to the win screen, with six worked examples. It has 11 open questions waiting for answers.
- No game code yet.

## Next

- Answer the open questions at the end of docs/GAME_LOGIC.md.
- Milestone 1: Desktop. See the build order in docs/START_HERE.md.

## Decisions

| Date | Decision | Why |
|---|---|---|
| 2026-10-02 | Added five new incidents, one per stage: 1.4 The Key in the Code, 2.4 The Chatty Feed, 3.4 The Domino Effect, 4.4 The Search That Gave Up, 5.4 The Bad Update | Asked for new challenges. The topics come from the workbook "60 Days of System Design Questions" by Joud Awad (Days 32, 2, 20, 45 and 14). The game text is our own words |
| 2026-10-02 | They teach five new patterns: Secrets manager, Eager loading, Circuit breaker, Search engine, Feature flags | Each fills a gap that the first 15 patterns do not cover |
| 2026-10-02 | Users gained were moved between incidents within the same stage | Keeps the total at exactly 1 billion. Each stage's total is unchanged, so Shop prices still follow the price rule |
| 2026-10-02 | 5.4 is played before 5.3 | 5.3 must stay the final incident. Ids are names, not places in the order. Renumbering would touch many files |
| 2026-10-02 | The bad option in 2.4 copies author names into every post | At Blip's size it leaves old names on years of posts. The workbook says this only pays off at very large scale |
| 2026-10-02 | All five new incidents get a Triage step. Only 3.4 and 5.4 get a Tune step | A dial teaches something real for timeouts (3.4) and rollout size (5.4). The other three have no natural dial |
| 2026-10-02 | New steps are numbered T6 to T10 and U4 to U5, after the old ones | Ids are names, not places in the order. Renumbering would touch many files |
| 2026-10-02 | The engine plan is its own doc, GAME_LOGIC.md. It points to rules with (see FILE.md > Heading) and never copies them | Keeps one fact in one home. The check script now proves every pointer leads to a real heading |
| 2026-10-02 | Q7: the investor only lends at the moment the needed feature is bought | The loan can never be spent on optional items, so it cannot repeat without limit |
| 2026-10-02 | Q2: Hint 2 spoils "solved first try", even when the handbook makes it free | Gold pips and Mastered should mean the player recalled the pattern |
| 2026-10-02 | Q11: the Standby server saves one outage per stage, not every outage | Every new incident has one bad option, so the old wording removed outages for good |
| 2026-10-02 | Saves hold ids, never text or row numbers, and old saves are migrated, never wiped | New incidents, rule changes and typo fixes must not move or wipe a player |
| 2026-10-02 | Every customer has a fixed first name, listed in GAME_DESIGN.md | The cast table said to use a different name each time, but no list existed |
| 2026-10-02 | The two workbook PDFs were removed from docs/ and the author is credited here | The repo is public and the workbook is someone else's work. They are still in the git history |
| 2026-10-02 | PROGRESS.md was created before Milestone 1 | Asked for a change log now |

## Change log

| Date | Change |
|---|---|
| 2026-10-02 | Added incidents 1.4, 2.4, 3.4, 4.4 and 5.4, with five new patterns, icons and familiar tools. Rebalanced users gained in 1.2, 1.3, 2.2, 2.3, 3.2, 3.3, 4.2, 4.3 and 5.2. Play order is now 35 incidents |
| 2026-10-02 | Created PROGRESS.md |
| 2026-10-02 | Added Triage steps T6 to T10 for 1.4, 2.4, 3.4, 4.4 and 5.4. Added Tune steps U4 for 3.4 and U5 for 5.4 |
| 2026-10-02 | Added docs/GAME_LOGIC.md with 14 open questions. The check script now checks pointers between docs and question numbers. Hub and START_HERE.md updated |

## On-screen text to check

- The 14 customer first names in GAME_DESIGN.md > Customer names.
- "This would work", shown when Test first is used on the right answer (GAME_LOGIC.md, Q4).
| 2026-10-02 | Answered Q2, Q7 and Q11 in GAME_DESIGN.md and UPGRADES.md. GAME_LOGIC.md: saves use ids and migrations, a fixed shuffle, Test first in Builds, tips, reset keeps settings, a phase diagram and six worked examples. Added customer names and a check for them. Removed the workbook PDFs |
