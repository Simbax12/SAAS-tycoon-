// Reducer tests. Run with: npm test
// The numbers follow docs/GAME_LOGIC.md > Part 6: Worked examples, where Stage 1 can play them.

import { test } from "node:test";
import assert from "node:assert/strict";
import { challenges } from "../data/challenges";
import { emailView } from "./emails";
import { freshState, reducer, SAVE_VERSION } from "./reducer";
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
  shuffled,
  usersOnScreen,
} from "./rules";
import { loadGame, saveGame, saveKey, type Storage } from "./save";
import type { Action, GameState } from "./types";

const play = (state: GameState, ...actions: Action[]) => actions.reduce(reducer, state);
const begun = () => play(freshState(42), { type: "begin" });
const pick = (optionId: string): Action => ({ type: "pick", optionId });
const solveBest: Action[] = [{ type: "investigate" }, pick("best")];

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
  s = play(s, { type: "investigate" }, pick("partial"));
  assert.equal(s.run.stars, 2);
  assert.equal(s.cash, 650);
  assert.equal(s.run.paid, 100);
  assert.deepEqual(s.recycleBin, [{ incidentId: "1.2", choice: "partial" }]);
  assert.equal(s.phase, "choosing");

  // The same option cannot be picked twice.
  assert.equal(reducer(s, pick("partial")), s);

  s = reducer(s, pick("best"));
  // £500 x 1 = £500.
  assert.equal(s.cash, 1150);
  assert.deepEqual(s.results["1.2"], { stars: 2, firstTry: false });
});

test("a bad pick dips users 10% and takes 10% of base cash until solved", () => {
  let s = play(begun(), ...solveBest, { type: "next" }); // 200 users, £750
  s = play(s, { type: "investigate" }, pick("bad"));
  assert.equal(s.run.dip, 20);
  assert.equal(usersOnScreen(s), 180);
  assert.equal(s.cash, 700);
  s = reducer(s, pick("best"));
  assert.equal(s.run.dip, 0);
  assert.equal(usersOnScreen(s), 450);
});

test("two wrong picks lead to the guided answer at 1 star", () => {
  let s = play(begun(), { type: "investigate" }, pick("bad"), pick("partial"));
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

test("after 1.4, B1 is skipped and play stops before Stage 2", () => {
  let s = begun();
  for (let i = 0; i < 3; i++) s = solveAndNext(s);
  s = play(s, ...solveBest, { type: "next" });
  assert.equal(s.currentId, "1.4");
  assert.equal(s.phase, "solved");
  assert.ok(s.emails.some((e) => e.key === "thanks:1.4"));
  assert.deepEqual(nextIncident(s), { row: nextIncident(s)!.row, blocked: true });
  assert.equal(nextIncident(s)!.row.id, "2.1");
  // Tapping Next again changes nothing.
  assert.equal(reducer(s, { type: "next" }), s);
  // 200 + 250 + 50 + 200 + 100.
  assert.equal(s.users, 800);
  // Four incidents at £750, less £300 for Payments.
  assert.equal(s.cash, 2700);
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
  const s = play(begun(), { type: "investigate" }, pick("partial"));
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
  let s = play(begun(), { type: "investigate" }, call, call);
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
  let s = play(begun(), ...solveBest, { type: "next" }, { type: "investigate" }); // £750, on 1.2
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
  let s = play(begun(), ...solveBest, { type: "next" }, { type: "investigate" });
  s = { ...s, owned: [...s.owned, "gear-handbook"] };
  s = reducer(s, call);
  assert.equal(s.cash, 750);
  assert.equal(s.run.handbookUsed, true);
  // The second call costs the second call's price.
  assert.equal(nextCallPrice(s), 125);
});

test("Victor's lifeline shows the answer once every call is used, and keeps stars", () => {
  let s = play(begun(), ...solveBest, { type: "next" }, { type: "investigate" });
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
    text: "People love Blip. Time to earn something. Can we add payments for Blip Plus?",
    shopItem: "feat-payments",
  });
  // Nothing can be picked while it waits.
  assert.equal(reducer(s, { type: "investigate" }), s);
});

test("buying Payments unlocks 1.3: it adds its users and the incident arrives", () => {
  const s = reducer(waitingForPayments(), buy("feat-payments"));
  assert.equal(s.cash, 1200);
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
  let s = play(begun(), ...solveBest, { type: "next" }, { type: "investigate" });
  // Not owned yet.
  assert.equal(reducer(s, { type: "testFirst", optionId: "bad" }), s);
  s = play(s, buy("srv-test"));
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
