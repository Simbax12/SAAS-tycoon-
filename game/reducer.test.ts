// Reducer tests. Run with: npm test
// The numbers follow docs/GAME_LOGIC.md > Part 6: Worked examples, where Stage 1 can play them.

import { test } from "node:test";
import assert from "node:assert/strict";
import { challenges } from "../data/challenges";
import { emailView } from "./emails";
import { freshState, reducer, SAVE_VERSION } from "./reducer";
import { nextIncident, shuffled, usersOnScreen } from "./rules";
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

  // It came from Maya, so there is no thank-you email. 1.2 arrives as a server alert, with no email.
  const n = reducer(s, { type: "next" });
  assert.equal(n.currentId, "1.2");
  assert.equal(n.phase, "arrived");
  assert.equal(n.emails.length, s.emails.length);
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

test("until the Shop is built, Payments is owned for free when 1.3 comes up", () => {
  let s = play(begun(), ...solveBest, { type: "next" }, ...solveBest, { type: "next" });
  assert.equal(s.currentId, "1.3");
  assert.equal(s.phase, "arrived");
  assert.deepEqual(s.owned, ["feat-payments"]);
  // 200 + 250 + 50 from Payments.
  assert.equal(s.users, 500);
  assert.equal(s.emails.at(-1)?.key, "arrive:1.3");
  assert.equal(emailView("arrive:1.3")?.name, "Priya");
});

test("thank-you emails come from the person who sent the incident", () => {
  let s = begun();
  for (let i = 0; i < 3; i++) s = play(s, ...solveBest, { type: "next" });
  assert.equal(s.currentId, "1.4");
  assert.ok(s.emails.some((e) => e.key === "thanks:1.3"));
  assert.equal(emailView("thanks:1.3")?.text, "It works now. Thank you!");
  assert.equal(emailView("thanks:1.4")?.text, "That fixed it. My team says thanks.");
  assert.equal(emailView("thanks:1.1"), undefined);
});

test("after 1.4, B1 is skipped and play stops before Stage 2", () => {
  let s = begun();
  for (let i = 0; i < 4; i++) s = play(s, ...solveBest, { type: "next" });
  assert.equal(s.currentId, "1.4");
  assert.equal(s.phase, "solved");
  assert.ok(s.emails.some((e) => e.key === "thanks:1.4"));
  assert.deepEqual(nextIncident(s), { row: nextIncident(s)!.row, blocked: true });
  assert.equal(nextIncident(s)!.row.id, "2.1");
  // Tapping Next again changes nothing.
  assert.equal(reducer(s, { type: "next" }), s);
  // 200 + 250 + 50 + 200 + 100.
  assert.equal(s.users, 800);
  assert.equal(s.cash, 3000);
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
