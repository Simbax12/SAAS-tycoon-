# Game design: the rules

## Story

It is day one. The player is the first engineer at Blip, working from a garage with one old PC and one server.

Work arrives the way it does in a real job. The servers raise alerts. The boss, the team and customers send emails. Maya, a senior engineer, helps the player make sense of it.

## Who the player hears from

| Who | Role | What they send |
|---|---|---|
| Maya | Senior engineer and the player's guide. Friendly, brief, never talks down | Stage openers, explanations, refreshers |
| Sam | The boss (CEO) | Asks for big features. Passes on problems he has heard about |
| Lena | Head of Finance | Problems with money and staff. Asks for safer servers |
| Omar | Head of Support | Problems his team sees. Asks for better tools |
| Zoe | Head of Growth | Sign-up problems. Asks for features that help Blip grow |
| Customers | People who use Blip | Complaints and wishes. Each one has their own first name, from the list below |
| The servers | BlipOS itself | Alerts, when a machine notices trouble before a person does |
| Dana | An outside systems consultant. Charges by the call | Clues, when the player calls her during an incident |
| Victor | A contract engineer. Expensive, blunt, always right | The answer, when the player uses his lifeline |

### Customer names

Every email from a customer shows a first name. Each name is used once. The thank-you email after an incident comes from the same customer.

| Sent by | Name |
|---|---|
| 1.3 | Priya |
| feat-darkmode | Tom |
| 2.2 | Ana |
| feat-photos | Kofi |
| R2 | Mei |
| 3.2 | Jack |
| feat-groups | Sara |
| R4 | Leo |
| R6 | Aisha |
| feat-voice | Ben |
| 4.4 | Rosa |
| 5.1 | Chloe |
| feat-translate | Yuki |
| R10 | Femi |

## Stages

| Stage | Name | Users without optional features | What breaks at this size | Base cash |
|---|---|---|---|---|
| 1 | Garage | 0 to 1,000 | Basic mistakes on one server | £500 |
| 2 | First office | 1,000 to 100,000 | The database struggles | £2,000 |
| 3 | Scale-up | 100,000 to 10 million | One server is not enough | £10,000 |
| 4 | Big tech | 10 million to 100 million | The data is too big | £50,000 |
| 5 | Planet scale | 100 million to 1 billion | Distance, disasters and attacks | £250,000 |

A new stage starts when the last incident of the stage before it is solved.

### Stage opening emails (Maya)

| Stage | Message |
|---|---|
| 1 | "Welcome to Blip. One server, zero users. Let's get our first thousand." |
| 2 | "We have an office now. And a database that is starting to sweat." |
| 3 | "One server cannot carry us any further. Time to think in plurals." |
| 4 | "We are big now. So is our data. Too big." |
| 5 | "Next stop: the whole planet. Things break differently at this size." |
| Win | "One billion users. You built this. Open your System Map and take a look." |

## Three kinds of incident

| Kind | How many | What it is | Where it is written |
|---|---|---|---|
| New | 20 | Teaches a pattern for the first time. The player picks from three options | CHALLENGES.md |
| Repeat | 10 | An everyday problem comes back in a new disguise. The player must recall the pattern | REPEATS.md |
| Build | 5 | The player draws the design in the Blueprint app by joining parts with arrows. Each stage has one | BLUEPRINTS.md |

Some incidents also have an extra step that uses one of the other work apps.

| Step | How many | What it is | Where it is written |
|---|---|---|---|
| Triage | 10 | Before the fix. The player finds the log line that shows the real cause, in Terminal | EXTRA_STEPS.md |
| Tune | 5 | After the fix. The player sets a dial for three waves of traffic, in SysDash | EXTRA_STEPS.md |

## Play order

There are 35 incidents. They are always played in this order. Only one incident is open at a time. An id is a name, not a place in the order: 5.4 is played before 5.3, because 5.3 is always the final incident.

| Order | Stage | Id | Title | Kind | Needs |
|---|---|---|---|---|---|
| 1 | 1 | 1.1 | The Open Door | New |  |
| 2 | 1 | 1.2 | The Leaked Passwords | New |  |
| 3 | 1 | 1.3 | The Double Charge | New | feat-payments |
| 4 | 1 | 1.4 | The Key in the Code | New |  |
| 5 | 1 | B1 | The First Blueprint | Build |  |
| 6 | 2 | 2.1 | The Melting Database | New |  |
| 7 | 2 | R1 | The Refund Button | Repeat |  |
| 8 | 2 | 2.2 | The Slow Lookup | New |  |
| 9 | 2 | R2 | The Triple Message | Repeat |  |
| 10 | 2 | 2.3 | The Heavy Photos | New | feat-photos |
| 11 | 2 | 2.4 | The Chatty Feed | New |  |
| 12 | 2 | B2 | The Fast Front Page | Build |  |
| 13 | 3 | 3.1 | The Lonely Server | New |  |
| 14 | 3 | R3 | The Profile Stampede | Repeat |  |
| 15 | 3 | 3.2 | The Vanishing Login | New |  |
| 16 | 3 | R4 | The Slow Inbox | Repeat |  |
| 17 | 3 | 3.3 | The Frozen Sign-up | New | feat-email |
| 18 | 3 | 3.4 | The Domino Effect | New |  |
| 19 | 3 | B3 | The Secure Door | Build |  |
| 20 | 4 | R5 | The Contractor Keys | Repeat |  |
| 21 | 4 | 4.1 | The Read Flood | New |  |
| 22 | 4 | R6 | The Stuck Upload | Repeat |  |
| 23 | 4 | 4.2 | The Table That Got Too Big | New |  |
| 24 | 4 | R7 | The Trending Crush | Repeat |  |
| 25 | 4 | 4.3 | The Celebrity Post | New | feat-verified |
| 26 | 4 | 4.4 | The Search That Gave Up | New |  |
| 27 | 4 | B4 | The Viral Like Button | Build |  |
| 28 | 5 | R8 | The Twice-Run Job | Repeat |  |
| 29 | 5 | 5.1 | The Slow Side of the World | New | feat-global |
| 30 | 5 | R9 | The Support Search | Repeat |  |
| 31 | 5 | 5.2 | The Blackout | New |  |
| 32 | 5 | 5.4 | The Bad Update | New |  |
| 33 | 5 | R10 | The Export That Never Finishes | Repeat |  |
| 34 | 5 | B5 | The Edge Delivery | Build |  |
| 35 | 5 | 5.3 | The Flood Attack | New |  |

## The game loop

1. Something arrives: a server alert or an email.
2. The player opens the incident and watches what is breaking.
3. The player picks a fix, or draws one in Blueprint.
4. Right fix: users grow, cash is paid, a pattern is learned or strengthened.
5. People email asking for features and upgrades. The player spends cash in the Shop.
6. Repeat until 1 billion users.

## How things arrive

### Server alerts

A server alert pops up on the desktop by itself, like an old error box. It shows the alert text and an "Investigate" button. The failing box on the System Map turns red at the same moment.

Alerts are for trouble a machine notices first: load, crashes, full disks, attacks.

### Emails

An email lands in the Inbox. A balloon rises from the taskbar: "New email from Sam". There are four kinds.

| Kind | What it is | Button |
|---|---|---|
| Incident email | Someone describes a problem | "Investigate" opens the incident |
| Request email | Someone asks for a feature or upgrade | "Open in Shop" opens the Shop at that item |
| Maya email | Stage openers and refreshers | None |
| Thank-you email | A short reply after their problem is fixed | None |

Each incident says how it arrives, with the exact text, in its "Arrives by" line. Request emails and when they arrive are listed in UPGRADES.md.

### The order emails arrive in

After the player taps "Next", emails arrive one after another, each with its own balloon, in this order:

1. The thank-you email, if the incident came from a person.
2. Refreshers that are due.
3. Request emails that arrive after this incident.
4. If a new stage starts: Maya's stage opening email, then request emails for the start of the stage, then any other start-of-stage email.
5. The next incident.

### Other emails (exact text)

| When | From | Text |
|---|---|---|
| Start of Stage 4 | Sam | "The board wants a worldwide launch next. It will cost a lot. Start saving now." |
| After solving an incident that came from a customer | That customer | "It works now. Thank you!" |
| After solving an incident that came from Sam | Sam | "Good work. The numbers already look better." |
| After solving an incident that came from Lena, Omar or Zoe | That person | "That fixed it. My team says thanks." |

## New incident flow: teach before testing

Never assume the player knows a technical term. Every new incident follows these steps.

1. **Arrive.** The alert or email from the incident's "Arrives by" line appears. The player taps "Investigate".
2. **Show.** The Incident window opens. The diagram plays the incident's "Sees" animation from CHALLENGES.md. The failing part glows red.
3. **Explain.** Maya's one-sentence explanation appears in a speech bubble.
4. **Choose.** Three option cards appear in a shuffled order. Each card shows the plain description in large text and the industry label in small text beneath.
5. **Result.** The diagram animates the outcome and the Result sentence appears.
   - Best choice: go to step 6.
   - Partial or bad choice: the card greys out and a copy goes to the Recycle Bin. Penalties apply. The player chooses again.
6. **Learn.** The Pattern Book gains a new entry. The System Map gains its new part. Users count up. Cash is paid. Stars are shown.
7. **Next.** A "Next" button returns to the desktop. Any thank-you or request emails arrive, then the next incident.

If the incident has a Triage step, it runs between steps 1 and 2. If it has a Tune step, it runs between steps 5 and 6. See "Extra steps" below.

### Option types in new incidents

Every new incident has exactly three options.

| Type | Meaning | What happens |
|---|---|---|
| best | The real industry pattern | Incident solved |
| partial | What a newer developer would try. Helps a bit or costs too much | Lose 20% of the incident's base cash. No users lost. Try again |
| bad | Makes something worse | Outage: users dip 10% until the incident is solved. Lose 10% of base cash. Try again |

Cash can never go below £0.

## Repeat incident flow: recall, not recognition

Repetition is what makes the patterns stick. A repeat does not explain the problem again. The player has to spot which pattern they already know fits.

1. **Arrive.** The alert or email from the repeat's "Arrives by" line appears. The player taps "Investigate".
2. **Show.** The diagram plays the "Sees" animation from REPEATS.md.
3. **Recall.** Maya does not explain. The window asks: "Which pattern fixes this?" Three pattern cards appear in a shuffled order. Each card shows the pattern's icon and name only.
4. **Remind me.** Each card has a small "Remind me" button. It shows that pattern's "Use this when" line from the Pattern Book. It is free.
5. **Result.**
   - Right card: the Result sentence appears with a "Seen before" stamp. Go to step 6.
   - Wrong card: its "Why not" sentence appears. The card greys out and a copy goes to the Recycle Bin. The player loses 1 star. No cash is lost and there is no outage. The player chooses again.
6. **Strengthen.** The pattern's next pip fills in the Pattern Book. Its "Also seen as" line is added to the entry. Users count up. Cash is paid. Stars are shown.

If the repeat has a Tune step, it runs between steps 5 and 6.

### Pips and mastery

Each of the five everyday patterns has three pips in the Pattern Book.

- Pip 1 fills when the pattern is first learned. It is always gold.
- Pips 2 and 3 fill when its two repeats are solved.
- A repeat solved first try gives a gold pip. Otherwise the pip is silver.
- Three gold pips earn a "Mastered" badge.

The other fifteen patterns have no pips.

### Refreshers

If a repeat took more than one try, Maya sends a refresher email after the next incident is solved. For R10, send it straight away.

A refresher shows the pattern's icon, its name, its "Use this when" line and its "Also seen as" lines. There is no test and no reward.

## Build incident flow: draw the design

A Build asks the player to put patterns together, the way a real design is drawn on a whiteboard. Every part in a Build is something the player has already met.

1. **Arrive.** The alert or email from the Build's "Arrives by" line appears. The player taps "Investigate".
2. **Brief.** Maya says: "We need a new design for this. Open Blueprint." The Blueprint app opens. The Build's Goal is on a sticky note.
3. **Build.** The tray on the left holds the Build's parts and decoys, shuffled. The player puts parts on the canvas and joins them with arrows to show which way traffic flows.
4. **Deploy.** The player taps "Deploy and test". Dots of traffic travel along the arrows.
5. **Result.**
   - The design is right: traffic flows smoothly and the Result sentence appears. Go to step 6.
   - A wrong move from the Build's list applies: its "Sees" animation plays and its "Says" sentence appears. The player loses 1 star. A copy of the "Says" sentence goes to the Recycle Bin.
   - Anything else is wrong: traffic stops at the first missing or wrong arrow and flashes red, with the words "Something is missing or in the wrong place." The player loses 1 star. Nothing goes to the Recycle Bin.
   - After a failed deploy the canvas stays as it was, so the player can fix it and deploy again. No cash is lost and there is no outage.
6. **Strengthen.** Each pattern in the Build's "Practises" line gains a "Built in" line in the Pattern Book. The finished design is saved in Blueprint so the player can look at it again. Users count up. Cash is paid. Stars are shown.

### When a design is right

A design is right when its arrows are exactly the Build's Solution. Where parts sit on the canvas does not matter. Parts left in the tray do not matter.

### Calls in a Build

- Call 1 puts the Build's "Call 1 places" part on the canvas and locks it there. Dana says the Build's Nudge.
- Call 2 removes every decoy from the tray and the canvas.
- Each call after that places and locks one more part from the Tray, in the order the Tray lists them, skipping parts already locked. The last call is the one that places the last part.
- Calls in a Build cost the same as anywhere else (see "Consultant calls").
- After two failed deploys, Blueprint draws the Solution. Maya shows the Result sentence and the player taps "Deploy and test".

## Extra steps: Triage and Tune

Extra steps add variety and teach two real skills: reading logs and tuning a live system. They never cost stars, cash or users. They can only add a bonus.

There is no timer in either step. Nothing scrolls or moves until the player acts.

### Triage, in Terminal

1. After the player taps "Investigate", Terminal opens with the step's six log lines in a shuffled order.
   - Above the lines: "Find the line that caused this. Not just a symptom."
   - Under it: "What happened:" and the incident's "Arrives by" text.
   - Then: "Wrong taps cost nothing. Right first time: +£50 bonus.", with the Triage bonus for the stage.
   - In the first Triage step of the play order, Maya speaks first, in two bubbles: "Logs are the servers' diary. Every action writes a line." and "A symptom is what you notice. The cause is why it happened."
2. The player taps the line that shows the real cause.
   - The cause: the "Why" sentence appears. If it was the first tap, "Triage bonus: +£50" appears too, with the Triage bonus for the stage. A "Now pick a fix" button opens the Incident window, and the incident carries on.
   - The symptom: "That is a symptom. Look for what causes it." The line greys out. Try again.
   - A routine line: "That line is routine. Look for what changed." The line greys out. Try again.
3. Finding the cause on the first tap pays the Triage bonus.
4. Each line has an info button. It says what the line's source and level mean (see EXTRA_STEPS.md > Log sources). Tapping it is not a tap on the line, and costs nothing.

### Tune, in SysDash

1. After the fix is chosen, SysDash opens with the step's dial and Fact.
2. For each of the three waves: the wave's text appears, the player sets the dial to a stop and taps "Run wave".
   - On the Right stop: the "Just right" sentence.
   - Below it: the "Too low" sentence. Above it: the "Too high" sentence. The Right stop is then shown.
   - Each wave is played once. There are no retries.
3. After the third wave the Lesson appears. The incident then carries on, and counts as solved when the step ends.
4. Each wave set right pays the Tune bonus.

## Users

Users are added up.

- Solving an incident adds its "Users gained" number.
- Buying a Shop item adds its "Users gained" number, if it has one.
- All incidents plus the must-have features add up to exactly 1,000,000,000.
- The 4 nice-to-have features add 95,505,000 more, so the best possible finish is 1,095,505,000.
- The game is won when incident 5.3 is solved. The count cannot reach 1 billion before then.

An outage dip is temporary. It is shown on screen and removed when the incident is solved.

### Progress bar

The bar to 1 billion has five equal segments with markers at 1,000, 100,000, 10 million, 100 million and 1 billion. Inside a segment the fill is proportional between its two marker values. The bar stops at full.

## Stars

Each incident starts at 3 stars.

- Each wrong choice: lose 1 star
- Each failed deploy in a Build: lose 1 star
- Calls to Dana and Victor's lifeline cost cash, not stars
- Minimum: 1 star

### Solved first try

An incident is solved first try when the player made no wrong choice, had no failed deploy, made no call to Dana and did not use Victor's lifeline. A free call still counts as a call. "Remind me" and "Test first" do not spoil it.

This decides gold pips, refreshers and the first-try count on the win screen.

## Money

The player starts the game with £0.

| Kind of incident | Cash paid when solved |
|---|---|
| New | Base cash for the stage x star multiplier |
| Repeat | Half the base cash for the stage x star multiplier |
| Build | Base cash for the stage x star multiplier |

| Stars | Multiplier |
|---|---|
| 3 | 1.5 |
| 2 | 1 |
| 1 | 0.5 |

Examples: a Stage 2 new incident solved with 3 stars pays £2,000 x 1.5 = £3,000. A Stage 2 repeat solved with 3 stars pays £1,000 x 1.5 = £1,500.

Extra steps pay a bonus on top.

| Bonus | Cash paid |
|---|---|
| Triage bonus | 10% of the stage's base cash, for finding the cause on the first tap |
| Tune bonus | 5% of the stage's base cash, for each wave set right |

Bonuses are paid with the rest of the pay when the incident is solved, not the moment they are earned, so they help pay off a loan too. Upgrade bonuses are applied last. Then the total is rounded once, to whole pounds.

Cash is spent in the Shop. All items, prices and effects are in UPGRADES.md.

## The Shop in brief

There are four kinds of item. Full details are in UPGRADES.md.

| Kind | What it does | Example |
|---|---|---|
| Must-have features | Add something new to Blip, bring in users and unlock a new incident | Payments unlocks "The Double Charge" |
| Nice-to-have features | Bring in extra users. Customers ask for them | Dark mode |
| Servers | Prepare Blip in advance. Each one changes how certain incidents unfold | Monitoring halves outage damage |
| Your setup | The player's own gear. Each one gives a helping hand | Engineering handbook gives a free call to Dana |

Prices are not flat. An item costs more when it is a bigger change and when it brings in more users. Every Shop card shows both.

The Shop also sells Victor's lifeline. It is not one of the four kinds, and it can be bought again once used (see UPGRADES.md > Victor's lifeline).

The Shop can be opened at any time, even during an incident. An item bought during an incident only changes incidents that start after it. A must-have feature that the waiting incident needs is the one exception: buying it lets that incident arrive.

## The game must never get stuck

The must-have feature that the next incident needs can always be bought. Its Buy button works even when the player is short of cash.

If the player taps Buy and is short, Maya says: "An investor believes in us." The investor lends exactly the shortfall and the feature is bought at once. The loan money can never be spent on anything else.

The top-up is a loan, so spending everything on optional items is not a free ride. Cash from later incidents pays the loan back first, before the player receives any.

Count how many times this happens. Show the count and the amount still owed on the Stats window.

## Consultant calls

Help with an incident is not free. Dana, an outside consultant, gives clues by phone, and each call costs cash. This makes the player think before asking.

- The "Call Dana" button sits in the Incident window, and in Blueprint during a Build. It shows the price of the next call.
- Each call gives the next clue. In a new or repeat incident, call 1 gives the Nudge, call 2 gives Clue 2 and call 3 gives Clue 3, if the incident has one. Each incident has as many calls as it has clues. Harder incidents have more.
- In a Build, calls place parts and remove decoys (see "Calls in a Build").
- Calls never remove an option or a card.
- Nothing is offered automatically. Dana only speaks when the player calls.
- When every call is used, the button is replaced by "Use Victor's lifeline", if the player holds one.

| Call in this incident | Price |
|---|---|
| Call 1 | 15% of the stage's base cash |
| Each call after that | 10% of the stage's base cash more than the call before |

Examples: in Stage 1 the calls cost £75, then £125, then £175. In Stage 4 they cost £7,500, then £12,500, then £17,500. Repeats use the same prices as new incidents.

- Every call in incident 1.1 is free, so the tutorial can teach the button.
- With the Engineering handbook, the first call in each incident is free. Later calls in that incident still cost their usual price.
- If the player does not have enough cash, the button shows the price in grey with the words "Not enough cash". Calls never use the investor or a loan.
- A call costs no star, but it does spoil "solved first try", even when it is free.

The game still cannot get stuck without calls. After two wrong choices only the right answer is left, and after two failed deploys Blueprint draws the Solution.

## Hints and help

| Help | How the player gets it | Cost |
|---|---|---|
| Call Dana | Tap "Call Dana". Each call gives the next clue, or in a Build places a part. See "Consultant calls" | Cash, rising with each call. Free in 1.1 |
| Victor's lifeline | Bought in the Shop beforehand. Once every call in an incident is used, it shows the answer | Its Shop price (see UPGRADES.md > Victor's lifeline) |
| Guided answer | After two wrong choices only the right one remains. Maya shows its Result sentence and the player taps to apply it | Already at 1 star |
| Remind me | Repeat incidents only. Shows a card's "Use this when" line | Free |
| Test first | Needs the Test environment upgrade. Once per incident, try one option and see its result with no penalty | Free |
| How to Play | Desktop icon, always available | Free |
| Pattern Book | Desktop icon. Every pattern learned so far, with its "Use this when" line | Free |
| Recycle Bin | Desktop icon. Every wrong option the player tried, with why it failed | Free |

## Tutorial

The tutorial runs inside incident 1.1. It uses a spotlight: the screen dims except for the one thing to tap. Each step has 8 words or fewer.

1. "Open your Inbox." (Inbox icon)
2. "Maya has a problem for you." (her email)
3. "Tap Investigate." (the button in her email)
4. "Red means something is breaking." (the failing part)
5. "Pick the fix you think is best." (option cards)
6. "Stuck? Call Dana. Today it is free." (Call Dana button)
7. "Fixed. Users and cash go up." (taskbar counters)
8. "Spend cash in the Shop." (Shop icon)

The player can skip the tutorial. It can be replayed from Settings.

### First-time tips

Each tip is shown once, with the same spotlight.

| When | Tip |
|---|---|
| First server alert (1.2) | "Alerts pop up by themselves. Tap Investigate." |
| First request email | "This email asks for something. Open the Shop." |
| First repeat incident (R1) | "You have seen this before. Pick the pattern." |
| First Triage step (1.2) | "Tap the line that shows the cause." |
| First Build incident (B1) | "Drag parts in. Join them with arrows." |
| First Tune step (3.1) | "Set the dial. Then run the wave." |

## How to Play window (exact text)

1. Problems arrive as server alerts and emails.
2. Open the incident. Watch what is breaking.
3. Pick the fix you think is best.
4. Right fix: users grow and you earn cash.
5. Wrong fix: try again. Stuck? Call Dana, but calls cost cash.
6. Old problems come back. Pick the pattern you learned.
7. Some problems need a design. Draw it in Blueprint.
8. Terminal shows the logs. SysDash shows live numbers.
9. People email asking for features. Buy them in the Shop.
10. Reach 1 billion users.

## Saving

- Save to localStorage after every change.
- Use a versioned key so old saves do not break new builds.
- Old saves are carried forward to new builds, never wiped.
- Settings has "Reset game" with a confirm step.
- "Reset game" and "Play again" clear all progress but keep the player's settings.

## Win screen

Shown when incident 5.3 is solved.

- Maya's win message
- The full System Map
- Final user count
- Total stars out of 105
- Number of incidents solved first try, out of 35
- Patterns mastered, out of 5
- Cash in the bank
- Number of investor top-ups, and any loan still owed
- "Play again" button

## Ideas for later (do not build yet)

- More new incidents per stage: video streaming, webhooks
- Repeats for the other fifteen patterns
- A login Build with a rate limiter that stops password guessing. It has to wait until rate limiting is taught earlier than the final incident
- A timed mode for SysDash, as an option for players who want pressure
- Random events between incidents
- Difficulty settings
- Endless mode past 1 billion
