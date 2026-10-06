// Copied from docs/UI_THEME.md > Pattern Book and pattern cards. The docs win if the two disagree.
// Pattern names are the "Pattern Book" names in docs/CHALLENGES.md.

import { noPartTools, toolbox } from "./blueprints";

export type PatternIconId =
  | "shield"
  | "padlock"
  | "key"
  | "lightning"
  | "bookmark"
  | "globe"
  | "signpost"
  | "badge"
  | "todo"
  | "copies"
  | "pie"
  | "megaphone"
  | "worldMap"
  | "heartbeat"
  | "turnstile"
  | "safe"
  | "basket"
  | "lightSwitch"
  | "magnifier"
  | "flag";

export const patternIcons: Record<string, PatternIconId> = {
  "Role-based access control (RBAC)": "shield",
  "Password hashing": "padlock",
  "Idempotency keys": "key",
  Caching: "lightning",
  "Database index": "bookmark",
  CDN: "globe",
  "Load balancing": "signpost",
  "Stateless servers": "badge",
  "Message queue": "todo",
  "Read replicas": "copies",
  Sharding: "pie",
  "Fan-out": "megaphone",
  "Multi-region": "worldMap",
  Failover: "heartbeat",
  "Rate limiting": "turnstile",
  "Secrets manager": "safe",
  "Eager loading": "basket",
  "Circuit breaker": "lightSwitch",
  "Search engine": "magnifier",
  "Feature flags": "flag",
};

// The familiar tools shown under "Tools you will meet" (docs/UI_THEME.md > Pattern Book and pattern cards),
// worked out from docs/BLUEPRINTS.md > The toolbox: a pattern with parts lists its parts' tools,
// the rest come from "Tools for patterns that have no part".
export const patternTools: Record<string, string[]> = Object.fromEntries(
  Object.keys(patternIcons).map((name) => {
    const fromParts = toolbox.filter((p) => p.pattern === name).flatMap((p) => p.tools);
    return [name, fromParts.length > 0 ? [...new Set(fromParts)] : (noPartTools[name] ?? [])];
  }),
);

// Copied from docs/REPEATS.md > The five everyday patterns. Each has three pips in the Pattern Book.
export const everydayPatterns: { name: string; learnedIn: string; repeats: [string, string] }[] = [
  { name: "Role-based access control (RBAC)", learnedIn: "1.1", repeats: ["R1", "R5"] },
  { name: "Idempotency keys", learnedIn: "1.3", repeats: ["R2", "R8"] },
  { name: "Caching", learnedIn: "2.1", repeats: ["R3", "R7"] },
  { name: "Database index", learnedIn: "2.2", repeats: ["R4", "R9"] },
  { name: "Message queue", learnedIn: "3.3", repeats: ["R6", "R10"] },
];
