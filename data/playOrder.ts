// Copied from docs/GAME_DESIGN.md > Play order. The docs win if the two disagree.
// An id is a name, not a place in the order: 5.4 is played before 5.3.

import type { StageNumber } from "./stages";

export type IncidentKind = "new" | "repeat" | "build";

export type PlayOrderRow = {
  id: string;
  stage: StageNumber;
  title: string;
  kind: IncidentKind;
  // A must-have feature that must be bought before this incident can arrive.
  needs?: string;
};

export const playOrder: PlayOrderRow[] = [
  { id: "1.1", stage: 1, title: "The Open Door", kind: "new" },
  { id: "1.2", stage: 1, title: "The Leaked Passwords", kind: "new" },
  { id: "1.3", stage: 1, title: "The Double Charge", kind: "new", needs: "feat-payments" },
  { id: "1.4", stage: 1, title: "The Key in the Code", kind: "new" },
  { id: "B1", stage: 1, title: "The First Blueprint", kind: "build" },
  { id: "2.1", stage: 2, title: "The Melting Database", kind: "new" },
  { id: "R1", stage: 2, title: "The Refund Button", kind: "repeat" },
  { id: "2.2", stage: 2, title: "The Slow Lookup", kind: "new" },
  { id: "R2", stage: 2, title: "The Triple Message", kind: "repeat" },
  { id: "2.3", stage: 2, title: "The Heavy Photos", kind: "new", needs: "feat-photos" },
  { id: "2.4", stage: 2, title: "The Chatty Feed", kind: "new" },
  { id: "B2", stage: 2, title: "The Fast Front Page", kind: "build" },
  { id: "3.1", stage: 3, title: "The Lonely Server", kind: "new" },
  { id: "R3", stage: 3, title: "The Profile Stampede", kind: "repeat" },
  { id: "3.2", stage: 3, title: "The Vanishing Login", kind: "new" },
  { id: "R4", stage: 3, title: "The Slow Inbox", kind: "repeat" },
  { id: "3.3", stage: 3, title: "The Frozen Sign-up", kind: "new", needs: "feat-email" },
  { id: "3.4", stage: 3, title: "The Domino Effect", kind: "new" },
  { id: "B3", stage: 3, title: "The Secure Door", kind: "build" },
  { id: "R5", stage: 4, title: "The Contractor Keys", kind: "repeat" },
  { id: "4.1", stage: 4, title: "The Read Flood", kind: "new" },
  { id: "R6", stage: 4, title: "The Stuck Upload", kind: "repeat" },
  { id: "4.2", stage: 4, title: "The Table That Got Too Big", kind: "new" },
  { id: "R7", stage: 4, title: "The Trending Crush", kind: "repeat" },
  { id: "4.3", stage: 4, title: "The Celebrity Post", kind: "new", needs: "feat-verified" },
  { id: "4.4", stage: 4, title: "The Search That Gave Up", kind: "new" },
  { id: "B4", stage: 4, title: "The Viral Like Button", kind: "build" },
  { id: "R8", stage: 5, title: "The Twice-Run Job", kind: "repeat" },
  { id: "5.1", stage: 5, title: "The Slow Side of the World", kind: "new", needs: "feat-global" },
  { id: "R9", stage: 5, title: "The Support Search", kind: "repeat" },
  { id: "5.2", stage: 5, title: "The Blackout", kind: "new" },
  { id: "5.4", stage: 5, title: "The Bad Update", kind: "new" },
  { id: "R10", stage: 5, title: "The Export That Never Finishes", kind: "repeat" },
  { id: "B5", stage: 5, title: "The Edge Delivery", kind: "build" },
  { id: "5.3", stage: 5, title: "The Flood Attack", kind: "new" },
];

export const playOrderRow = (id: string): PlayOrderRow | undefined => playOrder.find((r) => r.id === id);
