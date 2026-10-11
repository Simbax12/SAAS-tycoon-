"use client";

import { useEffect, useRef } from "react";
import { incidentById, isRepeat, patternOf } from "@/data/incidents";
import { patternIcons, type PatternIconId } from "@/data/patterns";
import {
  heartbeatLines,
  incidentsOnMap,
  mapArrows,
  mapBoxes,
  mapLayouts,
  switchRow,
  WORLD_FROM,
  worldArrows,
  worldBoxes,
  worldLayout,
  type MapArrow,
  type MapBox,
  type Place,
  type When,
} from "@/data/systemMap";
import { upgradeById, type Upgrade } from "@/data/upgrades";
import { BoxIcon, PatternIcon } from "@/components/desktop/gameIcons";
import { useDesktop } from "@/components/desktop/DesktopContext";
import { currentStage, incidentOpen } from "@/game/rules";
import type { GameState } from "@/game/types";

const BOX_H = 72;
// A box is wide enough for its icon and its name at 20 units.
const boxWidth = (name: string) => Math.max(150, 54 + name.length * 11);

// A box placed on the drawing, with its name and copies as they are now.
type Drawn = { id: string; name: string; icon: MapBox["icon"]; copies: number; x: number; y: number; w: number; fresh: boolean };

type Badge = { id: string; icon: PatternIconId; pop?: string; x: number; y: number };

// The diagram of Blip's architecture (docs/UI_THEME.md > The System Map and incident diagram).
// The same drawing is used in the Incident window, the System Map window and the win screen.
// From 5.1 the world view shows above the map of one region.
export default function Diagram({ state }: { state: GameState }) {
  const scroller = useRef<HTMLDivElement>(null);
  const solved = (id: string) => !!state.results[id];
  const met = (w: When) =>
    "owned" in w ? state.owned.includes(w.owned) : "solved" in w ? solved(w.solved) : solved(w.reached) || state.currentId === w.reached;

  const justSolved = state.phase === "solved" ? state.currentId : undefined;
  const onMap = incidentsOnMap[state.currentId];
  const failing = incidentOpen(state) ? onMap?.failing ?? [] : [];

  const place = (boxes: MapBox[], layout: Record<string, Place>): Drawn[] =>
    boxes.flatMap((b) => {
      const p = layout[b.id];
      if (!p || (b.shownWhen && !met(b.shownWhen))) return [];
      // A box that made room for a new one sits in its new place.
      const at = p.movedWhen && solved(p.movedWhen.solved) ? p.movedWhen : p;
      const change = (b.changes ?? []).filter((c) => solved(c.solved)).at(-1);
      const name = change?.name ?? b.name;
      const copies = change?.copies ?? b.copies ?? 1;
      const fresh =
        !!justSolved &&
        ((!!b.shownWhen && "solved" in b.shownWhen && b.shownWhen.solved === justSolved) || change?.solved === justSolved);
      return [{ id: b.id, name, icon: b.icon, copies, x: at.x, y: at.y, w: boxWidth(name), fresh }];
    });
  const keep = (arrows: MapArrow[], boxes: Drawn[]) =>
    arrows.filter((a) => (!a.until || !solved(a.until.solved)) && boxes.some((b) => b.id === a.from) && boxes.some((b) => b.id === a.to));

  const region = place(mapBoxes, mapLayouts[currentStage(state)]);
  const world = solved(WORLD_FROM) ? place(worldBoxes, worldLayout) : null;

  // The Map change of every solved incident, drawn with its pattern's icon, in the order solved.
  // A solved repeat makes the badges with its pattern's icon pulse once.
  const current = incidentById(state.currentId);
  const practised = justSolved && current && isRepeat(current) ? current.pattern : undefined;
  const badges = (boxes: Drawn[]): Badge[] => {
    const perBox: Record<string, number> = {};
    const at = (id: string) => boxes.find((b) => b.id === id);
    return Object.keys(state.results).flatMap((id) => {
      const where = incidentsOnMap[id]?.badge;
      const incident = incidentById(id);
      const pattern = incident ? patternOf(incident) : undefined;
      const icon = pattern ? patternIcons[pattern] : undefined;
      if (!where || !icon) return [];
      const pop = id === justSolved ? "part-pop" : pattern === practised ? "part-pulse" : undefined;
      if ("box" in where) {
        // Badges on the same box sit side by side, from its top right corner leftwards.
        const b = at(where.box);
        if (!b) return [];
        const n = (perBox[b.id] = (perBox[b.id] ?? 0) + 1) - 1;
        return [{ id, icon, pop, x: b.x + b.w / 2 - 14 - n * 38, y: b.y - BOX_H / 2 - 14 }];
      }
      if ("switchRow" in where) {
        const first = at(switchRow.above[0]);
        return first ? [{ id, icon, pop, x: first.x - first.w / 2 - 44, y: first.y - BOX_H / 2 - 50 }] : [];
      }
      const f = at(where.arrow.from);
      const t = at(where.arrow.to);
      return f && t ? [{ id, icon, pop, x: (f.x + t.x) / 2 + 6, y: (f.y + t.y) / 2 - 16 }] : [];
    });
  };

  // Only features get a chip, not servers or the player's own gear.
  const features = state.owned
    .map((id) => upgradeById(id))
    .filter((u): u is Upgrade => u !== undefined && (u.group === "must" || u.group === "nice"));

  // A wide map scrolls sideways on a phone. It starts scrolled so the first failing box is in view.
  const failingKey = failing.join(",");
  useEffect(() => {
    const box = scroller.current;
    const bad = box?.querySelector('[data-tour="failingPart"]');
    if (!box || !bad || box.scrollWidth <= box.clientWidth) return;
    const b = bad.getBoundingClientRect();
    const c = box.getBoundingClientRect();
    box.scrollLeft += b.left + b.width / 2 - (c.left + c.width / 2);
  }, [failingKey]);

  return (
    <div ref={scroller} className="flex flex-col gap-1 overflow-x-auto rounded-md border-2 border-[#C9C1A3] bg-[#FBF8EC]">
      {world && (
        <MapSvg
          label="World view"
          boxes={world}
          arrows={keep(worldArrows, world)}
          failing={failing}
          badges={badges(world)}
          world={{
            heartbeats: met(heartbeatLines.shownWhen) ? heartbeatLines.between : [],
            switches: met(switchRow.shownWhen) ? switchRow.above : [],
          }}
        />
      )}
      {world && <p className="px-3 text-[18px] font-bold">Inside each region</p>}
      <MapSvg
        label="System Map"
        boxes={region}
        arrows={keep(mapArrows, region)}
        failing={failing}
        badges={badges(region)}
        thick={(a) => !!a.thickWhen && solved(a.thickWhen.solved)}
        features={features}
      />
    </div>
  );
}

type MapProps = {
  label: string;
  boxes: Drawn[];
  arrows: MapArrow[];
  failing: string[];
  badges: Badge[];
  thick?: (a: MapArrow) => boolean;
  // Each feature bought shows as a small labelled chip beside the Users box.
  features?: Upgrade[];
  world?: { heartbeats: readonly (readonly [string, string])[]; switches: string[] };
};

function MapSvg({ label, boxes, arrows, failing, badges, thick, features = [], world }: MapProps) {
  const { reducedMotion } = useDesktop();
  const at = (id: string) => boxes.find((b) => b.id === id);
  const users = at("users");
  const failingHere = failing.filter((id) => at(id));

  // Crop the drawing to the boxes that show, with room for badges and stacks above and chips below.
  const chipsBottom = users ? users.y + BOX_H / 2 + 12 + features.length * 34 : 0;
  const switchesTop = world?.switches.length ? Math.min(...world.switches.map((id) => at(id)!.y)) - BOX_H / 2 - 56 : Infinity;
  const left = Math.min(...boxes.map((b) => b.x - b.w / 2)) - (world?.switches.length ? 56 : 12);
  const right = Math.max(...boxes.map((b) => b.x + b.w / 2)) + 20;
  const top = Math.min(switchesTop, ...boxes.map((b) => b.y - BOX_H / 2)) - 26;
  const bottom = Math.max(chipsBottom, ...boxes.map((b) => b.y + BOX_H / 2)) + 12;
  const width = right - left;
  const viewBox = `${left} ${top} ${width} ${bottom - top}`;

  const edge = (from: Drawn, to: Drawn) => {
    // Arrows run between box edges, not centres, at any angle.
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const tf = Math.min(dx ? from.w / 2 / Math.abs(dx) : Infinity, dy ? BOX_H / 2 / Math.abs(dy) : Infinity);
    const tt = Math.min(dx ? to.w / 2 / Math.abs(dx) : Infinity, dy ? BOX_H / 2 / Math.abs(dy) : Infinity);
    return { x1: from.x + dx * tf, y1: from.y + dy * tf, x2: to.x - dx * tt, y2: to.y - dy * tt };
  };

  // Traffic dots run from Users along the arrows to each failing box: the "Sees" loop.
  const entry = users ?? at("worldUsers");
  const trafficPaths = entry ? failingHere.map((id) => pathTo(entry.id, id, arrows)).filter((p) => p.length > 1) : [];

  return (
    // The drawing never gets so small that its words are hard to read: wide maps scroll sideways.
    <svg
      viewBox={viewBox}
      className="mx-auto block w-full"
      style={{ minWidth: Math.max(480, width * 0.62), maxHeight: 420 }}
      role="img"
      aria-label={label}
    >
      <defs>
        <marker id="arrow-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 Z" fill="#1E1E1E" />
        </marker>
        <marker id="arrow-head-thick" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 Z" fill="#1E1E1E" />
        </marker>
      </defs>

      {/* The world view sits on a simple outline of the land. */}
      {world && <Land />}

      {world?.heartbeats.map(([a, b]) => {
        const e = edge(at(a)!, at(b)!);
        return <line key={`${a}-${b}`} {...e} stroke="#2E8B3D" strokeWidth="3" strokeDasharray="10 6" />;
      })}

      {arrows.map((a) => {
        const e = edge(at(a.from)!, at(a.to)!);
        const isThick = !!thick?.(a);
        return (
          <line
            key={`${a.from}-${a.to}`}
            {...e}
            stroke="#1E1E1E"
            strokeWidth={isThick ? 7 : 2.5}
            markerEnd={isThick ? "url(#arrow-head-thick)" : "url(#arrow-head)"}
          />
        );
      })}

      {world?.switches.map((id) => {
        const b = at(id)!;
        return <Switch key={id} x={b.x - 30} y={b.y - BOX_H / 2 - 44} />;
      })}

      {boxes.map((b) => {
        const bad = failingHere.includes(b.id);
        return (
          <g key={b.id} className={b.fresh && !reducedMotion ? "part-pop" : undefined} data-tour={bad ? "failingPart" : undefined}>
            {/* Copies show as a stack behind the box, like a deck of cards. */}
            {Array.from({ length: Math.min(b.copies, 3) - 1 }, (_, i) => {
              const off = (Math.min(b.copies, 3) - 1 - i) * 7;
              return (
                <rect
                  key={i}
                  x={b.x - b.w / 2 + off}
                  y={b.y - BOX_H / 2 - off}
                  width={b.w}
                  height={BOX_H}
                  rx="8"
                  fill="#FFFFFF"
                  stroke={bad ? "#C83232" : "#2E8B3D"}
                  strokeWidth="3"
                />
              );
            })}
            <rect
              x={b.x - b.w / 2}
              y={b.y - BOX_H / 2}
              width={b.w}
              height={BOX_H}
              rx="8"
              fill="#FFFFFF"
              stroke={bad ? "#C83232" : "#2E8B3D"}
              strokeWidth="4"
              className={bad && !reducedMotion ? "box-pulse" : undefined}
            />
            <BoxIcon id={b.icon} x={b.x - b.w / 2 + 8} y={b.y - 14} size={28} />
            <text x={b.x - b.w / 2 + 42} y={b.y - 4} fontSize="20" fill="#1E1E1E">
              {b.name}
            </text>
            {/* Every box also shows a word, never colour alone. */}
            <g transform={`translate(${b.x - b.w / 2 + 42} ${b.y + 8})`}>
              {bad ? (
                <path d="M1 1 L13 13 M13 1 L1 13" stroke="#C83232" strokeWidth="3" />
              ) : (
                <path d="M1 7 L5 12 L13 2" fill="none" stroke="#2E8B3D" strokeWidth="3" />
              )}
              <text x="20" y="13" fontSize="18" fill="#1E1E1E">
                {bad ? "Critical" : "OK"}
              </text>
            </g>
          </g>
        );
      })}

      {badges.map((p) => (
        <g key={p.id} className={reducedMotion ? undefined : p.pop}>
          <circle cx={p.x + 14} cy={p.y + 14} r="17" fill="#FFF8D6" stroke="#1E1E1E" strokeWidth="2" />
          <svg x={p.x} y={p.y} width="28" height="28" overflow="visible">
            <PatternIcon id={p.icon} size={28} />
          </svg>
        </g>
      ))}

      {users &&
        features.map((f, i) => {
          // A chip is as wide as the Users box, or wider for a long name.
          const w = Math.max(users.w, 24 + f.name.length * 10);
          return (
            <g key={f.id} transform={`translate(${users.x - users.w / 2} ${users.y + BOX_H / 2 + 12 + i * 34})`}>
              <rect width={w} height="28" rx="14" fill="#DCE6FA" stroke="#2A5FD0" strokeWidth="2" />
              <text x={w / 2} y="20" fontSize="18" textAnchor="middle" fill="#1E1E1E">
                {f.name}
              </text>
            </g>
          );
        })}

      {!reducedMotion &&
        trafficPaths.map((path) =>
          [0, 0.6, 1.2].map((delay) => (
            // Not hit by the pointer, so the spotlight never mistakes a passing dot for a window on top.
            <circle key={`${path.at(-1)}-${delay}`} r="7" fill="#C83232" stroke="#FFFFFF" strokeWidth="2" pointerEvents="none">
              <animateMotion dur="1.8s" begin={`${delay}s`} repeatCount="indefinite" path={pointsToPath(path.map((id) => at(id)!))} />
            </circle>
          )),
        )}
    </svg>
  );
}

// An on and off switch, drawn on: a rounded track with its knob to the right.
function Switch({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="60" height="30" rx="15" fill="#2E8B3D" stroke="#1E1E1E" strokeWidth="2" />
      <circle cx="44" cy="15" r="10" fill="#FFFFFF" stroke="#1E1E1E" strokeWidth="2" />
    </g>
  );
}

// A plain, made-up outline of the land behind the world view. Not a real map, just a hint of one.
function Land() {
  return (
    <g fill="#DCEBD3" stroke="#B5CFA6" strokeWidth="2">
      <path d="M40 60 C90 20 230 30 280 80 C300 130 250 160 230 200 C250 250 220 330 180 360 C150 330 160 260 120 230 C70 200 20 130 40 60 Z" />
      <path d="M400 40 C460 10 600 20 640 60 C620 110 560 120 560 160 C600 200 580 280 520 330 C480 280 470 220 430 190 C400 160 380 90 400 40 Z" />
      <path d="M680 50 C760 20 940 40 990 100 C1000 160 940 190 900 220 C880 260 840 250 800 230 C760 200 700 160 680 50 Z" />
      <path d="M880 300 C920 280 990 290 1000 330 C970 360 910 360 880 340 Z" />
    </g>
  );
}

// The boxes along the arrows from the entry box to the target box.
function pathTo(from: string, target: string, arrows: { from: string; to: string }[]): string[] {
  const queue: string[][] = [[from]];
  while (queue.length) {
    const path = queue.shift()!;
    const last = path[path.length - 1];
    if (last === target) return path;
    for (const a of arrows) if (a.from === last && !path.includes(a.to)) queue.push([...path, a.to]);
  }
  return [];
}

const pointsToPath = (points: Drawn[]) => points.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ");
