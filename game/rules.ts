// The numbers rules, worked out from the data files.
// Pay and penalties: docs/GAME_DESIGN.md > Money, > Option types in new incidents and > Stars.

import { challengeById, type Challenge } from "../data/challenges";
import { playOrder, playOrderRow, type IncidentKind, type PlayOrderRow } from "../data/playOrder";
import { penalties, REPEAT_PAY_SHARE, stageByNumber, starMultiplier, type StageNumber } from "../data/stages";
import { BUILDS_BUILT } from "./built";
import type { GameState, Run, Stars } from "./types";

export const baseCash = (stage: StageNumber) => stageByNumber(stage).baseCash;

// docs/GAME_LOGIC.md > Cash coming in. Bonuses and the Faster PC arrive in later milestones.
export function payFor(kind: IncidentKind, stage: StageNumber, stars: Stars): number {
  const base = baseCash(stage) * (kind === "repeat" ? REPEAT_PAY_SHARE : 1);
  return Math.round(base * starMultiplier[stars]);
}

export const partialPenalty = (stage: StageNumber) => Math.round(baseCash(stage) * penalties.partialCash);
export const badPenalty = (stage: StageNumber) => Math.round(baseCash(stage) * penalties.badCash);

export const usersOnScreen = (state: GameState) => state.users - state.run.dip;

export const loseStar = (stars: Stars): Stars => (stars > 1 ? ((stars - 1) as Stars) : 1);

// docs/GAME_DESIGN.md > Solved first try.
export const solvedFirstTry = (run: Run) =>
  run.tried.length === 0 && run.failedDeploys === 0 && run.calls === 0 && !run.lifelineUsed;

// --- The play order ---

export const currentRow = (state: GameState): PlayOrderRow | undefined => playOrderRow(state.currentId);

export const currentChallenge = (state: GameState): Challenge | undefined => challengeById(state.currentId);

export function currentStage(state: GameState): StageNumber {
  if (state.won) return 5;
  return currentRow(state)?.stage ?? 1;
}

// Whether this milestone can play an incident: its data file has it.
// Repeats arrive in Milestone 5, so for now only new incidents have data.
export const isPlayable = (row: PlayOrderRow) => row.kind === "new" && challengeById(row.id) !== undefined;

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
