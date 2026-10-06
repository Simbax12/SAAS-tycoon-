// The game engine (docs/GAME_LOGIC.md). Every change to the game state goes through here.
// It never names a single incident: everything is looked up by id in the data files.

import { startOfStage, thanksText } from "../data/emails";
import { isRepeat } from "../data/incidents";
import { playOrder } from "../data/playOrder";
import { REFRESHER_AT_ONCE } from "../data/repeats";
import { TUTORIAL_INCIDENT } from "../data/tutorial";
import { itemEffects, requestEmails, upgradeById } from "../data/upgrades";
import {
  badDip,
  badPenalty,
  callButton,
  canBuy,
  canBuyLifeline,
  canTestFirst,
  currentChallenge,
  currentIncident,
  currentRow,
  currentStage,
  incidentOpen,
  lifelinePrice,
  loseStar,
  nextIncident,
  partialPenalty,
  payFor,
  solvedFirstTry,
} from "./rules";
import type { Action, GameState, Run, Settings } from "./types";

export const SAVE_VERSION = 1;

export const defaultSettings: Settings = {
  textSize: "normal",
  reduceMotion: false,
  sound: false,
  // "standard" is the wallpaper of the BlipOS version. The Wallpaper pack adds three more.
  wallpaper: "standard",
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
  let s: GameState = { ...state, run: freshRun(), phase: "waiting" };
  if (!currentIncident(s)) return s;

  // Options that owned upgrades take away. Only new incidents lose options this way, and Maya
  // says each item's line (rules.ts > removalLines).
  const challenge = currentChallenge(s);
  if (challenge) {
    const removed = challenge.options.filter((o) => o.removedBy && s.owned.includes(o.removedBy)).map((o) => o.id);
    s = { ...s, run: { ...s.run, removed } };
  }

  // An incident that needs a feature waits until it is bought. The Shop shows it as Needed next.
  const needs = currentRow(s)?.needs;
  if (needs && !s.owned.includes(needs)) return s;
  return arrive(s);
}

// The alert or email from "Arrives by" shows.
function arrive(state: GameState): GameState {
  const incident = currentIncident(state)!;
  const s: GameState = { ...state, phase: "arrived" };
  return incident.arrives.by === "email" ? sendEmail(s, `arrive:${incident.id}`) : s;
}

// docs/GAME_LOGIC.md > Cash going out, and > The investor top-up.
function buy(state: GameState, id: string): GameState {
  const item = upgradeById(id);
  if (!item || !canBuy(state, id)) return state;
  let s = state;
  if (s.cash < item.price) {
    // Only the feature that is Needed next gets here. The investor lends exactly the shortfall,
    // and it goes straight into the feature, so cash ends at £0.
    s = { ...s, loanOwed: s.loanOwed + item.price - s.cash, topUps: s.topUps + 1, cash: item.price };
  }
  s = { ...s, cash: s.cash - item.price, owned: [...s.owned, id], users: s.users + item.usersGained };
  // An item bought during an incident does not change that incident: its once-per-incident help
  // counts as used until the next one starts.
  if (incidentOpen(s)) {
    if (id === itemEffects.testFirst) s = { ...s, run: { ...s.run, testUsed: true } };
    if (id === itemEffects.freeFirstCall) s = { ...s, run: { ...s.run, handbookUsed: true } };
  }
  // Buying the feature the current incident waits for lets that incident arrive.
  if (s.phase === "waiting" && s.emails.length > 0 && currentRow(s)?.needs === id) s = arrive(s);
  return s;
}

function buyLifeline(state: GameState): GameState {
  if (!canBuyLifeline(state)) return state;
  return { ...state, cash: state.cash - lifelinePrice(state), lifeline: currentStage(state) };
}

// The ids of the options or cards still showing: not removed by an upgrade and not tried.
function choicesShowing(state: GameState): string[] {
  const incident = currentIncident(state);
  if (!incident) return [];
  const ids = isRepeat(incident) ? incident.cards.map((c) => c.pattern) : incident.options.map((o) => o.id);
  return ids.filter((id) => !state.run.removed.includes(id) && !state.run.tried.includes(id));
}

// "Test first" shows one option's or card's result and changes nothing else. It cannot be used on
// an option that has been removed. It works on repeats too (docs/UPGRADES.md > Rules when effects combine).
function testFirst(state: GameState, optionId: string): GameState {
  if (!canTestFirst(state) || !choicesShowing(state).includes(optionId)) return state;
  return { ...state, run: { ...state.run, testUsed: true } };
}

// Request emails, skipping any for items already owned (docs/UPGRADES.md > Request emails).
function sendRequests(state: GameState, due: (r: (typeof requestEmails)[number]) => boolean): GameState {
  return requestEmails
    .filter((r) => due(r) && !state.owned.includes(r.item))
    .reduce((s, r) => sendEmail(s, `request:${r.item}`), state);
}

// docs/GAME_LOGIC.md > When an incident is solved.
function solve(state: GameState): GameState {
  const row = currentRow(state)!;
  const incident = currentIncident(state)!;
  const { run } = state;
  const firstTry = solvedFirstTry(run);
  let s: GameState = {
    ...state,
    phase: "solved",
    results: { ...state.results, [row.id]: { stars: run.stars, firstTry } },
    users: state.users + incident.usersGained,
    run: { ...run, dip: 0 },
  };
  // A repeat that was not solved first try gets a refresher (docs/GAME_DESIGN.md > Refreshers).
  if (isRepeat(incident) && !firstTry && !s.refreshersDue.includes(row.id)) {
    s = { ...s, refreshersDue: [...s.refreshersDue, row.id] };
  }
  s = receiveCash(s, payFor(row.kind, row.stage, run.stars));

  // The player wins when the final incident in the play order is solved.
  if (row.id === playOrder[playOrder.length - 1].id) s = sendEmail({ ...s, won: true }, "opener:win");
  return s;
}

// After a wrong pick: if only the right answer is still showing, move to the guided answer.
function afterWrongPick(state: GameState): GameState {
  return choicesShowing(state).length === 1 ? { ...state, phase: "guided" } : state;
}

// docs/GAME_LOGIC.md > Picking.
function pick(state: GameState, optionId: string): GameState {
  const incident = currentIncident(state);
  if (state.phase !== "choosing" || !incident || !choicesShowing(state).includes(optionId)) return state;
  if (isRepeat(incident)) return pickCard(state, optionId);

  const option = incident.options.find((o) => o.id === optionId)!;
  // The Tune step arrives in Milestone 6, so the best option solves the incident straight away.
  if (option.type === "best") return solve(state);

  const wrong = option.type === "partial" ? partialPenalty(currentStage(state)) : badPenalty(state);
  // An outage: users dip by a share of the users on screen until the incident is solved.
  const dip = option.type === "bad" ? badDip(state) : 0;
  const [s, taken] = takeCash(state, wrong);
  return afterWrongPick({
    ...s,
    run: {
      ...s.run,
      stars: loseStar(s.run.stars),
      tried: [...s.run.tried, option.id],
      dip: s.run.dip + dip,
      paid: s.run.paid + taken,
    },
    recycleBin: [...s.recycleBin, { incidentId: incident.id, choice: option.id }],
  });
}

// In a repeat, a wrong card costs 1 star. No cash is lost and there is no dip.
function pickCard(state: GameState, pattern: string): GameState {
  const repeat = currentIncident(state);
  if (!repeat || !isRepeat(repeat)) return state;
  const card = repeat.cards.find((c) => c.pattern === pattern)!;
  if (card.right) return solve(state);
  return afterWrongPick({
    ...state,
    run: { ...state.run, stars: loseStar(state.run.stars), tried: [...state.run.tried, card.pattern] },
    recycleBin: [...state.recycleBin, { incidentId: repeat.id, choice: card.pattern }],
  });
}

// docs/GAME_LOGIC.md > Calls. Calls cost cash, never a star, and never remove an option.
function call(state: GameState): GameState {
  if (state.phase !== "choosing") return state;
  const button = callButton(state);
  if (button.kind !== "call" || !button.affordable) return state;
  const handbookFree =
    button.price === 0 && state.currentId !== TUTORIAL_INCIDENT && state.owned.includes(itemEffects.freeFirstCall);
  return {
    ...state,
    cash: state.cash - button.price,
    run: {
      ...state.run,
      calls: state.run.calls + 1,
      paid: state.run.paid + button.price,
      handbookUsed: state.run.handbookUsed || handbookFree,
    },
  };
}

// Victor gives the answer once every call is used (docs/UPGRADES.md > Victor's lifeline).
function useLifeline(state: GameState): GameState {
  if (state.phase !== "choosing" || callButton(state).kind !== "lifeline") return state;
  return { ...state, lifeline: null, phase: "guided", run: { ...state.run, lifelineUsed: true } };
}

// docs/GAME_LOGIC.md > After the player taps Next.
function next(state: GameState): GameState {
  if (state.phase !== "solved" || state.won) return state;
  const incident = currentIncident(state)!;
  let s = state;
  // The tutorial runs inside its incident only, so it ends when the player moves on.
  if (typeof s.tutorial === "number" && s.currentId === TUTORIAL_INCIDENT) s = { ...s, tutorial: "done" };

  // 1. The thank-you email, if the incident came from a person who sends one.
  if (incident.arrives.by === "email" && thanksText(incident.arrives.from)) s = sendEmail(s, `thanks:${incident.id}`);
  // 2. Refreshers that are due: those waiting since an earlier incident, and any sent straight away.
  const due = s.refreshersDue.filter((id) => id !== incident.id || REFRESHER_AT_ONCE.includes(id));
  s = due.reduce((acc, id) => sendEmail(acc, `refresher:${id}`), s);
  s = { ...s, refreshersDue: s.refreshersDue.filter((id) => !due.includes(id)) };
  // 3. Request emails that arrive after this incident.
  s = sendRequests(s, (r) => "after" in r.arrives && r.arrives.after === incident.id);

  // 4. Move on, unless the next incident is not built yet. Then play stops here, and tapping
  // Next again once it is built carries on from the same place.
  const upNext = nextIncident(s);
  if (!upNext || upNext.blocked) return s;
  const oldStage = currentStage(s);
  s = { ...s, currentId: upNext.row.id };

  // 5. A new stage: drop an unused lifeline from an earlier stage, then Maya's opener, request
  // emails for the start of the stage, and any other email.
  const stage = currentStage(s);
  if (stage !== oldStage) {
    if (s.lifeline !== null && s.lifeline < stage) s = { ...s, lifeline: null };
    s = sendEmail(s, `opener:${stage}`);
    s = sendRequests(s, (r) => "stageStart" in r.arrives && r.arrives.stageStart === stage);
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

    case "call":
      return call(state);

    case "useLifeline":
      return useLifeline(state);

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
