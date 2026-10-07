// Copied from docs/BLUEPRINTS.md. The docs win if the two disagree.
// Copy Builds in exactly as written. Stages 3 to 5 are added in later milestones.

import type { Arrival } from "./challenges";
import type { StageNumber } from "./stages";

// --- The toolbox (docs/BLUEPRINTS.md > The toolbox) ---

export type ToolboxPart = {
  name: string;
  what: string;
  // The first one is shown on the part: "like Redis".
  tools: string[];
  // A part with a pattern can only be used in a Build that comes after that pattern is learned.
  pattern?: string;
};

export const toolbox: ToolboxPart[] = [
  { name: "Users", what: "The people using Blip", tools: [] },
  { name: "Web server", what: "Runs Blip's code and answers each request", tools: ["Node.js", "Nginx"] },
  { name: "Web servers", what: "Several copies of the web server", tools: ["Node.js", "Nginx"], pattern: "Load balancing" },
  { name: "Database", what: "Keeps Blip's data safe on disk", tools: ["PostgreSQL", "MySQL"] },
  { name: "Primary database", what: "The main database. It takes every write", tools: ["PostgreSQL", "MySQL"], pattern: "Read replicas" },
  { name: "Payment provider", what: "Takes card payments for Blip", tools: ["Stripe"], pattern: "Idempotency keys" },
  { name: "Cache", what: "Keeps ready-made answers in fast memory", tools: ["Redis", "Memcached"], pattern: "Caching" },
  { name: "CDN", what: "Serves copies of files from near the user", tools: ["Cloudflare", "Amazon CloudFront"], pattern: "CDN" },
  { name: "File storage", what: "Holds photos and other files", tools: ["Amazon S3"], pattern: "CDN" },
  { name: "Load balancer", what: "Shares visitors out between servers", tools: ["Nginx", "HAProxy"], pattern: "Load balancing" },
  { name: "Session store", what: "One shared place for login records", tools: ["Redis"], pattern: "Stateless servers" },
  { name: "Message queue", what: "A to-do list for slow work", tools: ["Kafka", "RabbitMQ", "Amazon SQS"], pattern: "Message queue" },
  { name: "Background worker", what: "Does queued jobs out of sight", tools: ["Sidekiq", "Celery"], pattern: "Message queue" },
  { name: "Plain-text password file", what: "Passwords saved as readable text", tools: [] },
  { name: "One big server", what: "A single large machine doing everything", tools: [] },
];

// docs/BLUEPRINTS.md > Tools for patterns that have no part.
export const noPartTools: Record<string, string[]> = {
  "Role-based access control (RBAC)": ["AWS IAM", "Auth0"],
  "Password hashing": ["bcrypt", "Argon2"],
  "Database index": ["PostgreSQL", "MySQL"],
  Sharding: ["Vitess", "MongoDB"],
  "Fan-out": ["Redis", "Kafka"],
  "Multi-region": ["AWS", "Google Cloud"],
  Failover: ["Amazon Route 53", "Kubernetes"],
  "Rate limiting": ["Nginx", "Cloudflare"],
  "Secrets manager": ["HashiCorp Vault", "AWS Secrets Manager"],
  "Eager loading": ["Prisma", "Django ORM"],
  "Circuit breaker": ["Resilience4j", "Envoy"],
  "Search engine": ["Elasticsearch", "OpenSearch"],
  "Feature flags": ["LaunchDarkly", "Unleash"],
};

// A tray may add a place in brackets, such as "CDN (Tokyo)". It is the same part, shown at that place.
export function toolboxPart(name: string): ToolboxPart | undefined {
  const base = name.replace(/ \([^)]*\)$/, "");
  return toolbox.find((p) => p.name === base);
}

// --- Builds (docs/BLUEPRINTS.md > How to read a Build) ---

export type Arrow = { from: string; to: string };

export type WrongMoveTrigger =
  // The decoy is connected to anything.
  | { kind: "uses"; part: string }
  // An arrow from one part to another has been drawn.
  | { kind: "connects"; from: string; to: string }
  // The part has no arrows at all.
  | { kind: "missing"; part: string };

export type WrongMove = { trigger: WrongMoveTrigger; sees: string; says: string };

export type Build = {
  id: string;
  title: string;
  stage: StageNumber;
  arrives: Arrival;
  usersGained: number;
  goal: string;
  tray: string[];
  decoys: string[];
  solution: Arrow[];
  wrongMoves: WrongMove[];
  call1: string;
  nudge: string;
  result: string;
  // Pattern Book names.
  practises: string[];
};

// A wrong move's id in the save: its trigger, never its words or its row.
export function wrongMoveId(t: WrongMoveTrigger): string {
  return t.kind === "connects" ? `connects:${t.from}>${t.to}` : `${t.kind}:${t.part}`;
}

export const builds: Build[] = [
  // Stage 1
  {
    id: "B1",
    title: "The First Blueprint",
    stage: 1,
    arrives: { by: "email", from: "maya", text: "Before we grow, draw what we have. Show me how someone logs in and pays." },
    usersGained: 200,
    goal: "Draw how a user logs in and pays. Keep the database behind the server.",
    tray: ["Users", "Web server", "Database", "Payment provider"],
    decoys: ["Plain-text password file"],
    solution: [
      { from: "Users", to: "Web server" },
      { from: "Web server", to: "Database" },
      { from: "Web server", to: "Payment provider" },
    ],
    wrongMoves: [
      {
        trigger: { kind: "connects", from: "Users", to: "Database" },
        sees: "Data pours out of the Database straight to a stranger.",
        says: "Data leak. Nothing checks who is asking. Users must go through the server.",
      },
      {
        trigger: { kind: "uses", part: "Plain-text password file" },
        sees: "The file opens and every password can be read.",
        says: "Data leak. Readable passwords are never safe, wherever they are kept.",
      },
    ],
    call1: "Web server",
    nudge: "Who should be the only one allowed to talk to the database?",
    result: "Everything goes through the server. It checks each request before anything else is touched.",
    practises: ["Role-based access control (RBAC)", "Password hashing"],
  },

  // Stage 2
  {
    id: "B2",
    title: "The Fast Front Page",
    stage: 2,
    arrives: { by: "email", from: "zoe", text: "The front page decides whether new people stay. Can posts and photos both load fast?" },
    usersGained: 10_000,
    goal: "Design a front page that loads fast. Posts come from the database. Photos come from nearby.",
    tray: ["Users", "Web server", "Cache", "Database", "CDN", "File storage"],
    decoys: ["One big server"],
    solution: [
      { from: "Users", to: "Web server" },
      { from: "Web server", to: "Cache" },
      { from: "Cache", to: "Database" },
      { from: "Users", to: "CDN" },
      { from: "CDN", to: "File storage" },
    ],
    wrongMoves: [
      {
        trigger: { kind: "connects", from: "Web server", to: "Database" },
        sees: "Thousands of identical arrows hit the Database. It glows red.",
        says: "Every visitor asks the database the same thing. Put the cache in between.",
      },
      {
        trigger: { kind: "connects", from: "Users", to: "File storage" },
        sees: "Large photo files crawl across the map to faraway users.",
        says: "Every photo travels from one place. Let the CDN serve copies from nearby.",
      },
      {
        trigger: { kind: "uses", part: "One big server" },
        sees: "The big server copes, then slowly fills up and turns red.",
        says: "It copes for a few weeks at triple the cost. Then growth fills it again.",
      },
    ],
    call1: "Cache",
    nudge: "Two things must be fast: answers that repeat, and files that travel far.",
    result: "Repeat answers come from the cache. Photos come from the CDN. The server and database stay calm.",
    practises: ["Caching", "CDN"],
  },
];

export const buildById = (id: string): Build | undefined => builds.find((b) => b.id === id);

// Copied from docs/GAME_DESIGN.md > Build incident flow: draw the design, step 2.
export const BUILD_BRIEF = "We need a new design for this. Open Blueprint.";

// Copied from docs/GAME_DESIGN.md > Build incident flow: draw the design, step 5.
export const BUILD_GENERAL_FAILURE = "Something is missing or in the wrong place.";
