// Copied from docs/REPEATS.md. The docs win if the two disagree.
// Copy repeats in exactly as written.

import type { Arrival } from "./challenges";
import type { StageNumber } from "./stages";

export type RepeatCard = {
  // The card's pattern, exactly as its Pattern Book name. It is also the card's id in the save.
  pattern: string;
  right: boolean;
  // The Result sentence for the right card, the "Why not" sentence for a wrong one.
  text: string;
};

export type Repeat = {
  id: string;
  title: string;
  stage: StageNumber;
  // The pattern being practised. Its name matches its Pattern Book entry exactly.
  pattern: string;
  firstLearnedIn: string;
  arrives: Arrival;
  usersGained: number;
  sees: string;
  cards: RepeatCard[];
  nudge: string;
  // Clue 2.
  clues: string[];
  // A line added to the pattern's Pattern Book entry.
  alsoSeenAs: string;
};

export const repeats: Repeat[] = [
  // Stage 2
  {
    id: "R1",
    title: "The Refund Button",
    stage: 2,
    pattern: "Role-based access control (RBAC)",
    firstLearnedIn: "1.1",
    arrives: {
      by: "email",
      from: "sam",
      text: "A new support hire refunded £9,000 by mistake. Support staff should only be able to view orders.",
    },
    usersGained: 10_000,
    sees: "A person wearing a Support badge presses a button marked Refund. Money flies out.",
    cards: [
      {
        pattern: "Role-based access control (RBAC)",
        right: true,
        text: "Each role now has its own list of allowed actions. Support can view. Only Finance can refund.",
      },
      {
        pattern: "Password hashing",
        right: false,
        text: "Her password was safe and her login was real. The problem is what she was allowed to do.",
      },
      {
        pattern: "Idempotency keys",
        right: false,
        text: "The refund only went out once. It should not have been allowed at all.",
      },
    ],
    nudge: "Remember The Open Door? Who is allowed to do what?",
    clues: ["Her password was safe and the refund ran once. The question is what each role is allowed to do."],
    alsoSeenAs: "Staff tools that everyone can use.",
  },
  {
    id: "R2",
    title: "The Triple Message",
    stage: 2,
    pattern: "Idempotency keys",
    firstLearnedIn: "1.3",
    arrives: { by: "email", from: "customer", text: "I pressed Send once on the train. My message posted three times." },
    usersGained: 15_000,
    sees: "One tap on Send. The phone's signal drops, and three copies of the same message reach the Server.",
    cards: [
      {
        pattern: "Idempotency keys",
        right: true,
        text: "Each message carries a unique ticket. Repeats are spotted and dropped.",
      },
      {
        pattern: "Caching",
        right: false,
        text: "A saved copy of an answer does not stop the same message arriving three times.",
      },
      {
        pattern: "Database index",
        right: false,
        text: "Finding messages faster does not stop one being saved three times.",
      },
    ],
    nudge: "Remember The Double Charge? How did the server spot a repeat?",
    clues: ["One tap, three posts. The server must spot a send it has already handled."],
    alsoSeenAs: "Messages or posts that appear more than once.",
  },

  // Stage 3
  {
    id: "R3",
    title: "The Profile Stampede",
    stage: 3,
    pattern: "Caching",
    firstLearnedIn: "2.1",
    arrives: { by: "alert", text: "Database at 97%. One profile is being loaded 40,000 times a second." },
    usersGained: 1_000_000,
    sees: "Thousands of identical arrows ask the Database for the same famous profile.",
    cards: [
      {
        pattern: "Caching",
        right: true,
        text: "The profile is kept ready in fast memory. The database is barely touched.",
      },
      {
        pattern: "Load balancing",
        right: false,
        text: "More servers just send more copies of the same question to the database.",
      },
      {
        pattern: "Database index",
        right: false,
        text: "The lookup is already quick. The trouble is how many times it is repeated.",
      },
    ],
    nudge: "Remember The Melting Database? The answer is the same every time.",
    clues: ["One profile, asked for 40,000 times, gives the same answer each time. Keep that answer ready."],
    alsoSeenAs: "One popular page that everybody loads.",
  },
  {
    id: "R4",
    title: "The Slow Inbox",
    stage: 3,
    pattern: "Database index",
    firstLearnedIn: "2.2",
    arrives: { by: "email", from: "customer", text: "My inbox takes 10 seconds to open. I only have 40 messages!" },
    usersGained: 1_500_000,
    sees: "The Database reads through every message from every user to find one person's 40.",
    cards: [
      {
        pattern: "Database index",
        right: true,
        text: "The database now has a lookup list by recipient. It jumps straight to the right 40.",
      },
      {
        pattern: "Caching",
        right: false,
        text: "A saved copy hides it for a moment. The first load of every inbox is still slow.",
      },
      {
        pattern: "Stateless servers",
        right: false,
        text: "Logins are fine. The slow part is the database reading every row.",
      },
    ],
    nudge: "Remember The Slow Lookup? Why read every page to find one thing?",
    clues: ["Forty messages should open at once. The database is reading every row to find them."],
    alsoSeenAs: "Any screen that is slow because the database reads every row.",
  },

  // Stage 4
  {
    id: "R5",
    title: "The Contractor Keys",
    stage: 4,
    pattern: "Role-based access control (RBAC)",
    firstLearnedIn: "1.1",
    arrives: { by: "email", from: "lena", text: "We took on 200 contractors. Every one of them can open the payroll tools." },
    usersGained: 5_000_000,
    sees: "A crowd wearing Contractor badges walks into a room marked Payroll.",
    cards: [
      {
        pattern: "Role-based access control (RBAC)",
        right: true,
        text: "Contractors get a contractor role. Payroll opens for the Finance role only.",
      },
      {
        pattern: "Stateless servers",
        right: false,
        text: "Their logins work as they should. The problem is what they can open once inside.",
      },
      {
        pattern: "Password hashing",
        right: false,
        text: "Their passwords are safe. The problem is what they are allowed to open.",
      },
    ],
    nudge: "Remember The Open Door and The Refund Button? Check the role, every time.",
    clues: ["These are real logins, used by real staff. The problem is what a contractor is allowed to open."],
    alsoSeenAs: "New kinds of staff who can see too much.",
  },
  {
    id: "R6",
    title: "The Stuck Upload",
    stage: 4,
    pattern: "Message queue",
    firstLearnedIn: "3.3",
    arrives: { by: "email", from: "customer", text: "Posting a photo freezes my app for 20 seconds." },
    usersGained: 10_000_000,
    sees: "An upload arrow waits at the Server while it makes five sizes of the same photo. A spinner turns.",
    cards: [
      {
        pattern: "Message queue",
        right: true,
        text: "The photo posts at once. Background workers make the other sizes a moment later.",
      },
      {
        pattern: "CDN",
        right: false,
        text: "The CDN speeds up viewing photos. The wait here is the resizing during upload.",
      },
      {
        pattern: "Read replicas",
        right: false,
        text: "This is not a reading problem. The server is doing slow work while the user waits.",
      },
    ],
    nudge: "Remember The Frozen Sign-up? Does the user need to wait for this?",
    clues: ["The photo is already saved. The extra work after it does not need the user to wait."],
    alsoSeenAs: "Uploads that freeze while the server does extra work.",
  },
  {
    id: "R7",
    title: "The Trending Crush",
    stage: 4,
    pattern: "Caching",
    firstLearnedIn: "2.1",
    arrives: { by: "email", from: "sam", text: "Every time something big happens, the Trending page takes Blip down. Tonight is the cup final." },
    usersGained: 15_000_000,
    sees: "Every user asks for the same Trending list. The databases rebuild it from scratch each time and glow red.",
    cards: [
      {
        pattern: "Caching",
        right: true,
        text: "The Trending list is built once a minute and kept ready. Everyone gets the saved copy.",
      },
      {
        pattern: "Sharding",
        right: false,
        text: "Splitting the data does not help when everyone wants the very same list.",
      },
      {
        pattern: "Read replicas",
        right: false,
        text: "More copies share the pain, but each one still rebuilds the same list for every visitor.",
      },
    ],
    nudge: "Remember The Melting Database and The Profile Stampede? Same answer, asked again and again.",
    clues: ["The Trending page is the same list for everyone. Work it out once and hand out copies."],
    alsoSeenAs: "A list that is the same for everyone.",
  },

  // Stage 5
  {
    id: "R8",
    title: "The Twice-Run Job",
    stage: 5,
    pattern: "Idempotency keys",
    firstLearnedIn: "1.3",
    arrives: { by: "alert", text: "Payout worker crashed. The job ran again. 3,000 creators were paid twice." },
    usersGained: 50_000_000,
    sees: "A Worker box flashes and restarts. The Queue hands it the same job again. Two payments leave.",
    cards: [
      {
        pattern: "Idempotency keys",
        right: true,
        text: "Each payout carries a unique ticket. A job that runs twice still pays once.",
      },
      {
        pattern: "Message queue",
        right: false,
        text: "The queue did its job. Queues can deliver a job twice, so the job itself must be safe to repeat.",
      },
      {
        pattern: "Load balancing",
        right: false,
        text: "More workers would only run the repeated job sooner.",
      },
    ],
    nudge: "Remember The Double Charge and The Triple Message? Repeats will happen. Make them harmless.",
    clues: ["Crashed jobs will run again. Give each payout a ticket, so a rerun can see it was already paid."],
    alsoSeenAs: "Background jobs that run twice after a crash.",
  },
  {
    id: "R9",
    title: "The Support Search",
    stage: 5,
    pattern: "Database index",
    firstLearnedIn: "2.2",
    arrives: { by: "email", from: "omar", text: "Finding a customer by email address takes 30 seconds. We answer 10,000 tickets a day." },
    usersGained: 50_000_000,
    sees: "Every shard reads row after row, hunting for one email address.",
    cards: [
      {
        pattern: "Database index",
        right: true,
        text: "Each shard now has a lookup list by email address. Searches take milliseconds.",
      },
      {
        pattern: "Multi-region",
        right: false,
        text: "The database is already close by. Reading every row is what takes the time.",
      },
      {
        pattern: "Sharding",
        right: false,
        text: "The data is already split. Each piece still reads every row.",
      },
    ],
    nudge: "Remember The Slow Lookup and The Slow Inbox? A new kind of search needs its own lookup list.",
    clues: ["Searching by email address is new. Nobody made a lookup list for email addresses."],
    alsoSeenAs: "A new way of searching that nobody added a lookup list for.",
  },
  {
    id: "R10",
    title: "The Export That Never Finishes",
    stage: 5,
    pattern: "Message queue",
    firstLearnedIn: "3.3",
    arrives: { by: "email", from: "customer", text: "Download My Data fails every time. I have nine years of posts!" },
    usersGained: 100_000_000,
    sees: "A request arrow waits while the Server gathers years of posts. The arrow snaps before it finishes.",
    cards: [
      {
        pattern: "Message queue",
        right: true,
        text: "The export runs in the background. The user gets a download link when it is ready.",
      },
      {
        pattern: "Caching",
        right: false,
        text: "Every export is different, so there is no saved copy to reuse.",
      },
      {
        pattern: "Failover",
        right: false,
        text: "Nothing has broken down. The work is simply too slow to do while someone waits.",
      },
    ],
    nudge: "Remember The Frozen Sign-up and The Stuck Upload? Slow work belongs in the background.",
    clues: ["Nine years of posts cannot be packed while the user waits. Do it out of sight and send a link."],
    alsoSeenAs: "Big reports and exports that time out.",
  },
];

export const repeatById = (id: string): Repeat | undefined => repeats.find((r) => r.id === id);

// docs/GAME_DESIGN.md > Refreshers: a refresher is sent after the next incident is solved,
// except for these repeats, whose refresher is sent straight away.
export const REFRESHER_AT_ONCE = ["R10"];
