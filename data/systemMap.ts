// The System Map and incident diagram.
// The docs give each incident's "Sees" and "Map change" lines (docs/CHALLENGES.md), but not where the boxes sit.
// Each stage has its own layout. Stage 1 was agreed in Milestone 2, Stage 2 in Milestone 5, and Stages 3 to 5
// in Milestone 7, with the world view. All are listed in PROGRESS.md.

import type { StageNumber } from "./stages";

export type BoxIconId =
  | "users"
  | "server"
  | "database"
  | "payments"
  | "secrets"
  | "cache"
  | "storage"
  | "cdn"
  | "lb"
  | "session"
  | "queue"
  | "worker"
  | "fraud"
  | "replicas"
  | "feed"
  | "search"
  | "region"
  | "edge";

// `reached`: the incident is the current one or already solved, so a box its "Sees" names can fail.
export type When = { owned: string } | { solved: string } | { reached: string };

export type MapBox = {
  id: string;
  name: string;
  icon: BoxIconId;
  // A box that is not there from the start appears when a feature is owned or an incident is solved.
  shownWhen?: When;
  // How many copies the box stands for. More than one is drawn as a stack, like a deck of cards.
  copies?: number;
  // A box that changes its name or copies once an incident is solved. The last one that applies wins.
  changes?: { solved: string; name?: string; copies?: number }[];
};

// Every box of the main map. A box shows when its stage's layout places it and its shownWhen is met.
export const mapBoxes: MapBox[] = [
  { id: "users", name: "Users", icon: "users" },
  // "The Server box becomes three" (3.1).
  { id: "server", name: "Server", icon: "server", changes: [{ solved: "3.1", name: "Servers", copies: 3 }] },
  // "The Database becomes one Primary box with two Replica boxes" (4.1). "The Primary box splits into
  // Shard 1, Shard 2 and Shard 3" (4.2).
  {
    id: "database",
    name: "Database",
    icon: "database",
    changes: [
      { solved: "4.1", name: "Primary" },
      { solved: "4.2", name: "Shards", copies: 3 },
    ],
  },
  { id: "payments", name: "Payments", icon: "payments", shownWhen: { owned: "feat-payments" } },
  { id: "secrets", name: "Secrets", icon: "secrets", shownWhen: { solved: "1.4" } },
  { id: "cache", name: "Cache", icon: "cache", shownWhen: { solved: "2.1" } },
  { id: "storage", name: "Storage", icon: "storage", shownWhen: { solved: "2.3" } },
  { id: "cdn", name: "CDN", icon: "cdn", shownWhen: { solved: "2.3" } },
  { id: "lb", name: "Load Balancer", icon: "lb", shownWhen: { solved: "3.1" } },
  { id: "session", name: "Session Store", icon: "session", shownWhen: { solved: "3.2" } },
  { id: "queue", name: "Queue", icon: "queue", shownWhen: { solved: "3.3" } },
  { id: "worker", name: "Worker", icon: "worker", shownWhen: { solved: "3.3" } },
  // 3.4's "Sees" names the Fraud Check box, so it shows from the moment 3.4 arrives.
  { id: "fraud", name: "Fraud Check", icon: "fraud", shownWhen: { reached: "3.4" } },
  { id: "replicas", name: "Replicas", icon: "replicas", copies: 2, shownWhen: { solved: "4.1" } },
  { id: "feed", name: "Feed Service", icon: "feed", shownWhen: { solved: "4.3" } },
  { id: "search", name: "Search", icon: "search", shownWhen: { solved: "4.4" } },
];

// Where a box sits in one stage, with the centre of the box in drawing units.
// A box that moves to make room for a new one, once an incident is solved, has movedWhen.
export type Place = { x: number; y: number; movedWhen?: { solved: string; x: number; y: number } };

// Stages 1 and 2: columns 210 apart. Stages 3 to 5 have more boxes and longer names: columns 240 apart.
// Rows are about 110 apart in every stage.
const later = { c0: 100, c1: 340, c2: 580, c3: 820, c4: 1060, r0: 40, r1: 150, r2: 262, r3: 374 };

const stage3: Record<string, Place> = {
  users: { x: later.c0, y: later.r1 },
  cdn: { x: later.c0, y: later.r0 },
  lb: { x: later.c1, y: later.r1 },
  secrets: { x: later.c1, y: later.r0 },
  session: { x: later.c1, y: later.r2 },
  server: { x: later.c2, y: later.r1 },
  storage: { x: later.c2, y: later.r0 },
  queue: { x: later.c2, y: later.r3 },
  database: { x: later.c3, y: later.r1 },
  cache: { x: later.c3, y: later.r0 },
  payments: { x: later.c3, y: later.r2 },
  worker: { x: later.c3, y: later.r3 },
  fraud: { x: later.c4, y: later.r2 },
};

// Stage 4 keeps Stage 3's places and adds the Feed Service, the Replicas and Search.
const stage4: Record<string, Place> = {
  ...stage3,
  feed: { x: later.c2, y: later.r2 },
  replicas: { x: later.c4, y: later.r1 },
  search: { x: later.c4, y: later.r0 },
};

export const mapLayouts: Record<StageNumber, Record<string, Place>> = {
  1: {
    users: { x: 90, y: 150 },
    server: { x: 300, y: 150 },
    database: { x: 510, y: 150 },
    payments: { x: 300, y: 262 },
    secrets: { x: 300, y: 40 },
  },
  2: {
    users: { x: 90, y: 150 },
    server: { x: 300, y: 150 },
    // The Database moves right once 2.1 is solved, so the Cache can sit between it and the Server.
    database: { x: 510, y: 150, movedWhen: { solved: "2.1", x: 720, y: 150 } },
    payments: { x: 300, y: 262 },
    secrets: { x: 300, y: 40 },
    cache: { x: 510, y: 262 },
    storage: { x: 510, y: 40 },
    cdn: { x: 90, y: 40 },
  },
  3: stage3,
  4: stage4,
  // In Stage 5 the same map shows under the world view, as "Inside each region".
  5: stage4,
};

export type MapArrow = {
  from: string;
  to: string;
  // An arrow drawn thick once an incident is solved: many thin trips merged into one.
  thickWhen?: { solved: string };
  // An arrow that goes away once an incident is solved, because a new box now sits in the way.
  until?: { solved: string };
};

// Arrows show which way traffic flows. An arrow shows when both its boxes show.
export const mapArrows: MapArrow[] = [
  { from: "users", to: "server", until: { solved: "3.1" } },
  { from: "users", to: "lb" },
  { from: "lb", to: "server" },
  { from: "server", to: "database", thickWhen: { solved: "2.4" } },
  { from: "server", to: "payments" },
  { from: "server", to: "secrets" },
  { from: "server", to: "cache" },
  { from: "server", to: "storage" },
  { from: "users", to: "cdn" },
  { from: "server", to: "session" },
  { from: "server", to: "queue", until: { solved: "4.3" } },
  { from: "server", to: "feed" },
  { from: "feed", to: "queue" },
  { from: "queue", to: "worker" },
  { from: "payments", to: "fraud" },
  { from: "database", to: "replicas" },
  { from: "server", to: "search" },
];

// --- The world view (Stage 5) ---
// "The map switches to a world view with three regions" (5.1). It shows above the map of one region.

export const WORLD_FROM = "5.1";

export const worldBoxes: MapBox[] = [
  { id: "worldUsers", name: "Users", icon: "users" },
  { id: "americas", name: "Americas", icon: "region" },
  { id: "europe", name: "Europe", icon: "region" },
  { id: "asia", name: "Asia", icon: "region" },
  { id: "edge", name: "Edge Shield", icon: "edge", shownWhen: { solved: "5.3" } },
];

export const worldLayout: Record<string, Place> = {
  americas: { x: 170, y: 150 },
  europe: { x: 510, y: 110 },
  asia: { x: 850, y: 150 },
  edge: { x: 510, y: 290 },
  worldUsers: { x: 510, y: 400 },
};

export const worldArrows: MapArrow[] = [
  { from: "worldUsers", to: "americas", until: { solved: "5.3" } },
  { from: "worldUsers", to: "europe", until: { solved: "5.3" } },
  { from: "worldUsers", to: "asia", until: { solved: "5.3" } },
  { from: "worldUsers", to: "edge" },
  { from: "edge", to: "americas" },
  { from: "edge", to: "europe" },
  { from: "edge", to: "asia" },
];

// "Heartbeat lines appear between the three regions" (5.2). Lines, not arrows: each side checks the other.
export const heartbeatLines = { shownWhen: { solved: "5.2" }, between: [["americas", "europe"], ["europe", "asia"], ["americas", "asia"]] as const };

// "A row of on and off switches appears above the three regions" (5.4).
export const switchRow = { shownWhen: { solved: "5.4" }, above: ["americas", "europe", "asia"] };

// For each incident: the boxes that fail while it is open, and where its Map change sits once solved.
// The badge uses the icon of the incident's pattern (docs/UI_THEME.md > Pattern Book and pattern cards).
// Repeats add no badge. When one is solved, the badges with its pattern's icon pulse once (docs/REPEATS.md).
// A box id from worldBoxes, or a place in the world view, belongs to the world view.
export type IncidentOnMap = {
  failing: string[];
  badge?: { box: string } | { arrow: { from: string; to: string } } | { switchRow: true };
};

export const incidentsOnMap: Record<string, IncidentOnMap> = {
  // A shield appears on the Server box.
  "1.1": { failing: ["server"], badge: { box: "server" } },
  // A padlock appears on the Database box.
  "1.2": { failing: ["database"], badge: { box: "database" } },
  // A key appears on the arrow from Server to Payments.
  "1.3": { failing: ["payments"], badge: { arrow: { from: "server", to: "payments" } } },
  // A Secrets box with a safe on it appears beside the Server box.
  "1.4": { failing: ["server"], badge: { box: "secrets" } },
  // A Cache box appears between Server and Database.
  "2.1": { failing: ["database"], badge: { box: "cache" } },
  // A support hire presses Refund on the Server.
  R1: { failing: ["server"] },
  // An index tab appears on the Database box.
  "2.2": { failing: ["database"], badge: { box: "database" } },
  // Three copies of the same message reach the Server.
  R2: { failing: ["server"] },
  // A Storage box appears, and a ring of small CDN boxes appears near Users.
  "2.3": { failing: ["server"], badge: { box: "cdn" } },
  // The many thin arrows from Server to Database merge into one thick arrow.
  "2.4": { failing: ["database"], badge: { arrow: { from: "server", to: "database" } } },

  // A Load Balancer box appears. The Server box becomes three.
  "3.1": { failing: ["server"], badge: { box: "lb" } },
  // Thousands of identical arrows ask the Database for the same famous profile.
  R3: { failing: ["database"] },
  // A Session Store box appears, joined to all three servers.
  "3.2": { failing: ["server"], badge: { box: "session" } },
  // The Database reads through every message.
  R4: { failing: ["database"] },
  // A Queue box and a Worker box appear.
  "3.3": { failing: ["server"], badge: { box: "queue" } },
  // A Fraud Check box appears, with a switch on the arrow that leads to it.
  "3.4": { failing: ["fraud"], badge: { arrow: { from: "payments", to: "fraud" } } },

  // Contractors walk into Payroll.
  R5: { failing: ["server"] },
  // The Database becomes one Primary box with two Replica boxes.
  "4.1": { failing: ["database"], badge: { box: "replicas" } },
  // An upload waits at the Server.
  R6: { failing: ["server"] },
  // The Primary box splits into Shard 1, Shard 2 and Shard 3.
  "4.2": { failing: ["database"], badge: { box: "database" } },
  // The databases rebuild the Trending list each time.
  R7: { failing: ["database"] },
  // A Feed Service box appears with two paths: Push and Pull.
  "4.3": { failing: ["queue"], badge: { box: "feed" } },
  // A Search box appears beside the shards.
  "4.4": { failing: ["database"], badge: { box: "search" } },

  // The Queue hands the Worker the same job again.
  R8: { failing: ["worker"] },
  // The map switches to a world view with three regions.
  "5.1": { failing: ["server"], badge: { box: "worldUsers" } },
  // Every shard reads row after row.
  R9: { failing: ["database"] },
  // Heartbeat lines appear between the three regions.
  "5.2": { failing: ["americas"], badge: { arrow: { from: "americas", to: "europe" } } },
  // A row of on and off switches appears above the three regions.
  "5.4": { failing: ["americas", "europe", "asia"], badge: { switchRow: true } },
  // The Server gathers years of posts.
  R10: { failing: ["server"] },
  // An Edge Shield box appears in front of everything.
  "5.3": { failing: ["americas", "europe", "asia"], badge: { box: "edge" } },
};
