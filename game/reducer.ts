// The game engine (docs/GAME_LOGIC.md). Every change to the game state goes through here.
// It never names a single incident: everything is looked up by id in the data files.

import { challengeById } from "../data/challenges";
import { startOfStage, thanksText } from "../data/emails";
import { playOrder } from "../data/playOrder";
import { penalties } from "../data/stages";
import { upgradeById } from "../data/upgrades";
import { SHOP_BUILT } from "./built";
import {
  badPenalty,
  currentChallenge,
  currentRow,
  currentStage,
  loseStar,
  nextIncident,
  partialPenalty,
  payFor,
  solvedFirstTry,
  usersOnScreen,
} from "./rules";
import type { Action, GameState, Run, Settings } from "./types";

export const SAVE_VERSION = 1;

export const defaultSettings: Settings = {
  textSize: "normal",
  reduceMotion: false,
  sound: false,
  wallpaper: "hill",
};

export const freshRun = (): Run => ({
  stars: 3,
  tried: [],
  removed: [],
  calls: 0,
  handbookUsed: false,
  lifelineUsed: false,
  testUsed: false,
  dip: 0,
  failedDeploys: 0,
  canvas: null,
  triageTaps: [],
  tuneWaves: [],
  paid: 0,
});

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

// Each email key is sent once.
function sendEmail(state: GameState, key: string): GameState {
  if (state.emails.some((e) => e.key === key)) return state;
  return { ...state, emails: [...state.emails, { key, read: false }] };
}

const readEmail = (state: GameState, key: string): GameState => ({
  ...state,
  emails: state.emails.map((e) => (e.key === key ? { ...e, read: true } : e)),
});

// Takes cash, never below £0. Returns how much was really taken.
function takeCash(state: GameState, amount: number): [GameState, number] {
  const taken = Math.min(state.cash, amount);
  return [{ ...state, cash: state.cash - taken }, taken];
}

// All cash coming in pays the loan first (docs/GAME_LOGIC.md > Cash coming in).
function receiveCash(state: GameState, amount: number): GameState {
  const toLoan = Math.min(amount, state.loanOwed);
  return { ...state, loanOwed: state.loanOwed - toLoan, cash: state.cash + amount - toLoan };
}

// docs/GAME_LOGIC.md > When the run starts.
export function startIncident(state: GameState): GameState {
  const challenge = currentChallenge(state);
  let s: GameState = { ...state, run: freshRun(), phase: "waiting" };
  if (!challenge) return s;

  // Options that owned upgrades take away. Maya's line for it arrives with the Shop in Milestone 4.
  const removed = challenge.options.filter((o) => o.removedBy && s.owned.includes(o.removedBy)).map((o) => o.id);
  s = { ...s, run: { ...s.run, removed } };

  const needs = currentRow(s)?.needs;
  if (needs && !s.owned.includes(needs)) {
    if (SHOP_BUILT) return s;
    // Until the Shop is built, the needed feature is owned for free and brings its users (game/built.ts).
    s = { ...s, owned: [...s.owned, needs], users: s.users + (upgradeById(needs)?.usersGained ?? 0) };
  }

  s = { ...s, phase: "arrived" };
  if (challenge.arrives.by === "email") s = sendEmail(s, `arrive:${challenge.id}`);
  return s;
}

// docs/GAME_LOGIC.md > When an incident is solved.
function solve(state: GameState): GameState {
  const row = currentRow(state)!;
  const challenge = currentChallenge(state)!;
  const { run } = state;
  let s: GameState = {
    ...state,
    phase: "solved",
    results: { ...state.results, [row.id]: { stars: run.stars, firstTry: solvedFirstTry(run) } },
    users: state.users + challenge.usersGained,
    run: { ...run, dip: 0 },
  };
  s = receiveCash(s, payFor(row.kind, row.stage, run.stars));

  // The player wins when the final incident in the play order is solved.
  if (row.id === playOrder[playOrder.length - 1].id) s = sendEmail({ ...s, won: true }, "opener:win");
  return s;
}

// After a wrong pick: if only the right answer is still showing, move to the guided answer.
function afterWrongPick(state: GameState): GameState {
  const challenge = currentChallenge(state)!;
  const { removed, tried } = state.run;
  const showing = challenge.options.filter((o) => !removed.includes(o.id) && !tried.includes(o.id));
  return showing.length === 1 ? { ...state, phase: "guided" } : state;
}

function pick(state: GameState, optionId: string): GameState {
  const challenge = currentChallenge(state);
  if (state.phase !== "choosing" || !challenge) return state;
  const option = challenge.options.find((o) => o.id === optionId);
  if (!option || state.run.removed.includes(option.id) || state.run.tried.includes(option.id)) return state;

  // The Tune step arrives in Milestone 6, so the best option solves the incident straight away.
  if (option.type === "best") return solve(state);

  const stage = currentStage(state);
  const wrong = option.type === "partial" ? partialPenalty(stage) : badPenalty(stage);
  const [s, taken] = takeCash(state, wrong);
  // An outage: users dip by a share of the users on screen until the incident is solved.
  const dip = option.type === "bad" ? Math.round(usersOnScreen(s) * penalties.badDip) : 0;
  return afterWrongPick({
    ...s,
    run: {
      ...s.run,
      stars: loseStar(s.run.stars),
      tried: [...s.run.tried, option.id],
      dip: s.run.dip + dip,
      paid: s.run.paid + taken,
    },
    recycleBin: [...s.recycleBin, { incidentId: challenge.id, choice: option.id }],
  });
}

// docs/GAME_LOGIC.md > After the player taps Next.
function next(state: GameState): GameState {
  if (state.phase !== "solved" || state.won) return state;
  const challenge = currentChallenge(state)!;
  let s = state;

  // 1. The thank-you email, if the incident came from a person who sends one.
  if (challenge.arrives.by === "email" && thanksText(challenge.arrives.from)) s = sendEmail(s, `thanks:${challenge.id}`);
  // 2 and 3. Refreshers and request emails arrive in later milestones.

  // 4. Move on, unless the next incident is not built yet. Then play stops here, and tapping
  // Next again once it is built carries on from the same place.
  const upNext = nextIncident(s);
  if (!upNext || upNext.blocked) return s;
  const oldStage = currentStage(s);
  s = { ...s, currentId: upNext.row.id };

  // 5. A new stage: drop an unused lifeline from an earlier stage, then Maya's opener and any other email.
  const stage = currentStage(s);
  if (stage !== oldStage) {
    if (s.lifeline !== null && s.lifeline < stage) s = { ...s, lifeline: null };
    s = sendEmail(s, `opener:${stage}`);
    if (startOfStage[stage]) s = sendEmail(s, `other:${stage}`);
  }

  // 6. Start the next incident.
  return startIncident(s);
}

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
      // The Triage step arrives in Milestone 6, so the incident goes straight to choosing.
      return { ...readEmail(state, `arrive:${state.currentId}`), phase: "choosing" };
    }

    case "pick":
      return pick(state, action.optionId);

    case "applyGuided":
      return state.phase === "guided" ? solve(state) : state;

    case "next":
      return next(state);

    case "openEmail":
      return readEmail(state, action.key);

    case "reset":
      return freshState(action.seed, state.settings);
  }
}
