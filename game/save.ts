// Saving and loading (docs/GAME_LOGIC.md > Three rules for the save, and > Loading a save).
// Each save format has its own key, so an old save is never overwritten by a new build.
// Old saves are carried forward by migrations, never wiped.

import { playOrder } from "../data/playOrder";
import { defaultSettings, SAVE_VERSION, startIncident } from "./reducer";
import { computerNeeded } from "./rules";
import type { GameState } from "./types";

export type Storage = Pick<globalThis.Storage, "getItem" | "setItem">;

export const saveKey = (version: number) => `zero-to-a-billion:save:v${version}`;

// The Faster PC's price, given back when version 4 removes it.
const FASTER_PC_REFUND = 6_000;

// migrations[n] upgrades a version n save to version n + 1. Add one with every change to the save format.
const migrations: Record<number, (old: Record<string, unknown>) => Record<string, unknown>> = {
  // Version 2 gives each part on the Blueprint canvas a place. Version 1 could not play a Build,
  // so its canvas is always empty, but any part names found are spread along the middle.
  1: (old) => {
    const run = old.run as { canvas?: { parts?: unknown[] } | null } | undefined;
    const parts = run?.canvas?.parts;
    if (!run || !run.canvas || !Array.isArray(parts)) return old;
    const placed = parts.map((p, i) => (typeof p === "string" ? { name: p, x: (i + 0.5) / parts.length, y: 0.5 } : p));
    return { ...old, run: { ...run, canvas: { ...run.canvas, parts: placed } } };
  },
  // Version 3 adds two run fields for the Stage 3 items. No save could reach Stage 3 before, so both start empty.
  2: (old) => {
    const run = old.run as Record<string, unknown> | undefined;
    return run ? { ...old, run: { ...run, standbySaved: false, lateItems: [] } } : old;
  },
  // Version 4 removes the Faster PC from the Shop. A save that owns it gets its £6,000 back
  // (docs/GAME_LOGIC.md > Loading a save).
  3: (old) => {
    const owned = Array.isArray(old.owned) ? (old.owned as string[]) : [];
    if (!owned.includes("gear-pc")) return old;
    const run = old.run as { lateItems?: string[] } | undefined;
    const lateItems = run?.lateItems?.filter((id) => id !== "gear-pc");
    return {
      ...old,
      owned: owned.filter((id) => id !== "gear-pc"),
      cash: (Number(old.cash) || 0) + FASTER_PC_REFUND,
      run: run ? { ...run, lateItems } : run,
    };
  },
};



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
  let s: GameState = { ...state, settings: { ...defaultSettings, ...state.settings } };
  // A save that finished a stage before new computers existed gets Maya's email now, so "Next" can move on.
  const pc = computerNeeded(s);
  if (pc && !s.emails.some((e) => e.key === `request:${pc.id}`)) s = { ...s, emails: [...s.emails, { key: `request:${pc.id}`, read: false }] };
  // If the current incident was removed from the play order, carry on from the first one not yet solved.
  if (!playOrder.some((r) => r.id === s.currentId)) {
    const first = playOrder.find((r) => !s.results[r.id]) ?? playOrder[playOrder.length - 1];
    const moved = { ...s, currentId: first.id };
    return s.emails.length > 0 ? startIncident(moved) : { ...moved, phase: "waiting" };
  }
  return s;
}
