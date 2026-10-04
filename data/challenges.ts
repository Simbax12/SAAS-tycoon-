// Copied from docs/CHALLENGES.md. The docs win if the two disagree.
// Copy new incidents in exactly as written. Stages 2 to 5 are added in later milestones.

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
];

export const challengeById = (id: string): Challenge | undefined => challenges.find((c) => c.id === id);
