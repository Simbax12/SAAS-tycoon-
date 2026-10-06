// The Blueprint canvas: deploying, calls in a Build and drawing the Solution
// (docs/GAME_DESIGN.md > Build incident flow: draw the design, and docs/GAME_LOGIC.md > Deploying).
// Pure functions of a Build and a canvas, so the reducer and the screen give the same answer.

import type { Arrow, Build, WrongMove, WrongMoveTrigger } from "../data/blueprints";
import type { Canvas, PlacedPart } from "./types";

export const emptyCanvas = (): Canvas => ({ parts: [], arrows: [], locked: [], decoysRemoved: false });

export const sameArrow = (a: Arrow, b: Arrow) => a.from === b.from && a.to === b.to;

// The tray holds the Build's parts and decoys. A call can take the decoys away.
export const trayParts = (build: Build, canvas: Canvas): string[] =>
  canvas.decoysRemoved ? build.tray : [...build.tray, ...build.decoys];

export const onCanvas = (canvas: Canvas, name: string) => canvas.parts.some((p) => p.name === name);

const joined = (canvas: Canvas, name: string) => canvas.arrows.some((a) => a.from === name || a.to === name);

// docs/GAME_DESIGN.md > When a design is right: the arrows are exactly the Solution.
// Where parts sit, and parts with no arrows, do not matter.
export const isRight = (build: Build, canvas: Canvas) =>
  canvas.arrows.length === build.solution.length && build.solution.every((s) => canvas.arrows.some((a) => sameArrow(a, s)));

export function applies(trigger: WrongMoveTrigger, canvas: Canvas): boolean {
  switch (trigger.kind) {
    case "uses":
      return joined(canvas, trigger.part);
    case "connects":
      return canvas.arrows.some((a) => sameArrow(a, trigger));
    case "missing":
      return !joined(canvas, trigger.part);
  }
}

export type DeployOutcome =
  | { kind: "right" }
  // The first wrong move in the Build's list that applies.
  | { kind: "wrongMove"; move: WrongMove }
  // Anything else. Traffic stops at the first wrong arrow, or else where the first missing one should start.
  | { kind: "general"; stopped: { arrow: Arrow } | { part: string } };

export function deployOutcome(build: Build, canvas: Canvas): DeployOutcome {
  if (isRight(build, canvas)) return { kind: "right" };
  const move = build.wrongMoves.find((m) => applies(m.trigger, canvas));
  if (move) return { kind: "wrongMove", move };
  const wrong = canvas.arrows.find((a) => !build.solution.some((s) => sameArrow(s, a)));
  if (wrong) return { kind: "general", stopped: { arrow: wrong } };
  const missing = build.solution.find((s) => !canvas.arrows.some((a) => sameArrow(a, s)))!;
  return { kind: "general", stopped: { part: missing.from } };
}

// --- Where parts sit ---

// The Solution laid out left to right in the direction traffic flows: each part one column after
// the furthest part with an arrow into it. Used to draw the Solution, to place parts a call puts
// down, and to show a finished design.
export function flowLayout(arrows: Arrow[]): Record<string, { x: number; y: number }> {
  const names = [...new Set(arrows.flatMap((a) => [a.from, a.to]))];
  const column: Record<string, number> = Object.fromEntries(names.map((n) => [n, 0]));
  // Longest path from a part with no arrows in. Designs are small and have no loops worth following.
  for (let pass = 0; pass < names.length; pass++) {
    for (const a of arrows) column[a.to] = Math.max(column[a.to], Math.min(column[a.from] + 1, names.length - 1));
  }
  const columns = Math.max(...names.map((n) => column[n]), 0) + 1;
  const out: Record<string, { x: number; y: number }> = {};
  for (let c = 0; c < columns; c++) {
    const inColumn = names.filter((n) => column[n] === c);
    inColumn.forEach((n, i) => (out[n] = { x: (c + 0.5) / columns, y: (i + 0.5) / inColumn.length }));
  }
  return out;
}

// The first place on a 4 by 3 grid that is clear of every part, for placing a part with the keyboard.
export function freeSpot(canvas: Canvas): { x: number; y: number } {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      const spot = { x: (c + 0.5) / 4, y: (r + 0.5) / 3 };
      if (canvas.parts.every((p) => Math.abs(p.x - spot.x) > 0.12 || Math.abs(p.y - spot.y) > 0.16)) return spot;
    }
  }
  return { x: 0.5, y: 0.5 };
}

export const clampShare = (n: number) => Math.min(1, Math.max(0, n));

// Places a part, or moves it if it is already on the canvas.
export function placePart(canvas: Canvas, name: string, x: number, y: number): Canvas {
  const part: PlacedPart = { name, x: clampShare(x), y: clampShare(y) };
  const parts = onCanvas(canvas, name) ? canvas.parts.map((p) => (p.name === name ? part : p)) : [...canvas.parts, part];
  return { ...canvas, parts };
}

// Removes a part with every arrow joined to it.
export const removePart = (canvas: Canvas, name: string): Canvas => ({
  ...canvas,
  parts: canvas.parts.filter((p) => p.name !== name),
  arrows: canvas.arrows.filter((a) => a.from !== name && a.to !== name),
});

// --- Calls in a Build (docs/GAME_DESIGN.md > Calls in a Build) ---

// Puts a part on the canvas, in its place in the Solution, and locks it. A part already on the
// canvas is locked where it is.
function lockPart(build: Build, canvas: Canvas, name: string): Canvas {
  const placed = onCanvas(canvas, name) ? canvas : placePart(canvas, name, ...spotFor(build, name));
  return { ...placed, locked: placed.locked.includes(name) ? placed.locked : [...placed.locked, name] };
}

function spotFor(build: Build, name: string): [number, number] {
  const at = flowLayout(build.solution)[name] ?? { x: 0.5, y: 0.5 };
  return [at.x, at.y];
}

// What call number `n` does. Call 1 places the "Call 1 places" part. Call 2 removes every decoy
// from the tray and the canvas. Each later call places the next Tray part that is not locked yet.
export function callInBuild(build: Build, canvas: Canvas, n: number): Canvas {
  if (n === 1) return lockPart(build, canvas, build.call1);
  if (n === 2) {
    const cleared = build.decoys.reduce(removePart, canvas);
    return { ...cleared, decoysRemoved: true };
  }
  const next = build.tray.find((p) => !canvas.locked.includes(p));
  return next ? lockPart(build, canvas, next) : canvas;
}

// After two failed deploys, or Victor's lifeline, Blueprint draws the Solution.
export function drawSolution(build: Build, canvas: Canvas): Canvas {
  const layout = flowLayout(build.solution);
  return {
    ...canvas,
    parts: Object.entries(layout).map(([name, at]) => ({ name, ...at })),
    arrows: build.solution.map((a) => ({ ...a })),
    locked: canvas.locked.filter((n) => n in layout),
  };
}
