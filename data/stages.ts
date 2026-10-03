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
