# Upgrades: the Shop

The Shop icon on the desktop opens the store. There are 19 items in four groups. An item appears in the Shop when the player reaches its stage. Each item can be bought once.

Do not change prices, user numbers or effects. If something is unclear, ask.

## How prices work

An item costs more when it is a bigger change to Blip and when it brings in more users.

Price = stage base cash x (change points + user points)

| Change | Meaning | Points |
|---|---|---|
| Small | A tweak. Nothing else has to move | 0.2 |
| Medium | A new part or tool | 0.4 |
| Big | Changes how Blip works | 0.6 |

| Users | Meaning | Points |
|---|---|---|
| None | Brings in no users | 0 |
| Some | About 5% of the stage's growth | 0.2 |
| Lots | About 10% to 15% of the stage's growth | 0.4 |
| Huge | 20% or more of the stage's growth | 0.6 |

Stage base cash is £500, £2,000, £10,000, £50,000 and £250,000 for Stages 1 to 5 (see GAME_DESIGN.md).

The prices in the tables below are already worked out. Use the table prices. The rule is here so every card can show why it costs what it costs, and so any future item is priced the same way.

Users are added to the user count the moment the item is bought.

## Must-have features

Each one unlocks one incident. The incident cannot start until the feature is bought.

| Id | Name | Stage | Change | Users | Users gained | Price | Unlocks incident |
|---|---|---|---|---|---|---|---|
| feat-payments | Payments | 1 | Medium | Some | 50 | £300 | 1.3 The Double Charge |
| feat-photos | Photo sharing | 2 | Big | Lots | 15,000 | £2,000 | 2.3 The Heavy Photos |
| feat-email | Email notifications | 3 | Medium | Lots | 1,500,000 | £8,000 | 3.3 The Frozen Sign-up |
| feat-verified | Verified accounts | 4 | Medium | Lots | 10,000,000 | £40,000 | 4.3 The Celebrity Post |
| feat-global | Global launch | 5 | Big | Huge | 200,000,000 | £300,000 | 5.1 The Slow Side of the World |

If the player cannot afford a must-have feature when it is needed, the investor top-up rule in GAME_DESIGN.md applies.

## Nice-to-have features

Optional. Customers ask for them. They bring in extra users and unlock nothing.

| Id | Name | Stage | Change | Users | Users gained | Price |
|---|---|---|---|---|---|---|
| feat-darkmode | Dark mode | 2 | Small | Some | 5,000 | £800 |
| feat-groups | Group chats | 3 | Medium | Some | 500,000 | £6,000 |
| feat-voice | Voice notes | 4 | Medium | Some | 5,000,000 | £30,000 |
| feat-translate | Auto-translate | 5 | Medium | Lots | 90,000,000 | £200,000 |

## Servers

Optional. They bring in no users. Each one prepares Blip in advance and changes how certain incidents unfold.

| Id | Name | Stage | Change | Users | Users gained | Price | Effect |
|---|---|---|---|---|---|---|---|
| srv-test | Test environment | 1 | Medium | None | 0 | £200 | Adds a "Test first" button to every incident. Once per incident, try one option and see its result with no penalty and no star lost |
| srv-bigger | Bigger server | 2 | Medium | None | 0 | £800 | In incidents 2.1 and 3.1, the "bigger server" option is removed from the start. Maya says: "We already bought the biggest one we can afford. Hardware alone will not save us." |
| srv-monitoring | Monitoring | 2 | Big | None | 0 | £1,200 | The System Map shows live numbers on every box. Bad-choice penalties are halved: users dip 5% and cash loss is 5% of base |
| srv-standby | Standby server | 3 | Medium | None | 0 | £4,000 | From now on, the first bad choice in each incident causes no user dip. Maya says: "The standby caught it. Nobody noticed." |
| srv-analytics | Analytics | 4 | Medium | None | 0 | £20,000 | In incidents 4.2 and 4.3, the bad option is removed from the start. Maya says: "The data already shows that one would not work." |
| srv-drills | Disaster drills | 5 | Medium | None | 0 | £100,000 | In incidents 5.2 and 5.3, the bad option is removed from the start. Maya says: "We practised this. We know what not to do." |

## Your setup

Optional. The player's own gear. They bring in no users. Each item bought also shows up on the desktop (see UI_THEME.md).

| Id | Name | Stage | Change | Users | Users gained | Price | Effect |
|---|---|---|---|---|---|---|---|
| gear-monitor | Second monitor | 1 | Small | None | 0 | £100 | The Pattern Book can stay open beside an incident. On a phone, a tab switches between them without closing either |
| gear-wallpapers | Wallpaper pack | 2 | Small | None | 0 | £400 | Three extra wallpapers in Settings. No effect on play |
| gear-handbook | Engineering handbook | 2 | Medium | None | 0 | £800 | Hint 2 is free once per incident |
| gear-pc | Faster PC | 3 | Big | None | 0 | £6,000 | 10% more cash from every incident |

## Request emails

People ask for most items by email. The email has an "Open in Shop" button that opens the Shop at that item.

Emails about optional items are suggestions. Nothing bad happens if the player ignores them.

"Arrives" names the incident that must be solved first. See the play order table in GAME_DESIGN.md.

| Item | From | Arrives | Email text |
|---|---|---|---|
| srv-test | Maya | After 1.1 | "A safe place to try a fix before it goes live would save us some pain." |
| feat-payments | Sam | After 1.2 | "People love Blip. Time to earn something. Can we add payments for Blip Plus?" |
| srv-bigger | Sam | Start of Stage 2 | "Can we not just buy a bigger server and move on?" |
| feat-darkmode | Customer | After R1 | "My eyes hurt at night. Any chance of a dark mode?" |
| srv-monitoring | Omar | After 2.2 | "Customers spot problems before we do. Can we watch the servers ourselves?" |
| feat-photos | Customer | After R2 | "Please let us post photos! All my friends are asking for it." |
| srv-standby | Lena | After 3.1 | "Every outage costs us money. Could we keep a spare server ready?" |
| feat-groups | Customer | After R3 | "Can we have group chats? My football team wants to use Blip." |
| feat-email | Zoe | After R4 | "New users forget about us. Can Blip send welcome and alert emails?" |
| srv-analytics | Zoe | After R5 | "We are guessing what users do. Can we get proper numbers?" |
| feat-voice | Customer | After 4.1 | "Typing is slow. Can I send voice notes instead?" |
| feat-verified | Sam | After R7 | "Celebrities want to join, but they need a verified badge. Can we build it?" |
| feat-global | Sam | After R8 | "The board wants Blip in every country. It is our biggest step yet. Are we ready?" |
| feat-translate | Customer | After 5.1 | "My cousins abroad post in another language. Could Blip translate posts?" |
| srv-drills | Sam | After 5.1 | "What if a whole data centre goes down? Can we practise for it?" |

"Your setup" items have no email. When a stage starts, a balloon says "New in the Shop".

## Rules when effects combine

- An incident always keeps its best option. Upgrades and hints only ever remove wrong options.
- If upgrades and hints leave only the best option, Maya shows its Result sentence and the player taps to apply it. Stars are not reduced by upgrades.
- "Test first" does not count as a choice. It cannot be used on an option that has been removed. It works on repeat incidents too.
- Options are only removed by upgrades in new incidents. Repeat incidents always show three cards.
- The Faster PC bonus is applied after the star multiplier. It applies to new and repeat incidents.

## Shop layout

Three tabs: Features, Servers, Your setup. The Features tab lists must-have features first, then nice-to-have features.

Each item is a card with:

- Icon and name
- Price
- Two rows of dots that show why it costs what it costs:
  - Change: 1 dot for Small, 2 for Medium, 3 for Big
  - Users: 0 dots for None, 1 for Some, 2 for Lots, 3 for Huge
- "Users gained" as a number, for example "+15,000 users". Items with none show "No new users"
- One line saying what it does
- Who asked for it, shown as a small sender badge
- A Buy button

Items the player cannot afford show the price in grey with the words "Not enough cash". Items already bought show a tick and the word "Owned".

A must-have feature that is needed for the next incident shows a "Needed next" badge.
