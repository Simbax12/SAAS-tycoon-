// Saving and loading (docs/GAME_LOGIC.md > Three rules for the save, and > Loading a save).
// Each save format has its own key, so an old save is never overwritten by a new build.
// Old saves are carried forward by migrations, never wiped.

import { playOrder } from "../data/playOrder";
import { defaultSettings, SAVE_VERSION, startIncident } from "./reducer";
import type { GameState } from "./types";

export type Storage = Pick<globalThis.Storage, "getItem" | "setItem">;

export const saveKey = (version: number) => `zero-to-a-billion:save:v${version}`;

// migrations[n] upgrades a version n save to version n + 1. Add one with every change to the save format.
const migrations: Record<number, (old: Record<string, unknown>) => Record<string, unknown>> = {};

export function saveGame(storage: Storage, state: GameState) {
  try {
    storage.setItem(saveKey(SAVE_VERSION), JSON.stringify(state));
  } catch {
    // A full or blocked storage must never stop play.
  }
}

// Finds the newest save, upgrades it to the current version, and fixes a place that no longer exists.
// Returns null when there is no save, or it cannot be read at all.
export function loadGame(storage: Storage): GameState | null {
  for (let version = SAVE_VERSION; version >= 1; version--) {
    let raw: string | null = null;
    try {
      raw = storage.getItem(saveKey(version));
    } catch {
      return null;
    }
    if (!raw) continue;
    try {
      let data = JSON.parse(raw) as Record<string, unknown>;
      for (let v = version; v < SAVE_VERSION; v++) data = { ...migrations[v](data), saveVersion: v + 1 };
      return carryOn(data as unknown as GameState);
    } catch {
      return null;
    }
  }
  return null;
}

function carryOn(state: GameState): GameState {
  if (typeof state.currentId !== "string" || !Array.isArray(state.emails) || typeof state.results !== "object") {
    throw new Error("Not a save");
  }
  const s: GameState = { ...state, settings: { ...defaultSettings, ...state.settings } };
  // If the current incident was removed from the play order, carry on from the first one not yet solved.
  if (!playOrder.some((r) => r.id === s.currentId)) {
    const first = playOrder.find((r) => !s.results[r.id]) ?? playOrder[playOrder.length - 1];
    const moved = { ...s, currentId: first.id };
    return s.emails.length > 0 ? startIncident(moved) : { ...moved, phase: "waiting" };
  }
  return s;
}
