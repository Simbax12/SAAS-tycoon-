// The System Map and incident diagram for Stages 1 and 2.
// The docs give each incident's "Sees" and "Map change" lines (docs/CHALLENGES.md), but not where the boxes sit.
// The Stage 1 layout was agreed in Milestone 2, and the Stage 2 layout in Milestone 5. Both are listed in
// PROGRESS.md. Later stages add their boxes here.

export type BoxIconId = "users" | "server" | "database" | "payments" | "secrets" | "cache" | "storage" | "cdn";

type When = { owned: string } | { solved: string };

export type MapBox = {
  id: string;
  name: string;
  icon: BoxIconId;
  // Centre of the box, in a drawing where columns sit 210 apart and rows about 110 apart.
  x: number;
  y: number;
  // A box that is not there from the start appears when a feature is owned or an incident is solved.
  shownWhen?: When;
  // A box that moves to make room for a new one, once an incident is solved.
  movedWhen?: { solved: string; x: number; y: number };
};

export const mapBoxes: MapBox[] = [
  { id: "users", name: "Users", icon: "users", x: 90, y: 150 },
  { id: "server", name: "Server", icon: "server", x: 300, y: 150 },
  // The Database moves right once 2.1 is solved, so the Cache can sit between it and the Server.
  { id: "database", name: "Database", icon: "database", x: 510, y: 150, movedWhen: { solved: "2.1", x: 720, y: 150 } },
  { id: "payments", name: "Payments", icon: "payments", x: 300, y: 262, shownWhen: { owned: "feat-payments" } },
  { id: "secrets", name: "Secrets", icon: "secrets", x: 300, y: 40, shownWhen: { solved: "1.4" } },
  { id: "cache", name: "Cache", icon: "cache", x: 510, y: 262, shownWhen: { solved: "2.1" } },
  { id: "storage", name: "Storage", icon: "storage", x: 510, y: 40, shownWhen: { solved: "2.3" } },
  { id: "cdn", name: "CDN", icon: "cdn", x: 90, y: 40, shownWhen: { solved: "2.3" } },
];

export type MapArrow = {
  from: string;
  to: string;
  // An arrow drawn thick once an incident is solved: many thin trips merged into one.
  thickWhen?: { solved: string };
};

// Arrows show which way traffic flows. An arrow shows when both its boxes show.
export const mapArrows: MapArrow[] = [
  { from: "users", to: "server" },
  { from: "server", to: "database", thickWhen: { solved: "2.4" } },
  { from: "server", to: "payments" },
  { from: "server", to: "secrets" },
  { from: "server", to: "cache" },
  { from: "server", to: "storage" },
  { from: "users", to: "cdn" },
];

// For each incident: the box that fails while it is open, and where its Map change sits once solved.
// The badge uses the icon of the incident's pattern (docs/UI_THEME.md > Pattern Book and pattern cards).
// Repeats add no badge. When one is solved, the badges with its pattern's icon pulse once (docs/REPEATS.md).
export type IncidentOnMap = {
  failing: string;
  badge?: { box: string } | { arrow: { from: string; to: string } };
};

export const incidentsOnMap: Record<string, IncidentOnMap> = {
  // A shield appears on the Server box.
  "1.1": { failing: "server", badge: { box: "server" } },
  // A padlock appears on the Database box.
  "1.2": { failing: "database", badge: { box: "database" } },
  // A key appears on the arrow from Server to Payments.
  "1.3": { failing: "payments", badge: { arrow: { from: "server", to: "payments" } } },
  // A Secrets box with a safe on it appears beside the Server box.
  "1.4": { failing: "server", badge: { box: "secrets" } },
  // A Cache box appears between Server and Database.
  "2.1": { failing: "database", badge: { box: "cache" } },
  // A support hire presses Refund on the Server.
  R1: { failing: "server" },
  // An index tab appears on the Database box.
  "2.2": { failing: "database", badge: { box: "database" } },
  // Three copies of the same message reach the Server.
  R2: { failing: "server" },
  // A Storage box appears, and a ring of small CDN boxes appears near Users.
  "2.3": { failing: "server", badge: { box: "cdn" } },
  // The many thin arrows from Server to Database merge into one thick arrow.
  "2.4": { failing: "database", badge: { arrow: { from: "server", to: "database" } } },
};
