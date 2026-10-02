# Game design: the rules

## Story

It is day one. The player is the first engineer at Blip, working from a garage with one old PC and one server.

Work arrives the way it does in a real job. The servers raise alerts. The boss, the team and customers send emails. Maya, a senior engineer, helps the player make sense of it.

## Who the player hears from

| Who | Role | What they send |
|---|---|---|
| Maya | Senior engineer and the player's guide. Friendly, brief, never talks down | Stage openers, explanations, hints, refreshers |
| Sam | The boss (CEO) | Asks for big features. Passes on problems he has heard about |
| Lena | Head of Finance | Problems with money and staff. Asks for safer servers |
| Omar | Head of Support | Problems his team sees. Asks for better tools |
| Zoe | Head of Growth | Sign-up problems. Asks for features that help Blip grow |
| Customers | People who use Blip | Complaints and wishes. Use a different first name each time |
| The servers | BlipOS itself | Alerts, when a machine notices trouble before a person does |

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

## Two kinds of incident

| Kind | How many | What it is | Where it is written |
|---|---|---|---|
| New | 15 | Teaches a pattern for the first time | CHALLENGES.md |
| Repeat | 10 | An everyday problem comes back in a new disguise. The player must recall the pattern | REPEATS.md |

## Play order

There are 25 incidents. They are always played in this order. Only one incident is open at a time.

| Order | Stage | Id | Title | Kind | Needs |
|---|---|---|---|---|---|
| 1 | 1 | 1.1 | The Open Door | New | |
| 2 | 1 | 1.2 | The Leaked Passwords | New | |
| 3 | 1 | 1.3 | The Double Charge | New | feat-payments |
| 4 | 2 | 2.1 | The Melting Database | New | |
| 5 | 2 | R1 | The Refund Button | Repeat | |
| 6 | 2 | 2.2 | The Slow Lookup | New | |
| 7 | 2 | R2 | The Triple Message | Repeat | |
| 8 | 2 | 2.3 | The Heavy Photos | New | feat-photos |
| 9 | 3 | 3.1 | The Lonely Server | New | |
| 10 | 3 | R3 | The Profile Stampede | Repeat | |
| 11 | 3 | 3.2 | The Vanishing Login | New | |
| 12 | 3 | R4 | The Slow Inbox | Repeat | |
| 13 | 3 | 3.3 | The Frozen Sign-up | New | feat-email |
| 14 | 4 | R5 | The Contractor Keys | Repeat | |
| 15 | 4 | 4.1 | The Read Flood | New | |
| 16 | 4 | R6 | The Stuck Upload | Repeat | |
| 17 | 4 | 4.2 | The Table That Got Too Big | New | |
| 18 | 4 | R7 | The Trending Crush | Repeat | |
| 19 | 4 | 4.3 | The Celebrity Post | New | feat-verified |
| 20 | 5 | R8 | The Twice-Run Job | Repeat | |
| 21 | 5 | 5.1 | The Slow Side of the World | New | feat-global |
| 22 | 5 | R9 | The Support Search | Repeat | |
| 23 | 5 | 5.2 | The Blackout | New | |
| 24 | 5 | R10 | The Export That Never Finishes | Repeat | |
| 25 | 5 | 5.3 | The Flood Attack | New | |

## The game loop

1. Something arrives: a server alert or an email.
2. The player opens the incident and watches what is breaking.
3. The player picks a fix.
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
   - Partial or bad choice: the card greys out and a copy goes to the Recycle Bin. Penalties apply. Maya gives the nudge. The player chooses again.
6. **Learn.** The Pattern Book gains a new entry. The System Map gains its new part. Users count up. Cash is paid. Stars are shown.
7. **Next.** A "Next" button returns to the desktop. Any thank-you or request emails arrive, then the next incident.

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
   - Wrong card: its "Why not" sentence appears. The card greys out and a copy goes to the Recycle Bin. The player loses 1 star. No cash is lost and there is no outage. Maya gives the nudge, which names the earlier incident. The player chooses again.
6. **Strengthen.** The pattern's next pip fills in the Pattern Book. Its "Also seen as" line is added to the entry. Users count up. Cash is paid. Stars are shown.

### Pips and mastery

Each of the five everyday patterns has three pips in the Pattern Book.

- Pip 1 fills when the pattern is first learned. It is always gold.
- Pips 2 and 3 fill when its two repeats are solved.
- A repeat solved first try gives a gold pip. Otherwise the pip is silver.
- Three gold pips earn a "Mastered" badge.

The other ten patterns have no pips.

### Refreshers

If a repeat took more than one try, Maya sends a refresher email after the next incident is solved. For R10, send it straight away.

A refresher shows the pattern's icon, its name, its "Use this when" line and its "Also seen as" lines. There is no test and no reward.

## Users

Users are added up.

- Solving an incident adds its "Users gained" number.
- Buying a Shop item adds its "Users gained" number, if it has one.
- All 25 incidents plus the 5 must-have features add up to exactly 1,000,000,000.
- The 4 nice-to-have features add 95,505,000 more, so the best possible finish is 1,095,505,000.
- The game is won when incident 5.3 is solved. The count cannot reach 1 billion before then.

An outage dip is temporary. It is shown on screen and removed when the incident is solved.

### Progress bar

The bar to 1 billion has five equal segments with markers at 1,000, 100,000, 10 million, 100 million and 1 billion. Inside a segment the fill is proportional between its two marker values. The bar stops at full.

## Stars

Each incident starts at 3 stars.

- Each wrong choice: lose 1 star
- Using Hint 2: lose 1 star (unless it is free, see Hints)
- Minimum: 1 star

## Money

| Kind of incident | Cash paid when solved |
|---|---|
| New | Base cash for the stage x star multiplier |
| Repeat | Half the base cash for the stage x star multiplier |

| Stars | Multiplier |
|---|---|
| 3 | 1.5 |
| 2 | 1 |
| 1 | 0.5 |

Examples: a Stage 2 new incident solved with 3 stars pays £2,000 x 1.5 = £3,000. A Stage 2 repeat solved with 3 stars pays £1,000 x 1.5 = £1,500.

Round to whole pounds. Upgrade bonuses are applied last.

Cash is spent in the Shop. All items, prices and effects are in UPGRADES.md.

## The Shop in brief

There are four kinds of item. Full details are in UPGRADES.md.

| Kind | What it does | Example |
|---|---|---|
| Must-have features | Add something new to Blip, bring in users and unlock a new incident | Payments unlocks "The Double Charge" |
| Nice-to-have features | Bring in extra users. Customers ask for them | Dark mode |
| Servers | Prepare Blip in advance. Each one changes how certain incidents unfold | Monitoring halves outage damage |
| Your setup | The player's own gear. Each one gives a helping hand | Engineering handbook gives a free hint |

Prices are not flat. An item costs more when it is a bigger change and when it brings in more users. Every Shop card shows both.

## The game must never get stuck

If the next incident needs a feature and the player cannot afford it, Maya says: "An investor believes in us." Cash is topped up to exactly the price of that feature.

The top-up is a loan, so spending everything on optional items is not a free ride. Cash from later incidents pays the loan back first, before the player receives any.

Count how many times this happens. Show the count and the amount still owed on the Stats window.

## Hints and help

| Help | How the player gets it | Cost |
|---|---|---|
| Hint 1: the nudge | Tap the Hint button. Also shown automatically after the first wrong choice, and offered after 45 seconds without a choice | Free |
| Hint 2: remove one wrong option | Tap the Hint button a second time. In a new incident it removes the bad option first | 1 star |
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
6. "Stuck? Tap Hint." (Hint button)
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

## How to Play window (exact text)

1. Problems arrive as server alerts and emails.
2. Open the incident. Watch what is breaking.
3. Pick the fix you think is best.
4. Right fix: users grow and you earn cash.
5. Wrong fix: try again. Tap Hint if you are stuck.
6. Old problems come back. Pick the pattern you learned.
7. People email asking for features. Buy them in the Shop.
8. Reach 1 billion users.

## Saving

- Save to localStorage after every change.
- Use a versioned key so old saves do not break new builds.
- Settings has "Reset game" with a confirm step.

## Win screen

Shown when incident 5.3 is solved.

- Maya's win message
- The full System Map
- Final user count
- Total stars out of 75
- Number of incidents solved first try, out of 25
- Patterns mastered, out of 5
- Cash in the bank
- Number of investor top-ups, and any loan still owed
- "Play again" button

## Ideas for later (do not build yet)

- More new incidents per stage: slow repeated queries, search, video streaming, webhooks
- Repeats for the other ten patterns
- Random events between incidents
- Difficulty settings
- Endless mode past 1 billion
