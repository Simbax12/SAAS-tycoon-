// Copied from docs/REPEATS.md. The docs win if the two disagree.
// Copy repeats in exactly as written. Stages 3 to 5 are added in later milestones.

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
];

export const repeatById = (id: string): Repeat | undefined => repeats.find((r) => r.id === id);

// docs/GAME_DESIGN.md > Refreshers: a refresher is sent after the next incident is solved,
// except for these repeats, whose refresher is sent straight away.
export const REFRESHER_AT_ONCE = ["R10"];
