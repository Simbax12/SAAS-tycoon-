// The game engine's flow (docs/GAME_LOGIC.md): starting an incident, solving it, and moving on.
// Also the email and cash helpers every action group uses. It imports none of the other groups.

import { startOfStage, thanksText } from "../data/emails";
import { isBuild, isRepeat } from "../data/incidents";
import { playOrder } from "../data/playOrder";
import { REFRESHER_AT_ONCE } from "../data/repeats";
import { TUTORIAL_INCIDENT } from "../data/tutorial";
import { requestEmails } from "../data/upgrades";
import { emptyCanvas } from "./blueprint";
import {
  computerNeeded,
  currentBuild,
  currentChallenge,
  currentIncident,
  currentRow,
  currentStage,
  currentTune,
  incidentPay,
  nextIncident,
  solvedFirstTry,
} from "./rules";
import type { GameState, Run } from "./types";

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
  standbySaved: false,
  lateItems: [],
});

// Each email key is sent once.
export function sendEmail(state: GameState, key: string): GameState {
  if (state.emails.some((e) => e.key === key)) return state;
  return { ...state, emails: [...state.emails, { key, read: false }] };
}

export const readEmail = (state: GameState, key: string): GameState => ({
  ...state,
  emails: state.emails.map((e) => (e.key === key ? { ...e, read: true } : e)),
});

// Takes cash, never below £0. Returns how much was really taken.
export function takeCash(state: GameState, amount: number): [GameState, number] {
  const taken = Math.min(state.cash, amount);
  return [{ ...state, cash: state.cash - taken }, taken];
}

// All cash coming in pays the loan first (docs/GAME_LOGIC.md > Cash coming in).
export function receiveCash(state: GameState, amount: number): GameState {
  const toLoan = Math.min(amount, state.loanOwed);
  return { ...state, loanOwed: state.loanOwed - toLoan, cash: state.cash + amount - toLoan };
}

// docs/GAME_LOGIC.md > When the run starts.
export function startIncident(state: GameState): GameState {
  let s: GameState = { ...state, run: freshRun(), phase: "waiting" };
  if (!currentIncident(s)) return s;
  // A Build starts with an empty canvas.
  if (currentBuild(s)) s = { ...s, run: { ...s.run, canvas: emptyCanvas() } };

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
export function arrive(state: GameState): GameState {
  const incident = currentIncident(state)!;
  const s: GameState = { ...state, phase: "arrived" };
  return incident.arrives.by === "email" ? sendEmail(s, `arrive:${incident.id}`) : s;
}

// Request emails, skipping any for items already owned (docs/UPGRADES.md > Request emails).
export function sendRequests(state: GameState, due: (r: (typeof requestEmails)[number]) => boolean): GameState {
  return requestEmails
    .filter((r) => due(r) && !state.owned.includes(r.item))
    .reduce((s, r) => sendEmail(s, `request:${r.item}`), state);
}

// docs/GAME_LOGIC.md > When an incident is solved.
export function solve(state: GameState): GameState {
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
  // The finished design is kept so the player can look at it again in Blueprint.
  if (isBuild(incident) && run.canvas) s = { ...s, blueprints: { ...s.blueprints, [row.id]: run.canvas.arrows } };
  // A repeat that was not solved first try gets a refresher (docs/GAME_DESIGN.md > Refreshers).
  if (isRepeat(incident) && !firstTry && !s.refreshersDue.includes(row.id)) {
    s = { ...s, refreshersDue: [...s.refreshersDue, row.id] };
  }
  s = receiveCash(s, incidentPay(state));
  // The last incident of a stage: Maya asks for the new computer now, so it can be bought before "Next".
  const pc = computerNeeded(s);
  if (pc) s = sendEmail(s, `request:${pc.id}`);

  // The player wins when the final incident in the play order is solved.
  if (row.id === playOrder[playOrder.length - 1].id) s = sendEmail({ ...s, won: true }, "opener:win");
  return s;
}

// The right fix is chosen. If the incident has a Tune step, it runs now, and the incident counts
// as solved when it ends (docs/GAME_DESIGN.md > Tune, in SysDash).
export const fixChosen = (state: GameState): GameState => (currentTune(state) ? { ...state, phase: "tune" } : solve(state));

// docs/GAME_LOGIC.md > After the player taps Next.
export function next(state: GameState): GameState {
  if (state.phase !== "solved" || state.won || computerNeeded(state)) return state;
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

  // 4. Move on to the next incident in the play order.
  const upNext = nextIncident(s);
  if (!upNext) return s;
  const oldStage = currentStage(s);
  s = { ...s, currentId: upNext.id };

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
