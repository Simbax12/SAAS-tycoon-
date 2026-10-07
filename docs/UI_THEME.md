# UI theme: the retro desktop

The whole game is an old computer desktop, BlipOS, that upgrades as Blip grows: a grey 1995-style desktop in the garage, up to a modern one at planet scale. The player opens each part of the game by clicking an icon, and each part opens in its own window.

## Original artwork only

Each version of BlipOS is inspired by desktops of its era. It must not copy one.

- Do not use Microsoft or Windows names, logos, icons, sounds or the original wallpaper photo.
- Draw the desktop with CSS and inline SVG. The room around the computer is the only exception: it is video clips and pictures (see ROOM.md > The room: the world around the computer).
- The computer in the game is called "BlipOS".
- Real tool names such as Redis or Kafka appear as plain text only, so the player learns the names used at work. Never use a product's logo or brand colours. Every icon is an original drawing.

## BlipOS versions

BlipOS upgrades with each stage, so the computer feels older at the start and newer as Blip grows. Every version keeps the same layout, the same icons and the same readability rules. Only the look changes.

| Version | Stage | Inspired by | The look |
|---|---|---|---|
| BlipOS 1 | 1 | Desktops of 1995 | Square grey windows with raised 3D edges. Solid navy title bars. A plain teal desktop. A grey taskbar with a raised "Start" button and a sunken tray |
| BlipOS 2 | 2 | Desktops of 1998 | As BlipOS 1, but title bars fade from navy to blue, and the wallpaper is the hill drawn in flat colours |
| BlipOS 3 | 3 | Desktops of the early 2000s | Rounded blue title bars, a green rounded "Start" button, the hill wallpaper with soft clouds, and a cream window body |
| BlipOS 4 | 4 | Desktops of 2009 | A dark see-through taskbar and title bars, a round "Start" button, and the hill at night |
| BlipOS 5 | 5 | Desktops of today | Flat and light, with gently rounded corners. The taskbar's buttons sit in the middle. A soft gradient wallpaper |

### Version colours

| Version | Title bar | Title bar end | Title text | Taskbar | Taskbar text | Start button | Start text | Window body | Desktop |
|---|---|---|---|---|---|---|---|---|---|
| BlipOS 1 | #1B2A80 | #1B2A80 | #FFFFFF | #C3C0B6 | #1E1E1E | #C3C0B6 | #1E1E1E | #E0DDD6 | #2B7F7A |
| BlipOS 2 | #1B2A80 | #3A6EA5 | #FFFFFF | #C3C0B6 | #1E1E1E | #C3C0B6 | #1E1E1E | #E0DDD6 | #4A9DE0 |
| BlipOS 3 | #2A5FD0 | #2A5FD0 | #FFFFFF | #2A5FD0 | #FFFFFF | #2E7D32 | #FFFFFF | #F4F0E0 | #4A9DE0 |
| BlipOS 4 | #1F2A38 | #2C3E55 | #FFFFFF | #18212C | #FFFFFF | #2A5FD0 | #FFFFFF | #F4F0E0 | #13294B |
| BlipOS 5 | #E4E1D8 | #E4E1D8 | #1E1E1E | #EDEAE2 | #1E1E1E | #2A5FD0 | #FFFFFF | #F4F0E0 | #9EC5E8 |

"Title bar end" is where the title bar's colour fades to. When it is the same as "Title bar", the bar is one flat colour.

### The upgrade

- The desktop shows the version for the current stage. Stage 1 is BlipOS 1.
- At the very start, the loading bar shows "BlipOS 1".
- When a new stage starts, BlipOS upgrades. After the room clips, the loading bar shows "Upgrading to BlipOS 2", with the new version's number. Then the desktop appears in its new look (see GAME_LOGIC.md > After the player taps Next).
- Server alerts keep their red title bar in every version, so an alert always looks like an alert.

### Pop-ups and hint boxes

Every box that pops up over the desktop follows the version too, so the feel stays the same everywhere.

- **BlipOS 1 and 2:** each pop-up is a classic dialog box: a title bar in the version's colours, a grey body with raised 3D edges, and square corners. Its buttons are grey and raised, and press in when tapped. The main button has a dark outline and bold text.
  - Tutorial steps and first-time tips are small dialog boxes titled "Tutorial" and "Tip".
  - Server alerts use the dialog frame, with their red title bar.
  - Dana's phone window uses the dialog frame, with her colour in its title bar.
  - Email balloons are square pale-yellow notes with a thin dark edge, like the small notes desktops of that era showed.
- **BlipOS 3 and later:** pop-ups are rounded, as in the early 2000s look. The tutorial and tip boxes have no title bar.

## Desktop

- **Wallpaper:** set by the version (see "BlipOS versions"). The hill is a rolling green hill under a blue sky with a few soft clouds. Built from CSS gradients and SVG shapes.
- **Icons:** a grid on the left side. Each icon is a simple drawing with its name underneath.
- **Taskbar:** a bar along the bottom, in the version's colours.
  - Left: a "Start" button. It opens a menu listing the same items as the desktop icons.
  - Middle: a tab for each open window.
  - Right: the tray. It shows users, cash and a clock. On the computer layout it also has a zoom button: a magnifying glass with a plus to zoom in, or a minus to zoom out (see ROOM.md > During play).
- **Balloons:** small speech balloons rise from the tray, for example "New email from Sam" or "New in the Shop".
- **Start-up:** after the player sits down at the computer (see ROOM.md > The first time the game is opened), show a short BlipOS loading bar (2 seconds at most), then Maya's welcome email.

## Desktop icons

One click or tap opens a window. Do not require a double click.

| Icon | Name | Opens |
|---|---|---|
| Envelope | Inbox | Every email, newest first, each with its sender badge |
| Warning triangle | Incident | The current incident. Shows a red badge when one is waiting |
| Network of boxes | System Map | The diagram of Blip's architecture. It grows as the game goes on |
| Rolled-up plan | Blueprint | The drawing app for Build incidents, and every design the player has finished |
| Dark screen with a prompt | Terminal | The log viewer for Triage steps |
| Dial gauge | SysDash | The live dashboard for Tune steps |
| Shopping trolley | Shop | The store, in three tabs: Features, Servers, Your setup |
| Open book | Pattern Book | Every pattern learned, with its "Use this when" line and pips |
| Bar chart | Stats | Progress bar to 1 billion, current stage, stars, investor top-ups |
| Text file | How to Play | The instructions from GAME_DESIGN.md |
| Cog | Settings | Text size, motion, sound, wallpaper, replay tutorial, reset game |
| Bin | Recycle Bin | Every wrong option the player tried, with why it failed |

Icons that have something new show a small red dot. The Inbox icon shows the number of unread emails.

## Windows

- A title bar in the version's colours, with the window's icon and name on the left and a close button on the right.
- A body in the version's window body colour, never pure white.
- On a computer: windows can be dragged by the title bar and overlap. Clicking a window brings it to the front.
- On a computer, a window grows to fit what is inside, up to the bottom of the desktop. Only then does its body scroll. Its width grows with the desktop, from 600 to 760 pixels. Blueprint opens larger, and two windows side by side share the desktop.
- On a phone: one window at a time, full screen, with the taskbar still visible. No dragging.
- Closing a window never loses progress.

## Server alerts

A server alert is a small window that opens by itself in the middle of the desktop.

- Red title bar with a warning triangle and the words "Server alert".
- The alert text in large type. 15 words at most.
- One button: "Investigate". It opens the Incident window.
- It cannot be closed without tapping "Investigate", but it can be dragged aside.
- The failing box on the System Map turns red at the same moment.
- With sound on, it plays one short original alert sound.

## Emails and sender badges

Each email in the Inbox shows a sender badge, the sender's name and the first line.

| Sender | Badge colour | Badge icon | Badge word |
|---|---|---|---|
| Maya | #2E7D32 | Spanner | Maya |
| Sam | #2A5FD0 | Tie | Boss |
| Lena, Omar, Zoe | #6B3FA0 | Clipboard | Team |
| Customers | #0F6E6E | Speech bubble | Customer |
| Dana | #A8431C | Phone | Consultant |
| Victor | #4A4A4A | Life ring | Lifeline |

- Badge text is white.
- Opening an email shows the full text, 25 words at most, and its button if it has one ("Investigate" or "Open in Shop").
- Unread emails are bold with a dot. Read emails are normal weight.
- Emails are never deleted, so the Inbox is the story so far.

## The System Map and incident diagram

- Boxes joined by arrows. Each box has an icon and a short name.
- A healthy box has a green edge. A struggling box has an amber edge. A failing box has a red edge and a gentle pulse.
- Every box also shows a word: OK, Warning or Critical. Never rely on colour alone.
- When the player fixes a new incident, the new part slides into the diagram.
- When the player fixes a repeat incident, the part that carries the pattern's icon pulses once.
- Each feature bought appears as a small labelled chip beside the Users box.
- The same diagram component is used in the Incident window and the System Map window.

## Shop cards

Each card follows the layout in UPGRADES.md. The two price reasons are drawn as rows of dots so they can be compared at a glance.

- Change: three dots in a row. Filled dots show the size of the change.
- Users: three dots in a row. Filled dots show how many users it brings.
- Beside each row is its word: Small, Medium or Big, and None, Some, Lots or Huge.
- The price sits at the top right of the card in large type.

## Shop item icons

Each Shop card shows its item's icon. Original drawings, like every other icon.

| Item | Name | Icon |
|---|---|---|
| feat-payments | Payments | Credit card |
| feat-photos | Photo sharing | Camera |
| feat-email | Email notifications | Envelope with a bell |
| feat-verified | Verified accounts | Round badge with a tick |
| feat-global | Global launch | Rocket |
| feat-darkmode | Dark mode | Crescent moon |
| feat-groups | Group chats | Three speech bubbles |
| feat-voice | Voice notes | Microphone |
| feat-translate | Auto-translate | Two letters joined by an arrow |
| srv-test | Test environment | Flask |
| srv-bigger | Bigger server | Tall server tower |
| srv-monitoring | Monitoring | Heartbeat line on a screen |
| srv-standby | Standby server | Two servers, one dimmed |
| srv-analytics | Analytics | Pie chart |
| srv-drills | Disaster drills | Alarm bell |
| gear-monitor | Second monitor | Two screens side by side |
| gear-wallpapers | Wallpaper pack | Framed picture of a hill |
| gear-handbook | Engineering handbook | Thick book |
| gear-pc | Faster PC | Tower PC with a lightning mark |
| lifeline | Victor's lifeline | Life ring |

## Test first

With the Test environment owned, a "Test first" button with a flask icon sits beside "Call Dana" (see UPGRADES.md > Servers).

- Tapping it shows "Tap a fix to test it." and a "Cancel" button.
- The next card tapped is tested, not picked. Its Result shows in a box marked "Test". The right answer also shows "This would work" (see UPGRADES.md > Rules when effects combine).
- The button then goes away until the next incident.

## Stats

The Stats window shows, from top to bottom:

- Users, as a number and the progress bar to 1 billion (see GAME_DESIGN.md > Progress bar).
- The current stage, for example "Stage 1: Garage".
- Stars: the stars earned so far, out of 3 for each incident solved, for example "11 of 12 stars".
- Investor top-ups: how many there have been, and "Loan owed" with the amount still owed (see GAME_DESIGN.md > The game must never get stuck).

## Pattern Book and pattern cards

Each pattern has an icon. The same icon is used in the Pattern Book, on repeat incident cards and on the System Map.

| Pattern | Icon |
|---|---|
| Role-based access control (RBAC) | Shield |
| Password hashing | Padlock |
| Idempotency keys | Key |
| Caching | Lightning bolt |
| Database index | Bookmark tab |
| CDN | Globe with dots |
| Load balancing | Signpost with arrows |
| Stateless servers | Name badge |
| Message queue | To-do list |
| Read replicas | Two stacked copies |
| Sharding | Pie cut in slices |
| Fan-out | Megaphone |
| Multi-region | World map with pins |
| Failover | Heartbeat line |
| Rate limiting | Turnstile gate |
| Secrets manager | Safe |
| Eager loading | Shopping basket |
| Circuit breaker | Light switch |
| Search engine | Magnifying glass |
| Feature flags | Flag |

A Pattern Book entry shows: icon, name, the "Use this when" line, its familiar tools from the toolbox in BLUEPRINTS.md under the heading "Tools you will meet", and any "Also seen as" and "Built in" lines.

The five everyday patterns also show three pips. A gold pip is a filled circle with a small star. A silver pip is a filled circle. An empty pip is an outline. Three gold pips show a "Mastered" badge.

A repeat incident card shows the pattern's icon large, its name, and a small "Remind me" button.

## Blueprint

The drawing app. It opens from its icon or from a Build incident.

- **Tray** on the left. Each part is a card with its icon, its name and, beneath, "like" and its first familiar tool.
- Each part in the tray has the same info button as a Terminal row. It opens a box with the part's "What it is" line (see BLUEPRINTS.md > The parts). It never places or picks the part.
- **Canvas** on the right: a pale grid.
- **Sticky note** at the top of the canvas with the Build's Goal.
- **Placing a part:** drag it from the tray to the canvas, or tap the part and then tap the canvas.
- **Joining parts:** drag from one part to another, or tap the first part and then the second. An arrow appears, pointing from the first to the second.
- **Removing:** tap a part or an arrow, then tap "Remove".
- Every action works with taps alone and with the keyboard alone. Dragging is never required.
- **"Deploy and test"** button at the bottom right. It is greyed out until at least one arrow is drawn.
- **Traffic:** dots travel along the arrows. A wrong arrow flashes red and shows a cross icon and the word "Stopped".
- A part placed by a call to Dana shows a small pin icon and cannot be moved or removed.
- **My designs:** when no Build is waiting, Blueprint lists the finished designs. Opening one shows it, read only.
- On a phone the tray is a strip along the top that scrolls sideways, and the canvas fills the rest.

## Terminal

The log viewer. It opens from its icon or from a Triage step.

- A dark window with cream text, in the same font as everything else.
- Six rows, one per log line. Each row is a button at least 48px tall.
- Each row shows a level badge, the source name and the message. The badge is an icon and a word: a circle for INFO, a triangle for WARN, a cross for ERROR.
- Above the rows: the goal, "What happened" and the bonus line (see GAME_DESIGN.md > Triage, in Terminal).
- Each row has an info button at its right end: the letter "i" in a circle, with a 48px tap area. It opens a box under the row with the source's tool name, its part and what the part is, and what the level means. Tapping it again closes the box.
- Nothing scrolls and nothing blinks. The lines wait for the player.
- A tapped line that is not the cause turns grey and stays on screen.
- When no Triage step is waiting, Terminal shows the lines from past Triage steps with each cause marked.

## SysDash

The live dashboard. It opens from its icon or from a Tune step.

- The step's Fact sits at the top.
- One large gauge in the middle with three bands. Each band has an icon and its words: "Too low", "Just right", "Too high".
- One dial below it: a slider that snaps to the step's stops, each stop labelled. Minus and plus buttons beside it move one stop, so dragging is never required.
- A "Run wave" button, and a counter such as "Wave 1 of 3".
- After "Run wave" the needle moves to a band and the matching sentence appears.
- When no Tune step is waiting, SysDash shows users, cash and the current stage as simple gauges.

## The player's setup

On the computer layout, these items also appear on the desk in the room (see ROOM.md > The desk).

Items bought from "Your setup" should be visible, so spending feels real.

- Second monitor: the Pattern Book can sit beside the Incident window. On a computer, opening one while the other is open puts the two side by side, each half the desktop wide. On a phone, a tab at the top of both windows switches between them. Without it, opening one closes the other (see UPGRADES.md > Your setup).
- Wallpaper pack: three more original wallpapers (sunset hill, night sky, snowy hill).
- Engineering handbook: a small book icon sits on the taskbar tray.
- Faster PC: the BlipOS loading bar becomes quicker and the tray shows a lightning mark.

## Maya

- A simple round avatar with a friendly face. Original drawing.
- She speaks in speech bubbles of 25 words or fewer.
- Her emails are kept in the Inbox so the player can reread them.

## Dana and Victor

- Each has a simple round avatar, an original drawing, and their sender badge.
- The "Call Dana" button sits at the bottom of the Incident window and of Blueprint during a Build. It shows a phone icon and the price of the next call, or "Free call".
- When the player cannot afford the next call, the button shows the price in grey with the words "Not enough cash".
- A call shows a small phone window with Dana's badge and her clue, 25 words or fewer. Earlier clues in the same incident stay listed above it.
- When every call is used, the button becomes "Use Victor's lifeline" if one is held. Otherwise it is greyed out with the words "No more calls".
- Victor's line is "This one. You owe me." Then the guided answer shows.

## Colours

| Use | Colour |
|---|---|
| Sky | #4A9DE0 fading to #BFE3FF |
| Hill | #5DAA3C fading to #3F8A2B |
| Server alert title bar | #C83232 |
| Main text | #1E1E1E |
| Terminal background | #1E1E1E |
| Terminal text | #F4F0E0 |
| OK | #2E8B3D |
| Warning | #A86F00 |
| Critical | #C83232 |

The OK, Warning and Critical colours are for box edges, icons and fills only. Write the status words themselves in the main text colour.

Sender badge text is white. Each BlipOS version sets its own title, taskbar and Start text colours (see "Version colours").

Check that all text passes a contrast ratio of 4.5 to 1 against its background, and that edges and icons pass 3 to 1.

## Readability rules

These matter more than the retro look. If the two clash, readability wins.

- Font: Verdana, then Tahoma, then any sans-serif. No pixel fonts for anything the player must read.
- Body text 18px or larger. Line height 1.5. Left aligned.
- No italics. No sentences in capitals. No underlines except on links.
- Never pure white behind text. Use the version's window body colour.
- 25 words at most in any one bubble, email, card or button.
- One idea per screen. Use icons and animation before words.
- Every colour signal also has an icon and a word.
- Tap targets 48px or larger, with 8px between them.
- Settings offers three text sizes: Normal, Large, Extra large.

## Motion and sound

- Animations are short (under 600ms) except the incident "Sees" animation, which can loop gently.
- Respect the device's reduced motion setting. With reduced motion, show before and after states with no movement.
- Sound is off by default. If turned on, use short original sounds only.

## Phone layout

- Must work at 375px wide.
- Desktop icons sit in a grid of 3 per row.
- Windows and server alerts are full screen.
- The tray shows users and cash as icons with short numbers, for example 1.2M and £3.4K.
- The taskbar stays fixed at the bottom and is at least 56px tall.
