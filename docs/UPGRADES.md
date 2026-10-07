# Upgrades: the Shop

The Shop icon on the desktop opens the store. There are 19 items in four groups. An item appears in the Shop when the player reaches its stage. Each item can be bought once. The Shop also sells Victor's lifeline, which is not one of the 19 items (see "Victor's lifeline" below).

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
| srv-standby | Standby server | 3 | Medium | None | 0 | £4,000 | From now on, the first bad choice in each stage causes no user dip. Maya says: "The standby caught it. Nobody noticed." |
| srv-analytics | Analytics | 4 | Medium | None | 0 | £20,000 | In incidents 4.2 and 4.3, the bad option is removed from the start. Maya says: "The data already shows that one would not work." |
| srv-drills | Disaster drills | 5 | Medium | None | 0 | £100,000 | In incidents 5.2 and 5.3, the bad option is removed from the start. Maya says: "We practised this. We know what not to do." |

## Your setup

Optional. The player's own gear. They bring in no users. Each item bought also shows up on the desktop (see UI_THEME.md).

| Id | Name | Stage | Change | Users | Users gained | Price | Effect |
|---|---|---|---|---|---|---|---|
| gear-monitor | Second monitor | 1 | Small | None | 0 | £100 | The Pattern Book can stay open beside an incident. On a phone, a tab switches between them without closing either |
| gear-wallpapers | Wallpaper pack | 2 | Small | None | 0 | £400 | Three extra wallpapers in Settings. No effect on play |
| gear-handbook | Engineering handbook | 2 | Medium | None | 0 | £800 | The first call to Dana in each incident is free |
| gear-pc | Faster PC | 3 | Big | None | 0 | £6,000 | 10% more cash from every incident |

Without the Second monitor, the Incident window and the Pattern Book cannot be open at the same time. Opening one closes the other.

## Request emails

People ask for most items by email. The email has an "Open in Shop" button that opens the Shop at that item.

Emails about optional items are suggestions. Nothing bad happens if the player ignores them.

"Arrives" names the incident that must be solved first. See the play order table in GAME_DESIGN.md.

If the player already owns the item, its request email is not sent.

| Item | From | Arrives | Email text |
|---|---|---|---|
| srv-test | Maya | After 1.1 | "We cannot keep pushing bugs to the live app. We need a safe place to try a fix before it goes live." |
| feat-payments | Sam | After 1.2 | "People love Blip, but we earn nothing from it. Please add payments for Blip Plus, so we can pay for servers and keep growing." |
| srv-bigger | Sam | Start of Stage 2 | "Blip slows down at busy times. Please buy a bigger server. Then we will know for sure if more hardware is the answer." |
| feat-darkmode | Customer | After R1 | "Blip is so bright that my eyes hurt at night. Please add a dark mode, so I can keep chatting after dark." |
| srv-monitoring | Omar | After 2.2 | "Customers find problems before we do. Please add monitoring, so we see trouble early on the System Map and mistakes cost us less." |
| feat-photos | Customer | After R2 | "All my friends want to share photos on Blip. Please add photo sharing, or we will all move to another app." |
| srv-standby | Lena | After 3.1 | "Every outage loses us users. Please keep a standby server ready. When something breaks, it takes over and nobody notices." |
| feat-groups | Customer | After R3 | "My football team wants one chat for all of us. Please add group chats, so we can plan our games on Blip." |
| feat-email | Zoe | After R4 | "New users sign up, then forget about us. Please add email notifications, so Blip can welcome them and bring them back." |
| srv-analytics | Zoe | After R5 | "We are guessing what users do. Please add analytics, so the numbers show us which fixes would never work." |
| feat-voice | Customer | After 4.1 | "Typing on my phone is slow. Please add voice notes, so I can just talk to my friends instead." |
| feat-verified | Sam | After R7 | "Celebrities want to join, but fans cannot tell real accounts from fakes. Please add verified badges, so they feel safe on Blip." |
| feat-global | Sam | After R8 | "The board wants Blip in every country. Please fund a global launch. It is our biggest step yet, and it brings millions of users." |
| feat-translate | Customer | After 5.1 | "My cousins abroad post in another language. Please add auto-translate, so I can read their posts and reply." |
| srv-drills | Sam | After 5.1 | "What if a whole data centre goes down? Please let us run disaster drills, so we know what not to do when it happens." |

"Your setup" items have no email. When a stage starts, a balloon says "New in the Shop".

## Rules when effects combine

- An incident always keeps its best option. Upgrades only ever remove wrong options. Calls to Dana never remove options. In a Build, call 2 removes the decoys.
- If upgrades leave only the best option, Maya shows its Result sentence and the player taps to apply it. Stars are not reduced by upgrades.
- "Test first" does not count as a choice. It cannot be used on an option that has been removed. It works on repeat incidents too.
- "Test first" on the right answer shows its Result with the words "This would work". The player must still pick it.
- In a Build, "Test first" gives one "Deploy and test" that costs no star if it fails. If the design is right, it shows "This would work" and the player then deploys for real.
- In a Build, the Engineering handbook makes the first call free, the same as anywhere else.
- An upgrade bought during an incident does not change that incident. It changes incidents that start after it.
- Monitoring and Standby server only change new incidents. Builds and repeats have no outage.
- Options are only removed by upgrades in new incidents. Repeat incidents always show three cards.
- The Faster PC bonus is applied after the star multiplier. It applies to every incident, and to Triage and Tune bonuses.

## Victor's lifeline

Victor is a contract engineer. When every call to Dana in an incident is used and the player still does not see the answer, Victor gives it.

| Stage | Price |
|---|---|
| 1 | £1,000 |
| 2 | £4,000 |
| 3 | £20,000 |
| 4 | £100,000 |
| 5 | £500,000 |

- The price is 2 x the base cash of the current stage. That is more than any incident in the stage pays, so buying lifelines never makes a profit.
- It must be bought in the Shop before it is used. The incident has no Buy button for it.
- The player can hold one at a time. Once it is used, another can be bought.
- A lifeline is only good for the stage it was bought in. When a new stage starts, an unused one is lost, with no refund. Cheap lifelines cannot be saved for later stages.
- It can only be used once every call to Dana in the incident has been made.
- In a new or repeat incident, Victor names the right answer and the incident moves to the guided answer. In a Build, Blueprint draws the Solution and the player taps "Deploy and test".
- Stars stay as they are. Using it spoils "solved first try".
- It never uses the investor or a loan. It brings in no users.

## Shop layout

Three tabs: Features, Servers, Your setup. The Features tab lists must-have features first, then nice-to-have features. The Your setup tab shows Victor's lifeline first. Its card shows the price for the current stage, and "Held" while the player has one. It has no dots, because its price does not come from the price rule.

Each item is a card with:

- Icon and name
- Price
- Two rows of dots that show why it costs what it costs:
  - Change: 1 dot for Small, 2 for Medium, 3 for Big
  - Users: 0 dots for None, 1 for Some, 2 for Lots, 3 for Huge
- "Users gained" as a number, for example "+15,000 users". Items with none show "No new users"
- One line saying what it does:
  - Servers and "Your setup" items show their Effect.
  - A must-have feature says "Unlocks:" and the title of the incident it unlocks.
  - A nice-to-have feature says "Optional. Brings in extra users."
  - Victor's lifeline says "Gives the answer once every call is used."
- Who asked for it, shown as a small sender badge
- A Buy button

Items the player cannot afford show the price in grey with the words "Not enough cash". The one exception is a must-have feature marked "Needed next": its Buy button always works (see the investor rule in GAME_DESIGN.md). Items already bought show a tick and the word "Owned".

A must-have feature that is needed for the next incident shows a "Needed next" badge.
