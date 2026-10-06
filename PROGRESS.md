# Progress

What is built, what is next, and the decisions made. Keep this short and current.

## Done

- Game design docs in `docs/`, with CLAUDE.md as the hub.
- `scripts/check-docs.mjs` checks that the docs agree. It prints "0 problems".
- 35 incidents written: 20 new, 10 repeats, 5 Builds. Also 10 Triage steps, 5 Tune steps and 19 Shop items.
- docs/GAME_LOGIC.md: the engine plan, from the first email to the win screen, with seven worked examples. All open questions are answered.
- docs/ROOM.md: the low-poly room around the computer, shown as video clips.
- Room clips and stills for all five stages are in public/room/, each cut from one Wan 2.2 take. Every screen box and desk box is measured.
- Milestone 1: Desktop. A Next.js app with the wallpaper, 12 icons, the taskbar with Start menu, tabs and tray, and windows that open, close, drag and stack. The Stage 1 room plays the walk-in clip, waits for "Tap the screen to sit down", plays the sit-down clip, then the BlipOS loading bar. "Stand up" and "Skip" work. Reduced motion skips the clips. A zoom button in the tray makes the screen fill the window, with a thin strip of the monitor frame showing. Checked at 1440, 1024 and 375 pixels wide.
- Milestone 2: Engine and Stage 1. The four Stage 1 incidents are copied into `data/challenges.ts`, and the whole play order into `data/playOrder.ts`. The reducer in `game/` runs the new incident flow: alert or email, Investigate, Maya's line, three shuffled cards, penalties, outage dip, the guided answer, stars, users, cash, Next and thank-you emails. Inbox with sender badges, unread dots and balloons. Server alerts. The System Map. Settings has "Reset game". The game saves after every change and survives a refresh. 14 reducer tests pass with `npm test`.
- Milestone 3: Help. The 8-step tutorial runs inside 1.1 with a spotlight, and can be skipped or replayed from Settings. First-time tips show once each; the alert tip shows on 1.2. Calls to Dana: a "Call Dana" button with the next price, her phone window with every clue so far, "Not enough cash" and "No more calls". All calls in 1.1 are free. Victor's lifeline and the handbook's free call work in the engine, ready for the Shop. The Pattern Book shows each learned pattern with its icon, "Use this when" line, pips and "Tools you will meet". The Recycle Bin lists every wrong pick with why it failed. How to Play already had its exact text. 19 reducer tests pass. Checked in Chromium at 1440, 1024 and 375 pixels wide: two wrong picks lead to the guided answer.
- BlipOS 1: the desktop now has the grey 1995-style look in the garage. Windows, taskbar, Start menu and server alerts follow the version for the current stage, from `data/blipOs.ts`. The loading bar says "BlipOS 1".
- Milestone 4: Shop and money. The Shop has three tabs, cards with icons, price dots, "Needed next", "Not enough cash" and "Owned". Every Shop item is in `data/upgrades.ts`. Maya asks for the Test environment after 1.1 and Sam for Payments after 1.2, each with "Open in Shop". 1.3 waits until Payments is bought. The investor lends the shortfall for the feature Needed next, and Maya says so. Test first works in every incident. The Second monitor puts the Incident window and the Pattern Book side by side, or gives them tabs on a phone, and shows on the desk. Victor's lifeline can be bought and held, one at a time. The Stats window shows users, the bar to 1 billion, the stage, stars, top-ups and the loan. 28 reducer tests pass. Played in Chromium at 1440 and 375 pixels wide: buying Payments unlocks 1.3, and with too little cash the investor pays the rest.
- Milestone 5: Repeats and Stage 2. The four Stage 2 incidents are in `data/challenges.ts`, and R1 and R2 in the new `data/repeats.ts`. A repeat asks "Which pattern fixes this?" with three shuffled pattern cards, each with a free "Remind me". A wrong card costs a star, with no cash lost and no outage. The right card shows "Seen before", fills a pip, gold if solved first try, and adds its "Also seen as" line. A repeat not solved first try sends Maya's refresher after the next incident. Thank-you emails come from repeats too. Test first, calls and Victor work in repeats. When Stage 2 starts, the loading bar says "Upgrading to BlipOS 2", then the new emails rise one by one. The System Map grows with the Cache, the index tab, Storage, the CDN and the thick Server to Database arrow, and a repeat's pattern icon pulses once. Stage 2 Shop items work: the Bigger server removes the bigger-server option in 2.1 and Maya says why, Monitoring halves bad-choice penalties, and the Wallpaper pack adds sunset hill, night sky and snowy hill in Settings. Play stops after 2.4 with "Stage 3 is coming soon". 38 reducer tests pass. Played in Chromium at 1440, 1024 and 375 pixels wide: R1 with a wrong card, its refresher after 2.2, and the pips in the Pattern Book.
- Milestone 6: Work apps. B1 and B2 are in `data/blueprints.ts` with the whole toolbox, and every Triage and Tune step is in `data/extraSteps.ts`. Builds are no longer skipped. Blueprint: a tray of shuffled parts with "like" and a tool name, a canvas with the Goal on a sticky note, parts placed by dragging or by tapping the part then the canvas, arrows drawn by dragging one part onto another or tapping one then the other, "Remove", "Deploy and test", wrong moves with their "Says" sentence and a red "Stopped" mark, two failed deploys drawing the Solution, calls that place and lock parts and remove the decoys, Test first, Victor's lifeline, and "My designs". Terminal runs T1, T2, T6 and T7, with the Triage bonus, and shows past logs. SysDash runs a Tune step wave by wave with the Tune bonus, and shows users, cash and stage gauges otherwise. The Pattern Book's tools now come from the toolbox, and each entry gains "Built in" lines. The Recycle Bin shows a Build's wrong moves. The save is now version 2, and version 1 saves carry over. 46 reducer tests pass, including GAME_LOGIC.md Examples 2 and 6. Played in Chromium at 1440 and 375 pixels wide: T1 with a wrong tap, then B1 drawn with taps alone, one wrong deploy, then the right one at 2 stars.

## Next

- Play Milestone 6: `npm run dev`, then open http://localhost:3000. An old save that stopped after 2.4 carries on: tap Next and B2 arrives from Zoe. Use Settings > Reset game to play T1 on 1.2 and B1 after 1.4. Play stops after B2 with "Stage 3 is coming soon".
- No Tune step can be reached until Stage 3. SysDash's Tune flow was checked with a stand-in step that was then removed, and in the reducer tests.
- Check the new on-screen text listed at the end of this file.
- Milestone 7: Stages 3 to 5. See the build order in docs/START_HERE.md.
- Milestone 8: Monitoring's live numbers on every System Map box. No doc says which numbers yet, so that needs an answer first.
- With Stage 3: the Faster PC must only pay more in incidents that start after it is bought. The run does not yet remember that.

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
| 2026-10-03 | Stage 3 is a warehouse loft at golden hour, not a plain open-plan office | It looked better as a growing start-up, and still steps up from the small office |
| 2026-10-03 | Stage 3's sit-down clip has a 10% digital push-in at the end | The take's screen covered 24% of the picture, just under the quarter rule. A new take was not needed |
| 2026-10-03 | Stage 4 is an office above a data centre hall, not a glass office with a city view | It shows the stage's problem, data that is too big, and keeps Stage 5's city at night special |
| 2026-10-03 | The first Stage 4 take was rejected | It was photo-realistic, showed the real Windows XP wallpaper photo, had a lit sign with letters and an iMac-like monitor. The re-take used the loft still as a style picture |
| 2026-10-03 | Stage 5 keeps its curved monitor | Wan made it curved even when asked for flat. The curve is slight, so the screen box is the largest rectangle inside it |
| 2026-10-02 | PROGRESS.md was created before Milestone 1 | Asked for a change log now |
| 2026-10-03 | Q1, Q3, Q4, Q6, Q8, Q9, Q10 and Q14 answered as proposed. Each answer now lives in GAME_DESIGN.md or UPGRADES.md | Agreed with the proposals |
| 2026-10-03 | Hints are replaced by paid calls to Dana, an outside consultant | Free hints let players click through with no real cost. Paying makes them try first |
| 2026-10-03 | Call 1 costs 15% of the stage's base cash. Each later call costs 10% more | Help gets dearer the more is needed |
| 2026-10-03 | Each incident has as many calls as it has clues. Most have 2. Harder ones, where the options are close, have 3: 2.4, 3.4, 4.2, 4.3, 4.4 and 5.4 | Harder incidents may take some players more than two clues |
| 2026-10-03 | Calls never remove options. In a Build, call 1 places a part, call 2 removes the decoys, and each later call places one more part | The player still has to work out the answer |
| 2026-10-03 | Calls cost no star but spoil "solved first try", even when free | Not charged twice. Gold pips still mean the player recalled the pattern alone |
| 2026-10-03 | No automatic nudge after a wrong pick, and no 45-second offer | Help only comes when the player asks and pays. Two wrong picks still lead to the guided answer, so nobody gets stuck |
| 2026-10-03 | All calls are free in 1.1. The Engineering handbook makes the first call in each incident free | The tutorial must teach the button. Some players need several calls on hard incidents |
| 2026-10-03 | Victor's lifeline gives the answer once every call is used. It is pre-bought in the Shop for 2 x the stage's base cash, one held at a time, lost at the end of its stage. It spoils first try but keeps stars | It must never pay for itself. Dropping it at stage end stops buying cheap ones early for later stages |
| 2026-10-03 | Q5, Q12 and Q13 were dropped | Calls replaced the hints they asked about |
| 2026-10-03 | The Build field "Hint 1 places" is renamed "Call 1 places". The check script reads the new name and now checks lifeline prices | Hints no longer exist |
| 2026-10-03 | Each desk still now has a measured desk box in ROOM.md, and the check script checks every stage has one | The pulsing outline for "Tap the screen to sit down" needs to know where the monitor is |
| 2026-10-03 | The computer layout is used when the browser is at least 768 by 560 pixels. Anything smaller gets the phone layout | Below that the screen box is too small for 18px text |
| 2026-10-03 | Every clip and still of a stage is drawn in the same place, so they line up. The room fills the browser, but is shrunk if needed to keep the screen box clear of a 72px strip at the top and bottom | The stage name and "Stand up" must never cover the desktop |
| 2026-10-03 | The phone tray shows users and cash, not the clock | The phone layout rule lists only users and cash, and there is no room at 375px |
| 2026-10-03 | Until a window is built in its milestone, it shows its icon and its "Opens" line from UI_THEME.md. How to Play already shows its exact text | No new words were needed |
| 2026-10-03 | Arrow keys move a window when its title bar has focus | Every action should work with the keyboard alone |
| 2026-10-03 | Until saving arrives in Milestone 2, every visit counts as the first, so the walk-in clip always plays. The loading bar shows on the first sit-down of each visit | There is no save to say the player has been here before |
| 2026-10-03 | TypeScript is pinned to version 5 | Next.js 16 is not yet tested with TypeScript 7 |
| 2026-10-03 | The zoom button sits in the taskbar tray, and zoomed in, "Stand up" moves to the Start menu | Every 48px button outside the screen would cover the desktop when it fills the window. The tray is reachable in both views |
| 2026-10-03 | The zoom choice is kept in the browser, not in the game's save | It is a view preference for this device, like window positions, not progress |
| 2026-10-04 | Until the Shop is built, Payments is owned for free when 1.3 comes up, with its 50 users and no request email | Milestone 2 must play all four Stage 1 incidents, but the Shop arrives in Milestone 4. The switch is `SHOP_BUILT` in `game/built.ts` |
| 2026-10-04 | After 1.4, B1 is skipped and play stops: Next sends Lena's thank-you, then the Incident window says "Stage 2 is coming soon" | Stage 2 is not built yet. The save stays on 1.4, so once Stage 2 is added, Next carries on from there with the stage opener |
| 2026-10-04 | The Stage 1 System Map is Users, Server and Database in a row. Payments sits below Server once owned, Secrets above it once 1.4 is solved | The docs give each Map change but not where boxes sit. The layout lives in `data/systemMap.ts` |
| 2026-10-04 | The failing box is Server in 1.1 and 1.4, Database in 1.2 and Payments in 1.3. For now "Sees" is red traffic dots running to the failing box | The full "Sees" animations come in Milestone 8 |
| 2026-10-04 | A Map change is drawn as the pattern's icon on its box or arrow | UI_THEME.md says the same icon is used on the System Map |
| 2026-10-04 | An option's id is its type: best, partial or bad | Every new incident has exactly one of each, so saves stay valid if the wording changes |
| 2026-10-04 | Each email key is sent once | Tapping Next again at the end of Stage 1 must not send a second thank-you |
| 2026-10-04 | The save key is `zero-to-a-billion:save:v1`, and the version number goes up with each format change. Nothing is saved until Maya's first email arrives | A versioned key never overwrites an older save. A visit that ends before sitting down still counts as the first, so the walk-in plays next time |
| 2026-10-04 | The diagram keeps a 480px minimum width and scrolls sideways on a phone | Shrinking it to 375px would make its words smaller than 18px. To check again in Milestone 8 |
| 2026-10-04 | Settings has only "Reset game" for now. Calls to Dana, the tutorial and tips stay off until Milestone 3 | Reset is needed to test saving. The rest is Milestone 3 work |
| 2026-10-04 | An item bought during an incident only changes the incidents after it. Buying the Test environment or the Engineering handbook mid-incident marks its once-per-incident help as used for that incident | GAME_DESIGN.md > The Shop in brief says so. This needs no new field in the save. Written in GAME_LOGIC.md > Cash going out |
| 2026-10-04 | Windows behind the front one are no longer slightly see-through | With the Second monitor, the window behind is read side by side, and the Shop's text showed through it |
| 2026-10-04 | The diagram's chips beside Users show features only, not servers or "Your setup" items | UI_THEME.md says "Each feature bought". A second monitor is not part of Blip |
| 2026-10-04 | There is no "New in the Shop" balloon when the game starts, only when Stage 2 and later stages start | Tutorial step 8 already points at the Shop, and balloons stay hidden while the spotlight shows |
| 2026-10-04 | While an incident waits for its feature, the Incident window says "No incident right now." | Nothing has arrived yet (GAME_LOGIC.md > Phases). Sam's request email, its tip and the "Needed next" badge point to the Shop |
| 2026-10-04 | Reducer tests run with `npm test`: TypeScript compiles `game/` and `data/`, then Node's own test runner runs them | No extra library is needed |
| 2026-10-06 | Monitoring halves bad-choice penalties now. Its live numbers on every System Map box wait for Milestone 8 | UPGRADES.md says "live numbers" but no doc says which numbers. Agreed when Milestone 5 started |
| 2026-10-06 | The Stage 2 System Map: the Database moves right once 2.1 is solved, and the Cache sits below, between Server and Database. Storage sits top right, joined from Server. The CDN sits above Users, joined from Users. After 2.4 the Server to Database arrow is thick, with the basket icon on it | The docs give each Map change but not where boxes sit. Agreed when Milestone 5 started. The layout lives in `data/systemMap.ts` |
| 2026-10-06 | The failing box is Database in 2.1, 2.2 and 2.4, and Server in 2.3, R1 and R2. Badges on the same box sit side by side | The docs say what breaks but not which box glows red. Database already had the padlock from 1.2 when 2.2 adds its index tab |
| 2026-10-06 | A repeat card's id is its pattern's name | Every card is a different pattern, and pattern names are already used as ids across the docs |
| 2026-10-06 | When a new stage starts, the loading bar says "Upgrading to BlipOS 2" over the desktop, and the stage's balloons wait for it. The room clips for a new stage come with Milestone 8 | START_HERE.md lists those clips under Milestone 8. Without waiting, Maya's opener balloon would rise behind the loading bar |
| 2026-10-06 | A refresher shows in the Inbox list as the pattern's name, from Maya | GAME_DESIGN.md > Refreshers lists what the email shows but gives it no other words |
| 2026-10-06 | R10's refresher goes out at once. The list of such repeats is in `data/repeats.ts` | GAME_DESIGN.md > Refreshers says so. Keeping it in data means the engine never names an incident |
| 2026-10-06 | The wallpaper setting is "standard" for the BlipOS version's own wallpaper. A pack wallpaper only shows while the pack is owned | A reset keeps the settings but clears the Shop, so a pack wallpaper must not outlive the pack |
| 2026-10-06 | On a narrow card, "Remind me" drops below the pattern's name | At 375 pixels wide the button cut long names such as "Password hashing" short |
| 2026-10-06 | Milestone 6 includes T6 on 1.4 and T7 on 2.4, not only T1 and T2 | START_HERE.md names T1 and T2 because it was written before T6 to T10 were added. Both are on Stage 1 and 2 incidents, so leaving them out would change those incidents later |
| 2026-10-06 | Every Triage and Tune step is copied into `data/extraSteps.ts` now. A step only plays once its incident is in the data files | They are found by incident id, so Stages 3 to 5 need no change to this file |
| 2026-10-06 | The save is version 2. Each part on the Blueprint canvas keeps its place, as shares of the canvas's width and height. Version 1 saves are migrated | Where a part sits does not change the answer, but the player's layout must survive closing the window and a reload. Shares fit any screen size |
| 2026-10-06 | Dragging a part onto another part draws an arrow. Dropping it on empty canvas moves it. Tapping one part and then another also draws an arrow | UI_THEME.md lists dragging to join and to place, but not how to move a part. One drag does both, decided by where it ends |
| 2026-10-06 | Each arrow has a small round handle in its middle, above the parts, with a 48px tap area. Tapping it picks the arrow for "Remove" | Arrows between close parts were hidden under the cards and could not be tapped |
| 2026-10-06 | The tray shows only parts not yet on the canvas. A removed part goes back to the tray | GAME_DESIGN.md says parts left in the tray do not matter, so parts move out of it |
| 2026-10-06 | A part placed by a call, and the Solution when it is drawn, sit left to right in the order traffic flows | The docs say a call places a part but not where. This puts it where the answer needs it |
| 2026-10-06 | In a Build, Dana only says the Nudge. Her later calls place parts and remove the decoys without words | GAME_DESIGN.md > Calls in a Build gives her no other lines |
| 2026-10-06 | A failed deploy marks a wrong move's arrow or part red with "Stopped". The full "Sees" animations come in Milestone 8 | The same as for incidents, agreed in Milestone 2 |
| 2026-10-06 | With no wrong move, traffic stops at the first arrow drawn that is not in the Solution, or else at the part where the first missing Solution arrow should start | GAME_DESIGN.md says "the first missing or wrong arrow" but not how to pick it |
| 2026-10-06 | In Blueprint, "Test first" makes the next deploy a test and says "Next deploy is a test." with "Cancel" | A Build has no card to tap, so the player needs to know the next deploy is the one being tested |
| 2026-10-06 | "Investigate" opens Terminal when the incident has a Triage step, and Blueprint for a Build. SysDash opens by itself when a Tune step begins | GAME_DESIGN.md says each app "opens" at that step |
| 2026-10-06 | Blueprint opens in a larger window, up to 1000 by 700 pixels | The tray and the canvas need to sit side by side |
| 2026-10-06 | The SysDash cash gauge is full at 10 times the stage's base cash | UI_THEME.md asks for a gauge but gives no top. Tied to base cash, it means the same in every stage |
| 2026-10-06 | A log line's id is "cause", "symptom" or "routine1" to "routine4" in the order written. A wrong move's id is its trigger, such as "connects:Users>Database" | Saves hold ids, never text |

## Change log

| Date | Change |
|---|---|
| 2026-10-02 | Added incidents 1.4, 2.4, 3.4, 4.4 and 5.4, with five new patterns, icons and familiar tools. Rebalanced users gained in 1.2, 1.3, 2.2, 2.3, 3.2, 3.3, 4.2, 4.3 and 5.2. Play order is now 35 incidents |
| 2026-10-02 | Created PROGRESS.md |
| 2026-10-02 | Added Triage steps T6 to T10 for 1.4, 2.4, 3.4, 4.4 and 5.4. Added Tune steps U4 for 3.4 and U5 for 5.4 |
| 2026-10-02 | Added docs/GAME_LOGIC.md with 14 open questions. The check script now checks pointers between docs and question numbers. Hub and START_HERE.md updated |
| 2026-10-02 | Answered Q2, Q7 and Q11 in GAME_DESIGN.md and UPGRADES.md. GAME_LOGIC.md: saves use ids and migrations, a fixed shuffle, Test first in Builds, tips, reset keeps settings, a phase diagram and six worked examples. Added customer names and a check for them. Removed the workbook PDFs |
| 2026-10-02 | Added docs/ROOM.md and a check that its rooms and desk items match the stages and Shop. Updated UI_THEME.md, GAME_LOGIC.md, START_HERE.md and the hub |
| 2026-10-02 | Added the Stage 1 room clips and stills to public/room/. ROOM.md now has desk and seat stills, the one-take method, and the Stage 1 screen box |
| 2026-10-02 | Added the Stage 2 room clips and stills. Recorded its screen box. Changed the seat still size rule to area |
| 2026-10-03 | Added the Stage 3 room clips and stills, with a gentle push-in. Recorded its screen box. ROOM.md: the loft room row and the push-in method |
| 2026-10-03 | Added the Stage 4 room clips and stills. Recorded its screen box. ROOM.md: the data centre room row |
| 2026-10-03 | Added the Stage 5 room clips and stills. Recorded its screen box. All five rooms are done. ROOM.md: how to measure a curved screen. START_HERE.md: Milestone 1 uses the real Stage 1 room |
| 2026-10-03 | Answered all open questions in GAME_LOGIC.md. Replaced hints with paid calls to Dana and Victor's lifeline in GAME_DESIGN.md, GAME_LOGIC.md, UPGRADES.md, UI_THEME.md, BLUEPRINTS.md, START_HERE.md and the hub. Added Clue 2 and Clue 3 lines to CHALLENGES.md and REPEATS.md. Added Dana and Victor to the cast with sender badges |
| 2026-10-03 | Milestone 1 built: Next.js app, data/stages.ts, data/rooms.ts, data/desktopApps.ts, data/howToPlay.ts, components/desktop, components/windows and components/room. Added desk boxes to ROOM.md with a check for them. Hub: code map and commands |
| 2026-10-03 | Added the zoom button: ROOM.md and UI_THEME.md first, then `components/room/useZoom.ts`, `placePicture.ts`, `RoomFrame.tsx`, the tray and the Start menu |
| 2026-10-04 | Milestone 2 built: `data/challenges.ts` (Stage 1), `data/playOrder.ts`, `data/emails.ts`, `data/people.ts`, `data/patterns.ts`, `data/systemMap.ts`, `data/upgrades.ts` (must-have features), `game/`, `components/useGame.ts`, the Inbox, Incident, System Map and Settings windows, server alerts and balloons. Hub: code map and `npm test` |
| 2026-10-04 | `components/useGame.ts`: the game still plays, without saving, when the browser blocks storage. A private test build was published as a claude.ai page for playing on a phone |
| 2026-10-04 | In the tutorial, step 5 shows the cards with a Next button, and they cannot be tapped until step 6 has taught "Call Dana" | In the docs' order, a right first pick would solve 1.1 and skip the step that teaches the call. The decisions above say the tutorial must teach the button |
| 2026-10-04 | Every tutorial bubble has "Next" and "Skip tutorial", and steps 1 to 3 and 6 also move on when the player taps the lit-up thing | If the thing to tap is hidden, for example behind a full-screen window on a phone, the player can still move on and never gets stuck |
| 2026-10-04 | The tutorial catches up when the player goes ahead on their own, for example by opening the Incident window from its icon | The spotlight must never point at a step the player has already done |
| 2026-10-04 | "Replay tutorial" in Settings is a walk-through of the 8 steps with Next only. It changes nothing in the game | 1.1 is already solved, so its steps cannot be played again for real |
| 2026-10-04 | A save from Milestone 2 that is past 1.1 gets no tutorial | The tutorial runs inside 1.1 only |
| 2026-10-04 | A tip goes away when the player taps "OK" or does what it says, and is then never shown again | GAME_LOGIC.md: each tip once. Tapping Investigate on the alert is the tip's own advice |
| 2026-10-04 | Dana's phone window is a box inside the Incident window, above the "Call Dana" button, and each new clue scrolls into view | It keeps the clues next to the cards they are about, and works the same on a phone |
| 2026-10-04 | Which Shop item gives a free first call lives in `data/upgrades.ts` as `itemEffects` | Game logic must never name an upgrade. The handbook and Victor's lifeline can only be bought from Milestone 4 |
| 2026-10-04 | Settings has "Replay tutorial" and "Reset game". Text size, motion, sound and wallpaper are still to come | They are not in Milestone 3's list in START_HERE.md |
| 2026-10-04 | The Pattern Book's "Also seen as" and "Built in" lines are left out for now | They come from repeats and Builds, which arrive in Milestones 5 and 6 |
| 2026-10-04 | Milestone 3 built: `data/tutorial.ts`, call prices in `data/stages.ts`, `itemEffects` in `data/upgrades.ts`, tools and everyday patterns in `data/patterns.ts`, Victor's line in `data/people.ts`. Calls, the lifeline, the tutorial and tips in `game/`. `components/desktop/Guide.tsx`, `scrollWithin.ts`, the Pattern Book and Recycle Bin windows, calls in the Incident window, "Replay tutorial" in Settings. Hub: code map |
| 2026-10-04 | BlipOS upgrades with each stage: five versions, inspired by desktops of 1995, 1998, the early 2000s, 2009 and today | The computer feels old in the garage and new at planet scale, matching the rooms |
| 2026-10-04 | They are called BlipOS 1 to BlipOS 5 | Plainly our own names. UI_THEME.md bans real product names |
| 2026-10-04 | BlipOS 1 is built now. The others are built when their stage is. Their colours already drive the desktop, but the glassy 2009 look and the flat look with a centred taskbar are drawn in the early 2000s style until then | Only Stage 1 can be played yet |
| 2026-10-04 | The 1995-style grey window body is #E0DDD6, a little lighter than the era's grey | The check script found the green OK and amber Warning marks fell below 3 to 1 on the darker grey |
| 2026-10-04 | BlipOS 1's desktop is plain teal, not the hill. The hill wallpaper arrives with BlipOS 2 | A plain colour is the 1995 feel. The garage clip still shows the hill on the monitor before the player sits down |
| 2026-10-04 | Server alerts keep a red title bar in every version | An alert must always look like an alert |
| 2026-10-04 | The classic close button is a 40px raised square inside a 48px tap area | It looks like the era but keeps the 48px tap target rule |
| 2026-10-04 | BlipOS versions: UI_THEME.md, GAME_LOGIC.md, START_HERE.md and the hub, with a contrast check for every version. Code: `data/blipOs.ts`, version styles in `app/globals.css`, and the window frame, taskbar, Start menu, server alert, wallpaper and loading bar now follow the version |
| 2026-10-04 | In BlipOS 1 and 2, pop-ups and hint boxes are classic dialog boxes: the tutorial and tip boxes, server alerts, Dana's phone window and email balloons | Keeps the 1995 feel everywhere, not just in windows. Buttons inside windows, such as the option cards and "Call Dana", keep their current look |
| 2026-10-04 | `next.config.ts` sets `agentRules: false` | Next.js 16's `npm run dev` adds its own rules block to CLAUDE.md. That would clutter the hub, and its em dash fails the docs check |
| 2026-10-04 | Pop-ups follow the version: UI_THEME.md first, then dialog, button and note styles in `app/globals.css`, and the tutorial and tip box, balloons, server alert and Dana's box |
| 2026-10-04 | Saved unfinished Milestone 4 work left uncommitted by an earlier session: the Shop and Stats windows, desk items, Shop icons and engine changes. It builds and its 27 tests pass, but it has not been reviewed or played. Milestone 4 is not finished |
| 2026-10-04 | Milestone 4 finished: reviewed and played. GAME_LOGIC.md > Cash going out: an item bought mid-incident waits for the next incident. `game/reducer.ts` and a new test. The Test result scrolls into view. Diagram chips show features only. Windows behind are opaque. Hub: code map |
| 2026-10-04 | `next.config.ts`: turned off the Next.js agent rules block, which `npm run dev` was adding to CLAUDE.md |
| 2026-10-05 | Merged the Milestone 1 to 4 code from `claude/create-challenges-from-docs-mcwcdz` into main. Main had only the doc commits, so new sessions found no code |
| 2026-10-05 | Fixed the flickering tutorial box on "Red means something is breaking.". The red traffic dots in `components/windows/Diagram.tsx` no longer catch the pointer, so the spotlight stops thinking the failing box is hidden each time a dot passes its centre |
| 2026-10-06 | Milestone 6 built: `data/blueprints.ts` (toolbox, B1, B2), `data/extraSteps.ts` (all Triage and Tune steps), `game/blueprint.ts`, the Triage, Tune, canvas and deploy actions in `game/reducer.ts`, save version 2 with a migration in `game/save.ts`, "Built in" lines in `game/patternBook.ts`, and the Blueprint, Terminal and SysDash windows. `data/patterns.ts` now works out tool names from the toolbox. `game/built.ts` is removed. Hub: code map |
| 2026-10-06 | Milestone 5 built: Stage 2 in `data/challenges.ts`, `data/repeats.ts` (R1, R2), `data/incidents.ts`, `game/patternBook.ts`, the Stage 2 System Map, repeat cards with "Remind me", pips, "Also seen as", refreshers, the BlipOS 2 upgrade bar, the Bigger server, Monitoring and Wallpaper pack effects, and Stage 2 pattern and box icons. Hub: code map |

## On-screen text to check

- Screen reader labels added in Milestone 1, not shown on screen: "Close" and the window name, "Users:", "Cash:" and "Time:" with their numbers.

- The 14 customer first names in GAME_DESIGN.md > Customer names.
- "This would work", shown when Test first is used on the right answer (UPGRADES.md > Rules when effects combine).
- "Tap the screen to sit down", "Stand up" and "Skip" (ROOM.md).
- "Zoom in" and "Zoom out": the tray zoom button's label, shown when the pointer rests on it and read by screen readers.
- All 36 new clues: the Clue 2 and Clue 3 lines in CHALLENGES.md and REPEATS.md. They were drafted by Claude.
- Dana's and Victor's cast lines in GAME_DESIGN.md: "An outside systems consultant. Charges by the call" and "A contract engineer. Expensive, blunt, always right".
- Tutorial step 6: "Stuck? Call Dana. Today it is free."
- How to Play line 5: "Wrong fix: try again. Stuck? Call Dana, but calls cost cash."
- Buttons and labels: "Call Dana", "Free call", "No more calls", "Use Victor's lifeline", "Held".
- Victor's line: "This one. You owe me."

New in Milestone 2:

- Balloon: "New email from" and the sender's name.
- Incident window: "No incident right now.", "Try again." after a wrong fix's Result, "Tried" on a greyed card, "Outage: 20 users lost until fixed.", "Apply this fix", "Pattern learned:" and the pattern name, "+200 users", "+£750", "Next".
- End of Stage 1: "Stage 2 is coming soon. Thanks for playing!"
- Inbox: "Back".
- Settings: "Reset game", "This clears all progress. Are you sure?", "Yes, reset", "Cancel".
- Screen reader labels, not shown on screen: "Maya:", "2 of 3 stars", "Incident, waiting", "Inbox, 2 unread", "unread" on an email, "System Map" on the diagram.

New in Milestone 3:

- Tutorial and tip buttons: "Next", "Skip tutorial", "OK".
- Settings: "Replay tutorial".
- Pattern Book when empty: "No patterns yet. Fix an incident to learn one."
- Recycle Bin when empty: "The Recycle Bin is empty."
- Dana's phone window title: "Dana".
- Screen reader labels, not shown on screen: "Call with Dana", "Victor:", and "Pips:" with each pip's colour.

New with BlipOS versions:

- Dialog titles in BlipOS 1 and 2: "Tutorial" and "Tip".
- Loading bar: "BlipOS 1", and from Stage 2 "Upgrading to BlipOS 2" and so on (UI_THEME.md > The upgrade).

New in Milestone 4:

- Shop: the tab names "Features", "Servers" and "Your setup", "Buy", "Needed next", "Not enough cash", "Owned", "Held", "No new users", "+50 users", "Unlocks: The Double Charge", and the words beside the dots: "Change" and "Users".
- Inbox: "Open in Shop". Balloon: "New in the Shop".
- Incident window: "Test first", "Tap a fix to test it.", "Cancel", "Test" and "This would work".
- Stats: "Users: 500", "Stage 1: Garage", "6 of 6 stars", "Investor top-ups: 1", "Loan owed: £100", and the bar's labels "1K", "100K", "10M", "100M" and "1B".
- Screen reader labels, not shown on screen: "Users, out of 1 billion" on the bar, and each desk item's name.

New in Milestone 5:

- Incident window, repeats: "Which pattern fixes this?", "Remind me", "Seen before" and the heading "Also seen as". All from the docs.
- Loading bar: "Upgrading to BlipOS 2". From the docs.
- Settings: the heading "Wallpaper" and the choice "Standard", for the BlipOS version's own wallpaper. New words. The other three, "Sunset hill", "Night sky" and "Snowy hill", come from UI_THEME.md.
- Pattern Book: the heading "Also seen as".
- Play stops after 2.4 with "Stage 3 is coming soon. Thanks for playing!", the same words as at the end of Stage 1 before.

New in Milestone 6:

- Blueprint: "Remove", "Deploy and test", "Stopped", "like" before a tool name and the heading "Built in", from the docs. "Test first", "Cancel", "Test", "This would work" and "Back" as before.
- Blueprint, new words: "Next deploy is a test." while Test first is waiting, and "No designs yet." when no Build is finished.
- Terminal, new words: "No logs yet." before the first Triage step is solved.
- SysDash: "Wave 1 of 3", "Run wave", "Too low", "Just right" and "Too high", from the docs. Minus and plus buttons beside the dial. The idle gauges' labels "Users", "Cash" and "Stage", with the stage shown as "2: First office".
- Buttons that open a work app show its icon and name: "Terminal", "SysDash", "Blueprint" and "Incident".
- Screen reader labels, not shown on screen: "Canvas", "Tray", and each arrow as its two parts, such as "Users → Database".
