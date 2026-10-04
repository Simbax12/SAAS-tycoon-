// Copied from docs/GAME_DESIGN.md > Stage opening emails (Maya) and > Other emails (exact text).
// The docs win if the two disagree. Request emails from docs/UPGRADES.md are added in Milestone 4.

import type { PersonId } from "./people";
import type { StageNumber } from "./stages";

// Maya's stage opening emails, and her win email.
export const openers: Record<StageNumber | "win", string> = {
  1: "Welcome to Blip. One server, zero users. Let's get our first thousand.",
  2: "We have an office now. And a database that is starting to sweat.",
  3: "One server cannot carry us any further. Time to think in plurals.",
  4: "We are big now. So is our data. Too big.",
  5: "Next stop: the whole planet. Things break differently at this size.",
  win: "One billion users. You built this. Open your System Map and take a look.",
};

// Other emails sent at the start of a stage.
export const startOfStage: Partial<Record<StageNumber, { from: PersonId; text: string }>> = {
  4: { from: "sam", text: "The board wants a worldwide launch next. It will cost a lot. Start saving now." },
};

// The thank-you email after an incident that came from a person. Maya sends none.
export function thanksText(from: PersonId): string | undefined {
  if (from === "customer") return "It works now. Thank you!";
  if (from === "sam") return "Good work. The numbers already look better.";
  if (from === "lena" || from === "omar" || from === "zoe") return "That fixed it. My team says thanks.";
  return undefined;
}
