// Blueprint actions: editing the canvas of a Build and deploying it (docs/GAME_LOGIC.md > Part 3: Player actions).

import { wrongMoveId } from "../data/blueprints";
import { clampShare, deployOutcome, drawSolution, onCanvas, placePart, sameArrow, trayParts } from "./blueprint";
import { solve } from "./flow";
import { canTestFirst, currentBuild, loseStar } from "./rules";
import type { Canvas, GameState } from "./types";

// Changes the canvas of the Build being drawn. Nothing changes once the Solution has been drawn.
export function editCanvas(state: GameState, change: (canvas: Canvas) => Canvas): GameState {
  const canvas = state.run.canvas;
  if (state.phase !== "choosing" || !currentBuild(state) || !canvas) return state;
  const changed = change(canvas);
  return changed === canvas ? state : { ...state, run: { ...state.run, canvas: changed } };
}

// Places a part from the tray, or moves one already on the canvas. A part locked by a call stays put.
export function place(state: GameState, part: string, x: number, y: number): GameState {
  const build = currentBuild(state);
  return editCanvas(state, (canvas) => {
    if (!build || !trayParts(build, canvas).includes(part) || canvas.locked.includes(part)) return canvas;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return canvas;
    return placePart(canvas, part, clampShare(x), clampShare(y));
  });
}

export function drawArrow(state: GameState, from: string, to: string): GameState {
  return editCanvas(state, (canvas) => {
    const drawn = canvas.arrows.some((a) => sameArrow(a, { from, to }));
    if (from === to || drawn || !onCanvas(canvas, from) || !onCanvas(canvas, to)) return canvas;
    return { ...canvas, arrows: [...canvas.arrows, { from, to }] };
  });
}

// docs/GAME_LOGIC.md > Deploying.
export function deploy(state: GameState, test: boolean): GameState {
  const build = currentBuild(state);
  const canvas = state.run.canvas;
  if (state.phase !== "choosing" || !build || !canvas || canvas.arrows.length === 0) return state;

  // A test deploy loses nothing and counts for nothing. It only uses up "Test first".
  if (test) return canTestFirst(state) ? { ...state, run: { ...state.run, testUsed: true } } : state;

  const outcome = deployOutcome(build, canvas);
  if (outcome.kind === "right") return solve(state);
  let s: GameState = {
    ...state,
    run: { ...state.run, stars: loseStar(state.run.stars), failedDeploys: state.run.failedDeploys + 1 },
  };
  // A wrong move from the Build's list goes to the Recycle Bin. A general failure does not.
  if (outcome.kind === "wrongMove") {
    s = { ...s, recycleBin: [...s.recycleBin, { incidentId: build.id, choice: wrongMoveId(outcome.move.trigger) }] };
  }
  // After the second failed deploy, Blueprint draws the Solution.
  if (s.run.failedDeploys >= 2) s = { ...s, phase: "guided", run: { ...s.run, canvas: drawSolution(build, canvas) } };
  return s;
}
