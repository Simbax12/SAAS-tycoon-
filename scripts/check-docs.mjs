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
for (const [name, text] of Object.entries({ "GAME_DESIGN.md": G, "CHALLENGES.md": C, "REPEATS.md": R, "UPGRADES.md": U, "UI_THEME.md": UI, "START_HERE.md": S })) {
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
const incidents = { ...fresh, ...repeats };
const total = Object.keys(incidents).length;

// ---------------------------------------------------------------- play order
const rows = all(G, /^\| (\d+) \| (\d) \| (\S+) \| (.*?) \| (New|Repeat) \| ?(.*?) ?\|$/gm);
const order = rows.map((r) => r[3]);
const pos = Object.fromEntries(order.map((id, i) => [id, i]));
if (rows.length !== total) problem(`Play order has ${rows.length} rows but there are ${total} incidents`);
for (const id of Object.keys(incidents)) if (!(id in pos)) problem(`${id}: not in the play order table`);
rows.forEach(([, n, st, id, title, kind, needs], i) => {
  const d = incidents[id];
  if (Number(n) !== i + 1) problem(`Play order: row ${i + 1} is numbered ${n}`);
  if (!d) return problem(`Play order: ${id} is not written in CHALLENGES.md or REPEATS.md`);
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
  cash += Math.round(baseCash[d.stage] * (d.kind === "New" ? 1 : REPEAT_PAY) * starPay["2"]);
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

// ---------------------------------------------------------------- counts written in prose
const nNew = Object.keys(fresh).length;
const nRep = Object.keys(repeats).length;
const nItems = Object.keys(items).length;
const expectText = (name, text, needle) => { if (!text.includes(needle)) problem(`${name}: should say "${needle}"`); };
expectText("GAME_DESIGN.md", G, `| New | ${nNew} |`);
expectText("GAME_DESIGN.md", G, `| Repeat | ${nRep} |`);
expectText("GAME_DESIGN.md", G, `There are ${total} incidents`);
expectText("GAME_DESIGN.md", G, `Total stars out of ${total * 3}`);
expectText("GAME_DESIGN.md", G, `solved first try, out of ${total}`);
expectText("GAME_DESIGN.md", G, `Patterns mastered, out of ${everyday.length}`);
expectText("CHALLENGES.md", C, `the ${nNew} new incidents`);
expectText("REPEATS.md", R, `the ${nRep} repeat incidents`);
expectText("UPGRADES.md", U, `There are ${nItems} items`);
expectText("START_HERE.md", S, `The ${nNew} new incidents`);
expectText("START_HERE.md", S, `The ${nRep} repeat incidents`);
expectText("START_HERE.md", S, `The ${nItems} Shop items`);

// ---------------------------------------------------------------- colours
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const colour = (label) => one(UI, new RegExp(`^\\| ${label} \\| (#[0-9A-Fa-f]{6})`, "m"), `colour "${label}" in UI_THEME.md`);
const cream = colour("Window body");
const whiteTextOn = [
  ...["Taskbar and title bars", "Server alert title bar", "Start button"].map((l) => [l, colour(l)]),
  ...all(UI, /^\| ([^|]+) \| (#[0-9A-Fa-f]{6}) \| [^|]+ \| [^|]+ \|$/gm).map((m) => [`${m[1]} badge`, m[2]]),
];
for (const [label, hex] of whiteTextOn) if (contrast("#FFFFFF", hex) < 4.5) problem(`UI_THEME.md: white text on ${label} (${hex}) is below 4.5 to 1`);
if (contrast(colour("Main text"), cream) < 4.5) problem("UI_THEME.md: main text on the window body is below 4.5 to 1");
for (const label of ["OK", "Warning", "Critical"]) if (contrast(colour(label), cream) < 3) problem(`UI_THEME.md: the ${label} colour on the window body is below 3 to 1`);

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
console.log(`Docs checked: ${docNames.length} files, ${total} incidents (${nNew} new, ${nRep} repeat), ${nItems} Shop items.`);
console.log(`Users on the required path: ${fmt(users)}. Best possible finish: ${fmt(TARGET_USERS + optional)}.`);
if (problems.length === 0) {
  console.log("0 problems. The docs agree with each other.");
} else {
  console.log(`${problems.length} problem${problems.length === 1 ? "" : "s"}:`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
