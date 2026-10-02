# Progress

What is built, what is next, and the decisions made. Keep this short and current.

## Done

- Game design docs in `docs/`, with CLAUDE.md as the hub.
- `scripts/check-docs.mjs` checks that the docs agree. It prints "0 problems".
- 35 incidents written: 20 new, 10 repeats, 5 Builds. Also 10 Triage steps, 5 Tune steps and 19 Shop items.
- docs/GAME_LOGIC.md: the engine plan, from the first email to the win screen, with six worked examples. It has 11 open questions waiting for answers.
- docs/ROOM.md: the low-poly room around the computer, shown as video clips.
- Stage 1 and Stage 2 room clips and stills are in public/room/, each cut from one Wan 2.2 take. Their screen boxes are measured.
- No game code yet.

## Next

- Make the room clips for Stages 3 to 5 with Wan 2.2, following ROOM.md Part 3. Send each take to be cut and measured.
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
| 2026-10-02 | The game has a room around the computer: mostly 2D play, with short 3D clips for walking to the desk and sitting down | Gives the feel of sitting down to do a real job, like IT Specialist Simulator, without copying its design |
| 2026-10-02 | The room is video clips made with Wan 2.2, not live 3D | No 3D library is needed, the clips look better for less code, and phones cope easily |
| 2026-10-02 | The room frame shows on the computer layout only. On a phone the desktop fills the screen | Every pixel is needed at 375px wide |
| 2026-10-02 | One room per stage, from a garage to a glass tower. "Your setup" items appear on the desk | The room shows Blip growing, and spending feels real |
| 2026-10-02 | Milestone 1 uses a placeholder still. The real clips arrive in Milestone 8, or sooner if they are ready | The code does not have to wait for the video |
| 2026-10-02 | Each stage has two stills: a desk still to tap, and a seat still that holds the desktop | In the first real clip the monitor in the desk view was only 15% of the picture wide, far too small for the desktop |
| 2026-10-02 | Room clips can be made as one Wan 2.2 take and cut in two | The walk-in and sit-down clips then match perfectly |
| 2026-10-02 | The screen-size rule for seat stills is now a quarter of the picture's area, not 60% of its height | A wide monitor can hold more desktop with less height. Stage 2 covers 35% of the picture, Stage 1 28% |
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
- "Tap the screen to sit down", "Stand up" and "Skip" (ROOM.md).
| 2026-10-02 | Answered Q2, Q7 and Q11 in GAME_DESIGN.md and UPGRADES.md. GAME_LOGIC.md: saves use ids and migrations, a fixed shuffle, Test first in Builds, tips, reset keeps settings, a phase diagram and six worked examples. Added customer names and a check for them. Removed the workbook PDFs |
| 2026-10-02 | Added docs/ROOM.md and a check that its rooms and desk items match the stages and Shop. Updated UI_THEME.md, GAME_LOGIC.md, START_HERE.md and the hub |
| 2026-10-02 | Added the Stage 1 room clips and stills to public/room/. ROOM.md now has desk and seat stills, the one-take method, and the Stage 1 screen box |
| 2026-10-02 | Added the Stage 2 room clips and stills. Recorded its screen box. Changed the seat still size rule to area |
