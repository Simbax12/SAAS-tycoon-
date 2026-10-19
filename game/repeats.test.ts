// Repeats and Stage 2. Run with: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { emailView } from "./emails";
import { reducer, startIncident } from "./reducer";
import { alsoSeenAs, patternBook, pipsFor } from "./patternBook";
import { callsIn, cluesGiven, neededNext, removalLines, usersOnScreen } from "./rules";
import { begun, buy, call, deploy, drawRight, look, pick, play, playTo, solveNext } from "./testHelpers";

// --- Milestone 5: repeats and Stage 2 ---

test("Stage 2 can be played: the four new incidents, R1 and R2, then Stage 3 starts", () => {
  let s = playTo("2.1");
  const seen: string[] = [];
  while (s.currentId !== "3.1") {
    seen.push(s.currentId);
    s = solveNext(s);
  }
  assert.deepEqual(seen, ["2.1", "R1", "2.2", "R2", "2.3", "2.4", "B2"]);
  assert.ok(s.emails.some((e) => e.key === "opener:3"));
  assert.deepEqual(pipsFor(s, "Role-based access control (RBAC)"), ["gold", "gold", "empty"]);
  assert.deepEqual(pipsFor(s, "Idempotency keys"), ["gold", "gold", "empty"]);
  assert.deepEqual(
    patternBook(s).map((p) => p.name),
    ["Role-based access control (RBAC)", "Password hashing", "Idempotency keys", "Secrets manager", "Caching", "Database index", "CDN", "Eager loading"],
  );
});

test("Example 2: 2.1 with Triage and a wrong pick", () => {
  let s = { ...playTo("2.1"), cash: 1_000 };
  s = reducer(s, { type: "investigate" });
  assert.equal(s.phase, "triage");
  // The player taps the cause first. The bonus is paid when the incident is solved.
  s = reducer(s, { type: "tapLine", lineId: "cause" });
  assert.equal(s.phase, "choosing");
  assert.equal(s.cash, 1_000);
  s = reducer(s, pick("partial"));
  assert.equal(s.run.stars, 2);
  assert.equal(s.cash, 600);
  // No clue is shown after a wrong pick.
  assert.deepEqual(cluesGiven(s), []);
  const users = s.users;
  s = reducer(s, pick("best"));
  // £2,000 x 1 = £2,000, plus the Triage bonus, 10% of £2,000 = £200.
  assert.equal(s.cash, 2_800);
  assert.equal(s.users, users + 9_000);
  assert.deepEqual(s.results["2.1"], { stars: 2, firstTry: false });
  // Caching is learned, and pip 1 is always gold.
  assert.deepEqual(pipsFor(s, "Caching"), ["gold", "empty", "empty"]);
  assert.equal(patternBook(s).at(-1)?.name, "Caching");
});

test("the Bigger server removes the bigger-server option in 2.1, and Maya says why", () => {
  let s = { ...playTo("B1"), cash: 5_000 };
  // It is a Stage 2 item, so it cannot be bought in Stage 1.
  assert.equal(reducer(s, buy("srv-bigger")), s);
  s = play(s, ...look, ...drawRight("B1"), deploy, buy("pc-office"), { type: "next" }, buy("srv-bigger"));
  assert.equal(s.currentId, "2.1");
  assert.ok(s.owned.includes("srv-bigger"));
  // Bought while 2.1 is open, so 2.1 keeps all three options.
  assert.deepEqual(s.run.removed, []);
  assert.deepEqual(removalLines(s), []);
  // A run of 2.1 that starts with the server owned loses the option from the start.
  s = startIncident(s);
  assert.deepEqual(s.run.removed, ["partial"]);
  assert.deepEqual(removalLines(s), ["We already bought the biggest one we can afford. Hardware alone will not save us."]);
  // With one option gone, one wrong pick leaves only the best: the guided answer.
  s = play(s, ...look, pick("bad"));
  assert.equal(s.phase, "guided");
  assert.equal(reducer(s, pick("partial")), s);
});

test("Monitoring halves bad-choice penalties: a 5% dip and 5% of base cash", () => {
  let s = { ...playTo("2.1"), cash: 3_000 };
  // Bought during 2.1, it only changes the incidents after it: the full 10% of £2,000 is lost.
  assert.equal(play(s, buy("srv-monitoring"), ...look, pick("bad")).cash, 1_600);
  s = startIncident({ ...s, owned: [...s.owned, "srv-monitoring"], cash: 1_800 });
  const users = usersOnScreen(s);
  s = play(s, ...look, pick("bad"));
  assert.equal(s.cash, 1_700);
  assert.equal(s.run.dip, Math.round(users * 0.05));
  // A partial pick is not changed: 20% of £2,000.
  s = reducer(s, pick("partial"));
  assert.equal(s.cash, 1_300);
});

test("R1: a wrong card costs a star but no cash and no dip, and goes to the Recycle Bin", () => {
  let s = playTo("R1");
  assert.equal(s.phase, "arrived");
  assert.equal(s.emails.at(-1)?.key, "arrive:R1");
  assert.equal(emailView("arrive:R1")?.name, "Sam");
  s = play(s, ...look);
  const cash = s.cash;
  s = reducer(s, pick("Password hashing"));
  assert.equal(s.run.stars, 2);
  assert.equal(s.cash, cash);
  assert.equal(s.run.dip, 0);
  assert.equal(s.phase, "choosing");
  assert.deepEqual(s.recycleBin.at(-1), { incidentId: "R1", choice: "Password hashing" });
  // Calls give the Nudge, then Clue 2.
  assert.equal(callsIn(s), 2);
  s = reducer(s, pick("Role-based access control (RBAC)"));
  assert.equal(s.phase, "solved");
  // A repeat pays half the base cash: £1,000 x 1.
  assert.equal(s.cash, cash + 1_000);
  assert.deepEqual(s.results.R1, { stars: 2, firstTry: false });
  // A silver pip, and the "Also seen as" line.
  assert.deepEqual(pipsFor(s, "Role-based access control (RBAC)"), ["gold", "silver", "empty"]);
  assert.deepEqual(alsoSeenAs(s, "Role-based access control (RBAC)"), ["Staff tools that everyone can use."]);
  assert.deepEqual(s.refreshersDue, ["R1"]);
});

test("a refresher is sent after the next incident is solved, before the requests", () => {
  let s = play(playTo("R1"), ...look, pick("Idempotency keys"), pick("Role-based access control (RBAC)"));
  let before = s.emails.length;
  s = reducer(s, { type: "next" });
  // Not yet: Sam's thank-you, then the Dark mode request, then 2.2 arrives.
  assert.deepEqual(
    s.emails.slice(before).map((e) => e.key),
    ["thanks:R1", "request:feat-darkmode", "arrive:2.2"],
  );
  assert.equal(emailView("request:feat-darkmode")?.name, "Tom");
  assert.deepEqual(s.refreshersDue, ["R1"]);
  s = play(s, ...look, pick("best"));
  before = s.emails.length;
  s = reducer(s, { type: "next" });
  assert.deepEqual(
    s.emails.slice(before).map((e) => e.key),
    ["thanks:2.2", "refresher:R1", "request:srv-monitoring", "arrive:R2"],
  );
  assert.deepEqual(s.refreshersDue, []);
  assert.deepEqual(emailView("refresher:R1"), {
    key: "refresher:R1",
    from: "maya",
    name: "Maya",
    text: "Role-based access control (RBAC)",
    refresher: "R1",
  });
});

test("a repeat solved first try fills a gold pip and sends no refresher", () => {
  let s = playTo("R2");
  assert.equal(emailView("arrive:R2")?.name, "Mei");
  s = play(s, ...look, pick("Idempotency keys"));
  assert.deepEqual(s.results.R2, { stars: 3, firstTry: true });
  assert.deepEqual(pipsFor(s, "Idempotency keys"), ["gold", "gold", "empty"]);
  assert.deepEqual(s.refreshersDue, []);
  // Next: Mei's thank-you, then the Photo sharing request. 2.3 waits for it.
  const before = s.emails.length;
  s = reducer(s, { type: "next" });
  assert.deepEqual(s.emails.slice(before).map((e) => e.key), ["thanks:R2", "request:feat-photos"]);
  assert.equal(s.currentId, "2.3");
  assert.equal(s.phase, "waiting");
  assert.equal(neededNext(s), "feat-photos");
});

test("a call in a repeat spoils first try, so the pip is silver", () => {
  let s = { ...playTo("R2"), cash: 5_000 };
  s = play(s, ...look, call);
  // 15% of £2,000.
  assert.equal(s.cash, 4_700);
  assert.deepEqual(cluesGiven(s), ["Remember The Double Charge? How did the server spot a repeat?"]);
  s = reducer(s, pick("Idempotency keys"));
  assert.deepEqual(s.results.R2, { stars: 3, firstTry: false });
  assert.deepEqual(pipsFor(s, "Idempotency keys"), ["gold", "silver", "empty"]);
});

test("Test first works on a repeat card, and two wrong cards lead to the guided answer", () => {
  const at = playTo("R1");
  let s = startIncident({ ...at, owned: [...at.owned, "srv-test"] });
  s = play(s, ...look, { type: "testFirst", optionId: "Idempotency keys" });
  assert.equal(s.run.testUsed, true);
  assert.equal(s.run.stars, 3);
  assert.deepEqual(s.run.tried, []);
  s = play(s, pick("Idempotency keys"), pick("Password hashing"));
  assert.equal(s.phase, "guided");
  assert.equal(s.run.stars, 1);
  s = reducer(s, { type: "applyGuided" });
  assert.deepEqual(s.results.R1, { stars: 1, firstTry: false });
});

test("the wallpaper setting changes, and a reset keeps it", () => {
  const s = play(begun(), { type: "setting", settings: { wallpaper: "night" } });
  assert.equal(s.settings.wallpaper, "night");
  assert.equal(reducer(s, { type: "reset", seed: 1 }).settings.wallpaper, "night");
});
