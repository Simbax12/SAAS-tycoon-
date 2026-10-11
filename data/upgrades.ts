// Copied from docs/UPGRADES.md. The docs win if the two disagree.
// Every item is here. Effects are built stage by stage: Stage 1's in Milestone 4, the rest with their stage.

import type { PersonId } from "./people";
import type { StageNumber } from "./stages";

export type ShopGroup = "must" | "nice" | "server" | "setup" | "computer";
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
  // A new computer: the stage it moves the player to (docs/UPGRADES.md > New computers).
  movesTo?: StageNumber;
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
    id: "gear-monitor", name: "Second monitor", group: "setup", stage: 2, change: "Small", users: "None", usersGained: 0, price: 400,
    effect: "A second screen beside the main one. Any window can move to it, so the Pattern Book can stay open beside an incident",
  },
  {
    id: "gear-wallpapers", name: "Wallpaper pack", group: "setup", stage: 2, change: "Small", users: "None", usersGained: 0, price: 400,
    effect: "Three extra wallpapers in Settings. No effect on play",
  },
  {
    id: "gear-handbook", name: "Engineering handbook", group: "setup", stage: 2, change: "Medium", users: "None", usersGained: 0, price: 800,
    effect: "The first call to Dana in each incident is free",
  },

  // New computers (docs/UPGRADES.md > New computers)
  {
    id: "pc-office", name: "New computer", group: "computer", stage: 1, change: "Big", users: "None", usersGained: 0, price: 300,
    movesTo: 2, effect: "Needed to move to Stage 2, the First office",
  },
  {
    id: "pc-loft", name: "New computer", group: "computer", stage: 2, change: "Big", users: "None", usersGained: 0, price: 1_200,
    movesTo: 3, effect: "Needed to move to Stage 3, the Scale-up",
  },
  {
    id: "pc-hall", name: "New computer", group: "computer", stage: 3, change: "Big", users: "None", usersGained: 0, price: 6_000,
    movesTo: 4, effect: "Needed to move to Stage 4, Big tech",
  },
  {
    id: "pc-tower", name: "New computer", group: "computer", stage: 4, change: "Big", users: "None", usersGained: 0, price: 30_000,
    movesTo: 5, effect: "Needed to move to Stage 5, Planet scale",
  },
];

// The new computer that moves the player to a stage, if that stage needs one.
export const computerFor = (stage: StageNumber): Upgrade | undefined => upgrades.find((u) => u.movesTo === stage);

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
  { item: "srv-test", from: "maya", arrives: { after: "1.1" }, text: "We cannot keep pushing bugs to the live app. We need a safe place to try a fix before it goes live." },
  { item: "feat-payments", from: "sam", arrives: { after: "1.2" }, text: "People love Blip, but we earn nothing from it. Please add payments for Blip Plus, so we can pay for servers and keep growing." },
  { item: "srv-bigger", from: "sam", arrives: { stageStart: 2 }, text: "Blip slows down at busy times. Please buy a bigger server. Then we will know for sure if more hardware is the answer." },
  { item: "feat-darkmode", from: "customer", arrives: { after: "R1" }, text: "Blip is so bright that my eyes hurt at night. Please add a dark mode, so I can keep chatting after dark." },
  { item: "srv-monitoring", from: "omar", arrives: { after: "2.2" }, text: "Customers find problems before we do. Please add monitoring, so we see trouble early on the System Map and mistakes cost us less." },
  { item: "feat-photos", from: "customer", arrives: { after: "R2" }, text: "All my friends want to share photos on Blip. Please add photo sharing, or we will all move to another app." },
  { item: "srv-standby", from: "lena", arrives: { after: "3.1" }, text: "Every outage loses us users. Please keep a standby server ready. When something breaks, it takes over and nobody notices." },
  { item: "feat-groups", from: "customer", arrives: { after: "R3" }, text: "My football team wants one chat for all of us. Please add group chats, so we can plan our games on Blip." },
  { item: "feat-email", from: "zoe", arrives: { after: "R4" }, text: "New users sign up, then forget about us. Please add email notifications, so Blip can welcome them and bring them back." },
  { item: "srv-analytics", from: "zoe", arrives: { after: "R5" }, text: "We are guessing what users do. Please add analytics, so the numbers show us which fixes would never work." },
  { item: "feat-voice", from: "customer", arrives: { after: "4.1" }, text: "Typing on my phone is slow. Please add voice notes, so I can just talk to my friends instead." },
  { item: "feat-verified", from: "sam", arrives: { after: "R7" }, text: "Celebrities want to join, but fans cannot tell real accounts from fakes. Please add verified badges, so they feel safe on Blip." },
  { item: "feat-global", from: "sam", arrives: { after: "R8" }, text: "The board wants Blip in every country. Please fund a global launch. It is our biggest step yet, and it brings millions of users." },
  { item: "feat-translate", from: "customer", arrives: { after: "5.1" }, text: "My cousins abroad post in another language. Please add auto-translate, so I can read their posts and reply." },
  { item: "srv-drills", from: "sam", arrives: { after: "5.1" }, text: "What if a whole data centre goes down? Please let us run disaster drills, so we know what not to do when it happens." },
  // A new computer's email is sent the moment the stage's last incident is solved, before "Next" (docs/GAME_LOGIC.md > When an incident is solved).
  { item: "pc-office", from: "maya", arrives: { after: "B1" }, text: "Good news: we are moving into our first office. Please buy the new computer for it, so we can start work there." },
  { item: "pc-loft", from: "maya", arrives: { after: "B2" }, text: "We are moving to a bigger loft. Please buy the new computer for it. We cannot start there without one." },
  { item: "pc-hall", from: "maya", arrives: { after: "B3" }, text: "We are moving above a data centre. Please buy the new computer, so we can keep up with all this data." },
  { item: "pc-tower", from: "maya", arrives: { after: "B4" }, text: "We are moving to the tower. Please buy the new computer for it. The whole planet is waiting." },
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
  // "Bad-choice penalties are halved".
  halfPenalties: "srv-monitoring",
  // "Three extra wallpapers in Settings".
  wallpapers: "gear-wallpapers",
  // "The first bad choice in each stage causes no user dip".
  standby: "srv-standby",
};

// Monitoring: "users dip 5% and cash loss is 5% of base", half the usual bad-choice penalties.
// Its live numbers on the System Map come in Milestone 8 (see PROGRESS.md).
export const MONITORING_SHARE = 0.5;
