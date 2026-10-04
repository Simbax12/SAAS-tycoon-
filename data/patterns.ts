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

// The familiar tools shown under "Tools you will meet" (docs/UI_THEME.md > Pattern Book and pattern cards).
// Copied from docs/BLUEPRINTS.md > The toolbox: a pattern with parts lists its parts' tools,
// the rest come from "Tools for patterns that have no part".
export const patternTools: Record<string, string[]> = {
  "Role-based access control (RBAC)": ["AWS IAM", "Auth0"],
  "Password hashing": ["bcrypt", "Argon2"],
  "Idempotency keys": ["Stripe"],
  Caching: ["Redis", "Memcached"],
  "Database index": ["PostgreSQL", "MySQL"],
  CDN: ["Cloudflare", "Amazon CloudFront", "Amazon S3"],
  "Load balancing": ["Node.js", "Nginx", "HAProxy"],
  "Stateless servers": ["Redis"],
  "Message queue": ["Kafka", "RabbitMQ", "Amazon SQS", "Sidekiq", "Celery"],
  "Read replicas": ["PostgreSQL", "MySQL"],
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

// Copied from docs/REPEATS.md > The five everyday patterns. Each has three pips in the Pattern Book.
export const everydayPatterns: { name: string; learnedIn: string; repeats: [string, string] }[] = [
  { name: "Role-based access control (RBAC)", learnedIn: "1.1", repeats: ["R1", "R5"] },
  { name: "Idempotency keys", learnedIn: "1.3", repeats: ["R2", "R8"] },
  { name: "Caching", learnedIn: "2.1", repeats: ["R3", "R7"] },
  { name: "Database index", learnedIn: "2.2", repeats: ["R4", "R9"] },
  { name: "Message queue", learnedIn: "3.3", repeats: ["R6", "R10"] },
];
