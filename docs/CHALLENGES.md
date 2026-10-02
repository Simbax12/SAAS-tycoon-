# Challenges: the 15 new incidents

Copy these into a typed data file exactly as written. Do not add, remove or reword incidents, options, answers or hints. If something looks wrong, ask.

The 10 repeat incidents are in REPEATS.md. The 5 Build incidents are in BLUEPRINTS.md. Triage and Tune steps that attach to these incidents are in EXTRA_STEPS.md. The order everything is played in is in the play order table in GAME_DESIGN.md.

## How to read an incident

- **Starts:** "automatic" means it begins when the one before it in the play order is solved. A feature id means the player must buy that feature first.
- **Arrives by:** a server alert or an email, with the exact text. This is what the player sees first.
- **Users gained:** added to the user count when this incident is solved.
- **Sees:** the animation that shows the problem on the diagram.
- **Maya:** her one-sentence explanation, shown after the player taps Investigate.
- **Options:** each has a type, a plain description (large text), an industry label (small text) and a Result sentence. They are shown in a shuffled order.
- **Removed by:** an upgrade that removes this option from the start (see UPGRADES.md).
- **Nudge:** Hint 1.
- **Pattern Book:** the entry the player earns.
- **Map change:** what is added to the System Map.

Base cash comes from the stage (see GAME_DESIGN.md).

---

# Stage 1: Garage (0 to 1,000 users)

One server does everything. The app and the database live on the same machine.

## 1.1 The Open Door

- **Starts:** automatic. This is the tutorial incident.
- **Arrives by:** Email from Maya. "Your first job. Something is wrong with our admin page. Tap Investigate and take a look."
- **Users gained:** 200
- **Sees:** A free user walks straight into a room marked Admin.
- **Maya:** "Anyone can open our admin page just by typing /admin in the address bar."
- **Options:**
  - **best.** "Check every request on the server: is this user allowed in?"
    Label: Role-based access control (RBAC)
    Result: "The server now checks each user's role. Only admins get in."
  - **partial.** "Hide the admin link from the menu."
    Label: Hiding the link
    Result: "The link is gone, but typing the address still works."
  - **bad.** "Change the admin address to a long secret one."
    Label: Secret URL
    Result: "The secret address leaked through a shared link. Strangers are inside."
- **Nudge:** "Where should the check happen so that nobody can skip it?"
- **Pattern Book:** Role-based access control (RBAC). "Use this when different users are allowed to do different things."
- **Map change:** A shield appears on the Server box.

## 1.2 The Leaked Passwords

- **Starts:** automatic
- **Arrives by:** Server alert. "Unusual download. The whole user table was copied at 03:12."
- **Users gained:** 300
- **Sees:** The Database box shows passwords as readable text. A copy of the database slips out of the building.
- **Maya:** "A copy of our database leaked, and every password in it can be read."
- **Options:**
  - **best.** "Store a one-way scramble of each password, mixed with random data that is different for every user."
    Label: Salted password hashing (bcrypt or Argon2)
    Result: "Stolen data is now useless. Nobody can turn the scramble back into a password."
  - **partial.** "Lock all the passwords with one secret key."
    Label: Reversible encryption
    Result: "Better, but if that one key is stolen, every password opens at once."
  - **bad.** "Scramble passwords with a quick, old method and no random data."
    Label: Fast unsalted hash (MD5)
    Result: "Attackers cracked most of them in minutes using lists of known scrambles."
- **Nudge:** "Do we ever need to read a password back? Or only check that it matches?"
- **Pattern Book:** Password hashing. "Use this whenever you store passwords. Never store the real thing."
- **Map change:** A padlock appears on the Database box.

## 1.3 The Double Charge

- **Starts:** feat-payments
- **Arrives by:** Email from a customer. "You charged me twice for Blip Plus. I only tapped Pay once!"
- **Users gained:** 250
- **Sees:** One tap on Pay sends two arrows to the Payments box. Two charges appear.
- **Maya:** "People tap Pay twice, or their phone retries, and we charge them twice."
- **Options:**
  - **best.** "Give every payment attempt a unique ticket. If the same ticket arrives again, ignore it."
    Label: Idempotency keys
    Result: "Repeats are spotted and ignored. One tap, one charge."
  - **partial.** "Grey out the Pay button after the first tap."
    Label: Disable the button
    Result: "Double taps stopped, but phones on bad signal still retry and double charge."
  - **bad.** "Automatically retry any payment that seems slow."
    Label: Blind retries
    Result: "Slow payments were not failed payments. Some people are now charged three times."
- **Nudge:** "How could the server tell a repeat from a new payment?"
- **Pattern Book:** Idempotency keys. "Use this when doing something twice by accident would cause harm, like a payment."
- **Map change:** A key appears on the arrow from Server to Payments.

---

# Stage 2: First office (1,000 to 100,000 users)

The app and the database are now on separate machines. The database is the weak point.

## 2.1 The Melting Database

- **Starts:** automatic
- **Arrives by:** Server alert. "Database at 99%. Pages are timing out."
- **Users gained:** 9,000
- **Sees:** Thousands of identical arrows run from Server to Database. The Database glows red at 99%.
- **Maya:** "Every visitor asks the database for the same popular posts. It is at 99%."
- **Options:**
  - **best.** "Keep a ready-made copy of popular answers in fast memory. Only ask the database when the copy is missing or old."
    Label: Caching (cache-aside with Redis)
    Result: "Most requests never reach the database. Load drops from 99% to 15%."
  - **partial.** "Buy a bigger database server."
    Label: Vertical scaling
    Result: "It bought us a few weeks at triple the cost. Growth will fill it again."
    Removed by: srv-bigger
  - **bad.** "Add more app servers."
    Label: More app servers
    Result: "More servers sent even more questions to the same tired database."
- **Nudge:** "The answer is the same every time. Do we need to ask every time?"
- **Pattern Book:** Caching. "Use this when many people ask for the same thing and it rarely changes."
- **Map change:** A Cache box appears between Server and Database.

## 2.2 The Slow Lookup

- **Starts:** automatic
- **Arrives by:** Email from a customer. "Searching for my friend's name takes forever. Is Blip broken?"
- **Users gained:** 20,000
- **Sees:** The Database flips through every row one by one to find a single user. A clock spins.
- **Maya:** "Finding one user by name takes 4 seconds. The database reads every row to find them."
- **Options:**
  - **best.** "Give the database a sorted lookup list for usernames, like the index at the back of a book."
    Label: Database index
    Result: "The database jumps straight to the right row. 4 seconds became 4 milliseconds."
  - **partial.** "Remember recent lookups in the cache."
    Label: Cache the lookups
    Result: "Repeat lookups are fast, but most names are searched once, so most are still slow."
  - **bad.** "Load every user into the app's memory and search there."
    Label: In-memory copy
    Result: "The app ran out of memory and crashed."
- **Nudge:** "How do you find a word in a book without reading every page?"
- **Pattern Book:** Database index. "Use this when you often search a big table by the same field."
- **Map change:** An index tab appears on the Database box.

## 2.3 The Heavy Photos

- **Starts:** feat-photos
- **Arrives by:** Email from Sam. "Photos are a hit, but people say they load slowly. Can you look?"
- **Users gained:** 20,000
- **Sees:** Large photo files crawl from the Server to faraway users. The Server's network bar is red.
- **Maya:** "Photos load slowly, and our server spends all its effort sending image files."
- **Options:**
  - **best.** "Keep photos in file storage and serve copies from servers close to each user."
    Label: CDN (content delivery network) with object storage
    Result: "Photos now come from nearby. Our server is free to do real work."
  - **partial.** "Shrink the photo files."
    Label: Image compression
    Result: "Smaller files help, but everything still travels from one place."
  - **bad.** "Save the photos inside the database."
    Label: Files in the database
    Result: "The database ballooned and every query got slower."
- **Nudge:** "What if the photos did not have to travel so far?"
- **Pattern Book:** CDN. "Use this for files that are the same for everyone, like images and video."
- **Map change:** A Storage box appears, and a ring of small CDN boxes appears near Users.

---

# Stage 3: Scale-up (100,000 to 10 million users)

One app server can no longer cope.

## 3.1 The Lonely Server

- **Starts:** automatic
- **Arrives by:** Server alert. "Server at 100%. Blip was unreachable for 6 minutes."
- **Users gained:** 900,000
- **Sees:** The single Server box sits at 100% and flickers. Each time it flickers, every user turns grey.
- **Maya:** "Our one server is full at peak time. When it crashes, all of Blip goes down."
- **Options:**
  - **best.** "Run several servers, with a traffic director in front to share out the visitors."
    Label: Load balancer with horizontal scaling
    Result: "Traffic is shared. If one server dies, the others carry on."
  - **partial.** "Buy one much bigger server."
    Label: Vertical scaling
    Result: "More room for now, but it is still one machine. One crash still takes everything down."
    Removed by: srv-bigger
  - **bad.** "Restart the server automatically whenever it slows down."
    Label: Auto-restart
    Result: "Every restart kicked out everyone online. Peak time became restart time."
- **Nudge:** "What is safer than one strong server?"
- **Pattern Book:** Load balancing. "Use this when one server cannot handle the traffic, or when one crash must not stop everything."
- **Map change:** A Load Balancer box appears. The Server box becomes three.

## 3.2 The Vanishing Login

- **Starts:** automatic
- **Arrives by:** Email from a customer. "Blip keeps logging me out every few taps. So annoying!"
- **Users gained:** 1,500,000
- **Sees:** A user logs in on Server 1. Their next tap goes to Server 2, which shows a question mark.
- **Maya:** "Since we added servers, people keep getting logged out. Each server only remembers its own visitors."
- **Options:**
  - **best.** "Keep login records in one shared place that every server can check."
    Label: Shared session store (stateless servers)
    Result: "Any server can serve any user. Servers can come and go freely."
  - **partial.** "Always send each user back to the same server."
    Label: Sticky sessions
    Result: "It works until that server dies. Then everyone on it is logged out."
  - **bad.** "Make logins last much longer."
    Label: Longer sessions
    Result: "Nothing changed. The other servers still never knew about the login."
- **Nudge:** "The login is saved where only one server can see it. Where else could it live?"
- **Pattern Book:** Stateless servers. "Use this whenever you run more than one server."
- **Map change:** A Session Store box appears, joined to all three servers.

## 3.3 The Frozen Sign-up

- **Starts:** feat-email
- **Arrives by:** Email from Zoe. "Sign-ups halved today. People say the sign-up page just hangs."
- **Users gained:** 2,000,000
- **Sees:** A sign-up arrow gets stuck at the Email box with a spinner. A line of waiting users builds up.
- **Maya:** "Sign-up waits for the welcome email to send. When email is slow, sign-up freezes."
- **Options:**
  - **best.** "Put the email job on a to-do list and finish sign-up straight away. Background workers send it later."
    Label: Message queue with background workers
    Result: "Sign-up is instant. The email follows a few seconds later."
  - **partial.** "Wait longer before giving up."
    Label: Longer timeout
    Result: "Fewer errors, but people now stare at a spinner for 30 seconds."
  - **bad.** "Keep retrying the email instantly until it works."
    Label: Instant retries
    Result: "We flooded the email service and it blocked us completely."
- **Nudge:** "Does the user need the email to be sent before they can carry on?"
- **Pattern Book:** Message queue. "Use this for slow work that the user does not need to wait for."
- **Map change:** A Queue box and a Worker box appear.

---

# Stage 4: Big tech (10 million to 100 million users)

The data itself is now the problem.

## 4.1 The Read Flood

- **Starts:** automatic
- **Arrives by:** Server alert. "Database at 98%. Nearly all of the traffic is reads."
- **Users gained:** 10,000,000
- **Sees:** A huge stream of arrows marked Read and a thin stream marked Write all hit one Database. It glows red.
- **Maya:** "Most traffic is people reading. One database cannot answer them all, even with the cache."
- **Options:**
  - **best.** "Make copies of the database that only answer reads. Send all writes to the main one."
    Label: Read replicas
    Result: "Reads are spread across the copies. The main database can breathe."
  - **partial.** "Move to the biggest database machine that exists."
    Label: Vertical scaling
    Result: "Very expensive, and there is no bigger machine after this one."
  - **bad.** "Have the app write every change to several databases itself."
    Label: Dual writes
    Result: "Some writes failed halfway. The databases now disagree with each other."
- **Nudge:** "Reading and writing are different jobs. Do they need the same machine?"
- **Pattern Book:** Read replicas. "Use this when reads far outnumber writes. Copies can be a moment behind."
- **Map change:** The Database becomes one Primary box with two Replica boxes.

## 4.2 The Table That Got Too Big

- **Starts:** automatic
- **Arrives by:** Server alert. "Disk 96% full. The messages table has 4 billion rows."
- **Users gained:** 15,000,000
- **Sees:** The Messages table overflows its box. Write arrows slow to a crawl.
- **Maya:** "The messages table has billions of rows. It no longer fits on one machine."
- **Options:**
  - **best.** "Split the data across many databases, using the user ID to decide where each row lives."
    Label: Sharding
    Result: "Each database holds a slice. The load is spread evenly."
  - **partial.** "Move old messages into cheap storage."
    Label: Archiving
    Result: "The table shrank for a while, but new messages are filling it again."
  - **bad.** "Start a new database each month for that month's new sign-ups."
    Label: Sharding by sign-up date
    Result: "The newest database gets most of the traffic. It is overloaded while the old ones sit idle."
    Removed by: srv-analytics
- **Nudge:** "How can we split the data so that every piece gets a fair share of the work?"
- **Pattern Book:** Sharding. "Use this when the data is too big for one database. Pick a key that spreads the load evenly."
- **Map change:** The Primary box splits into Shard 1, Shard 2 and Shard 3.

## 4.3 The Celebrity Post

- **Starts:** feat-verified
- **Arrives by:** Email from Sam. "Our biggest star just posted and Blip slowed to a crawl. Her manager is on the phone."
- **Users gained:** 15,000,000
- **Sees:** A celebrity posts. Millions of arrows fan out at once. The Queue box overflows.
- **Maya:** "A star with 50 million followers posted. We tried to copy it into 50 million feeds at once."
- **Options:**
  - **best.** "Deliver normal posts to followers' feeds as before. For huge accounts, fetch their posts only when a follower opens the app."
    Label: Hybrid fan-out
    Result: "Normal posts stay fast. Celebrity posts no longer cause a flood."
  - **partial.** "Add more background workers."
    Label: More workers
    Result: "The flood clears faster, but each celebrity post still means 50 million writes."
  - **bad.** "Build every feed from scratch each time someone opens the app."
    Label: Fan-out on read for everyone
    Result: "Opening the app now takes seconds for every single user."
    Removed by: srv-analytics
- **Nudge:** "Should a post from a star be handled the same way as a post from you or me?"
- **Pattern Book:** Fan-out. "Use this when one action must reach many people. Push to small audiences, pull for huge ones."
- **Map change:** A Feed Service box appears with two paths: Push and Pull.

---

# Stage 5: Planet scale (100 million to 1 billion users)

Blip is everywhere. Distance, disasters and attackers are the new problems.

## 5.1 The Slow Side of the World

- **Starts:** feat-global
- **Arrives by:** Email from a customer. "Blip is so slow here in Sydney. Every tap takes seconds."
- **Users gained:** 100,000,000
- **Sees:** A world map. All servers sit in one spot. Long arrows stretch to faraway users, each with a snail on it.
- **Maya:** "Users far away wait 2 seconds per tap. Every request crosses the ocean to our one data centre."
- **Options:**
  - **best.** "Run servers and copies of the data in several parts of the world. Send each user to the nearest."
    Label: Multi-region deployment
    Result: "Everyone talks to a nearby region. Taps feel instant worldwide."
  - **partial.** "Put more content on the CDN."
    Label: More CDN
    Result: "Photos are fast, but posting and messaging still cross the ocean."
  - **bad.** "Buy faster servers for the one data centre."
    Label: Faster servers
    Result: "The servers were never the slow part. The distance was."
- **Nudge:** "The servers are fast. Which part of the journey is slow?"
- **Pattern Book:** Multi-region. "Use this when your users are spread around the world."
- **Map change:** The map switches to a world view with three regions.

## 5.2 The Blackout

- **Starts:** automatic
- **Arrives by:** Server alert. "Region down. No response from one of our three regions."
- **Users gained:** 150,000,000
- **Sees:** One region on the world map goes dark. Its users turn grey.
- **Maya:** "A whole region just lost power. A third of our users cannot reach Blip."
- **Options:**
  - **best.** "Check each region's health all the time. When one fails, send its users to a healthy region automatically."
    Label: Automatic failover
    Result: "Users were moved in seconds. Most never noticed."
  - **partial.** "Write a step-by-step guide so engineers can switch regions by hand."
    Label: Manual failover
    Result: "It worked, but it took an hour to wake people up and follow the steps."
  - **bad.** "Rely on last night's backup to rebuild the region."
    Label: Restore from backup
    Result: "Rebuilding took hours, and everything since last night was lost."
    Removed by: srv-drills
- **Nudge:** "Who reacts faster at 3am: a person or an automatic health check?"
- **Pattern Book:** Failover. "Use this when downtime is costly. Practise it before you need it."
- **Map change:** Heartbeat lines appear between the three regions.

## 5.3 The Flood Attack

- **Starts:** automatic. This is the final incident.
- **Arrives by:** Server alert. "Traffic is 40 times normal. Most of it looks fake."
- **Users gained:** 200,000,000
- **Sees:** A swarm of red arrows from all over the map hits the front door. Real users are squeezed out.
- **Maya:** "Millions of fake requests a second are hitting us. Real users cannot get through."
- **Options:**
  - **best.** "Limit how many requests each visitor can make, and filter out bad traffic before it reaches our servers."
    Label: Rate limiting with DDoS protection
    Result: "Bots are stopped at the door. Real users get through."
  - **partial.** "Add more servers to soak it up."
    Label: Scaling out
    Result: "It held briefly, at huge cost. The attacker just sent more."
  - **bad.** "Block the country most of it comes from."
    Label: Country block
    Result: "Millions of real users were locked out, and the bots simply moved."
    Removed by: srv-drills
- **Nudge:** "Can we stop the fake traffic before it gets inside?"
- **Pattern Book:** Rate limiting. "Use this to protect any public service from abuse or overload."
- **Map change:** An Edge Shield box appears in front of everything.
