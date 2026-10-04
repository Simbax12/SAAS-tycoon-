// Copied from docs/GAME_DESIGN.md > Stages. The docs win if the two disagree.

export type StageNumber = 1 | 2 | 3 | 4 | 5;

export type Stage = {
  stage: StageNumber;
  name: string;
  baseCash: number;
};

export const stages: Stage[] = [
  { stage: 1, name: "Garage", baseCash: 500 },
  { stage: 2, name: "First office", baseCash: 2_000 },
  { stage: 3, name: "Scale-up", baseCash: 10_000 },
  { stage: 4, name: "Big tech", baseCash: 50_000 },
  { stage: 5, name: "Planet scale", baseCash: 250_000 },
];

export const stageByNumber = (n: StageNumber): Stage => stages.find((s) => s.stage === n)!;

// Copied from docs/GAME_DESIGN.md > Money and > Option types in new incidents.

// Cash paid when an incident is solved is base cash x this, by the run's final stars.
export const starMultiplier: Record<1 | 2 | 3, number> = { 3: 1.5, 2: 1, 1: 0.5 };

// A repeat pays half the base cash for the stage.
export const REPEAT_PAY_SHARE = 0.5;

// Penalties in new incidents, as shares of the stage's base cash or of the users on screen.
export const penalties = {
  partialCash: 0.2,
  badCash: 0.1,
  badDip: 0.1,
};

// Copied from docs/GAME_DESIGN.md > Consultant calls, as shares of the stage's base cash.
// Call 1 costs `first`. Each call after that costs `step` more than the call before.
export const callPrices = { first: 0.15, step: 0.1 };

// Copied from docs/GAME_DESIGN.md > Progress bar: five equal segments, ending at these users.
export const progressMarkers = [1_000, 100_000, 10_000_000, 100_000_000, 1_000_000_000];
