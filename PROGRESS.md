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

## Next

- Play Milestone 3: `npm install`, then `npm run dev`, then open http://localhost:3000. Use Settings > Reset game to see the tutorial from the start, then Settings > Replay tutorial.
- Check the new on-screen text listed at the end of this file.
- Milestone 4: Shop and money. See the build order in docs/START_HERE.md.

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
| 2026-10-04 | Reducer tests run with `npm test`: TypeScript compiles `game/` and `data/`, then Node's own test runner runs them | No extra library is needed |

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
| 2026-10-04 | Pop-ups follow the version: UI_THEME.md first, then dialog, button and note styles in `app/globals.css`, and the tutorial and tip box, balloons, server alert and Dana's box |

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
