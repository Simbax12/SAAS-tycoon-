// Reducer tests. Run with: npm test
// The numbers follow docs/GAME_LOGIC.md > Part 6: Worked examples, where Stage 1 can play them.

import { test } from "node:test";
import assert from "node:assert/strict";
import { buildById } from "../data/blueprints";
import { challenges } from "../data/challenges";
import { emailView } from "./emails";
import { freshState, reducer, SAVE_VERSION, startIncident } from "./reducer";
import { repeatById } from "../data/repeats";
import { alsoSeenAs, builtIn, patternBook, pipsFor } from "./patternBook";
import { tuneFor, tuneSteps } from "../data/extraSteps";
import { requestFor } from "../data/upgrades";
import { deployOutcome } from "./blueprint";
import {
  callButton,
  callsIn,
  canBuy,
  canBuyLifeline,
  canTestFirst,
  cluesGiven,
  itemsOnShow,
  lifelinePrice,
  neededNext,
  nextCallPrice,
  nextIncident,
  progressShare,
  removalLines,
  shuffled,
  usersOnScreen,
} from "./rules";
import { loadGame, saveGame, saveKey, type Storage } from "./save";
import type { Action, GameState } from "./types";

const play = (state: GameState, ...actions: Action[]) => actions.reduce(reducer, state);
const begun = () => play(freshState(42), { type: "begin" });
const pick = (optionId: string): Action => ({ type: "pick", optionId });
// Investigate, then find the cause first try if the incident has a Triage step.
const look: Action[] = [{ type: "investigate" }, { type: "tapLine", lineId: "cause" }];
const solveBest: Action[] = [...look, pick("best")];
const deploy: Action = { type: "deploy" };

test("begin sends Maya's opener, then 1.1 arrives by email", () => {
  const s = begun();
  assert.deepEqual(
    s.emails.map((e) => e.key),
    ["opener:1", "arrive:1.1"],
  );
  assert.equal(s.currentId, "1.1");
  assert.equal(s.phase, "arrived");
  // Begin only works once.
  assert.equal(reducer(s, { type: "begin" }), s);
});

test("Example 1: 1.1 solved first try", () => {
  const s = play(begun(), ...solveBest);
  assert.equal(s.phase, "solved");
  assert.equal(s.cash, 750);
  assert.equal(s.users, 200);
  assert.deepEqual(s.results["1.1"], { stars: 3, firstTry: true });
  assert.equal(s.emails.find((e) => e.key === "arrive:1.1")?.read, true);

  // It came from Maya, so there is no thank-you email. Next sends the Test environment request,
  // then 1.2 arrives as a server alert, with no email.
  const n = reducer(s, { type: "next" });
  assert.equal(n.currentId, "1.2");
  assert.equal(n.phase, "arrived");
  assert.deepEqual(
    n.emails.slice(s.emails.length).map((e) => e.key),
    ["request:srv-test"],
  );
});

test("a partial pick takes a star and 20% of base cash, and goes to the Recycle Bin", () => {
  let s = play(begun(), ...solveBest, { type: "next" }); // cash £750, on 1.2
  s = play(s, ...look, pick("partial"));
  assert.equal(s.run.stars, 2);
  assert.equal(s.cash, 650);
  assert.equal(s.run.paid, 100);
  assert.deepEqual(s.recycleBin, [{ incidentId: "1.2", choice: "partial" }]);
  assert.equal(s.phase, "choosing");

  // The same option cannot be picked twice.
  assert.equal(reducer(s, pick("partial")), s);

  s = reducer(s, pick("best"));
  // £500 x 1 = £500, plus the Triage bonus, 10% of £500 = £50.
  assert.equal(s.cash, 1200);
  assert.deepEqual(s.results["1.2"], { stars: 2, firstTry: false });
});

test("a bad pick dips users 10% and takes 10% of base cash until solved", () => {
  let s = play(begun(), ...solveBest, { type: "next" }); // 200 users, £750
  s = play(s, ...look, pick("bad"));
  assert.equal(s.run.dip, 20);
  assert.equal(usersOnScreen(s), 180);
  assert.equal(s.cash, 700);
  s = reducer(s, pick("best"));
  assert.equal(s.run.dip, 0);
  assert.equal(usersOnScreen(s), 450);
});

test("two wrong picks lead to the guided answer at 1 star", () => {
  let s = play(begun(), ...look, pick("bad"), pick("partial"));
  assert.equal(s.phase, "guided");
  assert.equal(s.run.stars, 1);
  // Cash never goes below £0.
  assert.equal(s.cash, 0);
  assert.equal(reducer(s, pick("best")), s);
  s = reducer(s, { type: "applyGuided" });
  assert.equal(s.phase, "solved");
  // £500 x 0.5 = £250.
  assert.equal(s.cash, 250);
  assert.deepEqual(s.results["1.1"], { stars: 1, firstTry: false });
});

test("cash coming in pays the loan first", () => {
  const s = play({ ...begun(), loanOwed: 300 }, ...solveBest);
  assert.equal(s.loanOwed, 0);
  assert.equal(s.cash, 450);
});

// Solves the current incident, taps Next, and buys a feature the next incident waits for.
const solveAndNext = (s: GameState) => {
  const n = play(s, ...solveBest, { type: "next" });
  return n.phase === "waiting" ? reducer(n, { type: "buy", itemId: "feat-payments" }) : n;
};

test("thank-you emails come from the person who sent the incident", () => {
  let s = begun();
  for (let i = 0; i < 3; i++) s = solveAndNext(s);
  assert.equal(s.currentId, "1.4");
  assert.ok(s.emails.some((e) => e.key === "thanks:1.3"));
  assert.equal(emailView("thanks:1.3")?.text, "It works now. Thank you!");
  assert.equal(emailView("thanks:1.4")?.text, "That fixed it. My team says thanks.");
  assert.equal(emailView("thanks:1.1"), undefined);
});

test("after 1.4 comes B1, then Stage 2 starts with 2.1", () => {
  let s = begun();
  for (let i = 0; i < 3; i++) s = solveAndNext(s);
  s = play(s, ...solveBest);
  // 200 + 250 + 50 + 200 + 100.
  assert.equal(s.users, 800);
  // Four incidents at £750, two Triage bonuses of £50, less £300 for Payments.
  assert.equal(s.cash, 2800);
  assert.equal(nextIncident(s)!.row.id, "B1");
  // B1 arrives as Maya's email and starts with an empty canvas.
  s = reducer(s, { type: "next" });
  assert.equal(s.currentId, "B1");
  assert.equal(s.emails.at(-1)?.key, "arrive:B1");
  assert.deepEqual(s.run.canvas, { parts: [], arrows: [], locked: [], decoysRemoved: false });
  s = play(s, { type: "investigate" }, ...drawRight("B1"), deploy);
  // £500 x 1.5 = £750. Users +200.
  assert.equal(s.cash, 3550);
  assert.equal(s.users, 1000);
  assert.equal(nextIncident(s)!.row.id, "2.1");
  const before = s.emails.length;
  // A lifeline bought in Stage 1 is lost when Stage 2 starts.
  s = reducer({ ...s, lifeline: 1 }, { type: "next" });
  assert.equal(s.currentId, "2.1");
  assert.equal(s.phase, "arrived");
  assert.equal(s.lifeline, null);
  // The thank-you, then Maya's opener, then the request for the start of the stage. 2.1 is a server alert.
  assert.deepEqual(
    s.emails.slice(before).map((e) => e.key),
    ["opener:2", "request:srv-bigger"],
  );
});

test("reset keeps the settings and nothing else", () => {
  const s = { ...play(begun(), ...solveBest), settings: { ...begun().settings, sound: true } };
  const r = reducer(s, { type: "reset", seed: 7 });
  assert.deepEqual(r, freshState(7, s.settings));
});

test("the shuffle is fixed by the seed and the incident id", () => {
  const opts = challenges[0].options.map((o) => o.id);
  assert.deepEqual(shuffled(opts, 42, "1.1"), shuffled(opts, 42, "1.1"));
  assert.deepEqual([...shuffled(opts, 42, "1.1")].sort(), [...opts].sort());
});

function memoryStorage(): Storage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
}

test("a save survives a reload", () => {
  const store = memoryStorage();
  const s = play(begun(), ...look, pick("partial"));
  saveGame(store, s);
  assert.ok(store.data.has(saveKey(SAVE_VERSION)));
  assert.deepEqual(loadGame(store), s);
});

test("no save, or one that cannot be read, gives null", () => {
  const store = memoryStorage();
  assert.equal(loadGame(store), null);
  store.setItem(saveKey(SAVE_VERSION), "not json");
  assert.equal(loadGame(store), null);
});

test("a save whose incident left the play order carries on from the first unsolved one", () => {
  const store = memoryStorage();
  const s = play(begun(), ...solveBest);
  saveGame(store, { ...s, currentId: "9.9" });
  const loaded = loadGame(store)!;
  assert.equal(loaded.currentId, "1.2");
  assert.equal(loaded.phase, "arrived");
});

// --- Milestone 3: calls to Dana and the tutorial ---

const call: Action = { type: "call" };

test("every call in the tutorial incident is free, and each gives the next clue", () => {
  let s = play(begun(), ...look, call, call);
  assert.equal(s.cash, 0);
  assert.equal(s.run.calls, 2);
  assert.deepEqual(cluesGiven(s), [challenges[0].nudge, ...challenges[0].clues].slice(0, 2));
  // 1.1 has the Nudge and one Clue line, so a third call does nothing.
  assert.equal(callsIn(s), 2);
  assert.equal(reducer(s, call), s);
  assert.deepEqual(callButton(s), { kind: "noMore" });
  // A call costs no star, but spoils first try.
  s = reducer(s, pick("best"));
  assert.deepEqual(s.results["1.1"], { stars: 3, firstTry: false });
});

test("calls cost 15% of base cash, then 10% more each time, and never go into debt", () => {
  let s = play(begun(), ...solveBest, { type: "next" }, ...look); // £750, on 1.2
  assert.deepEqual(callButton(s), { kind: "call", price: 75, affordable: true });
  s = reducer(s, call);
  assert.equal(s.cash, 675);
  assert.equal(nextCallPrice(s), 125);
  s = { ...s, cash: 100 };
  assert.deepEqual(callButton(s), { kind: "call", price: 125, affordable: false });
  assert.equal(reducer(s, call), s);
  // Calls never remove an option.
  assert.deepEqual(s.run.removed, []);
  assert.equal(s.run.paid, 75);
});

test("the handbook makes the first call in each incident free", () => {
  let s = play(begun(), ...solveBest, { type: "next" }, ...look);
  s = { ...s, owned: [...s.owned, "gear-handbook"] };
  s = reducer(s, call);
  assert.equal(s.cash, 750);
  assert.equal(s.run.handbookUsed, true);
  // The second call costs the second call's price.
  assert.equal(nextCallPrice(s), 125);
});

test("Victor's lifeline shows the answer once every call is used, and keeps stars", () => {
  let s = play(begun(), ...solveBest, { type: "next" }, ...look);
  s = { ...s, cash: 10_000, lifeline: 1 };
  assert.equal(reducer(s, { type: "useLifeline" }), s);
  for (let i = 0; i < callsIn(s); i++) s = reducer(s, call);
  assert.deepEqual(callButton(s), { kind: "lifeline" });
  s = reducer(s, { type: "useLifeline" });
  assert.equal(s.phase, "guided");
  assert.equal(s.lifeline, null);
  s = reducer(s, { type: "applyGuided" });
  assert.deepEqual(s.results["1.2"], { stars: 3, firstTry: false });
});

test("the tutorial ends when the player moves on from its incident, and tips are seen once", () => {
  let s = play(begun(), { type: "tutorial", step: 4 });
  assert.equal(s.tutorial, 4);
  s = play(s, ...solveBest, { type: "next" });
  assert.equal(s.tutorial, "done");
  s = play(s, { type: "tipSeen", id: "alert" }, { type: "tipSeen", id: "alert" });
  assert.deepEqual(s.tipsSeen, ["alert"]);
});

// --- Milestone 4: the Shop and money ---

const buy = (itemId: string): Action => ({ type: "buy", itemId });
// On 1.3, waiting for Payments, with £1,500 after 1.1 and 1.2.
const waitingForPayments = () => play(begun(), ...solveBest, { type: "next" }, ...solveBest, { type: "next" });

test("1.3 waits for Payments, which Sam asks for after 1.2", () => {
  const s = waitingForPayments();
  assert.equal(s.currentId, "1.3");
  assert.equal(s.phase, "waiting");
  assert.equal(neededNext(s), "feat-payments");
  assert.equal(s.emails.at(-1)?.key, "request:feat-payments");
  assert.deepEqual(emailView("request:feat-payments"), {
    key: "request:feat-payments",
    from: "sam",
    name: "Sam",
    text: requestFor("feat-payments")!.text,
    shopItem: "feat-payments",
  });
  // Nothing can be picked while it waits.
  assert.equal(reducer(s, { type: "investigate" }), s);
});

test("buying Payments unlocks 1.3: it adds its users and the incident arrives", () => {
  const s = reducer(waitingForPayments(), buy("feat-payments"));
  // £750 + £800 (1.2 with its Triage bonus), less £300.
  assert.equal(s.cash, 1250);
  assert.deepEqual(s.owned, ["feat-payments"]);
  // 200 + 250 + 50.
  assert.equal(s.users, 500);
  assert.equal(s.phase, "arrived");
  assert.equal(s.emails.at(-1)?.key, "arrive:1.3");
  assert.equal(emailView("arrive:1.3")?.name, "Priya");
  assert.equal(neededNext(s), undefined);
  assert.equal(s.topUps, 0);
  // Each item can be bought once.
  assert.equal(reducer(s, buy("feat-payments")), s);
});

test("the investor lends exactly the shortfall for the feature Needed next", () => {
  // As in Example 5, with Stage 1 numbers: cash £100, Payments costs £300.
  let s = { ...waitingForPayments(), cash: 100 };
  assert.ok(canBuy(s, "feat-payments"));
  s = reducer(s, buy("feat-payments"));
  assert.equal(s.cash, 0);
  assert.equal(s.loanOwed, 200);
  assert.equal(s.topUps, 1);
  assert.equal(s.phase, "arrived");
  // 1.3 solved with 3 stars pays £750. £200 pays off the loan first.
  s = play(s, ...solveBest);
  assert.equal(s.loanOwed, 0);
  assert.equal(s.cash, 550);
});

test("optional items need the cash: no loan, and nothing from a later stage", () => {
  const s = { ...begun(), cash: 150 };
  assert.ok(canBuy(s, "gear-monitor"));
  assert.ok(!canBuy(s, "srv-test"));
  assert.equal(reducer(s, buy("srv-test")), s);
  // Payments is on show in Stage 1 but is not Needed next while 1.1 is current.
  assert.ok(!canBuy(s, "feat-payments"));
  // The Engineering handbook is a Stage 2 item.
  assert.ok(!canBuy({ ...s, cash: 10_000 }, "gear-handbook"));
  assert.deepEqual(itemsOnShow(s).map((u) => u.id), ["feat-payments", "srv-test", "gear-monitor"]);
  const bought = reducer(s, buy("gear-monitor"));
  assert.equal(bought.cash, 50);
  assert.equal(bought.users, 0);
  assert.equal(bought.loanOwed, 0);
});

test("buying Payments early means 1.3 arrives at once, and Sam's request is not sent", () => {
  let s = play(begun(), ...solveBest, { type: "next" }); // £750, on 1.2
  s = reducer(s, buy("feat-payments"));
  assert.equal(s.cash, 450);
  assert.equal(s.phase, "arrived");
  s = play(s, ...solveBest, { type: "next" });
  assert.equal(s.currentId, "1.3");
  assert.equal(s.phase, "arrived");
  assert.ok(!s.emails.some((e) => e.key === "request:feat-payments"));
});

test("Victor's lifeline costs 2 x base cash, one held at a time", () => {
  let s = { ...begun(), cash: 2500 };
  assert.equal(lifelinePrice(s), 1000);
  s = reducer(s, { type: "buyLifeline" });
  assert.equal(s.cash, 1500);
  assert.equal(s.lifeline, 1);
  assert.equal(reducer(s, { type: "buyLifeline" }), s);
  assert.ok(!canBuyLifeline({ ...s, lifeline: null, cash: 999 }));
});

test("Test first shows one option once, with no penalty, and does not spoil first try", () => {
  const notOwned = play(begun(), ...solveBest, { type: "next" }, ...look);
  assert.equal(reducer(notOwned, { type: "testFirst", optionId: "bad" }), notOwned);
  // Bought between incidents, so it works in the next one.
  let s = play(begun(), ...solveBest, buy("srv-test"), { type: "next" }, ...look);
  assert.equal(s.cash, 550);
  assert.ok(canTestFirst(s));
  s = reducer(s, { type: "testFirst", optionId: "bad" });
  assert.equal(s.run.testUsed, true);
  assert.equal(s.run.stars, 3);
  assert.equal(s.cash, 550);
  assert.deepEqual(s.run.tried, []);
  assert.equal(s.run.dip, 0);
  assert.equal(s.phase, "choosing");
  // Once per incident.
  assert.ok(!canTestFirst(s));
  assert.equal(reducer(s, { type: "testFirst", optionId: "best" }), s);
  s = reducer(s, pick("best"));
  assert.deepEqual(s.results["1.2"], { stars: 3, firstTry: true });
  // The next incident gets it again.
  s = reducer(s, { type: "next" });
  assert.equal(s.run.testUsed, false);
});

test("an item bought during an incident only changes the incidents after it", () => {
  let s = play(begun(), ...solveBest, { type: "next" }, ...look, buy("srv-test"));
  assert.ok(s.owned.includes("srv-test"));
  assert.ok(!canTestFirst(s));
  assert.equal(reducer(s, { type: "testFirst", optionId: "bad" }), s);
  s = play(s, pick("best"), { type: "next" });
  assert.equal(s.run.testUsed, false);
});

test("a request email is not sent for an item already owned", () => {
  const s = play({ ...begun(), cash: 200 }, buy("srv-test"), ...solveBest, { type: "next" });
  assert.ok(!s.emails.some((e) => e.key === "request:srv-test"));
});

test("the progress bar has five equal segments between its markers", () => {
  assert.equal(progressShare(0), 0);
  assert.equal(progressShare(500), 0.1);
  assert.equal(progressShare(1_000), 0.2);
  assert.ok(Math.abs(progressShare(50_500) - 0.3) < 1e-9);
  assert.equal(progressShare(1_000_000_000), 1);
  assert.equal(progressShare(1_095_505_000), 1);
});

// --- Milestone 5: repeats and Stage 2 ---

// The right answer for the current incident: the best option, or the right pattern card.
function rightChoice(s: GameState): string {
  const repeat = repeatById(s.currentId);
  return repeat ? repeat.cards.find((c) => c.right)!.pattern : "best";
}

// Draws a Build's Solution on the canvas: its parts, then its arrows.
function drawRight(id: string): Action[] {
  const build = buildById(id)!;
  const parts = [...new Set(build.solution.flatMap((a) => [a.from, a.to]))];
  return [
    ...parts.map((part, i): Action => ({ type: "placePart", part, x: (i + 0.5) / parts.length, y: 0.5 })),
    ...build.solution.map((a): Action => ({ type: "drawArrow", ...a })),
  ];
}

// Solves the current incident first try and taps Next, buying any feature the next one waits for.
// Stops if nothing moves, so a test can never loop for ever.
function solveNext(s: GameState): GameState {
  let n = play(s, ...look);
  n = buildById(n.currentId) ? play(n, ...drawRight(n.currentId), deploy) : reducer(n, pick(rightChoice(n)));
  n = reducer(n, { type: "next" });
  const needs = neededNext(n);
  return needs ? reducer(n, buy(needs)) : n;
}

// Plays from the start up to an incident, solving each one first try.
function playTo(id: string): GameState {
  let s = begun();
  while (s.currentId !== id) {
    const n = solveNext(s);
    if (n.currentId === s.currentId) throw new Error(`Stuck on ${s.currentId}`);
    s = n;
  }
  return s;
}

test("Stage 2 can be played: the four new incidents, R1 and R2, then play stops", () => {
  let s = playTo("2.1");
  const seen: string[] = [];
  for (;;) {
    seen.push(s.currentId);
    const n = solveNext(s);
    const stopped = n.currentId === s.currentId;
    s = n;
    if (stopped) break;
  }
  // Stage 3 is not built yet, so play stops after B2.
  assert.deepEqual(seen, ["2.1", "R1", "2.2", "R2", "2.3", "2.4", "B2"]);
  assert.equal(s.phase, "solved");
  assert.equal(nextIncident(s)!.row.id, "3.1");
  assert.equal(nextIncident(s)!.blocked, true);
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
  s = play(s, ...look, ...drawRight("B1"), deploy, { type: "next" }, buy("srv-bigger"));
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
  s = reducer(s, buy("srv-monitoring"));
  assert.equal(s.cash, 1_800);
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

// --- Milestone 6: work apps ---

const tap = (lineId: string): Action => ({ type: "tapLine", lineId });

test("Triage: a wrong tap greys out and loses the bonus, the cause moves on to the fix", () => {
  let s = play(begun(), ...solveBest, { type: "next" }, { type: "investigate" }); // £750, on 1.2
  assert.equal(s.phase, "triage");
  // Picking a fix is not possible until the cause is found.
  assert.equal(reducer(s, pick("best")), s);
  s = play(s, tap("symptom"), tap("routine2"));
  assert.deepEqual(s.run.triageTaps, ["symptom", "routine2"]);
  assert.equal(s.phase, "triage");
  // A line is tapped once.
  assert.equal(reducer(s, tap("symptom")), s);
  s = play(s, tap("cause"), pick("best"));
  // No Triage bonus: £500 x 1.5 = £750. Extra steps never cost stars.
  assert.equal(s.cash, 1_500);
  assert.deepEqual(s.results["1.2"], { stars: 3, firstTry: true });
});

test("Triage: finding the cause on the first tap pays 10% of base cash", () => {
  const s = play(begun(), ...solveBest, { type: "next" }, ...solveBest);
  // £750 + £750 + £50.
  assert.equal(s.cash, 1_550);
});

// A stand-in Tune step on 2.2, so the Tune flow can be tested before Stage 3 brings the real ones.
function withTuneOn<T>(incidentId: string, body: () => T): T {
  const step = { ...tuneFor("3.1")!, id: "U-test", incidentId };
  tuneSteps.push(step);
  try {
    return body();
  } finally {
    tuneSteps.splice(tuneSteps.indexOf(step), 1);
  }
}

test("Tune: three waves, each played once, each right one pays 5% of base cash", () => {
  withTuneOn("2.2", () => {
    let s = play(playTo("2.2"), ...solveBest);
    assert.equal(s.phase, "tune");
    const cash = s.cash;
    // Out of range stops do nothing.
    assert.equal(reducer(s, { type: "runWave", stop: 4 }), s);
    s = play(s, { type: "runWave", stop: 1 }, { type: "runWave", stop: 0 });
    assert.deepEqual(s.run.tuneWaves, [
      { stop: 1, right: true },
      { stop: 0, right: false },
    ]);
    assert.equal(s.phase, "tune");
    s = reducer(s, { type: "runWave", stop: 3 });
    assert.equal(s.phase, "solved");
    // £2,000 x 1.5 = £3,000, plus 2 x 5% of £2,000 = £200.
    assert.equal(s.cash, cash + 3_200);
    assert.equal(reducer(s, { type: "runWave", stop: 1 }), s);
  });
});

test("Tune: the guided answer runs the Tune step too", () => {
  withTuneOn("2.2", () => {
    let s = play(playTo("2.2"), ...look, pick("bad"), pick("partial"));
    assert.equal(s.phase, "guided");
    s = reducer(s, { type: "applyGuided" });
    assert.equal(s.phase, "tune");
  });
});

test("Example 6: B2 with Test first and two calls", () => {
  let s = playTo("B2");
  s = { ...s, cash: 1_000, owned: [...s.owned, "srv-test"] };
  s = reducer(s, { type: "investigate" });
  assert.equal(s.phase, "choosing");
  // 2, plus one for each Tray part other than the Cache.
  assert.equal(callsIn(s), 7);

  // Call 1: £300. The Cache is placed and locked, and Dana says the Nudge.
  s = reducer(s, call);
  assert.equal(s.cash, 700);
  assert.deepEqual(s.run.canvas!.locked, ["Cache"]);
  assert.ok(s.run.canvas!.parts.some((p) => p.name === "Cache"));
  assert.deepEqual(cluesGiven(s), [buildById("B2")!.nudge]);
  // A locked part cannot be moved or removed.
  assert.equal(reducer(s, { type: "removePart", part: "Cache" }), s);
  assert.equal(reducer(s, { type: "placePart", part: "Cache", x: 0.1, y: 0.1 }), s);

  // A test deploy of Web server to Database: the wrong move shows, nothing is lost.
  s = play(
    s,
    { type: "placePart", part: "Web server", x: 0.3, y: 0.5 },
    { type: "placePart", part: "Database", x: 0.7, y: 0.5 },
    { type: "placePart", part: "One big server", x: 0.5, y: 0.9 },
    { type: "drawArrow", from: "Web server", to: "Database" },
  );
  const outcome = deployOutcome(buildById("B2")!, s.run.canvas!);
  assert.equal(outcome.kind === "wrongMove" && outcome.move.says, "Every visitor asks the database the same thing. Put the cache in between.");
  s = reducer(s, { type: "deploy", test: true });
  assert.equal(s.run.stars, 3);
  assert.equal(s.run.failedDeploys, 0);
  assert.equal(s.run.testUsed, true);
  assert.equal(canTestFirst(s), false);
  assert.deepEqual(s.recycleBin, []);

  // Call 2: £500. The One big server is removed from the tray and the canvas.
  s = reducer(s, call);
  assert.equal(s.cash, 200);
  assert.equal(s.run.canvas!.decoysRemoved, true);
  assert.ok(!s.run.canvas!.parts.some((p) => p.name === "One big server"));
  assert.equal(reducer(s, { type: "placePart", part: "One big server", x: 0.5, y: 0.5 }), s);
  assert.equal(s.run.stars, 3);

  s = play(s, { type: "deleteArrow", from: "Web server", to: "Database" }, ...drawRight("B2"), deploy);
  assert.equal(s.phase, "solved");
  // £2,000 x 1.5 = £3,000.
  assert.equal(s.cash, 3_200);
  assert.deepEqual(s.results.B2, { stars: 3, firstTry: false });
  assert.deepEqual(s.blueprints.B2, buildById("B2")!.solution);
  assert.deepEqual(builtIn(s, "Caching"), ["The Fast Front Page"]);
  assert.deepEqual(builtIn(s, "CDN"), ["The Fast Front Page"]);
  assert.deepEqual(patternBook(s).find((p) => p.name === "Caching")?.builtIn, ["The Fast Front Page"]);
  s = reducer(s, { type: "next" });
  assert.ok(s.emails.some((e) => e.key === "thanks:B2"));
});

test("B1: a wrong move costs a star and goes to the Recycle Bin, two failures draw the Solution", () => {
  let s = play(playTo("B1"), { type: "investigate" });
  // Deploy is not possible with no arrows.
  assert.equal(reducer(s, deploy), s);
  s = play(
    s,
    { type: "placePart", part: "Users", x: 0.1, y: 0.5 },
    { type: "placePart", part: "Database", x: 0.9, y: 0.5 },
    { type: "drawArrow", from: "Users", to: "Database" },
    deploy,
  );
  assert.equal(s.run.stars, 2);
  assert.equal(s.run.failedDeploys, 1);
  assert.deepEqual(s.recycleBin.at(-1), { incidentId: "B1", choice: "connects:Users>Database" });
  assert.equal(s.phase, "choosing");
  // The canvas stays as it was.
  assert.equal(s.run.canvas!.arrows.length, 1);

  // A general failure: no wrong move applies, so nothing goes to the Recycle Bin.
  const bin = s.recycleBin.length;
  s = play(
    s,
    { type: "deleteArrow", from: "Users", to: "Database" },
    { type: "placePart", part: "Web server", x: 0.5, y: 0.5 },
    { type: "drawArrow", from: "Users", to: "Web server" },
  );
  assert.deepEqual(deployOutcome(buildById("B1")!, s.run.canvas!), { kind: "general", stopped: { part: "Web server" } });
  s = reducer(s, deploy);
  assert.equal(s.recycleBin.length, bin);
  assert.equal(s.run.stars, 1);

  // After two failed deploys, Blueprint draws the Solution and the player deploys it.
  assert.equal(s.phase, "guided");
  assert.deepEqual(s.run.canvas!.arrows, buildById("B1")!.solution);
  assert.equal(reducer(s, { type: "drawArrow", from: "Web server", to: "Users" }), s);
  s = reducer(s, { type: "applyGuided" });
  assert.equal(s.phase, "solved");
  assert.deepEqual(s.results.B1, { stars: 1, firstTry: false });
});

test("calls in a Build place parts in Tray order, and the lifeline draws the Solution", () => {
  let s = play(playTo("B1"), { type: "investigate" });
  s = { ...s, cash: 10_000, lifeline: 1 };
  assert.equal(callsIn(s), 5);
  for (let i = 0; i < 5; i++) s = reducer(s, call);
  // Web server first, then the decoys go, then the rest of the Tray in order.
  assert.deepEqual(s.run.canvas!.locked, ["Web server", "Users", "Database", "Payment provider"]);
  assert.equal(callButton(s).kind, "lifeline");
  s = reducer(s, { type: "useLifeline" });
  assert.equal(s.phase, "guided");
  assert.deepEqual(s.run.canvas!.arrows, buildById("B1")!.solution);
  s = reducer(s, { type: "applyGuided" });
  assert.deepEqual(s.results.B1, { stars: 3, firstTry: false });
});

test("a version 1 save is carried forward to version 2", () => {
  const store = memoryStorage();
  const s = play(begun(), ...look);
  const canvas = { parts: ["Users", "Cache"], arrows: [], locked: [], decoysRemoved: false };
  store.setItem(saveKey(1), JSON.stringify({ ...s, saveVersion: 1, run: { ...s.run, canvas } }));
  const loaded = loadGame(store)!;
  assert.equal(loaded.saveVersion, 2);
  assert.deepEqual(loaded.run.canvas!.parts, [
    { name: "Users", x: 0.25, y: 0.5 },
    { name: "Cache", x: 0.75, y: 0.5 },
  ]);
  assert.equal(loaded.currentId, s.currentId);
});
