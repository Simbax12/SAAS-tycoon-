// Copied from docs/UPGRADES.md. The docs win if the two disagree.
// Milestone 2 only needs the must-have features. The rest of the Shop is added in Milestone 4.

import type { StageNumber } from "./stages";

export type Upgrade = {
  id: string;
  name: string;
  stage: StageNumber;
  usersGained: number;
  price: number;
  // The incident this feature unlocks.
  unlocks?: string;
};

export const upgrades: Upgrade[] = [
  { id: "feat-payments", name: "Payments", stage: 1, usersGained: 50, price: 300, unlocks: "1.3" },
  { id: "feat-photos", name: "Photo sharing", stage: 2, usersGained: 15_000, price: 2_000, unlocks: "2.3" },
  { id: "feat-email", name: "Email notifications", stage: 3, usersGained: 1_500_000, price: 8_000, unlocks: "3.3" },
  { id: "feat-verified", name: "Verified accounts", stage: 4, usersGained: 10_000_000, price: 40_000, unlocks: "4.3" },
  { id: "feat-global", name: "Global launch", stage: 5, usersGained: 200_000_000, price: 300_000, unlocks: "5.1" },
];

export const upgradeById = (id: string): Upgrade | undefined => upgrades.find((u) => u.id === id);

// Which item gives which effect, so the engine never names an item itself.
// docs/UPGRADES.md > Your setup: "The first call to Dana in each incident is free".
export const itemEffects = { freeFirstCall: "gear-handbook" };
