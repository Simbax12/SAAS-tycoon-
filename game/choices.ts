// Picking an option or card, Test first, Triage taps and Tune waves (docs/GAME_LOGIC.md > Part 3: Player actions).

import { isBuild, isRepeat } from "../data/incidents";
import { itemEffects } from "../data/upgrades";
import { fixChosen, solve, takeCash } from "./flow";
import {
  badDip,
  badPenalty,
  canTestFirst,
  currentIncident,
  currentStage,
  currentTriage,
  currentTune,
  hasEffect,
  loseStar,
  partialPenalty,
} from "./rules";
import type { GameState } from "./types";

// The ids of the options or cards still showing: not removed by an upgrade and not tried.
export function choicesShowing(state: GameState): string[] {
  const incident = currentIncident(state);
  if (!incident || isBuild(incident)) return [];
  const ids = isRepeat(incident) ? incident.cards.map((c) => c.pattern) : incident.options.map((o) => o.id);
  return ids.filter((id) => !state.run.removed.includes(id) && !state.run.tried.includes(id));
}

// "Test first" shows one option's or card's result and changes nothing else. It cannot be used on
// an option that has been removed. It works on repeats too (docs/UPGRADES.md > Rules when effects combine).
export function testFirst(state: GameState, optionId: string): GameState {
  if (!canTestFirst(state) || !choicesShowing(state).includes(optionId)) return state;
  return { ...state, run: { ...state.run, testUsed: true } };
}

// docs/GAME_LOGIC.md > Part 3: Player actions, "Tap a log line". The cause moves on to the fix.
// A symptom or routine line greys out. Only the first tap decides the bonus.
export function tapLine(state: GameState, lineId: string): GameState {
  const line = currentTriage(state)?.lines.find((l) => l.id === lineId);
  if (state.phase !== "triage" || !line || state.run.triageTaps.includes(lineId)) return state;
  const s: GameState = { ...state, run: { ...state.run, triageTaps: [...state.run.triageTaps, lineId] } };
  return line.kind === "cause" ? { ...s, phase: "choosing" } : s;
}

// Each wave is played once, with no retries. After the last, the incident is solved.
export function runWave(state: GameState, stop: number): GameState {
  const tune = currentTune(state);
  if (state.phase !== "tune" || !tune || !Number.isInteger(stop) || stop < 0 || stop >= tune.stops.length) return state;
  const wave = tune.waves[state.run.tuneWaves.length];
  if (!wave) return state;
  const tuneWaves = [...state.run.tuneWaves, { stop, right: stop === wave.right }];
  const s: GameState = { ...state, run: { ...state.run, tuneWaves } };
  return tuneWaves.length === tune.waves.length ? solve(s) : s;
}

// After a wrong pick: if only the right answer is still showing, move to the guided answer.
export function afterWrongPick(state: GameState): GameState {
  return choicesShowing(state).length === 1 ? { ...state, phase: "guided" } : state;
}

// docs/GAME_LOGIC.md > Picking.
export function pick(state: GameState, optionId: string): GameState {
  const incident = currentIncident(state);
  if (state.phase !== "choosing" || !incident || !choicesShowing(state).includes(optionId)) return state;
  if (isRepeat(incident)) return pickCard(state, optionId);

  if (isBuild(incident)) return state;
  const option = incident.options.find((o) => o.id === optionId)!;
  if (option.type === "best") return fixChosen(state);

  const stage = currentStage(state);
  const wrong = option.type === "partial" ? partialPenalty(stage) : badPenalty(state);
  // An outage: users dip by a share of the users on screen until the incident is solved. The Standby
  // server saves the first one in each stage (docs/UPGRADES.md > Servers).
  const standby =
    option.type === "bad" && hasEffect(state, itemEffects.standby) && !state.standbyStages.includes(stage);
  const dip = option.type === "bad" && !standby ? badDip(state) : 0;
  const [s, taken] = takeCash(state, wrong);
  return afterWrongPick({
    ...s,
    standbyStages: standby ? [...s.standbyStages, stage] : s.standbyStages,
    run: {
      ...s.run,
      stars: loseStar(s.run.stars),
      tried: [...s.run.tried, option.id],
      dip: s.run.dip + dip,
      paid: s.run.paid + taken,
      standbySaved: s.run.standbySaved || standby,
    },
    recycleBin: [...s.recycleBin, { incidentId: incident.id, choice: option.id }],
  });
}

// In a repeat, a wrong card costs 1 star. No cash is lost and there is no dip.
export function pickCard(state: GameState, pattern: string): GameState {
  const repeat = currentIncident(state);
  if (!repeat || !isRepeat(repeat)) return state;
  const card = repeat.cards.find((c) => c.pattern === pattern)!;
  if (card.right) return fixChosen(state);
  return afterWrongPick({
    ...state,
    run: { ...state.run, stars: loseStar(state.run.stars), tried: [...state.run.tried, card.pattern] },
    recycleBin: [...state.recycleBin, { incidentId: repeat.id, choice: card.pattern }],
  });
}
