// Calls, Victor's lifeline and Shop buys: the actions that spend cash (docs/GAME_LOGIC.md > Cash going out).

import { TUTORIAL_INCIDENT } from "../data/tutorial";
import { itemEffects, upgradeById } from "../data/upgrades";
import { callInBuild, drawSolution } from "./blueprint";
import { arrive } from "./flow";
import {
  callButton,
  canBuy,
  canBuyLifeline,
  currentBuild,
  currentRow,
  currentStage,
  incidentOpen,
  lifelinePrice,
} from "./rules";
import type { GameState } from "./types";

// docs/GAME_LOGIC.md > Cash going out, and > The investor top-up.
export function buy(state: GameState, id: string): GameState {
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
  // counts as used, and its other effects wait in lateItems, until the next one starts.
  if (incidentOpen(s)) {
    if (id === itemEffects.testFirst) s = { ...s, run: { ...s.run, testUsed: true } };
    if (id === itemEffects.freeFirstCall) s = { ...s, run: { ...s.run, handbookUsed: true } };
    s = { ...s, run: { ...s.run, lateItems: [...s.run.lateItems, id] } };
  }
  // Buying the feature the current incident waits for lets that incident arrive.
  if (s.phase === "waiting" && s.emails.length > 0 && currentRow(s)?.needs === id) s = arrive(s);
  return s;
}

export function buyLifeline(state: GameState): GameState {
  if (!canBuyLifeline(state)) return state;
  return { ...state, cash: state.cash - lifelinePrice(state), lifeline: currentStage(state) };
}

// docs/GAME_LOGIC.md > Calls. Calls cost cash, never a star, and never remove an option.
export function call(state: GameState): GameState {
  if (state.phase !== "choosing") return state;
  const button = callButton(state);
  if (button.kind !== "call" || !button.affordable) return state;
  const handbookFree =
    button.price === 0 && state.currentId !== TUTORIAL_INCIDENT && state.owned.includes(itemEffects.freeFirstCall);
  const calls = state.run.calls + 1;
  // In a Build, calls place parts and remove the decoys (docs/GAME_DESIGN.md > Calls in a Build).
  const build = currentBuild(state);
  const canvas = build && state.run.canvas ? callInBuild(build, state.run.canvas, calls) : state.run.canvas;
  return {
    ...state,
    cash: state.cash - button.price,
    run: {
      ...state.run,
      calls,
      canvas,
      paid: state.run.paid + button.price,
      handbookUsed: state.run.handbookUsed || handbookFree,
    },
  };
}

// Victor gives the answer once every call is used (docs/UPGRADES.md > Victor's lifeline).
export function applyLifeline(state: GameState): GameState {
  if (state.phase !== "choosing" || callButton(state).kind !== "lifeline") return state;
  // In a Build, Victor draws the Solution.
  const build = currentBuild(state);
  const canvas = build && state.run.canvas ? drawSolution(build, state.run.canvas) : state.run.canvas;
  return { ...state, lifeline: null, phase: "guided", run: { ...state.run, lifelineUsed: true, canvas } };
}
