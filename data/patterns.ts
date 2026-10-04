// Copied from docs/UI_THEME.md > Pattern Book and pattern cards. The docs win if the two disagree.
// Pattern names are the "Pattern Book" names in docs/CHALLENGES.md.

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
