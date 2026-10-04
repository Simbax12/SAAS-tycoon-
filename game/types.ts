// The game state, copied from docs/GAME_LOGIC.md > Part 1: What the engine remembers.
// The docs win if the two disagree. Every field is here from the start, even those a later
// milestone first uses, so the save format does not change when those milestones arrive.

export type Phase = "waiting" | "arrived" | "triage" | "choosing" | "guided" | "tune" | "solved";

export type Stars = 1 | 2 | 3;

// Build only: parts placed, arrows drawn, parts locked by calls, and whether the decoys were removed.
export type Canvas = {
  parts: string[];
  arrows: { from: string; to: string }[];
  locked: string[];
  decoysRemoved: boolean;
};

// One incident attempt (docs/GAME_LOGIC.md > The run: one incident attempt).
export type Run = {
  stars: Stars;
  tried: string[];
  removed: string[];
  calls: number;
  handbookUsed: boolean;
  lifelineUsed: boolean;
  testUsed: boolean;
  dip: number;
  failedDeploys: number;
  canvas: Canvas | null;
  triageTaps: string[];
  tuneWaves: { stop: number; right: boolean }[];
  paid: number;
};

// An email is saved as a key, such as "arrive:1.4". Its words come from the data files.
export type Email = { key: string; read: boolean };

export type BinEntry = { incidentId: string; choice: string };

export type Result = { stars: Stars; firstTry: boolean };

export type Settings = {
  textSize: "normal" | "large" | "extraLarge";
  reduceMotion: boolean;
  sound: boolean;
  wallpaper: string;
};

export type GameState = {
  saveVersion: number;
  seed: number;
  currentId: string;
  phase: Phase;
  run: Run;
  users: number;
  cash: number;
  loanOwed: number;
  topUps: number;
  owned: string[];
  // The stage in which the held lifeline was bought, or null.
  lifeline: number | null;
  emails: Email[];
  recycleBin: BinEntry[];
  results: Record<string, Result>;
  refreshersDue: string[];
  standbyStages: number[];
  blueprints: Record<string, { from: string; to: string }[]>;
  tutorial: number | "skipped" | "done";
  tipsSeen: string[];
  settings: Settings;
  won: boolean;
};

export type Action =
  // Sends Maya's first email and starts the first incident. Does nothing once the game has begun.
  | { type: "begin" }
  | { type: "investigate" }
  | { type: "pick"; optionId: string }
  | { type: "applyGuided" }
  | { type: "next" }
  | { type: "openEmail"; key: string }
  // Call Dana for the next clue (docs/GAME_LOGIC.md > Calls).
  | { type: "call" }
  | { type: "useLifeline" }
  // Move the tutorial to a step, or skip or finish it (docs/GAME_DESIGN.md > Tutorial).
  | { type: "tutorial"; step: number | "skipped" | "done" }
  // A first-time tip has been shown and put away.
  | { type: "tipSeen"; id: string }
  // A fresh game, keeping the settings. The seed is picked outside the reducer so it stays pure.
  | { type: "reset"; seed: number }
  // Replaces the state with one loaded from a save.
  | { type: "load"; state: GameState };
