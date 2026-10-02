# Blueprints: the 5 Build incidents

A Build incident is solved by drawing. The player opens the Blueprint app, drags parts onto a canvas, joins them with arrows and deploys the design. Each stage ends with one Build that puts that stage's patterns together.

Copy these into a typed data file exactly as written. Do not add, remove or reword anything. If something looks wrong, ask.

The rules for how a Build plays are in GAME_DESIGN.md. The order everything is played in is in the play order table in GAME_DESIGN.md.

## The toolbox

Every part the player can drag is listed here. Each part shows its name and, beneath it, the word "like" and its first familiar tool, for example "Cache, like Redis".

Tool names are real products, used as plain text so the player meets the names they will see at work. Never use a product's logo. Icons are original drawings.

### The parts

| Part | What it is | Familiar tools | Pattern |
|---|---|---|---|
| Users | The people using Blip | | |
| Web server | Runs Blip's code and answers each request | Node.js, Nginx | |
| Web servers | Several copies of the web server | Node.js, Nginx | Load balancing |
| Database | Keeps Blip's data safe on disk | PostgreSQL, MySQL | |
| Primary database | The main database. It takes every write | PostgreSQL, MySQL | Read replicas |
| Payment provider | Takes card payments for Blip | Stripe | Idempotency keys |
| Cache | Keeps ready-made answers in fast memory | Redis, Memcached | Caching |
| CDN | Serves copies of files from near the user | Cloudflare, Amazon CloudFront | CDN |
| File storage | Holds photos and other files | Amazon S3 | CDN |
| Load balancer | Shares visitors out between servers | Nginx, HAProxy | Load balancing |
| Session store | One shared place for login records | Redis | Stateless servers |
| Message queue | A to-do list for slow work | Kafka, RabbitMQ, Amazon SQS | Message queue |
| Background worker | Does queued jobs out of sight | Sidekiq, Celery | Message queue |
| Plain-text password file | Passwords saved as readable text. Always a mistake | | |
| One big server | A single large machine doing everything | | |

A part with a pattern can only be used in a Build that comes after that pattern is learned.

A tray may add a place in brackets after a part's name, for example "CDN (Tokyo)". It is the same part, shown at that place.

### Tools for patterns that have no part

The Pattern Book shows familiar tools for every pattern. Patterns with a part above use that part's tools. The rest use this table.

| Pattern | Familiar tools |
|---|---|
| Role-based access control (RBAC) | AWS IAM, Auth0 |
| Password hashing | bcrypt, Argon2 |
| Database index | PostgreSQL, MySQL |
| Sharding | Vitess, MongoDB |
| Fan-out | Redis, Kafka |
| Multi-region | AWS, Google Cloud |
| Failover | Amazon Route 53, Kubernetes |
| Rate limiting | Nginx, Cloudflare |

## How to read a Build

- **Arrives by:** a server alert or an email, with the exact text.
- **Users gained:** added to the user count when solved.
- **Goal:** the text on the sticky note in Blueprint.
- **Tray:** the parts the design needs.
- **Decoys:** extra parts in the tray that the design does not need. The tray shows parts and decoys together, shuffled.
- **Solution:** the connections that must be drawn. "A -> B" means an arrow from A to B.
- **Wrong moves:** mistakes the game recognises. Each has a trigger, a "Sees" animation and a "Says" sentence. If more than one applies, use the first in the list.
  - `uses "X"` means the decoy X is connected to anything.
  - `connects "A" to "B"` means an arrow from A to B has been drawn.
  - `missing "X"` means X has no arrows at all.
- **Hint 1 places:** the part that Hint 1 puts on the canvas and locks.
- **Nudge:** Maya's hint after a failed deploy.
- **Result:** shown when the design is right.
- **Practises:** the patterns this Build puts together. The names match their Pattern Book entries exactly.

All Builds start automatically. Builds add no new boxes to the System Map.

---

# Stage 1

## B1 The First Blueprint

- **Arrives by:** Email from Maya. "Before we grow, draw what we have. Show me how someone logs in and pays."
- **Users gained:** 200
- **Goal:** "Draw how a user logs in and pays. Keep the database behind the server."
- **Tray:** Users, Web server, Database, Payment provider
- **Decoys:** Plain-text password file
- **Solution:**
  - Users -> Web server
  - Web server -> Database
  - Web server -> Payment provider
- **Wrong moves:**
  - connects "Users" to "Database"
    Sees: Data pours out of the Database straight to a stranger.
    Says: "Data leak. Nothing checks who is asking. Users must go through the server."
  - uses "Plain-text password file"
    Sees: The file opens and every password can be read.
    Says: "Data leak. Readable passwords are never safe, wherever they are kept."
- **Hint 1 places:** Web server
- **Nudge:** "Who should be the only one allowed to talk to the database?"
- **Result:** "Everything goes through the server. It checks each request before anything else is touched."
- **Practises:** Role-based access control (RBAC), Password hashing

---

# Stage 2

## B2 The Fast Front Page

- **Arrives by:** Email from Zoe. "The front page decides whether new people stay. Can posts and photos both load fast?"
- **Users gained:** 10,000
- **Goal:** "Design a front page that loads fast. Posts come from the database. Photos come from nearby."
- **Tray:** Users, Web server, Cache, Database, CDN, File storage
- **Decoys:** One big server
- **Solution:**
  - Users -> Web server
  - Web server -> Cache
  - Cache -> Database
  - Users -> CDN
  - CDN -> File storage
- **Wrong moves:**
  - connects "Web server" to "Database"
    Sees: Thousands of identical arrows hit the Database. It glows red.
    Says: "Every visitor asks the database the same thing. Put the cache in between."
  - connects "Users" to "File storage"
    Sees: Large photo files crawl across the map to faraway users.
    Says: "Every photo travels from one place. Let the CDN serve copies from nearby."
  - uses "One big server"
    Sees: The big server copes, then slowly fills up and turns red.
    Says: "It copes for a few weeks at triple the cost. Then growth fills it again."
- **Hint 1 places:** Cache
- **Nudge:** "Two things must be fast: answers that repeat, and files that travel far."
- **Result:** "Repeat answers come from the cache. Photos come from the CDN. The server and database stay calm."
- **Practises:** Caching, CDN

---

# Stage 3

## B3 The Secure Door

- **Arrives by:** Email from Zoe. "A big partner wants to sign up 50,000 staff. First they want to see how our login works."
- **Users gained:** 1,500,000
- **Goal:** "Design a login that survives a server crash and keeps passwords safe."
- **Tray:** Users, Load balancer, Web servers, Session store, Database
- **Decoys:** Plain-text password file, One big server
- **Solution:**
  - Users -> Load balancer
  - Load balancer -> Web servers
  - Web servers -> Session store
  - Web servers -> Database
- **Wrong moves:**
  - uses "Plain-text password file"
    Sees: The file opens and every password can be read.
    Says: "Data leak. Passwords must be stored as one-way scrambles in the database."
  - uses "One big server"
    Sees: The big server flickers. Every user turns grey at once.
    Says: "One crash logs everyone out and takes Blip down with it."
  - connects "Users" to "Web servers"
    Sees: Every visitor piles onto the same server while the others sit idle.
    Says: "Nothing is sharing out the visitors. Put the load balancer in front."
  - missing "Session store"
    Sees: A user logs in on one server. The next server shows a question mark.
    Says: "Each server only remembers its own visitors. Logins need one shared place."
- **Hint 1 places:** Load balancer
- **Nudge:** "What happens to a login when the server holding it dies?"
- **Result:** "Any server can answer any user. Logins live in one shared place. Passwords are stored as one-way scrambles."
- **Practises:** Load balancing, Stateless servers, Password hashing

---

# Stage 4

## B4 The Viral Like Button

- **Arrives by:** Server alert. "Database writes are jammed. One post is getting 10,000 likes a second."
- **Users gained:** 10,000,000
- **Goal:** "Design a like button that takes 10,000 taps a second without jamming the database."
- **Tray:** Users, Load balancer, Web servers, Message queue, Background worker, Primary database
- **Decoys:** Cache
- **Solution:**
  - Users -> Load balancer
  - Load balancer -> Web servers
  - Web servers -> Message queue
  - Message queue -> Background worker
  - Background worker -> Primary database
- **Wrong moves:**
  - connects "Web servers" to "Primary database"
    Sees: The Primary database catches fire.
    Says: "Every like is its own write. Ten thousand a second jam the database."
  - uses "Cache"
    Sees: A server restarts and a pile of likes vanishes.
    Says: "Likes lost. A cache can forget everything when it restarts. Likes must wait somewhere safe."
- **Hint 1 places:** Message queue
- **Nudge:** "Does the user need to wait for the like to be saved?"
- **Result:** "Likes join a queue in an instant. Workers write them to the database at a steady pace."
- **Practises:** Message queue, Load balancing

---

# Stage 5

## B5 The Edge Delivery

- **Arrives by:** Email from Sam. "Our users in Tokyo wait 4 seconds for images to load. Fix this before the global marketing push."
- **Users gained:** 50,000,000
- **Goal:** "Get photos to Tokyo and New York fast. The originals stay in London."
- **Tray:** Users (Tokyo), Users (New York), CDN (Tokyo), CDN (New York), File storage (London)
- **Decoys:** Web server (London)
- **Solution:**
  - Users (Tokyo) -> CDN (Tokyo)
  - Users (New York) -> CDN (New York)
  - CDN (Tokyo) -> File storage (London)
  - CDN (New York) -> File storage (London)
- **Wrong moves:**
  - connects "Users (Tokyo)" to "File storage (London)"
    Sees: A timer over Tokyo counts up to 4 seconds.
    Says: "Every photo crosses the world. Send Tokyo to a CDN near Tokyo first."
  - connects "Users (New York)" to "File storage (London)"
    Sees: A timer over New York counts up to 2 seconds.
    Says: "Every photo crosses the ocean. Send New York to a CDN near New York first."
  - connects "Users (Tokyo)" to "CDN (New York)"
    Sees: An arrow from Tokyo stretches right around the globe.
    Says: "Wrong side of the world. Each user should reach the CDN nearest to them."
  - uses "Web server (London)"
    Sees: The London web server strains under a pile of photo files.
    Says: "The web server should not be handing out photos. That is the CDN's job."
- **Hint 1 places:** CDN (Tokyo)
- **Nudge:** "Where should a photo be waiting when someone in Tokyo asks for it?"
- **Result:** "Each CDN keeps copies close by. It only asks London when it does not have the photo yet."
- **Practises:** CDN, Multi-region
