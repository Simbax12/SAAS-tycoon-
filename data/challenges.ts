// Copied from docs/CHALLENGES.md. The docs win if the two disagree.
// Copy new incidents in exactly as written.

import type { PersonId } from "./people";
import type { StageNumber } from "./stages";

export type OptionType = "best" | "partial" | "bad";

export type ChallengeOption = {
  // Every new incident has exactly one option of each type, so the type is also its id.
  id: OptionType;
  type: OptionType;
  // The plain description, in large text.
  plain: string;
  // The industry label, in small text.
  label: string;
  result: string;
  // An upgrade that removes this option from the start.
  removedBy?: string;
};

export type Arrival = { by: "alert"; text: string } | { by: "email"; from: PersonId; text: string };

export type Challenge = {
  id: string;
  title: string;
  stage: StageNumber;
  // "automatic", or the must-have feature that must be bought first.
  starts: "automatic" | string;
  arrives: Arrival;
  usersGained: number;
  sees: string;
  maya: string;
  options: ChallengeOption[];
  nudge: string;
  // Clue 2, and Clue 3 where the incident has one.
  clues: string[];
  pattern: { name: string; useWhen: string };
  mapChange: string;
};

export const challenges: Challenge[] = [
  // Stage 1: Garage
  {
    id: "1.1",
    title: "The Open Door",
    stage: 1,
    starts: "automatic",
    arrives: {
      by: "email",
      from: "maya",
      text: "Your first job. Something is wrong with our admin page. Tap Investigate and take a look.",
    },
    usersGained: 200,
    sees: "A free user walks straight into a room marked Admin.",
    maya: "Anyone can open our admin page just by typing /admin in the address bar.",
    options: [
      {
        id: "best",
        type: "best",
        plain: "Check every request on the server: is this user allowed in?",
        label: "Role-based access control (RBAC)",
        result: "The server now checks each user's role. Only admins get in.",
      },
      {
        id: "partial",
        type: "partial",
        plain: "Hide the admin link from the menu.",
        label: "Hiding the link",
        result: "The link is gone, but typing the address still works.",
      },
      {
        id: "bad",
        type: "bad",
        plain: "Change the admin address to a long secret one.",
        label: "Secret URL",
        result: "The secret address leaked through a shared link. Strangers are inside.",
      },
    ],
    nudge: "Where should the check happen so that nobody can skip it?",
    clues: ["Hiding or renaming the page does not lock it. The server must check who is asking, on every request."],
    pattern: {
      name: "Role-based access control (RBAC)",
      useWhen: "Use this when different users are allowed to do different things.",
    },
    mapChange: "A shield appears on the Server box.",
  },
  {
    id: "1.2",
    title: "The Leaked Passwords",
    stage: 1,
    starts: "automatic",
    arrives: { by: "alert", text: "Unusual download. The whole user table was copied at 03:12." },
    usersGained: 250,
    sees: "The Database box shows passwords as readable text. A copy of the database slips out of the building.",
    maya: "A copy of our database leaked, and every password in it can be read.",
    options: [
      {
        id: "best",
        type: "best",
        plain: "Store a one-way scramble of each password, mixed with random data that is different for every user.",
        label: "Salted password hashing (bcrypt or Argon2)",
        result: "Stolen data is now useless. Nobody can turn the scramble back into a password.",
      },
      {
        id: "partial",
        type: "partial",
        plain: "Lock all the passwords with one secret key.",
        label: "Reversible encryption",
        result: "Better, but if that one key is stolen, every password opens at once.",
      },
      {
        id: "bad",
        type: "bad",
        plain: "Scramble passwords with a quick, old method and no random data.",
        label: "Fast unsalted hash (MD5)",
        result: "Attackers cracked most of them in minutes using lists of known scrambles.",
      },
    ],
    nudge: "Do we ever need to read a password back? Or only check that it matches?",
    clues: ["Keep nothing that can be turned back into a password. Make each one different, so one crack does not crack them all."],
    pattern: {
      name: "Password hashing",
      useWhen: "Use this whenever you store passwords. Never store the real thing.",
    },
    mapChange: "A padlock appears on the Database box.",
  },
  {
    id: "1.3",
    title: "The Double Charge",
    stage: 1,
    starts: "feat-payments",
    arrives: { by: "email", from: "customer", text: "You charged me twice for Blip Plus. I only tapped Pay once!" },
    usersGained: 200,
    sees: "One tap on Pay sends two arrows to the Payments box. Two charges appear.",
    maya: "People tap Pay twice, or their phone retries, and we charge them twice.",
    options: [
      {
        id: "best",
        type: "best",
        plain: "Give every payment attempt a unique ticket. If the same ticket arrives again, ignore it.",
        label: "Idempotency keys",
        result: "Repeats are spotted and ignored. One tap, one charge.",
      },
      {
        id: "partial",
        type: "partial",
        plain: "Grey out the Pay button after the first tap.",
        label: "Disable the button",
        result: "Double taps stopped, but phones on bad signal still retry and double charge.",
      },
      {
        id: "bad",
        type: "bad",
        plain: "Automatically retry any payment that seems slow.",
        label: "Blind retries",
        result: "Slow payments were not failed payments. Some people are now charged three times.",
      },
    ],
    nudge: "How could the server tell a repeat from a new payment?",
    clues: ["A grey button does not stop a phone retrying on its own. The server must know it has seen this payment before."],
    pattern: {
      name: "Idempotency keys",
      useWhen: "Use this when doing something twice by accident would cause harm, like a payment.",
    },
    mapChange: "A key appears on the arrow from Server to Payments.",
  },
  {
    id: "1.4",
    title: "The Key in the Code",
    stage: 1,
    starts: "automatic",
    arrives: { by: "email", from: "lena", text: "A stranger used our payment account overnight. How did they get our key?" },
    usersGained: 100,
    sees: "Blip's code is shared online. A secret key sits inside it in plain sight. A stranger copies it.",
    maya: "Our payment key was written into the code. When the code was shared, the key went with it.",
    options: [
      {
        id: "best",
        type: "best",
        plain: "Keep keys in a locked vault. The server asks for them when it starts, and we can swap them anytime.",
        label: "Secrets manager (Vault or AWS Secrets Manager)",
        result: "The code holds no keys now. We swapped the stolen key, and only our server can read the new one.",
      },
      {
        id: "partial",
        type: "partial",
        plain: "Move the keys out of the code into a settings file on the server.",
        label: "Environment variables",
        result: "The code is clean, but the stolen key still works. And nobody can tell who reads the file.",
      },
      {
        id: "bad",
        type: "bad",
        plain: "Scramble the key and keep the scrambled key in the same code.",
        label: "Home-made encryption",
        result: "The key to unscramble it had to live in the code too. The stranger used both.",
      },
    ],
    nudge: "If our code leaks again, what should still be safe?",
    clues: ["A key kept in the code leaks with the code. Keep it in a locked place that we can change at any time."],
    pattern: {
      name: "Secrets manager",
      useWhen: "Use this for passwords and keys your servers need. Never write them into the code.",
    },
    mapChange: "A Secrets box with a safe on it appears beside the Server box.",
  },

  // Stage 2: First office
  {
    id: "2.1",
    title: "The Melting Database",
    stage: 2,
    starts: "automatic",
    arrives: { by: "alert", text: "Database at 99%. Pages are timing out." },
    usersGained: 9_000,
    sees: "Thousands of identical arrows run from Server to Database. The Database glows red at 99%.",
    maya: "Every visitor asks the database for the same popular posts. It is at 99%.",
    options: [
      {
        id: "best",
        type: "best",
        plain: "Keep a ready-made copy of popular answers in fast memory. Only ask the database when the copy is missing or old.",
        label: "Caching (cache-aside with Redis)",
        result: "Most requests never reach the database. Load drops from 99% to 15%.",
      },
      {
        id: "partial",
        type: "partial",
        plain: "Buy a bigger database server.",
        label: "Vertical scaling",
        result: "It bought us a few weeks at triple the cost. Growth will fill it again.",
        removedBy: "srv-bigger",
      },
      {
        id: "bad",
        type: "bad",
        plain: "Add more app servers.",
        label: "More app servers",
        result: "More servers sent even more questions to the same tired database.",
      },
    ],
    nudge: "The answer is the same every time. Do we need to ask every time?",
    clues: ["More servers or a bigger one still ask the database every time. Keep the answer close and reuse it."],
    pattern: {
      name: "Caching",
      useWhen: "Use this when many people ask for the same thing and it rarely changes.",
    },
    mapChange: "A Cache box appears between Server and Database.",
  },
  {
    id: "2.2",
    title: "The Slow Lookup",
    stage: 2,
    starts: "automatic",
    arrives: { by: "email", from: "customer", text: "Searching for my friend's name takes forever. Is Blip broken?" },
    usersGained: 15_000,
    sees: "The Database flips through every row one by one to find a single user. A clock spins.",
    maya: "Finding one user by name takes 4 seconds. The database reads every row to find them.",
    options: [
      {
        id: "best",
        type: "best",
        plain: "Give the database a sorted lookup list for usernames, like the index at the back of a book.",
        label: "Database index",
        result: "The database jumps straight to the right row. 4 seconds became 4 milliseconds.",
      },
      {
        id: "partial",
        type: "partial",
        plain: "Remember recent lookups in the cache.",
        label: "Cache the lookups",
        result: "Repeat lookups are fast, but most names are searched once, so most are still slow.",
      },
      {
        id: "bad",
        type: "bad",
        plain: "Load every user into the app's memory and search there.",
        label: "In-memory copy",
        result: "The app ran out of memory and crashed.",
      },
    ],
    nudge: "How do you find a word in a book without reading every page?",
    clues: ["A cache only helps names asked for before. Help the database jump straight to any name, the first time."],
    pattern: {
      name: "Database index",
      useWhen: "Use this when you often search a big table by the same field.",
    },
    mapChange: "An index tab appears on the Database box.",
  },
  {
    id: "2.3",
    title: "The Heavy Photos",
    stage: 2,
    starts: "feat-photos",
    arrives: { by: "email", from: "sam", text: "Photos are a hit, but people say they load slowly. Can you look?" },
    usersGained: 15_000,
    sees: "Large photo files crawl from the Server to faraway users. The Server's network bar is red.",
    maya: "Photos load slowly, and our server spends all its effort sending image files.",
    options: [
      {
        id: "best",
        type: "best",
        plain: "Keep photos in file storage and serve copies from servers close to each user.",
        label: "CDN (content delivery network) with object storage",
        result: "Photos now come from nearby. Our server is free to do real work.",
      },
      {
        id: "partial",
        type: "partial",
        plain: "Shrink the photo files.",
        label: "Image compression",
        result: "Smaller files help, but everything still travels from one place.",
      },
      {
        id: "bad",
        type: "bad",
        plain: "Save the photos inside the database.",
        label: "Files in the database",
        result: "The database ballooned and every query got slower.",
      },
    ],
    nudge: "What if the photos did not have to travel so far?",
    clues: ["Smaller files still come from one far-away server. Store them once and send copies from near each user."],
    pattern: {
      name: "CDN",
      useWhen: "Use this for files that are the same for everyone, like images and video.",
    },
    mapChange: "A Storage box appears, and a ring of small CDN boxes appears near Users.",
  },
  {
    id: "2.4",
    title: "The Chatty Feed",
    stage: 2,
    starts: "automatic",
    arrives: { by: "email", from: "omar", text: "Customers say the feed takes 3 seconds to load. Yet every server looks calm." },
    usersGained: 10_000,
    sees: "One feed request. The Server asks the Database for 50 posts, then makes 50 more trips, one for each author.",
    maya: "To show 50 posts, we ask the database 51 times. Once for the posts, then once for each author.",
    options: [
      {
        id: "best",
        type: "best",
        plain: "Ask for the posts and their authors together, in one trip.",
        label: "Eager loading with a JOIN (fixes N+1 queries)",
        result: "51 trips became 1. The feed loads in a blink.",
      },
      {
        id: "partial",
        type: "partial",
        plain: "Keep each author in the cache, so most trips are quick.",
        label: "Cache each author",
        result: "Each trip is shorter, but there are still 51 of them. And the saved copies can go out of date.",
      },
      {
        id: "bad",
        type: "bad",
        plain: "Copy each author's name into every post they write.",
        label: "Copy data into every row",
        result: "People who changed their name now show the old one on years of posts.",
      },
    ],
    nudge: "Would you go to the shop 51 times for 51 things on one list?",
    clues: [
      "The problem is the number of trips, not how long each one takes. Get everything the page needs at once.",
      "Copying names into posts leaves old names behind when people change them. Ask for posts and authors in one query.",
    ],
    pattern: {
      name: "Eager loading",
      useWhen: "Use this when a page shows a list and details for every item. Fetch them together.",
    },
    mapChange: "The many thin arrows from Server to Database merge into one thick arrow.",
  },

  // Stage 3: Scale-up
  {
    id: "3.1",
    title: "The Lonely Server",
    stage: 3,
    starts: "automatic",
    arrives: { by: "alert", text: "Server at 100%. Blip was unreachable for 6 minutes." },
    usersGained: 900_000,
    sees: "The single Server box sits at 100% and flickers. Each time it flickers, every user turns grey.",
    maya: "Our one server is full at peak time. When it crashes, all of Blip goes down.",
    options: [
      {
        id: "best",
        type: "best",
        plain: "Run several servers, with a traffic director in front to share out the visitors.",
        label: "Load balancer with horizontal scaling",
        result: "Traffic is shared. If one server dies, the others carry on.",
      },
      {
        id: "partial",
        type: "partial",
        plain: "Buy one much bigger server.",
        label: "Vertical scaling",
        result: "More room for now, but it is still one machine. One crash still takes everything down.",
        removedBy: "srv-bigger",
      },
      {
        id: "bad",
        type: "bad",
        plain: "Restart the server automatically whenever it slows down.",
        label: "Auto-restart",
        result: "Every restart kicked out everyone online. Peak time became restart time.",
      },
    ],
    nudge: "What is safer than one strong server?",
    clues: [
      "A bigger or restarted server is still one server. If it dies, Blip dies. Share the work out.",
    ],
    pattern: {
      name: "Load balancing",
      useWhen: "Use this when one server cannot handle the traffic, or when one crash must not stop everything.",
    },
    mapChange: "A Load Balancer box appears. The Server box becomes three.",
  },
  {
    id: "3.2",
    title: "The Vanishing Login",
    stage: 3,
    starts: "automatic",
    arrives: { by: "email", from: "customer", text: "Blip keeps logging me out every few taps. So annoying!" },
    usersGained: 1_000_000,
    sees: "A user logs in on Server 1. Their next tap goes to Server 2, which shows a question mark.",
    maya: "Since we added servers, people keep getting logged out. Each server only remembers its own visitors.",
    options: [
      {
        id: "best",
        type: "best",
        plain: "Keep login records in one shared place that every server can check.",
        label: "Shared session store (stateless servers)",
        result: "Any server can serve any user. Servers can come and go freely.",
      },
      {
        id: "partial",
        type: "partial",
        plain: "Always send each user back to the same server.",
        label: "Sticky sessions",
        result: "It works until that server dies. Then everyone on it is logged out.",
      },
      {
        id: "bad",
        type: "bad",
        plain: "Make logins last much longer.",
        label: "Longer sessions",
        result: "Nothing changed. The other servers still never knew about the login.",
      },
    ],
    nudge: "The login is saved where only one server can see it. Where else could it live?",
    clues: [
      "Sending users back to one server fails when that server dies. Let any server read any login.",
    ],
    pattern: {
      name: "Stateless servers",
      useWhen: "Use this whenever you run more than one server.",
    },
    mapChange: "A Session Store box appears, joined to all three servers.",
  },
  {
    id: "3.3",
    title: "The Frozen Sign-up",
    stage: 3,
    starts: "feat-email",
    arrives: { by: "email", from: "zoe", text: "Sign-ups halved today. People say the sign-up page just hangs." },
    usersGained: 1_500_000,
    sees: "A sign-up arrow gets stuck at the Email box with a spinner. A line of waiting users builds up.",
    maya: "Sign-up waits for the welcome email to send. When email is slow, sign-up freezes.",
    options: [
      {
        id: "best",
        type: "best",
        plain: "Put the email job on a to-do list and finish sign-up straight away. Background workers send it later.",
        label: "Message queue with background workers",
        result: "Sign-up is instant. The email follows a few seconds later.",
      },
      {
        id: "partial",
        type: "partial",
        plain: "Wait longer before giving up.",
        label: "Longer timeout",
        result: "Fewer errors, but people now stare at a spinner for 30 seconds.",
      },
      {
        id: "bad",
        type: "bad",
        plain: "Keep retrying the email instantly until it works.",
        label: "Instant retries",
        result: "We flooded the email service and it blocked us completely.",
      },
    ],
    nudge: "Does the user need the email to be sent before they can carry on?",
    clues: [
      "Waiting longer or retrying still makes the user wait. Let sign-up finish, and send the email afterwards.",
    ],
    pattern: {
      name: "Message queue",
      useWhen: "Use this for slow work that the user does not need to wait for.",
    },
    mapChange: "A Queue box and a Worker box appear.",
  },
  {
    id: "3.4",
    title: "The Domino Effect",
    stage: 3,
    starts: "automatic",
    arrives: { by: "alert", text: "All servers stuck. Every request is waiting on the fraud checker." },
    usersGained: 1_000_000,
    sees: "The Fraud Check box turns grey. Arrows to it pile up. One by one the Servers turn red, then all of Blip.",
    maya: "The outside service that checks payments for fraud is broken. Our servers keep waiting on it, so everything is stuck.",
    options: [
      {
        id: "best",
        type: "best",
        plain: "Count the failures. After a few, stop calling the checker and use a safe backup plan. Try it again later.",
        label: "Circuit breaker",
        result: "Calls to the broken checker stop at once. The rest of Blip works. When it recovers, calls start again.",
      },
      {
        id: "partial",
        type: "partial",
        plain: "Give up on the checker after 2 seconds instead of 30.",
        label: "Shorter timeout",
        result: "The waits are shorter, but every request still tries the broken checker first and fails.",
      },
      {
        id: "bad",
        type: "bad",
        plain: "When the checker does not answer, ask it again three times.",
        label: "Retries",
        result: "We sent three times the traffic to a service that was already struggling. It stayed down for hours.",
      },
    ],
    nudge: "If a shop is closed, do you keep knocking on the door?",
    clues: [
      "Retries hit a broken service even harder. A shorter wait still waits every time. Stop calling it for a while.",
      "Think of a fuse in a house. After a few failures, cut the line, use a backup plan, then test it later.",
    ],
    pattern: {
      name: "Circuit breaker",
      useWhen: "Use this when a service you depend on can fail. Stop calling it until it recovers.",
    },
    mapChange: "A Fraud Check box appears, with a switch on the arrow that leads to it.",
  },

  // Stage 4: Big tech
  {
    id: "4.1",
    title: "The Read Flood",
    stage: 4,
    starts: "automatic",
    arrives: { by: "alert", text: "Database at 98%. Nearly all of the traffic is reads." },
    usersGained: 10_000_000,
    sees: "A huge stream of arrows marked Read and a thin stream marked Write all hit one Database. It glows red.",
    maya: "Most traffic is people reading. One database cannot answer them all, even with the cache.",
    options: [
      {
        id: "best",
        type: "best",
        plain: "Make copies of the database that only answer reads. Send all writes to the main one.",
        label: "Read replicas",
        result: "Reads are spread across the copies. The main database can breathe.",
      },
      {
        id: "partial",
        type: "partial",
        plain: "Move to the biggest database machine that exists.",
        label: "Vertical scaling",
        result: "Very expensive, and there is no bigger machine after this one.",
      },
      {
        id: "bad",
        type: "bad",
        plain: "Have the app write every change to several databases itself.",
        label: "Dual writes",
        result: "Some writes failed halfway. The databases now disagree with each other.",
      },
    ],
    nudge: "Reading and writing are different jobs. Do they need the same machine?",
    clues: [
      "Most traffic is reads. Could other machines answer the reads, while one machine still takes every write?",
    ],
    pattern: {
      name: "Read replicas",
      useWhen: "Use this when reads far outnumber writes. Copies can be a moment behind.",
    },
    mapChange: "The Database becomes one Primary box with two Replica boxes.",
  },
  {
    id: "4.2",
    title: "The Table That Got Too Big",
    stage: 4,
    starts: "automatic",
    arrives: { by: "alert", text: "Disk 96% full. The messages table has 4 billion rows." },
    usersGained: 10_000_000,
    sees: "The Messages table overflows its box. Write arrows slow to a crawl.",
    maya: "The messages table has billions of rows. It no longer fits on one machine.",
    options: [
      {
        id: "best",
        type: "best",
        plain: "Split the data across many databases, using the user ID to decide where each row lives.",
        label: "Sharding",
        result: "Each database holds a slice. The load is spread evenly.",
      },
      {
        id: "partial",
        type: "partial",
        plain: "Move old messages into cheap storage.",
        label: "Archiving",
        result: "The table shrank for a while, but new messages are filling it again.",
      },
      {
        id: "bad",
        type: "bad",
        plain: "Start a new database each month for that month's new sign-ups.",
        label: "Sharding by sign-up date",
        result: "The newest database gets most of the traffic. It is overloaded while the old ones sit idle.",
        removedBy: "srv-analytics",
      },
    ],
    nudge: "How can we split the data so that every piece gets a fair share of the work?",
    clues: [
      "Archiving only buys time. The data must be split, but by something that spreads the work evenly.",
      "Split by date and the newest database gets all the traffic. Every user has an ID. Use that.",
    ],
    pattern: {
      name: "Sharding",
      useWhen: "Use this when the data is too big for one database. Pick a key that spreads the load evenly.",
    },
    mapChange: "The Primary box splits into Shard 1, Shard 2 and Shard 3.",
  },
  {
    id: "4.3",
    title: "The Celebrity Post",
    stage: 4,
    starts: "feat-verified",
    arrives: { by: "email", from: "sam", text: "Our biggest star just posted and Blip slowed to a crawl. Her manager is on the phone." },
    usersGained: 10_000_000,
    sees: "A celebrity posts. Millions of arrows fan out at once. The Queue box overflows.",
    maya: "A star with 50 million followers posted. We tried to copy it into 50 million feeds at once.",
    options: [
      {
        id: "best",
        type: "best",
        plain: "Deliver normal posts to followers' feeds as before. For huge accounts, fetch their posts only when a follower opens the app.",
        label: "Hybrid fan-out",
        result: "Normal posts stay fast. Celebrity posts no longer cause a flood.",
      },
      {
        id: "partial",
        type: "partial",
        plain: "Add more background workers.",
        label: "More workers",
        result: "The flood clears faster, but each celebrity post still means 50 million writes.",
      },
      {
        id: "bad",
        type: "bad",
        plain: "Build every feed from scratch each time someone opens the app.",
        label: "Fan-out on read for everyone",
        result: "Opening the app now takes seconds for every single user.",
        removedBy: "srv-analytics",
      },
    ],
    nudge: "Should a post from a star be handled the same way as a post from you or me?",
    clues: [
      "More workers still make 50 million copies. Building every feed fresh is slow for everyone. Treat huge accounts differently.",
      "Push posts to small audiences. For a star, let followers pull the post when they open the app.",
    ],
    pattern: {
      name: "Fan-out",
      useWhen: "Use this when one action must reach many people. Push to small audiences, pull for huge ones.",
    },
    mapChange: "A Feed Service box appears with two paths: Push and Pull.",
  },
  {
    id: "4.4",
    title: "The Search That Gave Up",
    stage: 4,
    starts: "automatic",
    arrives: { by: "email", from: "customer", text: "I searched my old posts for a recipe. It spun for ages and found nothing." },
    usersGained: 10_000_000,
    sees: "Someone types two words. Every shard reads every word of every post. A clock spins, then gives up.",
    maya: "Search means finding words anywhere inside billions of posts. A normal lookup list cannot help with that.",
    options: [
      {
        id: "best",
        type: "best",
        plain: "Use a search engine. It keeps a list of every word, and which posts contain it.",
        label: "Search engine with an inverted index (Elasticsearch)",
        result: "Each word leads straight to its posts. Results arrive in a blink.",
      },
      {
        id: "partial",
        type: "partial",
        plain: "Add a special word index inside our own databases.",
        label: "Full-text index in PostgreSQL",
        result: "Much faster, but still too slow at our size. And the databases now have extra work.",
      },
      {
        id: "bad",
        type: "bad",
        plain: "Let every search run as long as it needs, with no time limit.",
        label: "No time limit",
        result: "Long searches piled up and slowed the databases for everyone.",
      },
    ],
    nudge: "What if each word already knew which posts it appears in?",
    clues: [
      "A time limit does not make search smarter. Our databases were not built to find words buried inside text.",
      "A tool made for search keeps a list for every word, with the posts it appears in.",
    ],
    pattern: {
      name: "Search engine",
      useWhen: "Use this when people search for words inside lots of text.",
    },
    mapChange: "A Search box appears beside the shards.",
  },

  // Stage 5: Planet scale
  {
    id: "5.1",
    title: "The Slow Side of the World",
    stage: 5,
    starts: "feat-global",
    arrives: { by: "email", from: "customer", text: "Blip is so slow here in Sydney. Every tap takes seconds." },
    usersGained: 100_000_000,
    sees: "A world map. All servers sit in one spot. Long arrows stretch to faraway users, each with a snail on it.",
    maya: "Users far away wait 2 seconds per tap. Every request crosses the ocean to our one data centre.",
    options: [
      {
        id: "best",
        type: "best",
        plain: "Run servers and copies of the data in several parts of the world. Send each user to the nearest.",
        label: "Multi-region deployment",
        result: "Everyone talks to a nearby region. Taps feel instant worldwide.",
      },
      {
        id: "partial",
        type: "partial",
        plain: "Put more content on the CDN.",
        label: "More CDN",
        result: "Photos are fast, but posting and messaging still cross the ocean.",
      },
      {
        id: "bad",
        type: "bad",
        plain: "Buy faster servers for the one data centre.",
        label: "Faster servers",
        result: "The servers were never the slow part. The distance was.",
      },
    ],
    nudge: "The servers are fast. Which part of the journey is slow?",
    clues: [
      "Faster servers do not shorten an ocean. A CDN only helps with files. Put servers and data near the users.",
    ],
    pattern: {
      name: "Multi-region",
      useWhen: "Use this when your users are spread around the world.",
    },
    mapChange: "The map switches to a world view with three regions.",
  },
  {
    id: "5.2",
    title: "The Blackout",
    stage: 5,
    starts: "automatic",
    arrives: { by: "alert", text: "Region down. No response from one of our three regions." },
    usersGained: 100_000_000,
    sees: "One region on the world map goes dark. Its users turn grey.",
    maya: "A whole region just lost power. A third of our users cannot reach Blip.",
    options: [
      {
        id: "best",
        type: "best",
        plain: "Check each region's health all the time. When one fails, send its users to a healthy region automatically.",
        label: "Automatic failover",
        result: "Users were moved in seconds. Most never noticed.",
      },
      {
        id: "partial",
        type: "partial",
        plain: "Write a step-by-step guide so engineers can switch regions by hand.",
        label: "Manual failover",
        result: "It worked, but it took an hour to wake people up and follow the steps.",
      },
      {
        id: "bad",
        type: "bad",
        plain: "Rely on last night's backup to rebuild the region.",
        label: "Restore from backup",
        result: "Rebuilding took hours, and everything since last night was lost.",
        removedBy: "srv-drills",
      },
    ],
    nudge: "Who reacts faster at 3am: a person or an automatic health check?",
    clues: [
      "A backup takes hours to restore. A guide still needs a person awake. Let machines notice and switch on their own.",
    ],
    pattern: {
      name: "Failover",
      useWhen: "Use this when downtime is costly. Practise it before you need it.",
    },
    mapChange: "Heartbeat lines appear between the three regions.",
  },
  {
    id: "5.4",
    title: "The Bad Update",
    stage: 5,
    starts: "automatic",
    arrives: { by: "alert", text: "New checkout code went live for everyone. Payments are failing worldwide." },
    usersGained: 50_000_000,
    sees: "New code rolls out to every region at once. Every region turns red together.",
    maya: "We turned on new checkout code for everyone at once. It has a bug, so everyone has the bug.",
    options: [
      {
        id: "best",
        type: "best",
        plain: "Ship new code switched off. Turn it on for staff, then a few users, then more. One switch turns it off.",
        label: "Feature flags",
        result: "The new checkout is off in a second. Next time it reaches staff first, then a few users at a time.",
      },
      {
        id: "partial",
        type: "partial",
        plain: "Send 1% of requests to the new code first, then more if errors stay low.",
        label: "Canary release",
        result: "Fewer people are hit. But a busy customer can land on the new code many times before anyone notices.",
      },
      {
        id: "bad",
        type: "bad",
        plain: "Swap the servers to the new code one at a time.",
        label: "Rolling update",
        result: "For ten minutes old and new code shared the same payments. Some people were charged, but no order was saved.",
      },
    ],
    nudge: "What if new code could be switched off without shipping anything?",
    clues: [
      "Swapping servers one at a time still gives everyone the bug in the end. We need a way to undo it fast.",
      "A canary limits who is hit, but undoing it means shipping again. Which option has an off switch?",
    ],
    pattern: {
      name: "Feature flags",
      useWhen: "Use this when a change is risky. Turn it on for a few people first, and keep an off switch.",
    },
    mapChange: "A row of on and off switches appears above the three regions.",
  },
  {
    id: "5.3",
    title: "The Flood Attack",
    stage: 5,
    starts: "automatic",
    arrives: { by: "alert", text: "Traffic is 40 times normal. Most of it looks fake." },
    usersGained: 200_000_000,
    sees: "A swarm of red arrows from all over the map hits the front door. Real users are squeezed out.",
    maya: "Millions of fake requests a second are hitting us. Real users cannot get through.",
    options: [
      {
        id: "best",
        type: "best",
        plain: "Limit how many requests each visitor can make, and filter out bad traffic before it reaches our servers.",
        label: "Rate limiting with DDoS protection",
        result: "Bots are stopped at the door. Real users get through.",
      },
      {
        id: "partial",
        type: "partial",
        plain: "Add more servers to soak it up.",
        label: "Scaling out",
        result: "It held briefly, at huge cost. The attacker just sent more.",
      },
      {
        id: "bad",
        type: "bad",
        plain: "Block the country most of it comes from.",
        label: "Country block",
        result: "Millions of real users were locked out, and the bots simply moved.",
        removedBy: "srv-drills",
      },
    ],
    nudge: "Can we stop the fake traffic before it gets inside?",
    clues: [
      "More servers just feed the attack. Blocking a country blocks real users too. Stop the flood at the door.",
    ],
    pattern: {
      name: "Rate limiting",
      useWhen: "Use this to protect any public service from abuse or overload.",
    },
    mapChange: "An Edge Shield box appears in front of everything.",
  },
];

export const challengeById = (id: string): Challenge | undefined => challenges.find((c) => c.id === id);
