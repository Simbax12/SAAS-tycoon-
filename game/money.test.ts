// Calls to Dana, the tutorial, the Shop and money. Run with: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { challenges } from "../data/challenges";
import { emailView } from "./emails";
import { reducer } from "./reducer";
import { requestFor } from "../data/upgrades";
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
  progressShare,
} from "./rules";
import { begun, buy, call, look, pick, play, solveBest } from "./testHelpers";

// --- Milestone 3: calls to Dana and the tutorial ---

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
  assert.ok(!canBuy(s, "srv-test"));
  assert.equal(reducer(s, buy("srv-test")), s);
  // Payments is on show in Stage 1 but is not Needed next while 1.1 is current.
  assert.ok(!canBuy(s, "feat-payments"));
  // The Second monitor and the Engineering handbook are Stage 2 items.
  assert.ok(!canBuy({ ...s, cash: 10_000 }, "gear-handbook"));
  assert.ok(!canBuy({ ...s, cash: 10_000 }, "gear-monitor"));
  assert.deepEqual(itemsOnShow(s).map((u) => u.id), ["feat-payments", "srv-test", "pc-office"]);
  const rich = { ...s, cash: 400 };
  const bought = reducer(rich, buy("pc-office"));
  assert.equal(bought.cash, 100);
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
