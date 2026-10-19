// The game engine (docs/GAME_LOGIC.md). Every change to the game state goes through here.
// It never names a single incident: everything is looked up by id in the data files.

import { playOrder } from "../data/playOrder";
import { removePart, sameArrow } from "./blueprint";
import { pick, runWave, tapLine, testFirst } from "./choices";
import { deploy, drawArrow, editCanvas, place } from "./drawing";
import { fixChosen, freshRun, next, readEmail, sendEmail, solve, startIncident } from "./flow";
import { currentBuild, currentStage, currentTriage } from "./rules";
import { applyLifeline, buy, buyLifeline, call } from "./spending";
import type { Action, GameState, Settings } from "./types";

export { startIncident } from "./flow";

// Version 2 places each part on the Blueprint canvas. Version 3 adds the Standby server and late item
// fields to the run. Version 4 removes the Faster PC (game/save.ts has the migrations).
export const SAVE_VERSION = 4;

export const defaultSettings: Settings = {
  textSize: "normal",
  reduceMotion: false,
  sound: false,
  // "standard" is the wallpaper of the BlipOS version. The Wallpaper pack adds three more.
  wallpaper: "standard",
};

// docs/GAME_LOGIC.md > The game state, the "At the start" column.
export const freshState = (seed: number, settings: Settings = defaultSettings): GameState => ({
  saveVersion: SAVE_VERSION,
  seed,
  currentId: playOrder[0].id,
  phase: "waiting",
  run: freshRun(),
  users: 0,
  cash: 0,
  loanOwed: 0,
  topUps: 0,
  owned: [],
  lifeline: null,
  emails: [],
  recycleBin: [],
  results: {},
  refreshersDue: [],
  standbyStages: [],
  blueprints: {},
  tutorial: 1,
  tipsSeen: [],
  settings,
  won: false,
});

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "load":
      return action.state;

    case "begin": {
      // docs/GAME_LOGIC.md > The start of the game. Maya's opener is always the first email.
      if (state.emails.length > 0) return state;
      return startIncident(sendEmail(state, `opener:${currentStage(state)}`));
    }

    case "investigate": {
      if (state.phase !== "arrived") return state;
      // An incident with a Triage step starts in Terminal (docs/GAME_DESIGN.md > Extra steps: Triage and Tune).
      return { ...readEmail(state, `arrive:${state.currentId}`), phase: currentTriage(state) ? "triage" : "choosing" };
    }

    case "pick":
      return pick(state, action.optionId);

    case "applyGuided":
      if (state.phase !== "guided") return state;
      return currentBuild(state) ? solve(state) : fixChosen(state);

    case "tapLine":
      return tapLine(state, action.lineId);

    case "runWave":
      return runWave(state, action.stop);

    case "placePart":
      return place(state, action.part, action.x, action.y);

    case "removePart":
      return editCanvas(state, (canvas) => (canvas.locked.includes(action.part) ? canvas : removePart(canvas, action.part)));

    case "drawArrow":
      return drawArrow(state, action.from, action.to);

    case "deleteArrow":
      return editCanvas(state, (canvas) => ({
        ...canvas,
        arrows: canvas.arrows.filter((a) => !sameArrow(a, { from: action.from, to: action.to })),
      }));

    case "deploy":
      return deploy(state, !!action.test);

    case "next":
      return next(state);

    case "openEmail":
      return readEmail(state, action.key);

    case "call":
      return call(state);

    case "useLifeline":
      return applyLifeline(state);

    case "buy":
      return buy(state, action.itemId);

    case "buyLifeline":
      return buyLifeline(state);

    case "testFirst":
      return testFirst(state, action.optionId);

    case "tutorial":
      return { ...state, tutorial: action.step };

    case "setting":
      return { ...state, settings: { ...state.settings, ...action.settings } };

    case "tipSeen":
      return state.tipsSeen.includes(action.id) ? state : { ...state, tipsSeen: [...state.tipsSeen, action.id] };

    case "reset":
      return freshState(action.seed, state.settings);
  }
}
