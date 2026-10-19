// Stages 3 to 5, the win, and the worked examples they hold. Run with: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { reducer, SAVE_VERSION, startIncident } from "./reducer";
import { pipsFor } from "./patternBook";
import { lessonFor, triageSteps, tuneFor } from "../data/extraSteps";
import { isTaskCommand, runCommand } from "./terminal";
import { everydayPatterns } from "../data/patterns";
import { playOrder } from "../data/playOrder";
import { callButton, canBuy, neededNext, removalLines, usersOnScreen } from "./rules";
import { loadGame, saveKey } from "./save";
import { begun, buy, deploy, drawRight, memoryStorage, pick, play, playTo, solveNext } from "./testHelpers";

// --- Milestone 7: Stages 3 to 5 ---

test("the whole game can be played from 0 to 1 billion users", () => {
  let s = begun();
  const seen: string[] = [];
  while (!s.won) {
    seen.push(s.currentId);
    const n = solveNext(s);
    if (n === s || (n.currentId === s.currentId && !n.won)) throw new Error(`Stuck on ${s.currentId}`);
    s = n;
  }
  assert.deepEqual(seen, playOrder.map((r) => r.id));
  // Only the features that were Needed next were bought, so the users are exactly 1 billion.
  assert.equal(s.users, 1_000_000_000);
  assert.equal(s.currentId, "5.3");
  assert.equal(s.phase, "solved");
  assert.equal(s.emails.at(-1)?.key, "opener:win");
  for (const stage of [3, 4, 5]) assert.ok(s.emails.some((e) => e.key === `opener:${stage}`));
  assert.ok(s.emails.some((e) => e.key === "other:4"));
  // Next does nothing once the game is won.
  assert.equal(reducer(s, { type: "next" }), s);
  // Every result is 3 stars and first try, and all five everyday patterns are mastered.
  assert.equal(Object.keys(s.results).length, playOrder.length);
  assert.ok(Object.values(s.results).every((r) => r.stars === 3 && r.firstTry));
  for (const p of everydayPatterns) assert.deepEqual(pipsFor(s, p.name), ["gold", "gold", "gold"]);
  // "Play again" is a reset: a fresh game that keeps the settings.
  const again = reducer(s, { type: "reset", seed: 7 });
  assert.equal(again.won, false);
  assert.equal(again.users, 0);
});

test("Example 3: R7 with a wrong card, and two of three Tune waves", () => {
  let s = playTo("R7");
  const cash = s.cash;
  s = play(s, { type: "investigate" }, pick("Sharding"));
  assert.equal(s.run.stars, 2);
  assert.equal(s.cash, cash);
  assert.equal(s.run.dip, 0);
  s = reducer(s, pick("Caching"));
  assert.equal(s.phase, "tune");
  const waves = tuneFor("R7")!.waves;
  s = play(
    s,
    { type: "runWave", stop: waves[0].right },
    { type: "runWave", stop: waves[1].right },
    { type: "runWave", stop: (waves[2].right + 1) % tuneFor("R7")!.stops.length },
  );
  assert.equal(s.phase, "solved");
  // £50,000 / 2 x 1 = £25,000, plus 2 x 5% of £50,000 = £5,000.
  assert.equal(s.cash, cash + 30_000);
  assert.deepEqual(s.results.R7, { stars: 2, firstTry: false });
  assert.deepEqual(pipsFor(s, "Caching"), ["gold", "gold", "silver"]);
  assert.ok(s.refreshersDue.includes("R7"));
  s = reducer(s, { type: "next" });
  assert.ok(s.emails.some((e) => e.key === "thanks:R7"));
  assert.ok(!s.emails.some((e) => e.key === "refresher:R7"));
});

test("Example 4: Standby saves the first outage in a stage, and Monitoring halves the penalties", () => {
  let s = playTo("3.2");
  s = { ...s, owned: [...s.owned, "srv-monitoring", "srv-standby"], cash: 10_000, users: 4_000_000 };
  s = play(s, { type: "investigate" }, pick("bad"));
  assert.equal(s.run.stars, 2);
  assert.equal(s.cash, 9_500);
  assert.equal(s.run.dip, 0);
  assert.deepEqual(s.standbyStages, [3]);
  assert.equal(s.run.standbySaved, true);
  s = play(s, pick("best"), { type: "next" });
  assert.equal(s.run.standbySaved, false);
  // Play on to 3.3, buying Email notifications on the way.
  while (s.currentId !== "3.3" || s.phase !== "arrived") s = solveNext(s);
  const cash = s.cash;
  const onScreen = usersOnScreen(s);
  s = play(s, { type: "investigate" }, pick("bad"));
  assert.equal(s.run.dip, Math.round(onScreen * 0.05));
  assert.equal(s.cash, cash - 500);
  assert.equal(s.run.standbySaved, false);
  s = reducer(s, pick("best"));
  assert.equal(s.run.dip, 0);
});

test("Standby bought during an incident does not save that incident's outage", () => {
  let s = { ...playTo("3.2"), cash: 100_000 };
  s = play(s, { type: "investigate" }, buy("srv-standby"), pick("bad"));
  assert.ok(s.run.dip > 0);
  assert.deepEqual(s.standbyStages, []);
});

test("Example 5: the investor tops up for Email notifications", () => {
  let s = playTo("R4");
  s = play(s, { type: "investigate" }, pick("Database index"), { type: "next" });
  assert.equal(s.currentId, "3.3");
  assert.equal(s.phase, "waiting");
  s = { ...s, cash: 5_000, loanOwed: 0, topUps: 0 };
  const users = s.users;
  s = reducer(s, buy("feat-email"));
  assert.equal(s.loanOwed, 3_000);
  assert.equal(s.topUps, 1);
  assert.equal(s.cash, 0);
  assert.equal(s.users, users + 1_500_000);
  assert.equal(s.phase, "arrived");
  s = play(s, { type: "investigate" }, pick("best"));
  assert.equal(s.loanOwed, 0);
  assert.equal(s.cash, 12_000);
});

test("Example 7: 4.2 with the handbook and Victor's lifeline", () => {
  let s = playTo("4.2");
  s = { ...s, owned: [...s.owned, "gear-handbook"], lifeline: 4, cash: 50_000 };
  s = play(s, { type: "investigate" }, { type: "call" }, { type: "call" }, { type: "call" });
  assert.equal(s.cash, 20_000);
  assert.equal(callButton(s).kind, "lifeline");
  s = play(s, { type: "useLifeline" }, { type: "applyGuided" });
  assert.equal(s.lifeline, null);
  assert.equal(s.cash, 95_000);
  assert.deepEqual(s.results["4.2"], { stars: 3, firstTry: false });
});

test("Analytics and Disaster drills remove the bad option in their incidents", () => {
  let s = playTo("4.2");
  s = startIncident({ ...s, owned: [...s.owned, "srv-analytics"] });
  assert.deepEqual(s.run.removed, ["bad"]);
  assert.deepEqual(removalLines(s), ["The data already shows that one would not work."]);
  s = playTo("5.2");
  s = startIncident({ ...s, owned: [...s.owned, "srv-drills"] });
  assert.deepEqual(s.run.removed, ["bad"]);
});

test("each new stage needs its new computer, and the investor lends for it", () => {
  let s = playTo("B2");
  s = play({ ...s, cash: 0, loanOwed: 2_800 }, { type: "investigate" }, ...drawRight("B2"), deploy);
  // B2 paid £3,000. £2,800 went to the old loan, so £200 is left.
  assert.equal(s.cash, 200);
  assert.equal(neededNext(s), "pc-loft");
  assert.ok(canBuy(s, "pc-loft"));
  const cash = s.cash;
  s = { ...s, topUps: 0 };
  s = reducer(s, buy("pc-loft"));
  // £1,200, so the investor lends the shortfall.
  assert.equal(s.loanOwed, 1_200 - cash);
  assert.equal(s.topUps, 1);
  assert.equal(s.cash, 0);
  s = reducer(s, { type: "next" });
  assert.equal(s.currentId, "3.1");
});

test("a computer bought early lets Next move on, and its email is not sent", () => {
  let s = playTo("B1");
  s = play({ ...s, cash: 1_000 }, buy("pc-office"), { type: "investigate" }, ...drawRight("B1"), deploy);
  assert.equal(neededNext(s), undefined);
  assert.ok(!s.emails.some((e) => e.key === "request:pc-office"));
  assert.equal(reducer(s, { type: "next" }).currentId, "2.1");
});

test("a version 3 save that owns the Faster PC gets its £6,000 back", () => {
  const store = memoryStorage();
  const s = playTo("3.2");
  const old = { ...s, saveVersion: 3, owned: [...s.owned, "gear-pc"], run: { ...s.run, lateItems: ["gear-pc"] } };
  store.setItem(saveKey(3), JSON.stringify(old));
  const loaded = loadGame(store)!;
  assert.equal(loaded.saveVersion, SAVE_VERSION);
  assert.ok(!loaded.owned.includes("gear-pc"));
  assert.deepEqual(loaded.run.lateItems, []);
  assert.equal(loaded.cash, s.cash + 6_000);
});

test("an old save that finished a stage without the new computer gets Maya's email on load", () => {
  const store = memoryStorage();
  let s = playTo("B1");
  s = play(s, { type: "investigate" }, ...drawRight("B1"), deploy);
  const old = { ...s, saveVersion: 3, emails: s.emails.filter((e) => e.key !== "request:pc-office") };
  store.setItem(saveKey(3), JSON.stringify(old));
  const loaded = loadGame(store)!;
  assert.ok(loaded.emails.some((e) => e.key === "request:pc-office"));
});

test("Terminal commands run on the step's lines, and each lesson's command keeps the cause", () => {
  for (const step of triageSteps) {
    const lesson = lessonFor(step.id)!;
    assert.ok(lesson, `${step.id} has a lesson`);
    const result = runCommand(lesson.command, step.lines);
    assert.equal(result?.kind, "lines");
    assert.ok(result?.kind === "lines" && result.lines.some((l) => l.kind === "cause"), `${step.id} keeps its cause`);
  }
  const t1 = triageSteps.find((s) => s.id === "T1")!;
  assert.deepEqual(runCommand("pwd", t1.lines), { kind: "error", text: "pwd: command not found" });
  assert.deepEqual(runCommand("cat notes.txt", t1.lines), { kind: "error", text: "notes.txt: No such file or directory" });
  const errors = runCommand("grep ERROR blip.log", t1.lines);
  assert.ok(errors?.kind === "lines" && errors.lines.every((l) => l.level === "ERROR"));
  // Spaces and either kind of quote marks do not matter.
  assert.ok(isTaskCommand("grep  -E 'WARN|ERROR'   blip.log", 'grep -E "WARN|ERROR" blip.log'));
  assert.ok(!isTaskCommand("grep WARN blip.log", "grep -v INFO blip.log"));
});
