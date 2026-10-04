#!/usr/bin/env node
// Checks that the game docs still agree with each other.
// Run from anywhere:  node scripts/check-docs.mjs
// It reads CLAUDE.md and everything in docs/, then prints any problems.
// Exit code is 0 when the docs are consistent and 1 when they are not.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

const TARGET_USERS = 1_000_000_000; // the goal of the game
const MAX_WORDS = 25; // UI_THEME.md: any bubble, email, card or button
const MAX_ALERT_WORDS = 15; // UI_THEME.md: server alerts
const MAX_TUTORIAL_WORDS = 8; // GAME_DESIGN.md: tutorial steps and tips
const REPEAT_PAY = 0.5; // GAME_DESIGN.md: a repeat pays half the base cash

const problems = [];
const problem = (...parts) => problems.push(parts.join(" "));
const num = (s) => Number(String(s).replace(/[,£]/g, ""));
const fmt = (n) => n.toLocaleString("en-GB");
const words = (s) => s.trim().split(/\s+/).length;
const all = (text, re) => [...text.matchAll(re)];
const one = (text, re, what) => {
  const m = text.match(re);
  if (!m) throw new Error(`Could not find ${what}`);
  return m[1];
};

// Split a file into sections that each start at a heading matching `re`.
function sections(text, re) {
  const heads = all(text, re);
  return heads.map((m, i) => ({
    m,
    body: text.slice(m.index + m[0].length, i + 1 < heads.length ? heads[i + 1].index : text.length),
  }));
}

const cut = (text, from, to) => text.slice(text.indexOf(from), text.indexOf(to));

// ---------------------------------------------------------------- load
const docNames = readdirSync(join(root, "docs")).filter((f) => f.endsWith(".md")).sort();
const T = Object.fromEntries(docNames.map((f) => [f, read(`docs/${f}`)]));
const HUB = existsSync(join(root, "CLAUDE.md")) ? read("CLAUDE.md") : "";
const G = T["GAME_DESIGN.md"];
const C = T["CHALLENGES.md"];
const R = T["REPEATS.md"];
const U = T["UPGRADES.md"];
const UI = T["UI_THEME.md"];
const S = T["START_HERE.md"];
const B = T["BLUEPRINTS.md"];
const E = T["EXTRA_STEPS.md"];
for (const [name, text] of Object.entries({ "GAME_DESIGN.md": G, "CHALLENGES.md": C, "REPEATS.md": R, "UPGRADES.md": U, "UI_THEME.md": UI, "START_HERE.md": S, "BLUEPRINTS.md": B, "EXTRA_STEPS.md": E })) {
  if (!text) throw new Error(`docs/${name} is missing`);
}

// ---------------------------------------------------------------- style
for (const [name, text] of [...Object.entries(T), ["CLAUDE.md", HUB]]) {
  for (const ch of ["—", "–", "…", "“", "”", "‘", "’"]) {
    if (text.includes(ch)) problem(`${name}: contains the character ${JSON.stringify(ch)}. Use plain punctuation.`);
  }
  if (name === "CLAUDE.md") continue;
  for (const [, quote] of all(text, /"([^"\n]+)"/g)) {
    if (words(quote) > MAX_WORDS) problem(`${name}: text is over ${MAX_WORDS} words: "${quote}"`);
  }
}

// ---------------------------------------------------------------- new incidents
const fresh = {};
for (const { m, body } of sections(C, /^## (\d\.\d) (.*)$/gm)) {
  const id = m[1];
  const types = all(body, /^  - \*\*(best|partial|bad)\.\*\*/gm).map((x) => x[1]).sort().join(",");
  if (types !== "bad,best,partial") problem(`${id}: needs exactly one best, one partial and one bad option`);
  for (const field of ["Sees", "Maya", "Nudge", "Map change"]) {
    if (!body.includes(`**${field}:**`)) problem(`${id}: missing ${field}`);
  }
  fresh[id] = {
    id,
    title: m[2].trim(),
    kind: "New",
    stage: Number(id[0]),
    starts: one(body, /\*\*Starts:\*\* (\S+)/, `${id} Starts`).replace(/\.$/, ""),
    arrives: one(body, /\*\*Arrives by:\*\* (.*)/, `${id} Arrives by`),
    gain: num(one(body, /\*\*Users gained:\*\* ([\d,]+)/, `${id} Users gained`)),
    pattern: one(body, /\*\*Pattern Book:\*\* (.*?)\. "/, `${id} Pattern Book`),
    removedBy: all(body, /Removed by: (\S+)/g).map((x) => x[1]),
  };
}
const patternTaughtIn = Object.fromEntries(Object.values(fresh).map((d) => [d.pattern, d.id]));

// ---------------------------------------------------------------- repeat incidents
const repeats = {};
let stage = 0;
for (const { m, body } of sections(R, /^(?:# Stage (\d)|## (R\d+) (.*))$/gm)) {
  if (m[1]) { stage = Number(m[1]); continue; }
  const id = m[2];
  const right = all(body, /^  - \*\*right\.\*\* (.*)$/gm).map((x) => x[1].trim());
  const wrong = all(body, /^  - \*\*wrong\.\*\* (.*)$/gm).map((x) => x[1].trim());
  if (right.length !== 1 || wrong.length !== 2) problem(`${id}: needs one right card and two wrong cards`);
  if (all(body, /Result:/g).length !== 1 || all(body, /Why not:/g).length !== 2) problem(`${id}: needs one Result and two Why not lines`);
  for (const field of ["Sees", "Also seen as"]) {
    if (!body.includes(`**${field}:**`)) problem(`${id}: missing ${field}`);
  }
  repeats[id] = {
    id,
    title: m[3].trim(),
    kind: "Repeat",
    stage,
    starts: "automatic",
    arrives: one(body, /\*\*Arrives by:\*\* (.*)/, `${id} Arrives by`),
    gain: num(one(body, /\*\*Users gained:\*\* ([\d,]+)/, `${id} Users gained`)),
    pattern: one(body, /\*\*Pattern:\*\* (.*)/, `${id} Pattern`).trim(),
    first: one(body, /\*\*First learned in:\*\* (.*)/, `${id} First learned in`).trim(),
    nudge: one(body, /\*\*Nudge:\*\* (.*)/, `${id} Nudge`),
    right,
    wrong,
  };
}
// ---------------------------------------------------------------- build incidents
const builds = {};
stage = 0;
for (const { m, body } of sections(B, /^(?:# Stage (\d)|## (B\d+) (.*))$/gm)) {
  if (m[1]) { stage = Number(m[1]); continue; }
  const id = m[2];
  const list = (label) => one(body, new RegExp(`\\*\\*${label}:\\*\\* (.*)`), `${id} ${label}`).split(", ").map((s) => s.trim());
  for (const field of ["Goal", "Nudge", "Result"]) {
    if (!body.includes(`**${field}:**`)) problem(`${id}: missing ${field}`);
  }
  builds[id] = {
    id,
    title: m[3].trim(),
    kind: "Build",
    stage,
    starts: "automatic",
    arrives: one(body, /\*\*Arrives by:\*\* (.*)/, `${id} Arrives by`),
    gain: num(one(body, /\*\*Users gained:\*\* ([\d,]+)/, `${id} Users gained`)),
    tray: list("Tray"),
    decoys: list("Decoys"),
    solution: all(body, /^  - (.+?) -> (.+)$/gm).map((x) => [x[1].trim(), x[2].trim()]),
    wrong: all(body, /^  - (uses|missing|connects) "([^"]+)"(?: to "([^"]+)")?$/gm).map((x) => ({ type: x[1], a: x[2], b: x[3] })),
    sees: all(body, /^    Sees: /gm).length,
    says: all(body, /^    Says: "/gm).length,
    hint: one(body, /\*\*Call 1 places:\*\* (.*)/, `${id} Call 1 places`).trim(),
    practises: list("Practises"),
  };
}
const incidents = { ...fresh, ...repeats, ...builds };
const total = Object.keys(incidents).length;

// ---------------------------------------------------------------- play order
const rows = all(G, /^\| (\d+) \| (\d) \| (\S+) \| (.*?) \| (New|Repeat|Build) \| ?(.*?) ?\|$/gm);
const order = rows.map((r) => r[3]);
const pos = Object.fromEntries(order.map((id, i) => [id, i]));
if (rows.length !== total) problem(`Play order has ${rows.length} rows but there are ${total} incidents`);
for (const id of Object.keys(incidents)) if (!(id in pos)) problem(`${id}: not in the play order table`);
rows.forEach(([, n, st, id, title, kind, needs], i) => {
  const d = incidents[id];
  if (Number(n) !== i + 1) problem(`Play order: row ${i + 1} is numbered ${n}`);
  if (!d) return problem(`Play order: ${id} is not written in CHALLENGES.md, REPEATS.md or BLUEPRINTS.md`);
  if (d.title !== title) problem(`${id}: title differs between the play order and its own file`);
  if (d.kind !== kind) problem(`${id}: kind in the play order should be ${d.kind}`);
  if (d.stage !== Number(st)) problem(`${id}: stage in the play order is ${st} but its file says ${d.stage}`);
  const expected = d.starts === "automatic" ? "" : d.starts;
  if (needs.trim() !== expected) problem(`${id}: Needs in the play order should be "${expected}"`);
  if (i > 0 && Number(st) < Number(rows[i - 1][2])) problem(`Play order: ${id} goes back a stage`);
});

// ---------------------------------------------------------------- shop items
const baseCash = Object.fromEntries(all(G, /^\| (\d) \| [^|]+ \| [^|]+ \| [^|]+ \| £([\d,]+) \|$/gm).map((m) => [m[1], num(m[2])]));
const points = Object.fromEntries(all(U, /^\| (Small|Medium|Big|None|Some|Lots|Huge) \| [^|]+ \| ([\d.]+) \|$/gm).map((m) => [m[1], Number(m[2])]));
const starPay = Object.fromEntries(all(G, /^\| ([123]) \| ([\d.]+) \|$/gm).map((m) => [m[1], Number(m[2])]));
const items = {};
const unlocks = {};
for (const m of all(U, /^\| ((?:feat|srv|gear)-[a-z]+) \| (.*?) \| (\d) \| (Small|Medium|Big) \| (None|Some|Lots|Huge) \| ([\d,]+) \| £([\d,]+) \|(.*)$/gm)) {
  const [, id, name, st, change, users, gain, price, rest] = m;
  items[id] = { id, name, stage: Number(st), change, users, gain: num(gain), price: num(price), rest };
  const expected = Math.round(baseCash[st] * (points[change] + points[users]));
  if (expected !== num(price)) problem(`${id}: price is £${fmt(num(price))} but the price rule gives £${fmt(expected)}`);
  const unlock = rest.match(/^ (\d\.\d) /);
  if (id.startsWith("feat-") && unlock) unlocks[id] = unlock[1];
  if (!id.startsWith("feat-") && num(gain) !== 0) problem(`${id}: only features bring in users`);
}
for (const [fid, inc] of Object.entries(unlocks)) {
  if (!incidents[inc]) { problem(`${fid}: unlocks ${inc}, which does not exist`); continue; }
  if (incidents[inc].starts !== fid) problem(`${fid}: UPGRADES.md says it unlocks ${inc}, but ${inc} does not start with it`);
  if (incidents[inc].stage !== items[fid].stage) problem(`${fid}: must be in the same stage as ${inc}`);
}
for (const d of Object.values(fresh)) {
  if (d.starts !== "automatic" && !unlocks[d.starts]) problem(`${d.id}: starts with ${d.starts}, which is not a must-have feature in UPGRADES.md`);
  for (const up of d.removedBy) {
    if (!items[up]) problem(`${d.id}: "Removed by" names ${up}, which is not in UPGRADES.md`);
    else if (!items[up].rest.includes(d.id)) problem(`${up}: its effect text does not mention incident ${d.id}`);
  }
}

// ---------------------------------------------------------------- users
let users = 0;
const stageEnd = {};
for (const id of order) {
  const d = incidents[id];
  if (!d) continue;
  if (d.starts !== "automatic" && items[d.starts]) users += items[d.starts].gain;
  users += d.gain;
  stageEnd[d.stage] = users;
}
if (users !== TARGET_USERS) problem(`Incidents plus must-have features add up to ${fmt(users)} users, not ${fmt(TARGET_USERS)}`);
const optional = Object.values(items).filter((d) => !unlocks[d.id]).reduce((a, d) => a + d.gain, 0);
const last = incidents[order[order.length - 1]];
if (last && TARGET_USERS - last.gain + optional >= TARGET_USERS) problem(`The player could reach ${fmt(TARGET_USERS)} users before the final incident`);
if (!G.includes(fmt(optional))) problem(`GAME_DESIGN.md should say optional features add ${fmt(optional)} users`);
if (!G.includes(fmt(TARGET_USERS + optional))) problem(`GAME_DESIGN.md should say the best possible finish is ${fmt(TARGET_USERS + optional)}`);
for (const d of Object.values(items)) {
  const growth = stageEnd[d.stage] - (stageEnd[d.stage - 1] ?? 0);
  const share = d.gain / growth;
  const tier = d.gain === 0 ? "None" : share < 0.08 ? "Some" : share < 0.2 ? "Lots" : "Huge";
  if (tier !== d.users) problem(`${d.id}: brings ${(share * 100).toFixed(1)}% of its stage's growth, which is "${tier}", not "${d.users}"`);
}

// ---------------------------------------------------------------- money
// A two-star player who buys only must-have features should never need a loan.
let cash = 0;
for (const id of order) {
  const d = incidents[id];
  if (!d) continue;
  if (d.starts !== "automatic" && items[d.starts]) {
    if (cash < items[d.starts].price) problem(`${d.starts}: a two-star player is £${fmt(items[d.starts].price - cash)} short when it is needed`);
    cash = Math.max(0, cash - items[d.starts].price);
  }
  cash += Math.round(baseCash[d.stage] * (d.kind === "Repeat" ? REPEAT_PAY : 1) * starPay["2"]);
}

// ---------------------------------------------------------------- Victor's lifeline
// UPGRADES.md: the lifeline costs 2 x the stage's base cash, one row per stage.
const LIFELINE_TIMES = 2;
const lifeline = Object.fromEntries(all(cut(U, "## Victor's lifeline", "## Shop layout"), /^\| (\d) \| £([\d,]+) \|$/gm).map((m) => [m[1], num(m[2])]));
for (const st of Object.keys(baseCash)) {
  if (!(st in lifeline)) problem(`UPGRADES.md: Victor's lifeline has no price for Stage ${st}`);
  else if (lifeline[st] !== baseCash[st] * LIFELINE_TIMES) problem(`UPGRADES.md: Victor's lifeline in Stage ${st} should cost £${fmt(baseCash[st] * LIFELINE_TIMES)}`);
}

// ---------------------------------------------------------------- repeats
const everyday = all(R, /^\| (.*?) \| .*? \| (\d\.\d) \| (R\d+), (R\d+) \|$/gm);
for (const [, pattern, learned, a, b] of everyday) {
  if (patternTaughtIn[pattern] !== learned) problem(`Everyday patterns table: ${pattern} is not taught in ${learned}`);
  for (const r of [a, b]) if (repeats[r]?.pattern !== pattern) problem(`Everyday patterns table: ${r} does not practise ${pattern}`);
  if (!(pos[learned] < pos[a] && pos[a] < pos[b])) problem(`${pattern}: its repeats must come after it is learned, in order`);
}
const practised = new Set(Object.values(repeats).map((d) => d.pattern));
if (practised.size !== everyday.length) problem(`Everyday patterns table lists ${everyday.length} patterns but the repeats practise ${practised.size}`);
for (const d of Object.values(repeats)) {
  const src = patternTaughtIn[d.pattern];
  if (!src) { problem(`${d.id}: pattern "${d.pattern}" has no Pattern Book entry in CHALLENGES.md`); continue; }
  if (d.first !== `${src} ${fresh[src].title}`) problem(`${d.id}: "First learned in" should be "${src} ${fresh[src].title}"`);
  if (d.right[0] !== d.pattern) problem(`${d.id}: the right card must be its pattern`);
  if (!d.nudge.includes(fresh[src].title)) problem(`${d.id}: the nudge should name "${fresh[src].title}"`);
  for (const w of d.wrong) {
    if (!patternTaughtIn[w]) problem(`${d.id}: wrong card "${w}" is not a Pattern Book name`);
    else if (pos[patternTaughtIn[w]] > pos[d.id]) problem(`${d.id}: wrong card "${w}" has not been learned yet at that point`);
    if (w === d.pattern) problem(`${d.id}: a wrong card is the same as the right card`);
  }
  for (const earlier of Object.values(repeats)) {
    if (earlier.pattern === d.pattern && pos[earlier.id] < pos[d.id] && !d.nudge.includes(earlier.title)) {
      problem(`${d.id}: the nudge should also name "${earlier.title}"`);
    }
  }
}
for (const pattern of Object.keys(patternTaughtIn)) {
  if (!UI.includes(`| ${pattern} |`)) problem(`UI_THEME.md: no icon listed for the pattern "${pattern}"`);
}

// ---------------------------------------------------------------- arrivals and emails
const cast = all(G, /^\| (Maya|Sam|Lena|Omar|Zoe|Customers) \|/gm).map((m) => m[1]);
const senders = new Set(["Server alert", "Email from a customer", ...cast.filter((n) => n !== "Customers").map((n) => `Email from ${n}`)]);
for (const d of Object.values(incidents)) {
  const m = d.arrives.match(/^(.*?)\. "(.*)"$/);
  if (!m) { problem(`${d.id}: "Arrives by" should be a sender, a full stop, then the text in quotes`); continue; }
  if (!senders.has(m[1])) problem(`${d.id}: unknown sender "${m[1]}". Add them to the cast table in GAME_DESIGN.md first`);
  if (m[1] === "Server alert" && words(m[2]) > MAX_ALERT_WORDS) problem(`${d.id}: server alert is over ${MAX_ALERT_WORDS} words`);
}
const tutorial = [...all(G, /^\d\. "([^"]+)" \(/gm), ...all(G, /^\| First .*? \| "([^"]+)" \|$/gm)];
for (const [, text] of tutorial) if (words(text) > MAX_TUTORIAL_WORDS) problem(`Tutorial text is over ${MAX_TUTORIAL_WORDS} words: "${text}"`);

const requests = Object.fromEntries(all(U, /^\| ((?:feat|srv|gear)-[a-z]+) \| (\w+) \| (.*?) \| "(.*)" \|$/gm).map((m) => [m[1], { from: m[2], when: m[3] }]));
for (const id of Object.keys(items)) {
  if (id.startsWith("gear-")) { if (requests[id]) problem(`${id}: "Your setup" items have no request email`); }
  else if (!requests[id]) problem(`${id}: has no request email in UPGRADES.md`);
}
for (const [id, { from, when }] of Object.entries(requests)) {
  if (!items[id]) { problem(`Request email for ${id}, which is not a Shop item`); continue; }
  if (from !== "Customer" && !cast.includes(from)) problem(`${id}: request is from "${from}", who is not in the cast table`);
  let at = -1;
  let stageThen;
  const start = when.match(/^Start of Stage (\d)$/);
  const after = when.match(/^After (\S+)$/);
  if (start) stageThen = Number(start[1]);
  else if (after && after[1] in pos) { at = pos[after[1]]; stageThen = incidents[order[Math.min(at + 1, order.length - 1)]].stage; }
  else { problem(`${id}: "Arrives" should be "After <incident id>" or "Start of Stage <n>"`); continue; }
  if (stageThen < items[id].stage) problem(`${id}: its request email arrives before the item is in the Shop`);
  if (unlocks[id] && order[at + 1] !== unlocks[id]) problem(`${id}: its request email should arrive right before incident ${unlocks[id]}`);
  const affected = Object.values(fresh).filter((d) => d.removedBy.includes(id)).map((d) => pos[d.id]);
  if (affected.length && Math.min(...affected) <= at) problem(`${id}: its request email arrives too late to affect the incident it changes`);
}


// ---------------------------------------------------------------- customer names
// Every email from a customer has exactly one name in GAME_DESIGN.md, and each name is used once.
const nameRows = all(cut(G, "### Customer names", "## Stages"), /^\| ([^|]+) \| ([^|]+) \|$/gm)
  .map((m) => [m[1].trim(), m[2].trim()])
  .filter(([who]) => who !== "Sent by" && !who.startsWith("---"));
const customerSent = [
  ...Object.values(incidents).filter((d) => d.arrives.startsWith("Email from a customer.")).map((d) => d.id),
  ...Object.entries(requests).filter(([, r]) => r.from === "Customer").map(([id]) => id),
];
const named = nameRows.map(([who]) => who);
for (const who of customerSent) if (!named.includes(who)) problem(`GAME_DESIGN.md: ${who} is sent by a customer but has no row in Customer names`);
for (const who of named) if (!customerSent.includes(who)) problem(`GAME_DESIGN.md: Customer names lists ${who}, which is not sent by a customer`);
if (new Set(named).size !== named.length) problem("GAME_DESIGN.md: Customer names lists a sender more than once");
const names = nameRows.map(([, n]) => n);
if (new Set(names).size !== names.length) problem("GAME_DESIGN.md: a customer name is used more than once");
for (const n of names) if (cast.includes(n)) problem(`GAME_DESIGN.md: customer name ${n} is also in the cast`);

// ---------------------------------------------------------------- toolbox
const parts = {};
for (const m of all(cut(B, "### The parts", "### Tools for patterns that have no part"), /^\| ([^|]+) \| ([^|]+) \|([^|]*)\|([^|]*)\|$/gm)) {
  const name = m[1].trim();
  if (name !== "Part") parts[name] = { tools: m[3].trim(), pattern: m[4].trim() };
}
const patternTools = Object.fromEntries(
  all(cut(B, "### Tools for patterns that have no part", "## How to read a Build"), /^\| ([^|]+) \| ([^|]+) \|$/gm)
    .map((m) => [m[1].trim(), m[2].trim()])
    .filter(([p]) => p !== "Pattern"),
);
for (const [name, part] of Object.entries(parts)) {
  if (part.pattern && !patternTaughtIn[part.pattern]) problem(`Toolbox: part "${name}" names the pattern "${part.pattern}", which is not a Pattern Book name`);
}
for (const p of Object.keys(patternTools)) if (!patternTaughtIn[p]) problem(`Toolbox: "${p}" is not a Pattern Book name`);
for (const pattern of Object.keys(patternTaughtIn)) {
  const viaPart = Object.values(parts).some((p) => p.pattern === pattern && p.tools);
  if (!viaPart && !patternTools[pattern]) problem(`Toolbox: the pattern "${pattern}" has no familiar tools`);
  if (viaPart && patternTools[pattern]) problem(`Toolbox: the pattern "${pattern}" has tools in both tables. Keep one`);
}

// ---------------------------------------------------------------- builds
const basePart = (p) => p.replace(/ \([^)]*\)$/, "");
for (const d of Object.values(builds)) {
  const at = pos[d.id];
  const everything = [...d.tray, ...d.decoys];
  if (everything.length < 4 || everything.length > 7) problem(`${d.id}: the tray should hold 4 to 7 parts, counting decoys. It has ${everything.length}`);
  if (d.decoys.length < 1) problem(`${d.id}: needs at least one decoy, so call 2 has something to remove`);
  for (const p of everything) {
    const part = parts[basePart(p)];
    if (!part) problem(`${d.id}: "${p}" is not a part in the toolbox`);
    else if (part.pattern && pos[patternTaughtIn[part.pattern]] > at) problem(`${d.id}: "${p}" needs the pattern "${part.pattern}", which has not been learned yet at that point`);
  }
  const used = new Set(d.solution.flat());
  if (d.solution.length < 3) problem(`${d.id}: the Solution needs at least 3 arrows`);
  for (const p of used) if (!d.tray.includes(p)) problem(`${d.id}: the Solution uses "${p}", which is not in the Tray`);
  for (const p of d.tray) if (!used.has(p)) problem(`${d.id}: "${p}" is in the Tray but not in the Solution. Make it a decoy or use it`);
  const arrows = new Set(d.solution.map(([a, b]) => `${a} -> ${b}`));
  if (d.sees !== d.wrong.length || d.says !== d.wrong.length) problem(`${d.id}: every wrong move needs one Sees line and one Says line`);
  for (const w of d.wrong) {
    if (w.type === "uses" && !d.decoys.includes(w.a)) problem(`${d.id}: wrong move uses "${w.a}", which is not a decoy`);
    if (w.type === "missing" && !d.tray.includes(w.a)) problem(`${d.id}: wrong move says "${w.a}" is missing, but it is not in the Tray`);
    if (w.type === "connects") {
      for (const p of [w.a, w.b]) if (!everything.includes(p)) problem(`${d.id}: wrong move connects "${p}", which is not in the tray`);
      if (arrows.has(`${w.a} -> ${w.b}`)) problem(`${d.id}: wrong move "${w.a}" to "${w.b}" is part of the Solution`);
    }
  }
  for (const decoy of d.decoys) {
    if (!d.wrong.some((w) => w.type === "uses" && w.a === decoy)) problem(`${d.id}: the decoy "${decoy}" has no wrong move explaining why it fails`);
  }
  if (!d.tray.includes(d.hint)) problem(`${d.id}: "Call 1 places" must be a part from the Tray`);
  for (const p of d.practises) {
    if (!patternTaughtIn[p]) problem(`${d.id}: practises "${p}", which is not a Pattern Book name`);
    else if (pos[patternTaughtIn[p]] > at) problem(`${d.id}: practises "${p}", which has not been learned yet at that point`);
  }
}

// ---------------------------------------------------------------- extra steps
const sources = Object.fromEntries(all(cut(E, "## Log sources", "## How to read a Triage step"), /^\| ([a-z]+) \| ([^|]+) \|$/gm).map((m) => [m[1], m[2].trim()]));
for (const [src, name] of Object.entries(sources)) if (!B.includes(name)) problem(`EXTRA_STEPS.md: log source "${src}" stands for "${name}", which is not in the toolbox`);
const triaged = [];
const tuned = [];
for (const { m, body } of sections(E, /^## ([TU])(\d+) on (\S+) (.*)$/gm)) {
  const sid = m[1] + m[2];
  const inc = incidents[m[3]];
  if (!inc) { problem(`${sid}: is attached to ${m[3]}, which does not exist`); continue; }
  if (inc.title !== m[4].trim()) problem(`${sid}: heading title does not match the title of ${m[3]}`);
  if (inc.kind === "Build") problem(`${sid}: extra steps attach to new and repeat incidents, not Builds`);
  if (m[1] === "T") {
    triaged.push(m[3]);
    const lines = all(body, /^  - \*\*(routine|symptom|cause)\.\*\* (INFO|WARN|ERROR) ([a-z]+): "(.*)"$/gm);
    if (lines.length !== 6) problem(`${sid}: needs exactly 6 log lines, found ${lines.length}`);
    for (const kind of ["cause", "symptom"]) if (lines.filter((l) => l[1] === kind).length !== 1) problem(`${sid}: needs exactly one ${kind} line`);
    for (const l of lines) {
      if (!sources[l[3]]) problem(`${sid}: log source "${l[3]}" is not in the log sources table`);
      if (words(l[4]) > 10) problem(`${sid}: a log line is over 10 words: "${l[4]}"`);
    }
    if (!body.includes("**Why:**")) problem(`${sid}: missing Why`);
  } else {
    tuned.push(m[3]);
    const stops = one(body, /\*\*Stops:\*\* (.*)/, `${sid} Stops`).split(" / ").map((s) => s.trim());
    const waves = all(body, /^  - "(.*)" Right: (.*)$/gm);
    if (stops.length < 3) problem(`${sid}: the dial needs at least 3 stops`);
    if (waves.length !== 3) problem(`${sid}: needs exactly 3 waves, found ${waves.length}`);
    for (const w of waves) if (!stops.includes(w[2].trim())) problem(`${sid}: the Right stop "${w[2].trim()}" is not one of the Stops`);
    for (const field of ["Dial", "Fact", "Too low", "Too high", "Just right", "Lesson"]) {
      if (!body.includes(`**${field}:**`)) problem(`${sid}: missing ${field}`);
    }
  }
}
for (const [label, ids] of [["Triage", triaged], ["Tune", tuned]]) {
  if (new Set(ids).size !== ids.length) problem(`EXTRA_STEPS.md: an incident has more than one ${label} step`);
}
for (const app of ["Blueprint", "Terminal", "SysDash"]) {
  if (!UI.includes(`| ${app} |`)) problem(`UI_THEME.md: the desktop icons table has no ${app} icon`);
}

// ---------------------------------------------------------------- counts written in prose
const nNew = Object.keys(fresh).length;
const nRep = Object.keys(repeats).length;
const nItems = Object.keys(items).length;
const nBuild = Object.keys(builds).length;
const expectText = (name, text, needle) => { if (!text.includes(needle)) problem(`${name}: should say "${needle}"`); };
expectText("GAME_DESIGN.md", G, `| New | ${nNew} |`);
expectText("GAME_DESIGN.md", G, `| Repeat | ${nRep} |`);
expectText("GAME_DESIGN.md", G, `| Build | ${nBuild} |`);
expectText("GAME_DESIGN.md", G, `| Triage | ${triaged.length} |`);
expectText("GAME_DESIGN.md", G, `| Tune | ${tuned.length} |`);
expectText("GAME_DESIGN.md", G, `There are ${total} incidents`);
expectText("GAME_DESIGN.md", G, `Total stars out of ${total * 3}`);
expectText("GAME_DESIGN.md", G, `solved first try, out of ${total}`);
expectText("GAME_DESIGN.md", G, `Patterns mastered, out of ${everyday.length}`);
expectText("CHALLENGES.md", C, `the ${nNew} new incidents`);
expectText("REPEATS.md", R, `the ${nRep} repeat incidents`);
expectText("BLUEPRINTS.md", B, `the ${nBuild} Build incidents`);
expectText("EXTRA_STEPS.md", E, `the ${triaged.length} Triage steps and ${tuned.length} Tune steps`);
expectText("UPGRADES.md", U, `There are ${nItems} items`);
expectText("START_HERE.md", S, `The ${nNew} new incidents`);
expectText("START_HERE.md", S, `The ${nRep} repeat incidents`);
expectText("START_HERE.md", S, `The ${nBuild} Build incidents`);
expectText("START_HERE.md", S, `The ${triaged.length} Triage steps and ${tuned.length} Tune steps`);
expectText("START_HERE.md", S, `The ${nItems} Shop items`);

// ---------------------------------------------------------------- colours
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const colour = (label) => one(UI, new RegExp(`^\\| ${label} \\| (#[0-9A-Fa-f]{6})`, "m"), `colour "${label}" in UI_THEME.md`);
const whiteTextOn = [
  ["Server alert title bar", colour("Server alert title bar")],
  ...all(UI, /^\| ([^|]+) \| (#[0-9A-Fa-f]{6}) \| [^|]+ \| [^|]+ \|$/gm).map((m) => [`${m[1]} badge`, m[2]]),
];
for (const [label, hex] of whiteTextOn) if (contrast("#FFFFFF", hex) < 4.5) problem(`UI_THEME.md: white text on ${label} (${hex}) is below 4.5 to 1`);
if (contrast(colour("Terminal text"), colour("Terminal background")) < 4.5) problem("UI_THEME.md: Terminal text on its background is below 4.5 to 1");

// Each BlipOS version has its own colours (UI_THEME.md > Version colours). Every one must pass the
// same contrast rules, and there must be exactly one version for each stage.
const versionRows = all(cut(UI, "### Version colours", "### The upgrade"), /^\| BlipOS (\d) \| (.+) \|$/gm).map((m) => ({
  n: m[1],
  c: m[2].split("|").map((x) => x.trim()),
}));
const versionStages = all(cut(UI, "## BlipOS versions", "### Version colours"), /^\| BlipOS (\d) \| (\d) \|/gm).map((m) => [m[1], m[2]]);
for (const st of Object.keys(baseCash)) {
  if (!versionStages.some(([, s]) => s === st)) problem(`UI_THEME.md: Stage ${st} has no BlipOS version`);
  if (!versionRows.some((v) => v.n === st)) problem(`UI_THEME.md: BlipOS ${st} has no row in Version colours`);
}
for (const [v, st] of versionStages) if (v !== st) problem(`UI_THEME.md: BlipOS ${v} should belong to Stage ${v}, not Stage ${st}`);
const mainText = colour("Main text");
for (const { n, c } of versionRows) {
  if (c.length !== 9 || c.some((x) => !/^#[0-9A-Fa-f]{6}$/.test(x))) { problem(`UI_THEME.md: BlipOS ${n} needs 9 colours in Version colours`); continue; }
  const [title, titleEnd, titleText, bar, barText, start, startText, body] = c;
  const pairs = [
    ["title text", titleText, "title bar", title],
    ["title text", titleText, "title bar end", titleEnd],
    ["taskbar text", barText, "taskbar", bar],
    ["Start text", startText, "Start button", start],
    ["main text", mainText, "window body", body],
  ];
  for (const [what, fg, on, bg] of pairs) if (contrast(fg, bg) < 4.5) problem(`UI_THEME.md: BlipOS ${n} ${what} on its ${on} is below 4.5 to 1`);
  for (const label of ["OK", "Warning", "Critical"]) if (contrast(colour(label), body) < 3) problem(`UI_THEME.md: BlipOS ${n}: the ${label} colour on the window body is below 3 to 1`);
}

// ---------------------------------------------------------------- pointers between docs
// A pointer is written "(see FILE.md > Heading)". The heading must exist in that file.
for (const [name, text] of Object.entries(T)) {
  for (const [, file, heading] of all(text, /\(see ([A-Z_]+\.md) > ((?:[^()]|\([^)]*\))+)\)/g)) {
    if (!T[file]) { problem(`${name}: points to ${file}, which is not in docs/`); continue; }
    const esc = heading.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!new RegExp(`^#+ ${esc}$`, "m").test(T[file])) problem(`${name}: points to "${heading.trim()}" in ${file}, but there is no such heading`);
  }
}
const QS = T["GAME_LOGIC.md"];
if (QS) {
  const asked = new Set(all(QS, /^\| (Q\d+) \|/gm).map((m) => m[1]));
  for (const [, q] of all(QS, /\((Q\d+)\)/g)) if (!asked.has(q)) problem(`GAME_LOGIC.md: mentions ${q}, which is not in the open questions table`);
}

// ---------------------------------------------------------------- the room
const RM = T["ROOM.md"];
if (RM) {
  const stageNames = Object.fromEntries(all(G, /^\| (\d) \| ([^|]+) \| [^|]+ \| [^|]+ \| £[\d,]+ \|$/gm).map((m) => [m[1], m[2].trim()]));
  const rooms = all(cut(RM, "# Part 2: The rooms", "## The desk"), /^\| (\d) \| /gm).map((m) => m[1]);
  for (const st of Object.keys(stageNames)) if (!rooms.includes(st)) problem(`ROOM.md: Stage ${st} has no room`);
  for (const st of rooms) if (!stageNames[st]) problem(`ROOM.md: has a room for Stage ${st}, which is not a stage`);
  const boxes = all(RM.slice(RM.indexOf("## Screen boxes")), /^\| (\d) \| /gm).map((m) => m[1]);
  for (const st of Object.keys(stageNames)) if (!boxes.includes(st)) problem(`ROOM.md: Stage ${st} has no screen box row`);
  const desk = all(cut(RM, "## The desk", "# Part 3"), /^\| (gear-[a-z]+) \|/gm).map((m) => m[1]);
  for (const id of Object.keys(items).filter((i) => i.startsWith("gear-"))) if (!desk.includes(id)) problem(`ROOM.md: the desk table has no row for ${id}`);
  for (const id of desk) if (!items[id]) problem(`ROOM.md: the desk table lists ${id}, which is not a Shop item`);
}

// ---------------------------------------------------------------- the hub
if (!HUB) problem("CLAUDE.md is missing from the repo root");
else {
  for (const f of docNames) if (!HUB.includes(`](docs/${f})`)) problem(`CLAUDE.md: docs/${f} is not linked in the map. Every doc must have a row there`);
  for (const [, f] of all(HUB, /\bdocs\/([A-Za-z0-9_\-/]+\.md)\b/g)) if (!existsSync(join(root, "docs", f))) problem(`CLAUDE.md: links to docs/${f}, which does not exist`);
  for (const [, paths] of all(HUB, /^\| [^|]+ \| ([^|]+) \| Built \|$/gm)) {
    for (const p of paths.split(",").map((s) => s.trim().replace(/`/g, ""))) {
      if (!existsSync(join(root, p))) problem(`CLAUDE.md: the code map says ${p} is built, but it does not exist`);
    }
  }
}
for (const f of docNames) if (f !== "START_HERE.md" && !S.includes(f)) problem(`START_HERE.md: ${f} is not in its files table`);

// ---------------------------------------------------------------- report
console.log(`Docs checked: ${docNames.length} files, ${total} incidents (${nNew} new, ${nRep} repeat, ${nBuild} build), ${triaged.length} Triage and ${tuned.length} Tune steps, ${nItems} Shop items.`);
console.log(`Users on the required path: ${fmt(users)}. Best possible finish: ${fmt(TARGET_USERS + optional)}.`);
if (problems.length === 0) {
  console.log("0 problems. The docs agree with each other.");
} else {
  console.log(`${problems.length} problem${problems.length === 1 ? "" : "s"}:`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
