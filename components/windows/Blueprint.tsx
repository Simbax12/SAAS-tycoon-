"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BUILD_BRIEF, BUILD_GENERAL_FAILURE, buildById, toolboxPart, type Arrow, type Build } from "@/data/blueprints";
import { playOrder } from "@/data/playOrder";
import { CrossIcon, TickIcon } from "@/components/desktop/gameIcons";
import { ShopIcon } from "@/components/desktop/shopIcons";
import { useDesktop } from "@/components/desktop/DesktopContext";
import { useGameContext } from "@/components/useGame";
import { deployOutcome, flowLayout, freeSpot, onCanvas, sameArrow, trayParts, type DeployOutcome } from "@/game/blueprint";
import { canTestFirst, currentBuild, shuffled } from "@/game/rules";
import type { PlacedPart } from "@/game/types";
import { Calls, MayaSays, Solved, Stars } from "./Incident";
import { InfoBox, InfoButton } from "./InfoButton";
import { PartIcon } from "./partIcons";

const button = "min-h-12 rounded-md border-2 border-ink px-5 text-[18px] font-bold";

// Parts on the canvas are this wide. Their centres are kept far enough in that they never hang off.
const PART_W = 168;
const EDGE_X = PART_W / 2 + 4;
const EDGE_Y = 40;
// Below this width the tray becomes a strip along the top (docs/UI_THEME.md > Blueprint).
const NARROW = 640;
// How far the pointer must move before a press becomes a drag.
const DRAG_START = 6;

// The drawing app (docs/UI_THEME.md > Blueprint). It shows the Build being drawn, or else the
// finished designs, read only.
export default function Blueprint() {
  const { state } = useGameContext();
  const build = currentBuild(state);
  const drawing = build && state.run.canvas && ["choosing", "guided", "solved"].includes(state.phase);
  return drawing ? <Workbench build={build} /> : <MyDesigns />;
}

// A tray part's "What it is" line from the toolbox, opened by its info button (docs/UI_THEME.md > Blueprint).
function PartInfo({ name }: { name: string }) {
  const part = toolboxPart(name);
  if (!part) return null;
  return (
    <InfoBox>
      <p>
        <span className="font-bold">{part.name}:</span> {part.what}.
      </p>
    </InfoBox>
  );
}

// --- The canvas, shared by the Build being drawn and the finished designs ---

type Rect = { x: number; y: number; w: number; h: number };

type Selection = { kind: "part"; name: string } | { kind: "arrow"; from: string; to: string } | null;

// Something to flash red after a failed deploy, with the word "Stopped".
type Stopped = { arrow: Arrow } | { part: string } | null;

type CanvasProps = {
  parts: PlacedPart[];
  arrows: Arrow[];
  locked?: string[];
  selected?: Selection;
  stopped?: Stopped;
  // Traffic dots travel along every arrow.
  flowing?: boolean;
  // The part being dragged towards another part, to join them.
  joining?: { from: string; x: number; y: number; over: string | null } | null;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
  onRects?: (rects: Record<string, Rect>) => void;
  interactive?: {
    onCanvasTap: (x: number, y: number) => void;
    onCanvasKey: (e: React.KeyboardEvent) => void;
    onPartPointerDown: (name: string, e: React.PointerEvent) => void;
    onPartClick: (name: string) => void;
    onPartKey: (name: string, e: React.KeyboardEvent) => void;
    onArrowTap: (a: Arrow) => void;
  };
};

// Where an arrow between two parts starts and ends: on the edge of each part, not its centre.
function edgeLine(a: Rect, b: Rect) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const cut = (r: Rect) => Math.min(dx ? (r.w / 2 + 4) / Math.abs(dx) : Infinity, dy ? (r.h / 2 + 4) / Math.abs(dy) : Infinity);
  const ta = cut(a);
  const tb = cut(b);
  return { x1: a.x + dx * ta, y1: a.y + dy * ta, x2: b.x - dx * tb, y2: b.y - dy * tb };
}

function PartCard({ name, compact }: { name: string; compact?: boolean }) {
  const tool = toolboxPart(name)?.tools[0];
  return (
    <span className={`flex items-center gap-2 text-left ${compact ? "" : "w-full"}`}>
      <PartIcon name={name} size={32} />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="text-[18px] font-bold">{name}</span>
        {tool && <span className="text-[18px] text-[#4A4A4A]">like {tool}</span>}
      </span>
    </span>
  );
}

function PinIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="absolute -right-2 -top-3">
      <path d="M9 2 H15 L14 9 L18 13 H13 L12 22 L11 13 H6 L10 9 Z" fill="#C83232" stroke="#1E1E1E" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function StoppedLabel({ x, y }: { x: number; y: number }) {
  return (
    <span
      className="pointer-events-none absolute z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-md border-2 border-alert bg-[#FBE3E3] px-2 py-0.5 text-[18px] font-bold"
      style={{ left: x, top: y }}
    >
      <CrossIcon size={22} />
      Stopped
    </span>
  );
}

function Canvas({ parts, arrows, locked = [], selected = null, stopped = null, flowing, joining, canvasRef, onRects, interactive }: CanvasProps) {
  const { reducedMotion } = useDesktop();
  const ownRef = useRef<HTMLDivElement>(null);
  const ref = canvasRef ?? ownRef;
  const partRefs = useRef<Record<string, HTMLElement | null>>({});
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [rects, setRects] = useState<Record<string, Rect>>({});

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  // Measure every part after it is drawn, so arrows meet their edges.
  const partsKey = JSON.stringify(parts);
  useLayoutEffect(() => {
    const next: Record<string, Rect> = {};
    for (const p of parts) {
      const el = partRefs.current[p.name];
      // Each card is shifted back by half its size, so its offset point is its centre.
      if (el) next[p.name] = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
    }
    setRects((old) => (JSON.stringify(old) === JSON.stringify(next) ? old : next));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partsKey, size.w, size.h]);
  useEffect(() => {
    onRects?.(rects);
  }, [rects, onRects]);

  const isSelected = (a: Arrow) => selected?.kind === "arrow" && sameArrow(selected, a);
  const isStopped = (a: Arrow) => !!stopped && "arrow" in stopped && sameArrow(stopped.arrow, a);
  const lines = arrows.flatMap((a) => (rects[a.from] && rects[a.to] ? [{ a, ...edgeLine(rects[a.from], rects[a.to]) }] : []));
  const stoppedAt =
    stopped && "arrow" in stopped
      ? lines.find((l) => sameArrow(l.a, stopped.arrow))
      : null;
  const stoppedPart = stopped && "part" in stopped ? rects[stopped.part] : null;

  return (
    <div
      ref={ref}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? "Canvas" : undefined}
      onKeyDown={interactive?.onCanvasKey}
      onClick={(e) => {
        if (!interactive || e.target !== e.currentTarget) return;
        const box = e.currentTarget.getBoundingClientRect();
        interactive.onCanvasTap((e.clientX - box.left) / box.width, (e.clientY - box.top) / box.height);
      }}
      className="relative min-h-[380px] flex-1 overflow-hidden rounded-md border-2 border-[#9FB4D6] outline-offset-2"
      style={{
        backgroundColor: "#F4F8FF",
        backgroundImage: "linear-gradient(#D9E3F3 1px, transparent 1px), linear-gradient(90deg, #D9E3F3 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden={!interactive}>
        <defs>
          <marker id="bp-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" fill="#1E1E1E" />
          </marker>
          <marker id="bp-head-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" fill="#C83232" />
          </marker>
          <marker id="bp-head-blue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" fill="#2A5FD0" />
          </marker>
        </defs>
        {lines.map((l) => {
          const red = isStopped(l.a);
          const blue = isSelected(l.a);
          const colour = red ? "#C83232" : blue ? "#2A5FD0" : "#1E1E1E";
          return (
            <g key={`${l.a.from}>${l.a.to}`}>
              {interactive && (
                <line
                  x1={l.x1}
                  y1={l.y1}
                  x2={l.x2}
                  y2={l.y2}
                  stroke="transparent"
                  strokeWidth="28"
                  pointerEvents="stroke"
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    interactive.onArrowTap(l.a);
                  }}
                />
              )}
              <line
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke={colour}
                strokeWidth={red || blue ? 5 : 3}
                markerEnd={`url(#${red ? "bp-head-red" : blue ? "bp-head-blue" : "bp-head"})`}
                className={red && !reducedMotion ? "arrow-flash" : undefined}
              />
              {flowing &&
                !reducedMotion &&
                [0, 0.7].map((d) => (
                  <circle key={d} r="6" fill="#2E8B3D" stroke="#FFFFFF" strokeWidth="2" pointerEvents="none">
                    <animateMotion dur="1.4s" begin={`${d}s`} repeatCount="indefinite" path={`M${l.x1} ${l.y1} L${l.x2} ${l.y2}`} />
                  </circle>
                ))}
            </g>
          );
        })}
        {joining && rects[joining.from] && (
          <line
            x1={rects[joining.from].x}
            y1={rects[joining.from].y}
            x2={joining.x}
            y2={joining.y}
            stroke="#2A5FD0"
            strokeWidth="3"
            strokeDasharray="8 6"
            markerEnd="url(#bp-head-blue)"
          />
        )}
      </svg>

      {parts.map((p) => {
        const isLocked = locked.includes(p.name);
        const sel = selected?.kind === "part" && selected.name === p.name;
        const red = !!stopped && "part" in stopped && stopped.part === p.name;
        const target = joining?.over === p.name;
        const look = red ? "border-alert bg-[#FBE3E3]" : sel || target ? "border-[#2A5FD0] bg-[#EEF3FD] ring-4 ring-[#9FB4D6]" : "border-ink bg-white";
        const style: React.CSSProperties = {
          left: `clamp(${EDGE_X}px, ${p.x * 100}%, calc(100% - ${EDGE_X}px))`,
          top: `clamp(${EDGE_Y}px, ${p.y * 100}%, calc(100% - ${EDGE_Y}px))`,
          width: PART_W,
        };
        const cls = `absolute z-10 flex min-h-12 -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 px-2 py-1.5 shadow-[2px_3px_0_rgba(0,0,0,0.25)] ${look}`;
        if (!interactive) {
          return (
            <div key={p.name} ref={(el) => void (partRefs.current[p.name] = el)} className={cls} style={style}>
              <PartCard name={p.name} />
            </div>
          );
        }
        return (
          <button
            key={p.name}
            ref={(el) => void (partRefs.current[p.name] = el)}
            type="button"
            aria-pressed={sel}
            className={`${cls} touch-none ${isLocked ? "cursor-default" : "cursor-grab"}`}
            style={style}
            onPointerDown={(e) => interactive.onPartPointerDown(p.name, e)}
            onClick={(e) => {
              e.stopPropagation();
              interactive.onPartClick(p.name);
            }}
            onKeyDown={(e) => interactive.onPartKey(p.name, e)}
          >
            <PartCard name={p.name} />
            {isLocked && <PinIcon />}
          </button>
        );
      })}

      {/* Each arrow's handle sits above the parts, so it can always be tapped, with a 48px tap area.
          It is also how an arrow is picked with the keyboard. */}
      {interactive && (
        <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full">
          {lines.map((l) => {
            const colour = isStopped(l.a) ? "#C83232" : isSelected(l.a) ? "#2A5FD0" : "#1E1E1E";
            const pick = () => interactive.onArrowTap(l.a);
            return (
              <g
                key={`${l.a.from}>${l.a.to}`}
                className="bp-arrow cursor-pointer"
                role="button"
                tabIndex={0}
                aria-pressed={isSelected(l.a)}
                aria-label={`${l.a.from} → ${l.a.to}`}
                onClick={(e) => {
                  e.stopPropagation();
                  pick();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    pick();
                  }
                }}
              >
                <circle cx={(l.x1 + l.x2) / 2} cy={(l.y1 + l.y2) / 2} r="24" fill="transparent" pointerEvents="all" />
                <circle className="bp-handle" cx={(l.x1 + l.x2) / 2} cy={(l.y1 + l.y2) / 2} r="9" fill="#FFFFFF" stroke={colour} strokeWidth="2.5" />
              </g>
            );
          })}
        </svg>
      )}

      {stoppedAt && <StoppedLabel x={(stoppedAt.x1 + stoppedAt.x2) / 2} y={(stoppedAt.y1 + stoppedAt.y2) / 2 - 22} />}
      {stoppedPart && <StoppedLabel x={stoppedPart.x} y={stoppedPart.y + stoppedPart.h / 2 + 16} />}
    </div>
  );
}

function StickyNote({ goal }: { goal: string }) {
  return (
    <p className="max-w-[560px] -rotate-1 self-start rounded-sm border-2 border-[#C9A400] bg-[#FFF3A6] px-4 py-2 text-[18px] shadow-[2px_3px_0_rgba(0,0,0,0.2)]">
      {goal}
    </p>
  );
}

// --- The Build being drawn ---

// What the last deploy showed. It stays until the canvas changes. Screen state only.
type Shown = { key: string; outcome: DeployOutcome; test: boolean };

type Drag = {
  part: string;
  from: "tray" | "canvas";
  startX: number;
  startY: number;
  // Pointer position inside the workbench, for the ghost card.
  x: number;
  y: number;
  moved: boolean;
};

function Workbench({ build }: { build: Build }) {
  const { state, dispatch } = useGameContext();
  const { phase, run } = state;
  const canvas = run.canvas!;
  const editable = phase === "choosing";
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const rectsRef = useRef<Record<string, Rect>>({});
  const [narrow, setNarrow] = useState(false);
  const [trayPick, setTrayPick] = useState<string | null>(null);
  // The tray part whose info box is open. Screen state only, never saved.
  const [infoPart, setInfoPart] = useState<string | null>(null);
  const [selected, setSelected] = useState<Selection>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const suppressClick = useRef(false);
  const [testArmed, setTestArmed] = useState(false);
  const [shown, setShown] = useState<Shown | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setNarrow(el.clientWidth < NARROW));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const canvasKey = JSON.stringify([canvas.parts.map((p) => p.name).sort(), canvas.arrows]);
  const showing = shown && shown.key === canvasKey ? shown : null;
  const stopped: Stopped = (() => {
    const o = showing?.outcome;
    if (!o || o.kind === "right") return null;
    if (o.kind === "general") return o.stopped;
    const t = o.move.trigger;
    return t.kind === "connects" ? { arrow: { from: t.from, to: t.to } } : onCanvas(canvas, t.part) ? { part: t.part } : null;
  })();

  // The tray shows the parts not yet on the canvas, shuffled with the decoys.
  const tray = trayParts(build, canvas).filter((p) => !onCanvas(canvas, p));
  // Its order is fixed by the save's seed, like every shuffle (docs/GAME_LOGIC.md > Derived values).
  const shuffledTray = shuffled([...build.tray, ...build.decoys], state.seed, build.id).filter((p) => tray.includes(p));

  const sharesAt = (clientX: number, clientY: number) => {
    const box = canvasRef.current?.getBoundingClientRect();
    if (!box) return null;
    const x = (clientX - box.left) / box.width;
    const y = (clientY - box.top) / box.height;
    return x >= 0 && x <= 1 && y >= 0 && y <= 1 ? { x, y, px: clientX - box.left, py: clientY - box.top } : null;
  };
  const partAt = (px: number, py: number, except: string) =>
    Object.entries(rectsRef.current).find(([name, r]) => name !== except && Math.abs(px - r.x) <= r.w / 2 && Math.abs(py - r.y) <= r.h / 2)?.[0] ?? null;

  const place = (part: string, x: number, y: number) => dispatch({ type: "placePart", part, x, y });

  // --- Pointer dragging: from the tray to place, and from a part to join or move ---

  const startDrag = (part: string, from: Drag["from"], e: React.PointerEvent) => {
    if (!editable || e.button !== 0) return;
    suppressClick.current = false;
    const box = rootRef.current!.getBoundingClientRect();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ part, from, startX: e.clientX, startY: e.clientY, x: e.clientX - box.left, y: e.clientY - box.top, moved: false });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const box = rootRef.current!.getBoundingClientRect();
    const moved = drag.moved || Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > DRAG_START;
    setDrag({ ...drag, x: e.clientX - box.left, y: e.clientY - box.top, moved });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag;
    setDrag(null);
    if (!d || !d.moved) return;
    suppressClick.current = true;
    const at = sharesAt(e.clientX, e.clientY);
    if (!at) return;
    if (d.from === "tray") {
      place(d.part, at.x, at.y);
      setTrayPick(null);
      return;
    }
    // Dropped on another part: join them. Dropped on empty canvas: move there.
    const over = partAt(at.px, at.py, d.part);
    if (over) dispatch({ type: "drawArrow", from: d.part, to: over });
    else if (!canvas.locked.includes(d.part)) place(d.part, at.x, at.y);
    setSelected(null);
  };
  const consumeClick = () => {
    if (!suppressClick.current) return false;
    suppressClick.current = false;
    return true;
  };

  // The dashed arrow while a part is dragged, and the part it would join.
  const joining = (() => {
    if (!drag || !drag.moved || drag.from !== "canvas" || !canvasRef.current || !rootRef.current) return null;
    const c = canvasRef.current.getBoundingClientRect();
    const r = rootRef.current.getBoundingClientRect();
    const x = drag.x + r.left - c.left;
    const y = drag.y + r.top - c.top;
    return { from: drag.part, x, y, over: partAt(x, y, drag.part) };
  })();

  // --- Taps and keys ---

  const tapPart = (name: string) => {
    if (consumeClick() || !editable) return;
    setTrayPick(null);
    if (selected?.kind === "part" && selected.name !== name) {
      // The second part tapped: an arrow from the first to the second.
      dispatch({ type: "drawArrow", from: selected.name, to: name });
      setSelected(null);
      return;
    }
    setSelected(selected?.kind === "part" && selected.name === name ? null : { kind: "part", name });
  };
  const partKey = (name: string, e: React.KeyboardEvent) => {
    if (!editable) return;
    const step: Record<string, [number, number]> = { ArrowLeft: [-0.05, 0], ArrowRight: [0.05, 0], ArrowUp: [0, -0.05], ArrowDown: [0, 0.05] };
    const m = step[e.key];
    if (m && !canvas.locked.includes(name)) {
      e.preventDefault();
      const p = canvas.parts.find((q) => q.name === name)!;
      place(name, p.x + m[0], p.y + m[1]);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      dispatch({ type: "removePart", part: name });
      setSelected(null);
    } else if (e.key === "Escape") {
      setSelected(null);
    }
  };
  const tapCanvas = (x: number, y: number) => {
    if (consumeClick() || !editable) return;
    if (trayPick) {
      place(trayPick, x, y);
      setTrayPick(null);
    } else setSelected(null);
  };
  // With the keyboard, Enter on the canvas places the picked part in the first clear spot.
  const canvasKey_ = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget || !editable) return;
    if ((e.key === "Enter" || e.key === " ") && trayPick) {
      e.preventDefault();
      const spot = freeSpot(canvas);
      place(trayPick, spot.x, spot.y);
      setTrayPick(null);
    } else if (e.key === "Escape") {
      setSelected(null);
      setTrayPick(null);
    }
  };
  const tapArrow = (a: Arrow) => {
    if (!editable) return;
    setTrayPick(null);
    setSelected(selected?.kind === "arrow" && sameArrow(selected, a) ? null : { kind: "arrow", ...a });
  };

  const removable =
    editable && ((selected?.kind === "part" && !canvas.locked.includes(selected.name) && onCanvas(canvas, selected.name)) || selected?.kind === "arrow");
  const remove = () => {
    if (selected?.kind === "part") dispatch({ type: "removePart", part: selected.name });
    if (selected?.kind === "arrow") dispatch({ type: "deleteArrow", from: selected.from, to: selected.to });
    setSelected(null);
  };

  const deploy = () => {
    const test = testArmed && canTestFirst(state);
    setShown({ key: canvasKey, outcome: deployOutcome(build, canvas), test });
    setTestArmed(false);
    setSelected(null);
    dispatch({ type: "deploy", test });
  };

  const trayLook = (p: string) => (trayPick === p ? "border-[#2A5FD0] bg-[#EEF3FD] ring-4 ring-[#9FB4D6]" : "border-ink bg-white hover:bg-[#EEF3FD]");

  return (
    <div ref={rootRef} className="relative flex min-h-full flex-col gap-3" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={() => setDrag(null)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[20px] font-bold">{build.title}</h3>
        <Stars stars={phase === "solved" ? state.results[build.id]?.stars ?? run.stars : run.stars} />
      </div>

      {phase === "choosing" && <MayaSays>{BUILD_BRIEF}</MayaSays>}
      {phase === "guided" && <MayaSays>{build.result}</MayaSays>}
      <StickyNote goal={build.goal} />

      <div className={`flex min-h-[360px] flex-1 gap-3 ${narrow ? "flex-col" : "flex-row"}`}>
        {(editable || tray.length > 0) && phase !== "solved" && (
          <ul
            data-tour="blueprintTray"
            aria-label="Tray"
            className={`flex shrink-0 gap-2 ${narrow ? "flex-row overflow-x-auto pb-1" : "w-[240px] flex-col overflow-y-auto"}`}
          >
            {shuffledTray.map((p) => (
              <li key={p} className="shrink-0">
                <div className="flex items-stretch gap-1">
                <button
                  type="button"
                  disabled={!editable}
                  aria-pressed={trayPick === p}
                  onPointerDown={(e) => startDrag(p, "tray", e)}
                  onClick={() => {
                    if (consumeClick()) return;
                    setSelected(null);
                    setTrayPick(trayPick === p ? null : p);
                  }}
                  className={`flex min-h-12 rounded-lg border-2 px-2 py-1.5 ${narrow ? "touch-pan-x" : "min-w-0 flex-1 touch-pan-y"} ${trayLook(p)}`}
                >
                  <PartCard name={p} compact={narrow} />
                </button>
                <InfoButton label={p} open={infoPart === p} onToggle={() => setInfoPart(infoPart === p ? null : p)} />
                </div>
                {!narrow && infoPart === p && <PartInfo name={p} />}
              </li>
            ))}
          </ul>
        )}
        {/* On a narrow window the tray is a strip, so the info box sits under the whole strip. */}
        {narrow && infoPart && tray.includes(infoPart) && phase !== "solved" && <PartInfo name={infoPart} />}

        <Canvas
          canvasRef={canvasRef}
          parts={canvas.parts}
          arrows={canvas.arrows}
          locked={canvas.locked}
          selected={selected}
          stopped={stopped}
          flowing={phase === "solved"}
          joining={joining}
          onRects={(r) => (rectsRef.current = r)}
          interactive={
            editable
              ? {
                  onCanvasTap: tapCanvas,
                  onCanvasKey: canvasKey_,
                  onPartPointerDown: (name, e) => startDrag(name, "canvas", e),
                  onPartClick: tapPart,
                  onPartKey: partKey,
                  onArrowTap: tapArrow,
                }
              : undefined
          }
        />
      </div>

      {showing && <DeployResult build={build} shown={showing} />}

      {phase === "choosing" && (
        <>
          <Calls>
            {testArmed && canTestFirst(state) ? (
              <span className="flex flex-wrap items-center gap-2 text-[18px]" role="status">
                <ShopIcon id="srv-test" size={26} />
                Next deploy is a test.
                <button type="button" onClick={() => setTestArmed(false)} className={`${button} bg-white hover:bg-[#EEF3FD]`}>
                  Cancel
                </button>
              </span>
            ) : (
              canTestFirst(state) && (
                <button type="button" onClick={() => setTestArmed(true)} className={`${button} flex items-center gap-2 bg-white hover:bg-[#EEF3FD]`}>
                  <ShopIcon id="srv-test" size={26} />
                  Test first
                </button>
              )
            )}
          </Calls>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button type="button" disabled={!removable} onClick={remove} className={`${button} bg-white enabled:hover:bg-[#FBE3E3] disabled:border-[#8A8A8A] disabled:bg-[#DDDAD0] disabled:text-[#4A4A4A]`}>
              Remove
            </button>
            <button
              type="button"
              disabled={canvas.arrows.length === 0}
              onClick={deploy}
              className={`${button} bg-[#FFE08A] enabled:hover:bg-[#FFD35C] disabled:border-[#8A8A8A] disabled:bg-[#DDDAD0] disabled:text-[#4A4A4A]`}
            >
              Deploy and test
            </button>
          </div>
        </>
      )}

      {phase === "guided" && (
        <button type="button" autoFocus onClick={() => dispatch({ type: "applyGuided" })} className={`${button} self-end bg-[#FFE08A] hover:bg-[#FFD35C]`}>
          Deploy and test
        </button>
      )}

      {phase === "solved" && <Solved result={build.result} />}

      {drag?.moved && drag.from === "tray" && (
        <div
          className="pointer-events-none absolute z-30 flex -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-[#2A5FD0] bg-white px-2 py-1.5 opacity-90 shadow-lg"
          style={{ left: drag.x, top: drag.y, width: PART_W }}
          aria-hidden="true"
        >
          <PartCard name={drag.part} />
        </div>
      )}
    </div>
  );
}

function DeployResult({ build, shown }: { build: Build; shown: Shown }) {
  const { outcome, test } = shown;
  const right = outcome.kind === "right";
  const text = right ? build.result : outcome.kind === "wrongMove" ? outcome.move.says : BUILD_GENERAL_FAILURE;
  if (test) {
    return (
      <div className="flex items-start gap-2 rounded-md border-2 border-[#2A5FD0] bg-[#EEF3FD] px-3 py-2 text-[18px]" role="status">
        <ShopIcon id="srv-test" size={26} />
        <p className="flex flex-col gap-1">
          <span className="font-bold">Test</span>
          <span>{text}</span>
          {right && <span className="font-bold">This would work</span>}
        </p>
      </div>
    );
  }
  if (right) return null;
  return (
    <p className="flex items-start gap-2 rounded-md border-2 border-alert bg-[#FBE3E3] px-3 py-2 text-[18px]" role="status">
      <CrossIcon />
      <span>{text}</span>
    </p>
  );
}

// --- My designs: the finished Builds, read only ---

function MyDesigns() {
  const { state } = useGameContext();
  const [open, setOpen] = useState<string | null>(null);
  const done = playOrder.flatMap((row) => {
    const b = buildById(row.id);
    return b && state.blueprints[row.id] ? [b] : [];
  });

  const build = open ? done.find((b) => b.id === open) : undefined;
  if (build) {
    const arrows = state.blueprints[build.id];
    const layout = flowLayout(arrows);
    const parts = Object.entries(layout).map(([name, at]) => ({ name, ...at }));
    return (
      <div className="flex min-h-full flex-col gap-3">
        <button type="button" onClick={() => setOpen(null)} className="min-h-12 self-start rounded-md border-2 border-ink bg-white px-4 text-[18px] hover:bg-[#EEF3FD]">
          Back
        </button>
        <h3 className="text-[20px] font-bold">{build.title}</h3>
        <StickyNote goal={build.goal} />
        <Canvas parts={parts} arrows={arrows} />
        <p className="flex items-start gap-2 text-[18px]">
          <TickIcon />
          <span>{build.result}</span>
        </p>
      </div>
    );
  }

  if (done.length === 0) return <p className="text-[18px]">No designs yet.</p>;
  return (
    <ul className="flex flex-col gap-3">
      {done.map((b) => (
        <li key={b.id}>
          <button
            type="button"
            onClick={() => setOpen(b.id)}
            className="flex min-h-12 w-full flex-col items-start gap-1 rounded-lg border-2 border-[#9FB4D6] bg-white px-4 py-3 text-left hover:bg-[#EEF3FD]"
          >
            <span className="text-[20px] font-bold">{b.title}</span>
            <span className="text-[18px]">{b.goal}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
