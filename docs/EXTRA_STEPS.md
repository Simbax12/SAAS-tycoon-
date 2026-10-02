# Extra steps: the 5 Triage steps and 3 Tune steps

Some incidents have an extra step that uses one of the work apps on the desktop.

- A **Triage** step comes before the fix. The player opens Terminal and finds the log line that shows the real cause.
- A **Tune** step comes after the fix. The player opens SysDash and sets a dial for three waves of traffic.

Copy these into a typed data file exactly as written. Do not add, remove or reword anything. If something looks wrong, ask.

The rules for how these steps play, and what they pay, are in GAME_DESIGN.md. The incidents they attach to are in CHALLENGES.md and REPEATS.md.

## Log sources

Each log line starts with the short name of the thing that wrote it, the way real logs do.

| Source | Stands for |
|---|---|
| nginx | Nginx |
| node | Node.js |
| postgres | PostgreSQL |
| redis | Redis |
| cloudflare | Cloudflare |
| stripe | Stripe |
| worker | Background worker |

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
