// The System Map and incident diagram for Stage 1.
// The docs give each incident's "Sees" and "Map change" lines (docs/CHALLENGES.md), but not where the boxes sit.
// This layout was agreed for Milestone 2 and is listed in PROGRESS.md. Later stages add their boxes here.

export type BoxIconId = "users" | "server" | "database" | "payments" | "secrets";

export type MapBox = {
  id: string;
  name: string;
  icon: BoxIconId;
  // Centre of the box, in a 600 by 300 drawing.
  x: number;
  y: number;
  // A box that is not there from the start appears when a feature is owned or an incident is solved.
  shownWhen?: { owned: string } | { solved: string };
};

export const mapBoxes: MapBox[] = [
  { id: "users", name: "Users", icon: "users", x: 90, y: 150 },
  { id: "server", name: "Server", icon: "server", x: 300, y: 150 },
  { id: "database", name: "Database", icon: "database", x: 510, y: 150 },
  { id: "payments", name: "Payments", icon: "payments", x: 300, y: 262, shownWhen: { owned: "feat-payments" } },
  { id: "secrets", name: "Secrets", icon: "secrets", x: 300, y: 40, shownWhen: { solved: "1.4" } },
];

// Arrows show which way traffic flows. An arrow shows when both its boxes show.
export const mapArrows: { from: string; to: string }[] = [
  { from: "users", to: "server" },
  { from: "server", to: "database" },
  { from: "server", to: "payments" },
  { from: "server", to: "secrets" },
];

// For each incident: the box that fails while it is open, and where its Map change sits once solved.
// The badge uses the icon of the incident's pattern (docs/UI_THEME.md > Pattern Book and pattern cards).
export type IncidentOnMap = {
  failing: string;
  badge: { box: string } | { arrow: { from: string; to: string } };
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
};
