// The Pattern Book, worked out from `results` (docs/GAME_LOGIC.md > Derived values).
// A solved new incident adds its pattern. A solved repeat fills a pip, gold if solved first try,
// and adds its "Also seen as" line. A solved Build adds a "Built in" line to each pattern it practises.

import { builds } from "../data/blueprints";
import { challenges } from "../data/challenges";
import { playOrder } from "../data/playOrder";
import { everydayPatterns } from "../data/patterns";
import { repeatById } from "../data/repeats";
import type { GameState } from "./types";

export type Pip = "gold" | "silver" | "empty";

export type PatternEntry = {
  name: string;
  useWhen: string;
  // Only the five everyday patterns have pips.
  pips: Pip[] | null;
  alsoSeenAs: string[];
  // The titles of the solved Builds that practised this pattern.
  builtIn: string[];
};

// A pattern's "Use this when" line, from the new incident that teaches it.
export const useWhenFor = (name: string): string | undefined =>
  challenges.find((c) => c.pattern.name === name)?.pattern.useWhen;

// docs/GAME_DESIGN.md > Pips and mastery. Pip 1 is always gold. Pips 2 and 3 fill when the
// pattern's two repeats are solved: gold if solved first try, otherwise silver.
export function pipsFor(state: GameState, name: string): Pip[] | null {
  const everyday = everydayPatterns.find((p) => p.name === name);
  if (!everyday) return null;
  const repeatPip = (id: string): Pip => {
    const r = state.results[id];
    return !r ? "empty" : r.firstTry ? "gold" : "silver";
  };
  return ["gold", ...everyday.repeats.map(repeatPip)];
}

export const isMastered = (pips: Pip[] | null) => !!pips && pips.every((p) => p === "gold");

// The "Also seen as" lines of a pattern's solved repeats, in play order.
export function alsoSeenAs(state: GameState, name: string): string[] {
  return playOrder.flatMap((row) => {
    const repeat = repeatById(row.id);
    return repeat && repeat.pattern === name && state.results[row.id] ? [repeat.alsoSeenAs] : [];
  });
}

// The titles of a pattern's solved Builds, in play order (docs/GAME_DESIGN.md > Build incident flow: draw the design).
export function builtIn(state: GameState, name: string): string[] {
  return playOrder.flatMap((row) => {
    const build = builds.find((b) => b.id === row.id);
    return build && build.practises.includes(name) && state.results[row.id] ? [build.title] : [];
  });
}

// Every pattern learned so far, in the order it was learned.
export function patternBook(state: GameState): PatternEntry[] {
  return playOrder.flatMap((row) => {
    const challenge = challenges.find((c) => c.id === row.id);
    if (!challenge || !state.results[row.id]) return [];
    const { name, useWhen } = challenge.pattern;
    return [{ name, useWhen, pips: pipsFor(state, name), alsoSeenAs: alsoSeenAs(state, name), builtIn: builtIn(state, name) }];
  });
}
