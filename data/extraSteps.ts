// Copied from docs/EXTRA_STEPS.md. The docs win if the two disagree.
// Every step is here. A step only plays once its incident is in the data files.

export type LogKind = "cause" | "symptom" | "routine";
export type LogLevel = "INFO" | "WARN" | "ERROR";

export type LogLine = {
  // "cause", "symptom", or "routine1" to "routine4" in the order written. It is the line's id in the save.
  id: string;
  kind: LogKind;
  level: LogLevel;
  source: string;
  message: string;
};

export type TriageStep = { id: string; incidentId: string; lines: LogLine[]; why: string };

export type TuneStep = {
  id: string;
  incidentId: string;
  dial: string;
  // Lowest first.
  stops: string[];
  fact: string;
  // "right" is the stop's place in `stops`.
  waves: { text: string; right: number }[];
  tooLow: string;
  tooHigh: string;
  justRight: string;
  lesson: string;
};

// docs/EXTRA_STEPS.md > Log sources: the tool each source stands for, and its toolbox part.
// The info button on a log line shows the part's "What it is" line from the toolbox.
export const logSources: Record<string, { name: string; part: string }> = {
  nginx: { name: "Nginx", part: "Web server" },
  node: { name: "Node.js", part: "Web server" },
  postgres: { name: "PostgreSQL", part: "Database" },
  redis: { name: "Redis", part: "Cache" },
  cloudflare: { name: "Cloudflare", part: "CDN" },
  stripe: { name: "Stripe", part: "Payment provider" },
  worker: { name: "Background worker", part: "Background worker" },
};

// docs/EXTRA_STEPS.md > Log levels: what each level means, shown by the info button.
export const logLevels: Record<LogLevel, string> = {
  INFO: "Normal news. Something worked as expected.",
  WARN: "Something looks odd. Not broken yet.",
  ERROR: "Something failed and needs fixing.",
};

// Gives routine lines their ids in the order they are written.
function lines(rows: [LogKind, LogLevel, string, string][]): LogLine[] {
  let routine = 0;
  return rows.map(([kind, level, source, message]) => ({
    id: kind === "routine" ? `routine${++routine}` : kind,
    kind,
    level,
    source,
    message,
  }));
}

export const triageSteps: TriageStep[] = [
  {
    id: "T1",
    incidentId: "1.2",
    lines: lines([
      ["routine", "INFO", "nginx", "Home page loaded in 0.2 seconds"],
      ["routine", "INFO", "node", "Server started on port 3000"],
      ["symptom", "WARN", "nginx", "Very large download at 03:12"],
      ["cause", "ERROR", "postgres", "Export of users table included readable passwords"],
      ["routine", "INFO", "node", "User 14 logged in"],
      ["routine", "INFO", "postgres", "Nightly backup finished"],
    ]),
    why: "The download is the symptom. The real fault is that the passwords could be read at all.",
  },
  {
    id: "T2",
    incidentId: "2.1",
    lines: lines([
      ["routine", "INFO", "node", "User 88 logged in"],
      ["symptom", "WARN", "node", "Page took 2.9 seconds to answer"],
      ["routine", "INFO", "postgres", "Nightly backup finished"],
      ["cause", "WARN", "postgres", "Same query ran 4,812 times in one second"],
      ["routine", "INFO", "nginx", "Health check passed"],
      ["routine", "INFO", "node", "Password changed for user 31"],
    ]),
    why: "Slow pages are the symptom. The cause is one question being asked thousands of times.",
  },
  {
    id: "T3",
    incidentId: "3.1",
    lines: lines([
      ["routine", "INFO", "redis", "Cache hit for popular posts"],
      ["symptom", "ERROR", "nginx", "502 Bad Gateway for 6 minutes"],
      ["cause", "ERROR", "node", "Out of memory. The only server restarted"],
      ["routine", "INFO", "postgres", "Database load at 20%"],
      ["routine", "INFO", "cloudflare", "Photos served from the CDN"],
      ["routine", "INFO", "node", "User 5,120 signed up"],
    ]),
    why: "502 means the server behind did not answer. With one server, one crash stops everything.",
  },
  {
    id: "T4",
    incidentId: "4.3",
    lines: lines([
      ["routine", "INFO", "nginx", "Traffic shared across 3 servers"],
      ["symptom", "WARN", "node", "Opening the app took 9 seconds"],
      ["cause", "ERROR", "worker", "50,000,000 feed copies queued for one post"],
      ["routine", "INFO", "postgres", "Replica 2 is up to date"],
      ["routine", "INFO", "redis", "Session found for user 901"],
      ["routine", "INFO", "stripe", "Payment 7,731 accepted"],
    ]),
    why: "The slow app is the symptom. One post created fifty million jobs at once.",
  },
  {
    id: "T5",
    incidentId: "5.3",
    lines: lines([
      ["routine", "INFO", "cloudflare", "Photos served from the CDN"],
      ["symptom", "ERROR", "nginx", "Real users are timing out"],
      ["cause", "WARN", "nginx", "One visitor sent 9,000 requests this minute"],
      ["routine", "INFO", "postgres", "All three regions are in step"],
      ["routine", "INFO", "worker", "Welcome email sent"],
      ["routine", "INFO", "node", "Health check passed"],
    ]),
    why: "Timeouts are the symptom. No real person sends 9,000 requests a minute.",
  },
  {
    id: "T6",
    incidentId: "1.4",
    lines: lines([
      ["routine", "INFO", "node", "User 212 logged in"],
      ["symptom", "WARN", "stripe", "40 payments made from an unknown computer"],
      ["routine", "INFO", "postgres", "Nightly backup finished"],
      ["cause", "WARN", "node", "Payment key loaded from the code, not a safe store"],
      ["routine", "INFO", "nginx", "Health check passed"],
      ["routine", "INFO", "stripe", "Payment 118 accepted"],
    ]),
    why: "The strange payments are the symptom. The cause is a key that anyone with the code could read.",
  },
  {
    id: "T7",
    incidentId: "2.4",
    lines: lines([
      ["routine", "INFO", "redis", "Cache hit for popular posts"],
      ["symptom", "WARN", "node", "Feed took 3 seconds to answer"],
      ["cause", "WARN", "postgres", "51 queries for one feed page"],
      ["routine", "INFO", "node", "User 402 signed up"],
      ["routine", "INFO", "postgres", "Database load at 30%"],
      ["routine", "INFO", "nginx", "Health check passed"],
    ]),
    why: "The slow feed is the symptom. The cause is one page asking the database 51 times.",
  },
  {
    id: "T8",
    incidentId: "3.4",
    lines: lines([
      ["symptom", "ERROR", "nginx", "504 Gateway Timeout on every page"],
      ["routine", "INFO", "redis", "Session found for user 7,310"],
      ["cause", "ERROR", "node", "Fraud check gave no answer after 30 seconds"],
      ["routine", "INFO", "postgres", "Database load at 25%"],
      ["routine", "INFO", "worker", "Welcome email sent"],
      ["routine", "INFO", "cloudflare", "Photos served from the CDN"],
    ]),
    why: "Timeouts everywhere are the symptom. Every server is stuck waiting on one broken outside service.",
  },
  {
    id: "T9",
    incidentId: "4.4",
    lines: lines([
      ["routine", "INFO", "postgres", "Replica 1 is up to date"],
      ["symptom", "WARN", "node", "Search took 40 seconds, then gave up"],
      ["routine", "INFO", "redis", "Cache hit for the Trending list"],
      ["cause", "WARN", "postgres", "Search read every post on all shards"],
      ["routine", "INFO", "worker", "Photo resized to five sizes"],
      ["routine", "INFO", "nginx", "Traffic shared across 3 servers"],
    ]),
    why: "The slow search is the symptom. The cause is reading every post to find two words.",
  },
  {
    id: "T10",
    incidentId: "5.4",
    lines: lines([
      ["symptom", "ERROR", "stripe", "Payment failures up 300% in every region"],
      ["routine", "INFO", "postgres", "All three regions are in step"],
      ["cause", "INFO", "node", "New checkout code released to 100% of users"],
      ["routine", "INFO", "cloudflare", "Photos served from the CDN"],
      ["routine", "INFO", "node", "Health check passed"],
      ["routine", "INFO", "worker", "Export ready for user 55"],
    ]),
    why: "The failures are the symptom. The cause is new code going to everyone at once. Look for what changed.",
  },
];

export const tuneSteps: TuneStep[] = [
  {
    id: "U1",
    incidentId: "3.1",
    dial: "Web servers",
    stops: ["1", "2", "4", "8"],
    fact: "One server can handle 20,000 people. Above 90% is overloaded. Below 40% is wasteful.",
    waves: [
      { text: "Quiet night. 20,000 people online.", right: 1 },
      { text: "Lunchtime. 60,000 people online.", right: 2 },
      { text: "A post goes viral. 140,000 people online.", right: 3 },
    ],
    tooLow: "Overloaded. The servers are above 90% and pages are failing.",
    tooHigh: "Wasteful. We are paying for servers that sit idle.",
    justRight: "Steady. Every server is busy but none is struggling.",
    lesson: "Add servers when traffic rises and remove them when it falls. This is called auto-scaling.",
  },
  {
    id: "U2",
    incidentId: "R7",
    dial: "Keep the saved copy for",
    stops: ["1 second", "1 minute", "1 hour", "1 day"],
    fact: "A saved copy is fast, but it can be out of date.",
    waves: [
      { text: "The Trending list. It changes every few minutes.", right: 1 },
      { text: "A profile photo. It changes a few times a year.", right: 3 },
      { text: "The unread message count. It changes whenever a message arrives.", right: 0 },
    ],
    tooLow: "Too fresh. The database is being asked far more often than it needs to be.",
    tooHigh: "Too stale. People are seeing old information.",
    justRight: "Fresh enough for people, calm enough for the database.",
    lesson: "The slower something changes, the longer its copy can be kept. This setting is called a time to live, or TTL.",
  },
  {
    id: "U3",
    incidentId: "5.3",
    dial: "Requests allowed per visitor each minute",
    stops: ["10", "100", "1,000", "10,000"],
    fact: "A real person makes a few requests a minute. A bot makes thousands.",
    waves: [
      { text: "Under attack. Real people make up to 60 a minute. Bots make 5,000.", right: 1 },
      { text: "Sale day. Shoppers refresh a lot, up to 600 a minute.", right: 2 },
      { text: "Quiet night. Real people make up to 8 a minute.", right: 0 },
    ],
    tooLow: "Too strict. Real people are being blocked.",
    tooHigh: "Too loose. Bots are getting through.",
    justRight: "Real people get through. Bots hit the limit.",
    lesson: "Set the limit just above what real people need, and raise it for busy days.",
  },
  {
    id: "U4",
    incidentId: "3.4",
    dial: "Seconds to wait for an answer",
    stops: ["0.1 seconds", "1 second", "10 seconds", "60 seconds"],
    fact: "A broken service never answers. While we wait, one of our servers sits stuck.",
    waves: [
      { text: "The fraud checker. It usually answers in 0.2 seconds.", right: 1 },
      { text: "A partner's report service. It usually takes 6 seconds.", right: 2 },
      { text: "The cache. It usually answers in 0.001 seconds.", right: 0 },
    ],
    tooLow: "Too impatient. Healthy answers are being cut off.",
    tooHigh: "Too patient. A broken service ties up our servers.",
    justRight: "Healthy answers get through. Broken calls give up quickly.",
    lesson: "Wait a little longer than a service normally takes, and no more. The circuit breaker handles the rest.",
  },
  {
    id: "U5",
    incidentId: "5.4",
    dial: "Who gets the new code",
    stops: ["Staff only", "1% of users", "25% of users", "Everyone"],
    fact: "Start small. Give it to more people only when nothing has gone wrong.",
    waves: [
      { text: "Day one. The new checkout has never met a real customer.", right: 0 },
      { text: "Staff have used it for a week. No problems.", right: 1 },
      { text: "A quarter of users for two weeks. Errors match the old code.", right: 3 },
    ],
    tooLow: "Too careful. The new code is fine, but almost nobody gets it.",
    tooHigh: "Too fast. If there is a bug, too many people meet it.",
    justRight: "A safe step. Big enough to learn from, small enough to undo.",
    lesson: "Turn new code on in steps. Grow the share only when the last step looked healthy.",
  },
];

export const triageFor = (incidentId: string): TriageStep | undefined => triageSteps.find((t) => t.incidentId === incidentId);
export const tuneFor = (incidentId: string): TuneStep | undefined => tuneSteps.find((t) => t.incidentId === incidentId);

// Copied from docs/GAME_DESIGN.md > Triage, in Terminal: the words around the log lines.
// `bonus` is the stage's Triage bonus, already written as money, such as "£50".
export const triageText = {
  goal: "Find the line that caused this. Not just a symptom.",
  whatHappened: "What happened:",
  bonusOffer: (bonus: string) => `Wrong taps cost nothing. Right first time: +${bonus} bonus.`,
  bonusEarned: (bonus: string) => `Triage bonus: +${bonus}`,
  nextStep: "Now pick a fix",
  // Maya's two bubbles, in the first Triage step of the play order.
  firstTime: ["Logs are the servers' diary. Every action writes a line.", "A symptom is what you notice. The cause is why it happened."],
};

// Copied from docs/GAME_DESIGN.md > Triage, in Terminal: what a wrong tap says.
export const triageWrong: Record<Exclude<LogKind, "cause">, string> = {
  symptom: "That is a symptom. Look for what causes it.",
  routine: "That line is routine. Look for what changed.",
};

// Copied from docs/GAME_DESIGN.md > Money: the bonuses, as shares of the stage's base cash.
export const bonuses = {
  // For finding the cause on the first tap.
  triage: 0.1,
  // For each wave set right.
  tuneWave: 0.05,
};
