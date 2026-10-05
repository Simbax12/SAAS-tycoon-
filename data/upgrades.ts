// Copied from docs/UPGRADES.md. The docs win if the two disagree.
// Every item is here. Effects are built stage by stage: Stage 1's in Milestone 4, the rest with their stage.

import type { PersonId } from "./people";
import type { StageNumber } from "./stages";

export type ShopGroup = "must" | "nice" | "server" | "setup";
export type Change = "Small" | "Medium" | "Big";
export type UsersSize = "None" | "Some" | "Lots" | "Huge";

export type Upgrade = {
  id: string;
  name: string;
  group: ShopGroup;
  stage: StageNumber;
  change: Change;
  users: UsersSize;
  usersGained: number;
  price: number;
  // The incident this feature unlocks.
  unlocks?: string;
  // The Effect column, for servers and "Your setup" items, without Maya's line.
  effect?: string;
  // What Maya says when the effect happens, from the end of the Effect column.
  maya?: string;
};

export const upgrades: Upgrade[] = [
  // Must-have features
  { id: "feat-payments", name: "Payments", group: "must", stage: 1, change: "Medium", users: "Some", usersGained: 50, price: 300, unlocks: "1.3" },
  { id: "feat-photos", name: "Photo sharing", group: "must", stage: 2, change: "Big", users: "Lots", usersGained: 15_000, price: 2_000, unlocks: "2.3" },
  { id: "feat-email", name: "Email notifications", group: "must", stage: 3, change: "Medium", users: "Lots", usersGained: 1_500_000, price: 8_000, unlocks: "3.3" },
  { id: "feat-verified", name: "Verified accounts", group: "must", stage: 4, change: "Medium", users: "Lots", usersGained: 10_000_000, price: 40_000, unlocks: "4.3" },
  { id: "feat-global", name: "Global launch", group: "must", stage: 5, change: "Big", users: "Huge", usersGained: 200_000_000, price: 300_000, unlocks: "5.1" },

  // Nice-to-have features
  { id: "feat-darkmode", name: "Dark mode", group: "nice", stage: 2, change: "Small", users: "Some", usersGained: 5_000, price: 800 },
  { id: "feat-groups", name: "Group chats", group: "nice", stage: 3, change: "Medium", users: "Some", usersGained: 500_000, price: 6_000 },
  { id: "feat-voice", name: "Voice notes", group: "nice", stage: 4, change: "Medium", users: "Some", usersGained: 5_000_000, price: 30_000 },
  { id: "feat-translate", name: "Auto-translate", group: "nice", stage: 5, change: "Medium", users: "Lots", usersGained: 90_000_000, price: 200_000 },

  // Servers
  {
    id: "srv-test", name: "Test environment", group: "server", stage: 1, change: "Medium", users: "None", usersGained: 0, price: 200,
    effect: "Adds a \"Test first\" button to every incident. Once per incident, try one option and see its result with no penalty and no star lost",
  },
  {
    id: "srv-bigger", name: "Bigger server", group: "server", stage: 2, change: "Medium", users: "None", usersGained: 0, price: 800,
    effect: "In incidents 2.1 and 3.1, the \"bigger server\" option is removed from the start",
    maya: "We already bought the biggest one we can afford. Hardware alone will not save us.",
  },
  {
    id: "srv-monitoring", name: "Monitoring", group: "server", stage: 2, change: "Big", users: "None", usersGained: 0, price: 1_200,
    effect: "The System Map shows live numbers on every box. Bad-choice penalties are halved: users dip 5% and cash loss is 5% of base",
  },
  {
    id: "srv-standby", name: "Standby server", group: "server", stage: 3, change: "Medium", users: "None", usersGained: 0, price: 4_000,
    effect: "From now on, the first bad choice in each stage causes no user dip",
    maya: "The standby caught it. Nobody noticed.",
  },
  {
    id: "srv-analytics", name: "Analytics", group: "server", stage: 4, change: "Medium", users: "None", usersGained: 0, price: 20_000,
    effect: "In incidents 4.2 and 4.3, the bad option is removed from the start",
    maya: "The data already shows that one would not work.",
  },
  {
    id: "srv-drills", name: "Disaster drills", group: "server", stage: 5, change: "Medium", users: "None", usersGained: 0, price: 100_000,
    effect: "In incidents 5.2 and 5.3, the bad option is removed from the start",
    maya: "We practised this. We know what not to do.",
  },

  // Your setup
  {
    id: "gear-monitor", name: "Second monitor", group: "setup", stage: 1, change: "Small", users: "None", usersGained: 0, price: 100,
    effect: "The Pattern Book can stay open beside an incident. On a phone, a tab switches between them without closing either",
  },
  {
    id: "gear-wallpapers", name: "Wallpaper pack", group: "setup", stage: 2, change: "Small", users: "None", usersGained: 0, price: 400,
    effect: "Three extra wallpapers in Settings. No effect on play",
  },
  {
    id: "gear-handbook", name: "Engineering handbook", group: "setup", stage: 2, change: "Medium", users: "None", usersGained: 0, price: 800,
    effect: "The first call to Dana in each incident is free",
  },
  {
    id: "gear-pc", name: "Faster PC", group: "setup", stage: 3, change: "Big", users: "None", usersGained: 0, price: 6_000,
    effect: "10% more cash from every incident",
  },
];

export const upgradeById = (id: string): Upgrade | undefined => upgrades.find((u) => u.id === id);

// The dots on a Shop card (docs/UPGRADES.md > Shop layout).
export const changeDots: Record<Change, number> = { Small: 1, Medium: 2, Big: 3 };
export const usersDots: Record<UsersSize, number> = { None: 0, Some: 1, Lots: 2, Huge: 3 };

// The card's one line for features and the lifeline (docs/UPGRADES.md > Shop layout).
export const cardLines = {
  unlocks: "Unlocks:",
  nice: "Optional. Brings in extra users.",
  lifeline: "Gives the answer once every call is used.",
};

// --- Request emails (docs/UPGRADES.md > Request emails) ---

// "Arrives": after an incident is solved, or at the start of a stage.
export type Arrives = { after: string } | { stageStart: StageNumber };

export type RequestEmail = { item: string; from: PersonId; arrives: Arrives; text: string };

export const requestEmails: RequestEmail[] = [
  { item: "srv-test", from: "maya", arrives: { after: "1.1" }, text: "A safe place to try a fix before it goes live would save us some pain." },
  { item: "feat-payments", from: "sam", arrives: { after: "1.2" }, text: "People love Blip. Time to earn something. Can we add payments for Blip Plus?" },
  { item: "srv-bigger", from: "sam", arrives: { stageStart: 2 }, text: "Can we not just buy a bigger server and move on?" },
  { item: "feat-darkmode", from: "customer", arrives: { after: "R1" }, text: "My eyes hurt at night. Any chance of a dark mode?" },
  { item: "srv-monitoring", from: "omar", arrives: { after: "2.2" }, text: "Customers spot problems before we do. Can we watch the servers ourselves?" },
  { item: "feat-photos", from: "customer", arrives: { after: "R2" }, text: "Please let us post photos! All my friends are asking for it." },
  { item: "srv-standby", from: "lena", arrives: { after: "3.1" }, text: "Every outage costs us money. Could we keep a spare server ready?" },
  { item: "feat-groups", from: "customer", arrives: { after: "R3" }, text: "Can we have group chats? My football team wants to use Blip." },
  { item: "feat-email", from: "zoe", arrives: { after: "R4" }, text: "New users forget about us. Can Blip send welcome and alert emails?" },
  { item: "srv-analytics", from: "zoe", arrives: { after: "R5" }, text: "We are guessing what users do. Can we get proper numbers?" },
  { item: "feat-voice", from: "customer", arrives: { after: "4.1" }, text: "Typing is slow. Can I send voice notes instead?" },
  { item: "feat-verified", from: "sam", arrives: { after: "R7" }, text: "Celebrities want to join, but they need a verified badge. Can we build it?" },
  { item: "feat-global", from: "sam", arrives: { after: "R8" }, text: "The board wants Blip in every country. It is our biggest step yet. Are we ready?" },
  { item: "feat-translate", from: "customer", arrives: { after: "5.1" }, text: "My cousins abroad post in another language. Could Blip translate posts?" },
  { item: "srv-drills", from: "sam", arrives: { after: "5.1" }, text: "What if a whole data centre goes down? Can we practise for it?" },
];

export const requestFor = (item: string): RequestEmail | undefined => requestEmails.find((r) => r.item === item);

// --- Victor's lifeline (docs/UPGRADES.md > Victor's lifeline) ---

// The price is this many times the base cash of the current stage.
export const LIFELINE_TIMES = 2;

// Which item gives which effect, so the engine never names an item itself.
export const itemEffects = {
  // "The first call to Dana in each incident is free".
  freeFirstCall: "gear-handbook",
  // Adds a "Test first" button to every incident.
  testFirst: "srv-test",
  // The Pattern Book can stay open beside an incident.
  secondMonitor: "gear-monitor",
};
