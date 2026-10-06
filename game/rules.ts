// The numbers rules, worked out from the data files.
// Pay and penalties: docs/GAME_DESIGN.md > Money, > Option types in new incidents and > Stars.

import { challengeById, type Challenge } from "../data/challenges";
import { incidentById, type IncidentData } from "../data/incidents";
import { playOrder, playOrderRow, type IncidentKind, type PlayOrderRow } from "../data/playOrder";
import { callPrices, penalties, progressMarkers, REPEAT_PAY_SHARE, stageByNumber, starMultiplier, type StageNumber } from "../data/stages";
import { TUTORIAL_INCIDENT } from "../data/tutorial";
import { itemEffects, LIFELINE_TIMES, MONITORING_SHARE, upgradeById, upgrades, type Upgrade } from "../data/upgrades";
import { BUILDS_BUILT } from "./built";
import type { GameState, Run, Stars } from "./types";

export const baseCash = (stage: StageNumber) => stageByNumber(stage).baseCash;

// docs/GAME_LOGIC.md > Cash coming in. Bonuses and the Faster PC arrive in later milestones.
export function payFor(kind: IncidentKind, stage: StageNumber, stars: Stars): number {
  const base = baseCash(stage) * (kind === "repeat" ? REPEAT_PAY_SHARE : 1);
  return Math.round(base * starMultiplier[stars]);
}

export const partialPenalty = (stage: StageNumber) => Math.round(baseCash(stage) * penalties.partialCash);

// Monitoring halves bad-choice penalties: the cash loss and the user dip (docs/UPGRADES.md > Servers).
const badShare = (state: GameState) => (state.owned.includes(itemEffects.halfPenalties) ? MONITORING_SHARE : 1);
export const badPenalty = (state: GameState) => Math.round(baseCash(currentStage(state)) * penalties.badCash * badShare(state));
export const badDip = (state: GameState) => Math.round(usersOnScreen(state) * penalties.badDip * badShare(state));

export const usersOnScreen = (state: GameState) => state.users - state.run.dip;

export const loseStar = (stars: Stars): Stars => (stars > 1 ? ((stars - 1) as Stars) : 1);

// docs/GAME_DESIGN.md > Solved first try.
export const solvedFirstTry = (run: Run) =>
  run.tried.length === 0 && run.failedDeploys === 0 && run.calls === 0 && !run.lifelineUsed;

// How full the bar to 1 billion is, from 0 to 1 (docs/GAME_DESIGN.md > Progress bar): five equal
// segments, each filled in proportion between its two markers. The bar stops at full.
export function progressShare(users: number): number {
  const segment = 1 / progressMarkers.length;
  let low = 0;
  for (let i = 0; i < progressMarkers.length; i++) {
    const high = progressMarkers[i];
    if (users < high) return segment * (i + Math.max(0, users - low) / (high - low));
    low = high;
  }
  return 1;
}

// --- Calls to Dana (docs/GAME_DESIGN.md > Consultant calls) ---

// A new or repeat incident has one call per clue: the Nudge, then each Clue line.
// Builds get their own count when Blueprint arrives in Milestone 6.
export function callsIn(state: GameState): number {
  const incident = currentIncident(state);
  return incident ? 1 + incident.clues.length : 0;
}

// The clues given so far in this incident, in order.
export function cluesGiven(state: GameState): string[] {
  const incident = currentIncident(state);
  if (!incident) return [];
  return [incident.nudge, ...incident.clues].slice(0, state.run.calls);
}

// The price of the next call. Every call in the tutorial incident is free, and the Engineering
// handbook makes the first call in each incident free (docs/GAME_LOGIC.md > Derived values).
export function nextCallPrice(state: GameState): number {
  if (state.currentId === TUTORIAL_INCIDENT) return 0;
  if (state.owned.includes(itemEffects.freeFirstCall) && !state.run.handbookUsed) return 0;
  const share = callPrices.first + callPrices.step * state.run.calls;
  return Math.round(baseCash(currentStage(state)) * share);
}

export type CallButton =
  | { kind: "call"; price: number; affordable: boolean }
  | { kind: "lifeline" }
  | { kind: "noMore" };

// What the button at the bottom of the Incident window offers (docs/UI_THEME.md > Dana and Victor).
export function callButton(state: GameState): CallButton {
  if (state.run.calls < callsIn(state)) {
    const price = nextCallPrice(state);
    return { kind: "call", price, affordable: state.cash >= price };
  }
  return state.lifeline === currentStage(state) ? { kind: "lifeline" } : { kind: "noMore" };
}

// --- The Shop (docs/GAME_LOGIC.md > Derived values) ---

// Items whose stage is at or below the current stage.
export const itemsOnShow = (state: GameState): Upgrade[] => upgrades.filter((u) => u.stage <= currentStage(state));

// The current incident's "Needs" feature, if it is not owned.
export function neededNext(state: GameState): string | undefined {
  const needs = currentRow(state)?.needs;
  return needs && !state.owned.includes(needs) ? needs : undefined;
}

// On show, not owned, and either the cash covers it or it is Needed next.
export function canBuy(state: GameState, id: string): boolean {
  const item = upgradeById(id);
  if (!item || item.stage > currentStage(state) || state.owned.includes(id)) return false;
  return state.cash >= item.price || neededNext(state) === id;
}

// docs/UPGRADES.md > Victor's lifeline: 2 x the base cash of the current stage.
export const lifelinePrice = (state: GameState) => baseCash(currentStage(state)) * LIFELINE_TIMES;

export const canBuyLifeline = (state: GameState) => state.lifeline === null && state.cash >= lifelinePrice(state);

// "Test first": once per incident, with the Test environment owned (docs/UPGRADES.md > Rules when effects combine).
export const canTestFirst = (state: GameState) =>
  state.phase === "choosing" && state.owned.includes(itemEffects.testFirst) && !state.run.testUsed;

// --- The play order ---

export const currentRow = (state: GameState): PlayOrderRow | undefined => playOrderRow(state.currentId);

// The current incident, new or repeat.
export const currentIncident = (state: GameState): IncidentData | undefined => incidentById(state.currentId);

// The current incident, if it is a new one.
export const currentChallenge = (state: GameState): Challenge | undefined => challengeById(state.currentId);

// What Maya says when owned upgrades took options away at the start of this incident
// (docs/GAME_LOGIC.md > When the run starts). Each item's line is said once.
export function removalLines(state: GameState): string[] {
  const options = currentChallenge(state)?.options ?? [];
  const lines = options
    .filter((o) => o.removedBy && state.run.removed.includes(o.id))
    .map((o) => upgradeById(o.removedBy!)?.maya)
    .filter((line): line is string => !!line);
  return [...new Set(lines)];
}

export function currentStage(state: GameState): StageNumber {
  if (state.won) return 5;
  return currentRow(state)?.stage ?? 1;
}

// Whether this milestone can play an incident: its data file has it.
export const isPlayable = (row: PlayOrderRow) => row.kind !== "build" && incidentById(row.id) !== undefined;

// The incident after the current one. Builds are skipped until Blueprint is built.
// "blocked" means the next incident is not in the data files yet, so play stops here.
export function nextIncident(state: GameState): { row: PlayOrderRow; blocked: boolean } | null {
  const at = playOrder.findIndex((r) => r.id === state.currentId);
  for (const row of playOrder.slice(at + 1)) {
    if (row.kind === "build" && !BUILDS_BUILT) continue;
    return { row, blocked: !isPlayable(row) };
  }
  return null;
}

// --- The fixed shuffle (docs/GAME_LOGIC.md > Derived values) ---

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The same seed and incident id always give the same order, so cards keep their places after a reload.
export function shuffled<T>(items: T[], seed: number, incidentId: string): T[] {
  const out = [...items];
  const next = random(hash(`${seed}:${incidentId}`));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const newSeed = () => Math.floor(Math.random() * 2 ** 31);

// An incident has arrived and is not solved yet. The Incident icon shows its red badge.
export const incidentOpen = (state: GameState) =>
  ["arrived", "triage", "choosing", "guided", "tune"].includes(state.phase);
