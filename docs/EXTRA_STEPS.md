# Extra steps: the 10 Triage steps and 5 Tune steps

Some incidents have an extra step that uses one of the work apps on the desktop.

- A **Triage** step comes before the fix. The player opens Terminal, types the step's command to read the log, and finds the line that shows the real cause. Each step teaches one command (see "Terminal lessons").
- A **Tune** step comes after the fix. The player opens SysDash and sets a dial for three waves of traffic.

Copy these into a typed data file exactly as written. Do not add, remove or reword anything. If something looks wrong, ask.

The rules for how these steps play, and what they pay, are in GAME_DESIGN.md. The incidents they attach to are in CHALLENGES.md and REPEATS.md.

## Log sources

Each log line starts with the short name of the thing that wrote it, the way real logs do. "Part" is the toolbox part it belongs to (see BLUEPRINTS.md > The parts). The info button on a log line shows the part's "What it is" line.

| Source | Stands for | Part |
|---|---|---|
| nginx | Nginx | Web server |
| node | Node.js | Web server |
| postgres | PostgreSQL | Database |
| redis | Redis | Cache |
| cloudflare | Cloudflare | CDN |
| stripe | Stripe | Payment provider |
| worker | Background worker | Background worker |

## Log levels

Each log line has a level. The info button on a log line shows what its level means.

| Level | Means |
|---|---|
| INFO | Normal news. Something worked as expected. |
| WARN | Something looks odd. Not broken yet. |
| ERROR | Something failed and needs fixing. |

## How to read a Triage step

- **The heading** names the incident the step belongs to.
- **Lines:** six log lines, shown in a shuffled order. Each has a kind, a level, a source and a message.
  - `cause` is the line the player must find. There is exactly one.
  - `symptom` is a tempting line that shows the effect, not the cause. There is exactly one.
  - `routine` lines are ordinary noise.
- **Why:** shown when the player taps the cause.

## How to read a Tune step

- **The heading** names the incident the step belongs to.
- **Dial:** the name of the one slider.
- **Stops:** the positions the slider snaps to, lowest first.
- **Fact:** one line shown above the dial for the whole step.
- **Waves:** three situations, played in order. "Right" is the stop that is just right for that wave.
- **Too low**, **Too high**, **Just right:** shown after a wave runs.
- **Lesson:** shown when the step ends.

---

# Triage steps

## T1 on 1.2 The Leaked Passwords

- **Lines:**
  - **routine.** INFO nginx: "Home page loaded in 0.2 seconds"
  - **routine.** INFO node: "Server started on port 3000"
  - **symptom.** WARN nginx: "Very large download at 03:12"
  - **cause.** ERROR postgres: "Export of users table included readable passwords"
  - **routine.** INFO node: "User 14 logged in"
  - **routine.** INFO postgres: "Nightly backup finished"
- **Why:** "The download is the symptom. The real fault is that the passwords could be read at all."

## T2 on 2.1 The Melting Database

- **Lines:**
  - **routine.** INFO node: "User 88 logged in"
  - **symptom.** WARN node: "Page took 2.9 seconds to answer"
  - **routine.** INFO postgres: "Nightly backup finished"
  - **cause.** WARN postgres: "Same query ran 4,812 times in one second"
  - **routine.** INFO nginx: "Health check passed"
  - **routine.** INFO node: "Password changed for user 31"
- **Why:** "Slow pages are the symptom. The cause is one question being asked thousands of times."

## T3 on 3.1 The Lonely Server

- **Lines:**
  - **routine.** INFO redis: "Cache hit for popular posts"
  - **symptom.** ERROR nginx: "502 Bad Gateway for 6 minutes"
  - **cause.** ERROR node: "Out of memory. The only server restarted"
  - **routine.** INFO postgres: "Database load at 20%"
  - **routine.** INFO cloudflare: "Photos served from the CDN"
  - **routine.** INFO node: "User 5,120 signed up"
- **Why:** "502 means the server behind did not answer. With one server, one crash stops everything."

## T4 on 4.3 The Celebrity Post

- **Lines:**
  - **routine.** INFO nginx: "Traffic shared across 3 servers"
  - **symptom.** WARN node: "Opening the app took 9 seconds"
  - **cause.** ERROR worker: "50,000,000 feed copies queued for one post"
  - **routine.** INFO postgres: "Replica 2 is up to date"
  - **routine.** INFO redis: "Session found for user 901"
  - **routine.** INFO stripe: "Payment 7,731 accepted"
- **Why:** "The slow app is the symptom. One post created fifty million jobs at once."

## T5 on 5.3 The Flood Attack

- **Lines:**
  - **routine.** INFO cloudflare: "Photos served from the CDN"
  - **symptom.** ERROR nginx: "Real users are timing out"
  - **cause.** WARN nginx: "One visitor sent 9,000 requests this minute"
  - **routine.** INFO postgres: "All three regions are in step"
  - **routine.** INFO worker: "Welcome email sent"
  - **routine.** INFO node: "Health check passed"
- **Why:** "Timeouts are the symptom. No real person sends 9,000 requests a minute."

## T6 on 1.4 The Key in the Code

- **Lines:**
  - **routine.** INFO node: "User 212 logged in"
  - **symptom.** WARN stripe: "40 payments made from an unknown computer"
  - **routine.** INFO postgres: "Nightly backup finished"
  - **cause.** WARN node: "Payment key loaded from the code, not a safe store"
  - **routine.** INFO nginx: "Health check passed"
  - **routine.** INFO stripe: "Payment 118 accepted"
- **Why:** "The strange payments are the symptom. The cause is a key that anyone with the code could read."

## T7 on 2.4 The Chatty Feed

- **Lines:**
  - **routine.** INFO redis: "Cache hit for popular posts"
  - **symptom.** WARN node: "Feed took 3 seconds to answer"
  - **cause.** WARN postgres: "51 queries for one feed page"
  - **routine.** INFO node: "User 402 signed up"
  - **routine.** INFO postgres: "Database load at 30%"
  - **routine.** INFO nginx: "Health check passed"
- **Why:** "The slow feed is the symptom. The cause is one page asking the database 51 times."

## T8 on 3.4 The Domino Effect

- **Lines:**
  - **symptom.** ERROR nginx: "504 Gateway Timeout on every page"
  - **routine.** INFO redis: "Session found for user 7,310"
  - **cause.** ERROR node: "Fraud check gave no answer after 30 seconds"
  - **routine.** INFO postgres: "Database load at 25%"
  - **routine.** INFO worker: "Welcome email sent"
  - **routine.** INFO cloudflare: "Photos served from the CDN"
- **Why:** "Timeouts everywhere are the symptom. Every server is stuck waiting on one broken outside service."

## T9 on 4.4 The Search That Gave Up

- **Lines:**
  - **routine.** INFO postgres: "Replica 1 is up to date"
  - **symptom.** WARN node: "Search took 40 seconds, then gave up"
  - **routine.** INFO redis: "Cache hit for the Trending list"
  - **cause.** WARN postgres: "Search read every post on all shards"
  - **routine.** INFO worker: "Photo resized to five sizes"
  - **routine.** INFO nginx: "Traffic shared across 3 servers"
- **Why:** "The slow search is the symptom. The cause is reading every post to find two words."

## T10 on 5.4 The Bad Update

- **Lines:**
  - **symptom.** ERROR stripe: "Payment failures up 300% in every region"
  - **routine.** INFO postgres: "All three regions are in step"
  - **cause.** INFO node: "New checkout code released to 100% of users"
  - **routine.** INFO cloudflare: "Photos served from the CDN"
  - **routine.** INFO node: "Health check passed"
  - **routine.** INFO worker: "Export ready for user 55"
- **Why:** "The failures are the symptom. The cause is new code going to everyone at once. Look for what changed."

---

# Terminal lessons

Each Triage step is also a short lesson that teaches one real command. The commands run for real on the step's six log lines, in a file called blip.log.

## How a command runs

A log line reads as its level, its source, a colon and its message, for example `ERROR postgres: Export of users table included readable passwords`.

| Command | What it prints |
|---|---|
| `cat blip.log` | Every line |
| `tail blip.log` | The newest lines. The file is short, so this is every line |
| `grep WORD blip.log` | Only lines that contain WORD. Upper and lower case must match |
| `grep -v WORD blip.log` | Only lines that do not contain WORD |
| `grep -i WORD blip.log` | Lines that contain WORD in any case |
| `grep -E "A\|B" blip.log` | Lines that contain A or B |
| `journalctl -p warning` | The system's own log, warnings and worse: WARN and ERROR lines |
| `ls` | The files here: blip.log |
| `clear` | Clears the screen |
| `help` | "Type the command in the task. Stuck? Tap Hint." |

Messages for a command that is not right:

| When | Message |
|---|---|
| The first word is not a command above | "COMMAND: command not found" |
| The file is not blip.log | "FILE: No such file or directory" |
| The command works but is not the task's | "That works, but the task asks for something else." |

## How to read a lesson

- **The heading** names the Triage step the lesson belongs to.
- **Command:** the command Task 1 asks for. Spaces and either kind of quote marks do not matter.
- **Learn:** what the command does, shown above the tasks.
- **Task:** Task 1's words. Task 2 is always "Tap the line that caused this."
- The command must keep the step's cause line.

## Lesson for T1

- **Command:** `cat blip.log`
- **Learn:** "Servers write a log: one line for everything they do. cat prints a whole file to the screen."
- **Task:** "Print the whole of blip.log."

## Lesson for T6

- **Command:** `tail blip.log`
- **Learn:** "Logs grow all day long. tail shows only the newest lines, at the end of the file."
- **Task:** "Show the newest lines of blip.log."

## Lesson for T2

- **Command:** `grep WARN blip.log`
- **Learn:** "grep keeps only the lines that contain a word. Search for WARN to see what looks odd."
- **Task:** "Keep only the WARN lines."

## Lesson for T7

- **Command:** `grep -v INFO blip.log`
- **Learn:** "grep -v does the opposite: it hides lines with a word. INFO lines are normal news."
- **Task:** "Hide every INFO line."

## Lesson for T3

- **Command:** `grep ERROR blip.log`
- **Learn:** "When something is down, start with the errors. grep ERROR keeps only the failures."
- **Task:** "Find the ERROR lines."

## Lesson for T8

- **Command:** `grep -i error blip.log`
- **Learn:** "grep cares about upper and lower case. Add -i to match error, Error and ERROR."
- **Task:** "Find the errors, in any case."

## Lesson for T4

- **Command:** `grep -E "WARN|ERROR" blip.log`
- **Learn:** "grep -E can look for several words at once. The bar between them means or."
- **Task:** "Show the WARN and ERROR lines together."

## Lesson for T9

- **Command:** `journalctl -p warning`
- **Learn:** "journalctl reads the system's own log. -p warning shows warnings and anything worse."
- **Task:** "Show warnings and worse from the system log."

## Lesson for T10

- **Command:** `grep node blip.log`
- **Learn:** "To check one service, grep for its name. node runs Blip's code, so new releases land there."
- **Task:** "Show only the node lines."

## Lesson for T5

- **Command:** `grep nginx blip.log`
- **Learn:** "nginx is Blip's front door. Every visitor passes it, so attacks show up there first."
- **Task:** "Show only the nginx lines."

---

# Tune steps

## U1 on 3.1 The Lonely Server

- **Dial:** Web servers
- **Stops:** 1 / 2 / 4 / 8
- **Fact:** "One server can handle 20,000 people. Above 90% is overloaded. Below 40% is wasteful."
- **Waves:**
  - "Quiet night. 20,000 people online." Right: 2
  - "Lunchtime. 60,000 people online." Right: 4
  - "A post goes viral. 140,000 people online." Right: 8
- **Too low:** "Overloaded. The servers are above 90% and pages are failing."
- **Too high:** "Wasteful. We are paying for servers that sit idle."
- **Just right:** "Steady. Every server is busy but none is struggling."
- **Lesson:** "Add servers when traffic rises and remove them when it falls. This is called auto-scaling."

## U2 on R7 The Trending Crush

- **Dial:** Keep the saved copy for
- **Stops:** 1 second / 1 minute / 1 hour / 1 day
- **Fact:** "A saved copy is fast, but it can be out of date."
- **Waves:**
  - "The Trending list. It changes every few minutes." Right: 1 minute
  - "A profile photo. It changes a few times a year." Right: 1 day
  - "The unread message count. It changes whenever a message arrives." Right: 1 second
- **Too low:** "Too fresh. The database is being asked far more often than it needs to be."
- **Too high:** "Too stale. People are seeing old information."
- **Just right:** "Fresh enough for people, calm enough for the database."
- **Lesson:** "The slower something changes, the longer its copy can be kept. This setting is called a time to live, or TTL."

## U3 on 5.3 The Flood Attack

- **Dial:** Requests allowed per visitor each minute
- **Stops:** 10 / 100 / 1,000 / 10,000
- **Fact:** "A real person makes a few requests a minute. A bot makes thousands."
- **Waves:**
  - "Under attack. Real people make up to 60 a minute. Bots make 5,000." Right: 100
  - "Sale day. Shoppers refresh a lot, up to 600 a minute." Right: 1,000
  - "Quiet night. Real people make up to 8 a minute." Right: 10
- **Too low:** "Too strict. Real people are being blocked."
- **Too high:** "Too loose. Bots are getting through."
- **Just right:** "Real people get through. Bots hit the limit."
- **Lesson:** "Set the limit just above what real people need, and raise it for busy days."

## U4 on 3.4 The Domino Effect

- **Dial:** Seconds to wait for an answer
- **Stops:** 0.1 seconds / 1 second / 10 seconds / 60 seconds
- **Fact:** "A broken service never answers. While we wait, one of our servers sits stuck."
- **Waves:**
  - "The fraud checker. It usually answers in 0.2 seconds." Right: 1 second
  - "A partner's report service. It usually takes 6 seconds." Right: 10 seconds
  - "The cache. It usually answers in 0.001 seconds." Right: 0.1 seconds
- **Too low:** "Too impatient. Healthy answers are being cut off."
- **Too high:** "Too patient. A broken service ties up our servers."
- **Just right:** "Healthy answers get through. Broken calls give up quickly."
- **Lesson:** "Wait a little longer than a service normally takes, and no more. The circuit breaker handles the rest."

## U5 on 5.4 The Bad Update

- **Dial:** Who gets the new code
- **Stops:** Staff only / 1% of users / 25% of users / Everyone
- **Fact:** "Start small. Give it to more people only when nothing has gone wrong."
- **Waves:**
  - "Day one. The new checkout has never met a real customer." Right: Staff only
  - "Staff have used it for a week. No problems." Right: 1% of users
  - "A quarter of users for two weeks. Errors match the old code." Right: Everyone
- **Too low:** "Too careful. The new code is fine, but almost nobody gets it."
- **Too high:** "Too fast. If there is a bug, too many people meet it."
- **Just right:** "A safe step. Big enough to learn from, small enough to undo."
- **Lesson:** "Turn new code on in steps. Grow the share only when the last step looked healthy."
