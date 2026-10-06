"use client";

import { incidentById, isRepeat, patternOf } from "@/data/incidents";
import { patternIcons } from "@/data/patterns";
import { incidentsOnMap, mapArrows, mapBoxes, type MapBox } from "@/data/systemMap";
import { upgradeById, type Upgrade } from "@/data/upgrades";
import { BoxIcon, PatternIcon } from "@/components/desktop/gameIcons";
import { useDesktop } from "@/components/desktop/DesktopContext";
import { incidentOpen } from "@/game/rules";
import type { GameState } from "@/game/types";

const BOX_W = 150;
const BOX_H = 72;

// The diagram of Blip's architecture (docs/UI_THEME.md > The System Map and incident diagram).
// The same drawing is used in the Incident window and the System Map window.
export default function Diagram({ state }: { state: GameState }) {
  const { reducedMotion } = useDesktop();

  const solved = (id: string) => !!state.results[id];
  const shows = (b: MapBox) =>
    !b.shownWhen || ("owned" in b.shownWhen ? state.owned.includes(b.shownWhen.owned) : solved(b.shownWhen.solved));
  // A box that made room for a new one sits in its new place.
  const boxes = mapBoxes
    .filter(shows)
    .map((b) => (b.movedWhen && solved(b.movedWhen.solved) ? { ...b, x: b.movedWhen.x, y: b.movedWhen.y } : b));
  const at = (id: string) => boxes.find((b) => b.id === id);
  const arrows = mapArrows.filter((a) => at(a.from) && at(a.to));

  // While an incident is open, its box fails. Its new part slides in once it is solved.
  const onMap = incidentsOnMap[state.currentId];
  const failing = incidentOpen(state) ? onMap?.failing : undefined;
  const justSolved = state.phase === "solved" ? state.currentId : undefined;
  // A solved repeat makes the badges with its pattern's icon pulse once.
  const current = incidentById(state.currentId);
  const practised = justSolved && current && isRepeat(current) ? current.pattern : undefined;

  // The Map change of every solved incident, drawn with its pattern's icon, in the order solved.
  // Badges on the same box sit side by side, from its top right corner leftwards.
  const perBox: Record<string, number> = {};
  const badges = Object.keys(state.results).flatMap((id) => {
    const place = incidentsOnMap[id]?.badge;
    const incident = incidentById(id);
    const pattern = incident ? patternOf(incident) : undefined;
    const icon = pattern ? patternIcons[pattern] : undefined;
    if (!place || !icon) return [];
    const pop = id === justSolved ? "part-pop" : pattern === practised ? "part-pulse" : undefined;
    if ("box" in place) {
      const b = at(place.box);
      if (!b) return [];
      const n = (perBox[b.id] = (perBox[b.id] ?? 0) + 1) - 1;
      return [{ id, icon, pop, x: b.x + BOX_W / 2 - 14 - n * 38, y: b.y - BOX_H / 2 - 14 }];
    }
    const f = at(place.arrow.from);
    const t = at(place.arrow.to);
    return f && t ? [{ id, icon, pop, x: (f.x + t.x) / 2 + 6, y: (f.y + t.y) / 2 - 16 }] : [];
  });

  // Traffic dots run from Users along the arrows to the failing box: the "Sees" loop.
  const trafficPath = failing ? pathTo(failing, arrows) : [];
  const users = at("users");
  // Only features get a chip, not servers or the player's own gear.
  const features = state.owned
    .map((id) => upgradeById(id))
    .filter((u): u is Upgrade => u !== undefined && (u.group === "must" || u.group === "nice"));

  // Crop the drawing to the boxes that show, with room for badges above and feature chips below.
  const chipsBottom = users ? users.y + BOX_H / 2 + 12 + features.length * 34 : 0;
  const left = Math.min(...boxes.map((b) => b.x - BOX_W / 2)) - 12;
  const right = Math.max(...boxes.map((b) => b.x + BOX_W / 2)) + 12;
  const top = Math.min(...boxes.map((b) => b.y - BOX_H / 2)) - 22;
  const bottom = Math.max(chipsBottom, ...boxes.map((b) => b.y + BOX_H / 2)) + 12;
  const viewBox = `${left} ${top} ${right - left} ${bottom - top}`;

  const edge = (from: MapBox, to: MapBox) => {
    // Arrows run between box edges, not centres, at any angle.
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const t = Math.min(dx ? BOX_W / 2 / Math.abs(dx) : Infinity, dy ? BOX_H / 2 / Math.abs(dy) : Infinity);
    return { x1: from.x + dx * t, y1: from.y + dy * t, x2: to.x - dx * t, y2: to.y - dy * t };
  };

  return (
    <div className="overflow-x-auto rounded-md border-2 border-[#C9C1A3] bg-[#FBF8EC]">
      <svg viewBox={viewBox} className="mx-auto block max-h-[260px] w-full min-w-[480px]" role="img" aria-label="System Map">
        <defs>
          <marker id="arrow-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" fill="#1E1E1E" />
          </marker>
          <marker id="arrow-head-thick" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" fill="#1E1E1E" />
          </marker>
        </defs>

        {arrows.map((a) => {
          const e = edge(at(a.from)!, at(a.to)!);
          const thick = !!a.thickWhen && solved(a.thickWhen.solved);
          return (
            <line
              key={`${a.from}-${a.to}`}
              {...e}
              stroke="#1E1E1E"
              strokeWidth={thick ? 7 : 2.5}
              markerEnd={thick ? "url(#arrow-head-thick)" : "url(#arrow-head)"}
            />
          );
        })}

        {boxes.map((b) => {
          const bad = b.id === failing;
          const fresh = !!justSolved && !!b.shownWhen && "solved" in b.shownWhen && b.shownWhen.solved === justSolved;
          return (
            <g key={b.id} className={fresh && !reducedMotion ? "part-pop" : undefined} data-tour={bad ? "failingPart" : undefined}>
              <rect
                x={b.x - BOX_W / 2}
                y={b.y - BOX_H / 2}
                width={BOX_W}
                height={BOX_H}
                rx="8"
                fill="#FFFFFF"
                stroke={bad ? "#C83232" : "#2E8B3D"}
                strokeWidth="4"
                className={bad && !reducedMotion ? "box-pulse" : undefined}
              />
              <BoxIcon id={b.icon} x={b.x - BOX_W / 2 + 8} y={b.y - 14} size={28} />
              <text x={b.x - BOX_W / 2 + 42} y={b.y - 4} fontSize="20" fill="#1E1E1E">
                {b.name}
              </text>
              {/* Every box also shows a word, never colour alone. */}
              <g transform={`translate(${b.x - BOX_W / 2 + 42} ${b.y + 8})`}>
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

        {/* Each feature bought shows as a small labelled chip beside the Users box. */}
        {users &&
          features.map((f, i) => (
            <g key={f.id} transform={`translate(${users.x - BOX_W / 2} ${users.y + BOX_H / 2 + 12 + i * 34})`}>
              <rect width={BOX_W} height="28" rx="14" fill="#DCE6FA" stroke="#2A5FD0" strokeWidth="2" />
              <text x={BOX_W / 2} y="20" fontSize="18" textAnchor="middle" fill="#1E1E1E">
                {f.name}
              </text>
            </g>
          ))}

        {!reducedMotion &&
          trafficPath.length > 1 &&
          [0, 0.6, 1.2].map((delay) => (
            // Not hit by the pointer, so the spotlight never mistakes a passing dot for a window on top.
            <circle key={delay} r="7" fill="#C83232" stroke="#FFFFFF" strokeWidth="2" pointerEvents="none">
              <animateMotion dur="1.8s" begin={`${delay}s`} repeatCount="indefinite" path={pointsToPath(trafficPath.map((id) => at(id)!))} />
            </circle>
          ))}
      </svg>
    </div>
  );
}

// The boxes along the arrows from Users to the target box.
function pathTo(target: string, arrows: { from: string; to: string }[]): string[] {
  const queue: string[][] = [["users"]];
  while (queue.length) {
    const path = queue.shift()!;
    const last = path[path.length - 1];
    if (last === target) return path;
    for (const a of arrows) if (a.from === last && !path.includes(a.to)) queue.push([...path, a.to]);
  }
  return [];
}

const pointsToPath = (points: MapBox[]) => points.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ");
