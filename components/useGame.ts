"use client";

import { createContext, useContext, useEffect, useReducer, useState } from "react";
import { freshState, reducer } from "@/game/reducer";
import { newSeed } from "@/game/rules";
import { loadGame, saveGame } from "@/game/save";
import type { Action, GameState } from "@/game/types";

export type Game = { state: GameState; dispatch: (action: Action) => void };

// Holds the game state, loads the save once, and saves after every change (docs/GAME_LOGIC.md > Saving).
// `hadSave` is null until the save has been read.
export function useGame(): Game & { hadSave: boolean | null } {
  const [state, dispatch] = useReducer(reducer, 0, freshState);
  const [hadSave, setHadSave] = useState<boolean | null>(null);

  useEffect(() => {
    const saved = loadGame(window.localStorage);
    dispatch(saved ? { type: "load", state: saved } : { type: "reset", seed: newSeed() });
    setHadSave(saved !== null);
  }, []);

  // Nothing is saved until the game has begun, so a visit that ends before sitting down
  // still counts as the first one next time (docs/ROOM.md > The first time the game is opened).
  useEffect(() => {
    if (hadSave !== null && state.emails.length > 0) saveGame(window.localStorage, state);
  }, [state, hadSave]);

  return { state, dispatch, hadSave };
}

export const GameContext = createContext<Game | null>(null);

export function useGameContext(): Game {
  const game = useContext(GameContext);
  if (!game) throw new Error("useGameContext needs a GameContext provider");
  return game;
}
