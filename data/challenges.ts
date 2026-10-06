// Copied from docs/CHALLENGES.md. The docs win if the two disagree.
// Copy new incidents in exactly as written. Stages 3 to 5 are added in later milestones.

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
];

export const challengeById = (id: string): Challenge | undefined => challenges.find((c) => c.id === id);
