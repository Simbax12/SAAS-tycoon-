// Helpers shared by the reducer test files. Not a test file itself, so `npm test` does not run it.

import { buildById } from "../data/blueprints";
import { freshState, reducer } from "./reducer";
import { repeatById } from "../data/repeats";
import { tuneFor } from "../data/extraSteps";
import { neededNext } from "./rules";
import { type Storage } from "./save";
import type { Action, GameState } from "./types";

export const play = (state: GameState, ...actions: Action[]) => actions.reduce(reducer, state);

export const begun = () => play(freshState(42), { type: "begin" });

export const pick = (optionId: string): Action => ({ type: "pick", optionId });

// Investigate, then find the cause first try if the incident has a Triage step.
export const look: Action[] = [{ type: "investigate" }, { type: "tapLine", lineId: "cause" }];

export const solveBest: Action[] = [...look, pick("best")];

export const deploy: Action = { type: "deploy" };

export function memoryStorage(): Storage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
}

export const call: Action = { type: "call" };

export const buy = (itemId: string): Action => ({ type: "buy", itemId });

// The right answer for the current incident: the best option, or the right pattern card.
export function rightChoice(s: GameState): string {
  const repeat = repeatById(s.currentId);
  return repeat ? repeat.cards.find((c) => c.right)!.pattern : "best";
}

// Draws a Build's Solution on the canvas: its parts, then its arrows.
export function drawRight(id: string): Action[] {
  const build = buildById(id)!;
  const parts = [...new Set(build.solution.flatMap((a) => [a.from, a.to]))];
  return [
    ...parts.map((part, i): Action => ({ type: "placePart", part, x: (i + 0.5) / parts.length, y: 0.5 })),
    ...build.solution.map((a): Action => ({ type: "drawArrow", ...a })),
  ];
}

// Solves the current incident first try and taps Next, buying any feature the next one waits for.
// Stops if nothing moves, so a test can never loop for ever.
export function solveNext(s: GameState): GameState {
  let n = play(s, ...look);
  n = buildById(n.currentId) ? play(n, ...drawRight(n.currentId), deploy) : reducer(n, pick(rightChoice(n)));
  n = runTune(n);
  // The last incident of a stage waits for the new computer.
  const computer = neededNext(n);
  if (computer) n = reducer(n, buy(computer));
  n = reducer(n, { type: "next" });
  const needs = neededNext(n);
  return needs ? reducer(n, buy(needs)) : n;
}

// Sets every wave of a Tune step right.
export function runTune(s: GameState): GameState {
  const tune = tuneFor(s.currentId);
  return s.phase === "tune" && tune ? play(s, ...tune.waves.map((w): Action => ({ type: "runWave", stop: w.right }))) : s;
}

// Plays from the start up to an incident, solving each one first try.
export function playTo(id: string): GameState {
  let s = begun();
  while (s.currentId !== id) {
    const n = solveNext(s);
    if (n.currentId === s.currentId) throw new Error(`Stuck on ${s.currentId}`);
    s = n;
  }
  return s;
}
