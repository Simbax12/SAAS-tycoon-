# Game logic: the engine from start to finish

This file says how the game engine works: what it remembers, what the player can do, and the exact order things happen in. It is the plan for `game/reducer.ts` and `game/types.ts`.

It holds no rules or numbers of its own. Prices, payouts, penalties, texts and the play order live in the other docs. This file points to them like this: (see GAME_DESIGN.md > Money). The check script makes sure every pointer leads to a real heading.

Where the rules do not yet say what the engine should do, this file says "Open question" and gives a number, like Q3. The questions and the proposed answers are at the end. Until you answer one, build the proposed answer and list it in PROGRESS.md.

## How to read this file

- **State** is everything the engine remembers. It is saved after every change.
- **Derived** values are worked out from the state each time. They are never saved.
- **Actions** are the only way the state changes. Each one is a player tap or a timer.
- Every incident, email, option and item is looked up by its id in the data files. The engine never has a single incident written into it.

---

# Part 1: What the engine remembers

## The game state

| Field | What it holds | At the start |
|---|---|---|
| `saveVersion` | The version of the save format (see GAME_DESIGN.md > Saving) | The current version |
| `orderIndex` | Which row of the play order is the current incident (see GAME_DESIGN.md > Play order) | 0, which is 1.1 |
| `phase` | Where the current incident is. See "The life of one incident" | `waiting` |
| `run` | Everything about the current incident attempt. See the next table | A fresh run |
| `users` | Users earned for good. Outage dips are not taken off here | 0 |
| `cash` | Pounds in the bank. Never below 0 | £0 (Q1) |
| `loanOwed` | Pounds still owed to the investor | £0 |
| `topUps` | How many investor top-ups have happened | 0 |
| `owned` | Ids of Shop items bought | None |
| `emails` | Every email sent, in order, each with its id, sender, kind, text, button and read flag | None |
| `patterns` | Each learned pattern: where it was learned, its three pips, its "Also seen as" and "Built in" lines | None |
| `recycleBin` | Every wrong choice tried: the incident, the option, and the sentence that said why it failed | None |
| `results` | For each solved incident: final stars and whether it was solved first try (Q2) | None |
| `refreshersDue` | Patterns whose refresher email is waiting to be sent, and after which incident | None |
| `blueprints` | Each finished Build design, so it can be shown again | None |
| `tutorial` | The tutorial step, or "skipped" or "done" | Step 1 |
| `tipsSeen` | Which first-time tips have been shown | None |
| `settings` | Text size, motion, sound, wallpaper | Defaults |
| `won` | True once the final incident is solved | False |

Window positions and which windows are open are screen state, not game state. They are not saved. Closing a window never changes the game state.

## The run: one incident attempt

A fresh run is made each time a new incident becomes current.

| Field | What it holds |
|---|---|
| `stars` | Starts at 3. Never below 1 (see GAME_DESIGN.md > Stars) |
| `tried` | Options or cards the player picked that were wrong |
| `removed` | Options taken away by upgrades or by Hint 2 |
| `hintLevel` | 0, 1 or 2 |
| `handbookUsed` | Whether the free Hint 2 from the Engineering handbook was used |
| `testUsed` | Whether "Test first" was used, and on which option |
| `dip` | Users lost to an outage in this incident. Given back when it is solved |
| `failedDeploys` | Build only: how many deploys failed |
| `canvas` | Build only: parts placed, arrows drawn, and the part locked by Hint 1 |
| `triageTaps` | Triage only: lines tapped, in order |
| `tuneWaves` | Tune only: the stop set for each wave, and whether it was right |
| `paid` | Cash lost to penalties in this incident, for the Stats window |

## Derived values

| Value | How it is worked out |
|---|---|
| Current incident | The play order row at `orderIndex` |
| Current stage | The stage of the current incident. After the win, Stage 5 |
| Users on screen | `users` minus `dip`. The progress bar uses this number (see GAME_DESIGN.md > Progress bar) |
| Shop items on show | Items whose stage is at or below the current stage (see UPGRADES.md > Upgrades: the Shop) |
| Needed next | The current incident's "Needs" feature, if it is not owned |
| Can buy | On show, not owned, and `cash` is at least the price |
| Options still showing | The incident's options, minus `removed`, minus `tried` |

---

# Part 2: The life of one incident

## Phases

Every incident moves through these phases in this order. Some phases are skipped, as the table says.

| Phase | What is happening | Skipped when |
|---|---|---|
| `waiting` | The incident's "Needs" feature is not owned yet. Nothing has arrived | The incident needs nothing, or the feature is owned |
| `arrived` | The alert or email from "Arrives by" is showing. The Incident icon has a red badge | Never |
| `triage` | Terminal is open with the six log lines | The incident has no Triage step |
| `choosing` | The diagram, Maya's line and the options or cards are showing. In a Build, Blueprint is open | Never |
| `guided` | Only the right answer is left. Its Result sentence shows and the player taps to apply it | The player finds the answer before it comes to this |
| `tune` | SysDash is open with the dial and three waves | The incident has no Tune step |
| `solved` | Rewards are shown: users, cash, stars, the new pattern or pip | Never |

Then the player taps "Next", the after-solve steps run, and the next incident starts at `waiting`.

The flows these phases follow are in GAME_DESIGN.md (see GAME_DESIGN.md > New incident flow: teach before testing), (see GAME_DESIGN.md > Repeat incident flow: recall, not recognition) and (see GAME_DESIGN.md > Build incident flow: draw the design).

## When the run starts

When an incident becomes current:

1. Make a fresh run.
2. Remove options that owned upgrades take away. These are the "Removed by" lines (see CHALLENGES.md > How to read an incident). Only new incidents lose options this way. If an upgrade removed something, queue Maya's line from that item's effect text.
3. If the incident needs a feature that is not owned, stay in `waiting` and run the top-up check (see "Money" below). Otherwise move to `arrived`.

Upgrades bought after this point do not change this incident (Q3).

---

# Part 3: Player actions

| Action | Allowed when | What it changes |
|---|---|---|
| Investigate | Phase is `arrived` | Moves to `triage`, or to `choosing` if there is no Triage step. Marks the incident's email as read |
| Tap a log line | Phase is `triage` | Adds it to `triageTaps`. Cause: move to `choosing`. Symptom or routine: grey it out and show its message (see GAME_DESIGN.md > Triage, in Terminal) |
| Pick an option or card | Phase is `choosing`, and it is still showing | See "Picking" below |
| Test first | `srv-test` owned, not used yet in this run, and the option is still showing | Shows that option's result. Changes nothing else (Q4) |
| Hint | Phase is `choosing` and `hintLevel` is below 2 | See "Hints" below |
| Remind me | A repeat, phase is `choosing` | Nothing. The screen shows the card's "Use this when" line |
| Place, move or remove a part | A Build, phase is `choosing` | Changes `canvas`. The part locked by Hint 1 cannot be moved or removed |
| Draw or delete an arrow | A Build, phase is `choosing` | Changes `canvas` |
| Deploy and test | A Build, phase is `choosing` | See "Deploying" below |
| Apply the guided answer | Phase is `guided` | Moves to `tune`, or to `solved` if there is no Tune step |
| Set the dial and run a wave | Phase is `tune` | Records the wave. After the third wave, moves to `solved` |
| Next | Phase is `solved` and the game is not won | Runs the after-solve steps |
| Buy | The item can be bought | See "Money" below |
| Open an email | Any time | Marks it as read |
| Tutorial step, skip or replay | Any time | Changes `tutorial` |
| Change a setting | Any time | Changes `settings` |
| Reset game | After the confirm step | Replaces the whole state with a fresh one |

The Shop, Inbox, Pattern Book and every other window can be opened in any phase (Q3).

## Picking

**In a new incident**, by the option's type (see GAME_DESIGN.md > Option types in new incidents):

- **best:** show its Result. Move to `tune`, or to `solved`.
- **partial:** take 1 star. Take the partial cash penalty. Add the option to `tried` and to the Recycle Bin. Show the Result and the nudge.
- **bad:** take 1 star. Take the bad cash penalty and set `dip`, both changed by Monitoring and Standby server (see UPGRADES.md > Servers) (Q11). Add it to `tried` and to the Recycle Bin. Show the Result and the nudge.

**In a repeat**:

- **right card:** show its Result with the "Seen before" stamp. Move to `tune`, or to `solved`.
- **wrong card:** take 1 star. No cash is lost and there is no dip. Add it to `tried` and to the Recycle Bin. Show its "Why not" line and the nudge.

**After any wrong pick:** if only the right answer is still showing, move to `guided`. The first wrong pick also shows the nudge, which counts as Hint 1 (Q12).

## Hints

- **Hint 1:** shows the nudge. In a Build, it places the "Hint 1 places" part and locks it. Free. Sets `hintLevel` to 1.
- **Hint 2:** in a new incident, removes the bad option if it is still showing, otherwise the partial one. In a repeat, removes one wrong card (Q5). In a Build, removes every decoy. Costs 1 star, unless the Engineering handbook is owned and `handbookUsed` is false, in which case it is free and `handbookUsed` becomes true. Sets `hintLevel` to 2.
- If Hint 2 leaves only the right answer, move to `guided`.
- The 45-second offer (see GAME_DESIGN.md > Hints and help) only counts time while the Incident window is open and on top (Q13).

## Deploying

1. If the arrows on the canvas are exactly the Solution, the design is right. Parts with no arrows do not count (see GAME_DESIGN.md > When a design is right). Save the design in `blueprints` and move to `solved`.
2. Otherwise, go through the Build's wrong moves in the order they are written (see BLUEPRINTS.md > How to read a Build). Show the first one that applies.
3. If none applies, show the general failure.
4. A failed deploy takes 1 star, unless "Test first" was saved for this deploy. Add 1 to `failedDeploys`. Add the wrong move, if one applied, to the Recycle Bin (Q14). Show the nudge. The canvas stays as it is.
5. After the second failed deploy, draw the Solution and move to `guided`.

---

# Part 4: Money and users

## Cash coming in

When an incident is solved, work out its pay in this order (see GAME_DESIGN.md > Money):

1. Base cash for the stage, halved for a repeat.
2. Times the star multiplier for the run's final stars.
3. Plus the Triage bonus, if the cause was the first line tapped.
4. Plus the Tune bonus for each wave set right.
5. Times 1.1 if the Faster PC is owned.
6. Round once, to the nearest whole pound (Q8).

Triage and Tune bonuses are paid here, with the rest of the pay, not the moment they are earned (Q9).

All cash coming in pays the loan first: the smaller of the pay and `loanOwed` comes off `loanOwed`, and the rest goes into `cash`.

## Cash going out

- **Penalties:** taken from `cash`, rounded to whole pounds. `cash` stops at £0. Penalties never add to the loan.
- **Buying:** the price comes off `cash`. The item goes into `owned`. Its "Users gained" are added to `users` at once (see UPGRADES.md > Upgrades: the Shop). If it is the feature the current incident is waiting for, move that incident to `arrived`.

## The investor top-up

Run this check when an incident enters `waiting`, and again after every purchase while one is waiting (Q7):

- If the needed feature costs more than `cash`, add the difference to `loanOwed`, set `cash` to the price, add 1 to `topUps`, and show Maya's investor line (see GAME_DESIGN.md > The game must never get stuck).

## Users

- Solving an incident adds its "Users gained" to `users` and sets `dip` back to 0.
- An outage sets `dip` to a share of the users on screen at that moment (Q11).
- The player wins when the final incident in the play order is solved, not when a number is reached (see GAME_DESIGN.md > Users).

## Stars, pips and the first-try record

When an incident is solved:

1. Store the run's `stars` and whether it was solved first try (Q2) in `results`.
2. **New incident:** add its Pattern Book entry to `patterns`. If the pattern is an everyday pattern, fill pip 1 in gold (see GAME_DESIGN.md > Pips and mastery).
3. **Repeat:** fill the pattern's next pip, gold if solved first try, otherwise silver. Add its "Also seen as" line. If it was not solved first try, add the pattern to `refreshersDue` (see GAME_DESIGN.md > Refreshers).
4. **Build:** add a "Built in" line to each pattern in its "Practises" line.

---

# Part 5: Between incidents

## After the player taps Next

Run these in order. Each email shows its own balloon, one after another (Q10).

1. **Thank-you email**, if the incident came from a customer, Sam, Lena, Omar or Zoe (see GAME_DESIGN.md > Other emails (exact text)).
2. **Refresher emails** that are now due.
3. **Request emails** whose "Arrives" names the incident just solved (see UPGRADES.md > Request emails). Skip any for items already owned (Q6).
4. Add 1 to `orderIndex`.
5. **If the stage has changed:** Maya's stage opening email (see GAME_DESIGN.md > Stage opening emails (Maya)). Then request emails that arrive at the start of this stage. Then any other email for the start of this stage. Then the "New in the Shop" balloon.
6. **Start the next incident** (see "When the run starts").

## The start of the game

1. Make a fresh state.
2. Show the BlipOS loading bar (see UI_THEME.md > Desktop).
3. Send Maya's Stage 1 opening email.
4. Start incident 1.1. Its email arrives and the tutorial begins (see GAME_DESIGN.md > Tutorial).

## The end of the game

When the final incident is solved, set `won` to true and show the win screen instead of "Next" (see GAME_DESIGN.md > Win screen). Send Maya's win email. Everything on the win screen is worked out from `results`, `patterns`, `users`, `cash`, `loanOwed` and `topUps`.

"Play again" does the same as "Reset game".

## Saving

Save the whole state after every action (see GAME_DESIGN.md > Saving). On load, if the save's version is not the current one, start a fresh game.

---

# Open questions

Each has a proposed answer. When you decide, the answer moves to its home, usually GAME_DESIGN.md, and the question is removed from here.

| # | Question | Proposed answer |
|---|---|---|
| Q1 | How much cash does the player start with? No doc says | £0. The money check in the script already assumes this |
| Q2 | What counts as "solved first try", for gold pips, refreshers and the win screen? | No wrong pick and no failed deploy. Using hints or "Test first" does not spoil it |
| Q3 | Can the player shop during an incident? If they buy an upgrade that removes an option, does it change the open incident? | Yes, they can shop at any time. Upgrades only change incidents that start after the purchase |
| Q4 | What happens if "Test first" is used on the right answer? | It shows the Result with the words "This would work". The player still has to pick it. It is not a choice |
| Q5 | Which wrong card does Hint 2 remove in a repeat? | The first wrong card in REPEATS.md that is still showing, so the game is the same each time |
| Q6 | A request email asks for an item the player already bought. Send it? | No, skip it |
| Q7 | When is the investor top-up checked, and can it happen twice for one feature? | When the incident starts waiting, and after every purchase while it waits. Yes, it can happen again if the player spends the money on something else |
| Q8 | When is pay rounded? | Once, at the end, after the Faster PC bonus |
| Q9 | When are Triage and Tune bonuses paid? | With the rest of the pay when the incident is solved, so they also pay off the loan |
| Q10 | In what order do emails arrive after Next? | Thank-you, then refreshers, then request emails, then the stage opener and start-of-stage emails, then the next incident |
| Q11 | Standby server stops the dip from "the first bad choice in each incident". Every new incident has exactly one bad option, so with Standby a new incident never dips. Is that what you want? | Keep it. Standby then means "no outages ever", which is a clear reason to buy it. The dip is a share of the users on screen at that moment |
| Q12 | The first wrong pick shows the nudge by itself. Does that count as Hint 1, so the next tap on Hint gives Hint 2? | Yes |
| Q13 | Does the 45-second hint offer count while the player is in another window? | No. It only counts while the Incident window is open and on top |
| Q14 | Do failed deploys in a Build go in the Recycle Bin? | Yes, when a named wrong move caused it, with its "Says" sentence. General failures do not |
