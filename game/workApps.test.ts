// The work apps: Triage, Tune and Blueprint Builds. Run with: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { buildById } from "../data/blueprints";
import { reducer, SAVE_VERSION } from "./reducer";
import { builtIn, patternBook } from "./patternBook";
import { tuneFor, tuneSteps } from "../data/extraSteps";
import { deployOutcome } from "./blueprint";
import { callButton, callsIn, canTestFirst, cluesGiven } from "./rules";
import { loadGame, saveKey } from "./save";
import type { Action } from "./types";
import { begun, buy, call, deploy, drawRight, look, memoryStorage, pick, play, playTo, solveBest } from "./testHelpers";

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
  s = play(s, buy("pc-loft"), { type: "next" });
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

test("a version 1 save is carried forward to the current version", () => {
  const store = memoryStorage();
  const s = play(begun(), ...look);
  const canvas = { parts: ["Users", "Cache"], arrows: [], locked: [], decoysRemoved: false };
  store.setItem(saveKey(1), JSON.stringify({ ...s, saveVersion: 1, run: { ...s.run, canvas } }));
  const loaded = loadGame(store)!;
  assert.equal(loaded.saveVersion, SAVE_VERSION);
  assert.equal(loaded.run.standbySaved, false);
  assert.deepEqual(loaded.run.lateItems, []);
  assert.deepEqual(loaded.run.canvas!.parts, [
    { name: "Users", x: 0.25, y: 0.5 },
    { name: "Cache", x: 0.75, y: 0.5 },
  ]);
  assert.equal(loaded.currentId, s.currentId);
});
