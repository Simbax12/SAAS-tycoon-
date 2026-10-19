# Progress

What is built, and the new on-screen text waiting for a check. Keep this short and current.
What is next lives in `ai-context/next-steps.md`. Decisions and changes live in `.agents/changelogs/CHANGELOG.md`.
History before 2026-10-19: `python scripts/gate.py search "<words>"`.

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
- Milestone 7: Stages 3 to 5. Every incident is in the data files: 3.1 to 5.4, R3 to R10, and B3 to B5. The game plays from 0 to 1 billion users. The Standby server saves the first outage in each stage and Maya says her line. Analytics and Disaster drills remove their bad options. The Faster PC pays 10% more, makes the loading bar quicker and puts a lightning mark on the tray. The handbook's book now shows on the tray too. Items bought during an incident now wait for the next one, as GAME_DESIGN.md says. The System Map has its own layout for each stage, draws copies as stacks, and from 5.1 shows the world view with three regions above "Inside each region". BlipOS 3, 4 and 5 have their own looks and wallpapers. The win screen opens by itself after 5.3, and "Play again" asks first. The save is version 3, and version 2 saves carry over. 54 reducer tests pass, including a whole game and GAME_LOGIC.md Examples 3, 4, 5 and 7. Checked in Chromium at 1440, 1024 and 375 pixels wide: the Stage 3, 4 and 5 maps, the world view, a failing region, the Standby line, the last Tune wave of 5.3, the win screen and "Play again".
- After Milestone 7, eight changes asked for after playing it: a new computer to buy before each new stage (the Faster PC is gone, and old saves get its £6,000 back). The new room's walk-in and sit-down clips, then a BlipOS update screen and a milestone banner, when a stage starts. Apps never open by themselves: the game says which one to open and its icon pulses. Minimise and maximise on every window. Three zoom views: out, in and full screen. Tapping two joined parts again removes the arrow in Blueprint. Terminal is now a short typed lesson with one real command per Triage step, with word tiles on a phone. The Second monitor is a Stage 2 item and a real second screen. The save is version 4. 58 reducer tests pass. Checked in Chromium at 1440 and 375 pixels wide.

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

New after the first play on Vercel (2026-10-07), drafted by Claude:
- Terminal: "Find the line that caused this. Not just a symptom.", "What happened:", "Wrong taps cost nothing. Right first time: +£50 bonus.", "Triage bonus: +£50" and the button "Now pick a fix". The amount is the stage's Triage bonus.
- Maya, in the first Triage step: "Logs are the servers' diary. Every action writes a line." and "A symptom is what you notice. The cause is why it happened."
- Log levels, in the info box: "Normal news. Something worked as expected.", "Something looks odd. Not broken yet." and "Something failed and needs fixing."
- The info boxes reuse the toolbox's "What it is" lines.
- Screen reader labels, not shown on screen: "About" and the line's source and level, such as "About postgres, ERROR", or the part's name.
- Milestone 7 box names on the System Map: "Servers", "Load Balancer", "Session Store", "Queue", "Worker", "Fraud Check", "Primary", "Replicas", "Shards", "Feed Service", "Search", "Europe", "Americas", "Asia", "Edge Shield".
- Milestone 7 world view heading: "Inside each region".
- Milestone 7 win screen: the window title and button "You did it", and the rows "Users", "Stars", "Solved first try", "Patterns mastered", "Cash in the bank", "Investor top-ups", "Loan still owed". "Play again" asks "This clears all progress. Are you sure?" with "Yes, play again" and "Cancel".
- After Milestone 7: Maya's four new computer emails (approved), "New computer" and its four effect lines, "Buy the new computer in the Shop.", "Find in Shop", "Updating to BlipOS 2", "Please do not switch off your computer.", "Milestone reached", "Stage 2: First office" with the users, "Open Terminal from the desktop or the Start menu." (with each app's name, including "Open You did it from the desktop or the Start menu."), "Now open the Incident window." (tutorial step 4), "Open it from its icon or Start menu." (tip), "Type the command. Then tap the cause." (tip), "Now open the Incident window and pick a fix.", the 10 Terminal lessons in EXTRA_STEPS.md, "Tap the line that caused this.", "Run", "Delete", "Hint", "Hint:", the terminal's messages ("command not found", "No such file or directory", "That works, but the task asks for something else.", "Type the command in the task. Stuck? Tap Hint."), "Minimise", "Maximise", "Restore", "Close", "Move to other screen", "Full screen", "Second screen".
