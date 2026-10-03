# Repeats: the 10 repeat incidents

Five problems turn up again and again in real software. The game brings each one back twice, in a new disguise and at a bigger scale, so the pattern sticks.

Copy these into a typed data file exactly as written. Do not add, remove or reword anything. If something looks wrong, ask.

The rules for how a repeat plays are in GAME_DESIGN.md. The order everything is played in is in the play order table in GAME_DESIGN.md.

## The five everyday patterns

| Pattern | The everyday problem | Learned in | Comes back in |
|---|---|---|---|
| Role-based access control (RBAC) | People can do things they should not be allowed to do | 1.1 | R1, R5 |
| Idempotency keys | The same request arrives more than once | 1.3 | R2, R8 |
| Caching | The same question is asked again and again | 2.1 | R3, R7 |
| Database index | The database reads every row to find one thing | 2.2 | R4, R9 |
| Message queue | The user waits while slow work is done | 3.3 | R6, R10 |

## How to read a repeat

- **Pattern:** the pattern being practised. The name matches its Pattern Book entry exactly.
- **First learned in:** the incident that taught it.
- **Arrives by:** a server alert or an email, with the exact text.
- **Users gained:** added to the user count when solved.
- **Sees:** the animation that shows the problem on the diagram.
- **Cards:** three pattern cards, shown in a shuffled order. One is right. The two wrong ones are patterns the player has already learned.
- **Result:** shown when the right card is picked.
- **Why not:** shown when that wrong card is picked.
- **Nudge:** the clue Dana gives on call 1. It names the earlier incident.
- **Clue 2:** the clue Dana gives on call 2 (see GAME_DESIGN.md > Consultant calls).
- **Also seen as:** a line added to the pattern's Pattern Book entry.

All repeats start automatically. Repeats add no new boxes to the System Map. The part of the map that carries the pattern's icon pulses once.

---

# Stage 2

## R1 The Refund Button

- **Pattern:** Role-based access control (RBAC)
- **First learned in:** 1.1 The Open Door
- **Arrives by:** Email from Sam. "A new support hire refunded £9,000 by mistake. Support staff should only be able to view orders."
- **Users gained:** 10,000
- **Sees:** A person wearing a Support badge presses a button marked Refund. Money flies out.
- **Cards:**
  - **right.** Role-based access control (RBAC)
    Result: "Each role now has its own list of allowed actions. Support can view. Only Finance can refund."
  - **wrong.** Password hashing
    Why not: "Her password was safe and her login was real. The problem is what she was allowed to do."
  - **wrong.** Idempotency keys
    Why not: "The refund only went out once. It should not have been allowed at all."
- **Nudge:** "Remember The Open Door? Who is allowed to do what?"
- **Clue 2:** "Her password was safe and the refund ran once. The question is what each role is allowed to do."
- **Also seen as:** "Staff tools that everyone can use."

## R2 The Triple Message

- **Pattern:** Idempotency keys
- **First learned in:** 1.3 The Double Charge
- **Arrives by:** Email from a customer. "I pressed Send once on the train. My message posted three times."
- **Users gained:** 15,000
- **Sees:** One tap on Send. The phone's signal drops, and three copies of the same message reach the Server.
- **Cards:**
  - **right.** Idempotency keys
    Result: "Each message carries a unique ticket. Repeats are spotted and dropped."
  - **wrong.** Caching
    Why not: "A saved copy of an answer does not stop the same message arriving three times."
  - **wrong.** Database index
    Why not: "Finding messages faster does not stop one being saved three times."
- **Nudge:** "Remember The Double Charge? How did the server spot a repeat?"
- **Clue 2:** "One tap, three posts. The server must spot a send it has already handled."
- **Also seen as:** "Messages or posts that appear more than once."

---

# Stage 3

## R3 The Profile Stampede

- **Pattern:** Caching
- **First learned in:** 2.1 The Melting Database
- **Arrives by:** Server alert. "Database at 97%. One profile is being loaded 40,000 times a second."
- **Users gained:** 1,000,000
- **Sees:** Thousands of identical arrows ask the Database for the same famous profile.
- **Cards:**
  - **right.** Caching
    Result: "The profile is kept ready in fast memory. The database is barely touched."
  - **wrong.** Load balancing
    Why not: "More servers just send more copies of the same question to the database."
  - **wrong.** Database index
    Why not: "The lookup is already quick. The trouble is how many times it is repeated."
- **Nudge:** "Remember The Melting Database? The answer is the same every time."
- **Clue 2:** "One profile, asked for 40,000 times, gives the same answer each time. Keep that answer ready."
- **Also seen as:** "One popular page that everybody loads."

## R4 The Slow Inbox

- **Pattern:** Database index
- **First learned in:** 2.2 The Slow Lookup
- **Arrives by:** Email from a customer. "My inbox takes 10 seconds to open. I only have 40 messages!"
- **Users gained:** 1,500,000
- **Sees:** The Database reads through every message from every user to find one person's 40.
- **Cards:**
  - **right.** Database index
    Result: "The database now has a lookup list by recipient. It jumps straight to the right 40."
  - **wrong.** Caching
    Why not: "A saved copy hides it for a moment. The first load of every inbox is still slow."
  - **wrong.** Stateless servers
    Why not: "Logins are fine. The slow part is the database reading every row."
- **Nudge:** "Remember The Slow Lookup? Why read every page to find one thing?"
- **Clue 2:** "Forty messages should open at once. The database is reading every row to find them."
- **Also seen as:** "Any screen that is slow because the database reads every row."

---

# Stage 4

## R5 The Contractor Keys

- **Pattern:** Role-based access control (RBAC)
- **First learned in:** 1.1 The Open Door
- **Arrives by:** Email from Lena. "We took on 200 contractors. Every one of them can open the payroll tools."
- **Users gained:** 5,000,000
- **Sees:** A crowd wearing Contractor badges walks into a room marked Payroll.
- **Cards:**
  - **right.** Role-based access control (RBAC)
    Result: "Contractors get a contractor role. Payroll opens for the Finance role only."
  - **wrong.** Stateless servers
    Why not: "Their logins work as they should. The problem is what they can open once inside."
  - **wrong.** Password hashing
    Why not: "Their passwords are safe. The problem is what they are allowed to open."
- **Nudge:** "Remember The Open Door and The Refund Button? Check the role, every time."
- **Clue 2:** "These are real logins, used by real staff. The problem is what a contractor is allowed to open."
- **Also seen as:** "New kinds of staff who can see too much."

## R6 The Stuck Upload

- **Pattern:** Message queue
- **First learned in:** 3.3 The Frozen Sign-up
- **Arrives by:** Email from a customer. "Posting a photo freezes my app for 20 seconds."
- **Users gained:** 10,000,000
- **Sees:** An upload arrow waits at the Server while it makes five sizes of the same photo. A spinner turns.
- **Cards:**
  - **right.** Message queue
    Result: "The photo posts at once. Background workers make the other sizes a moment later."
  - **wrong.** CDN
    Why not: "The CDN speeds up viewing photos. The wait here is the resizing during upload."
  - **wrong.** Read replicas
    Why not: "This is not a reading problem. The server is doing slow work while the user waits."
- **Nudge:** "Remember The Frozen Sign-up? Does the user need to wait for this?"
- **Clue 2:** "The photo is already saved. The extra work after it does not need the user to wait."
- **Also seen as:** "Uploads that freeze while the server does extra work."

## R7 The Trending Crush

- **Pattern:** Caching
- **First learned in:** 2.1 The Melting Database
- **Arrives by:** Email from Sam. "Every time something big happens, the Trending page takes Blip down. Tonight is the cup final."
- **Users gained:** 15,000,000
- **Sees:** Every user asks for the same Trending list. The databases rebuild it from scratch each time and glow red.
- **Cards:**
  - **right.** Caching
    Result: "The Trending list is built once a minute and kept ready. Everyone gets the saved copy."
  - **wrong.** Sharding
    Why not: "Splitting the data does not help when everyone wants the very same list."
  - **wrong.** Read replicas
    Why not: "More copies share the pain, but each one still rebuilds the same list for every visitor."
- **Nudge:** "Remember The Melting Database and The Profile Stampede? Same answer, asked again and again."
- **Clue 2:** "The Trending page is the same list for everyone. Work it out once and hand out copies."
- **Also seen as:** "A list that is the same for everyone."

---

# Stage 5

## R8 The Twice-Run Job

- **Pattern:** Idempotency keys
- **First learned in:** 1.3 The Double Charge
- **Arrives by:** Server alert. "Payout worker crashed. The job ran again. 3,000 creators were paid twice."
- **Users gained:** 50,000,000
- **Sees:** A Worker box flashes and restarts. The Queue hands it the same job again. Two payments leave.
- **Cards:**
  - **right.** Idempotency keys
    Result: "Each payout carries a unique ticket. A job that runs twice still pays once."
  - **wrong.** Message queue
    Why not: "The queue did its job. Queues can deliver a job twice, so the job itself must be safe to repeat."
  - **wrong.** Load balancing
    Why not: "More workers would only run the repeated job sooner."
- **Nudge:** "Remember The Double Charge and The Triple Message? Repeats will happen. Make them harmless."
- **Clue 2:** "Crashed jobs will run again. Give each payout a ticket, so a rerun can see it was already paid."
- **Also seen as:** "Background jobs that run twice after a crash."

## R9 The Support Search

- **Pattern:** Database index
- **First learned in:** 2.2 The Slow Lookup
- **Arrives by:** Email from Omar. "Finding a customer by email address takes 30 seconds. We answer 10,000 tickets a day."
- **Users gained:** 50,000,000
- **Sees:** Every shard reads row after row, hunting for one email address.
- **Cards:**
  - **right.** Database index
    Result: "Each shard now has a lookup list by email address. Searches take milliseconds."
  - **wrong.** Multi-region
    Why not: "The database is already close by. Reading every row is what takes the time."
  - **wrong.** Sharding
    Why not: "The data is already split. Each piece still reads every row."
- **Nudge:** "Remember The Slow Lookup and The Slow Inbox? A new kind of search needs its own lookup list."
- **Clue 2:** "Searching by email address is new. Nobody made a lookup list for email addresses."
- **Also seen as:** "A new way of searching that nobody added a lookup list for."

## R10 The Export That Never Finishes

- **Pattern:** Message queue
- **First learned in:** 3.3 The Frozen Sign-up
- **Arrives by:** Email from a customer. "Download My Data fails every time. I have nine years of posts!"
- **Users gained:** 100,000,000
- **Sees:** A request arrow waits while the Server gathers years of posts. The arrow snaps before it finishes.
- **Cards:**
  - **right.** Message queue
    Result: "The export runs in the background. The user gets a download link when it is ready."
  - **wrong.** Caching
    Why not: "Every export is different, so there is no saved copy to reuse."
  - **wrong.** Failover
    Why not: "Nothing has broken down. The work is simply too slow to do while someone waits."
- **Nudge:** "Remember The Frozen Sign-up and The Stuck Upload? Slow work belongs in the background."
- **Clue 2:** "Nine years of posts cannot be packed while the user waits. Do it out of sight and send a link."
- **Also seen as:** "Big reports and exports that time out."
