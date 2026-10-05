"use client";

import { useEffect, useRef, useState } from "react";
import { tips, TUTORIAL_INCIDENT, tutorialSteps, type TipId, type TourTarget } from "@/data/tutorial";
import { useGameContext } from "@/components/useGame";
import { currentChallenge, currentRow } from "@/game/rules";
import type { GameState } from "@/game/types";
import { scrollWithin } from "./scrollWithin";
import type { OpenWindow } from "./useWindows";

// The spotlight: the screen dims except for the one thing to tap (docs/GAME_DESIGN.md > Tutorial).
// It shows three things, never two at once:
// - the tutorial, live inside the tutorial incident, moved on by the player's own taps;
// - a replay of the tutorial from Settings, moved on with "Next" only;
// - a first-time tip, once each, never while a tutorial step shows (docs/GAME_LOGIC.md > First-time tips).

type Props = {
  root: React.RefObject<HTMLDivElement | null>;
  windows: OpenWindow[];
  isPhone: boolean;
  // The replay's step, or null when no replay is running. This is screen state, never saved.
  tourStep: number | null;
  onTourStep: (step: number | null) => void;
  // Tells the desktop when the spotlight shows, so balloons can stay out of the way.
  onActive: (active: boolean) => void;
};

type Shown = {
  key: string;
  // The dialog box's title in the classic BlipOS look (docs/UI_THEME.md > Pop-ups and hint boxes).
  title: "Tutorial" | "Tip";
  text: string;
  target: TourTarget;
  // Whether the player can tap the lit-up thing itself. If not, the light is only for looking.
  tappable: boolean;
  buttons: { label: string; onClick: () => void }[];
};

type Rect = { left: number; top: number; width: number; height: number };

const PAD = 6;
const LAST_STEP = tutorialSteps.length;

// The tutorial step the player has already reached by their own actions, so skipping ahead
// with the mouse never leaves the spotlight behind.
function reachedStep(state: GameState, windows: OpenWindow[]): number {
  if (state.phase === "solved") return 7;
  if (state.phase === "choosing" || state.phase === "guided") return state.run.calls > 0 ? 7 : 4;
  if (state.emails.some((e) => e.key === `arrive:${TUTORIAL_INCIDENT}` && e.read)) return 3;
  if (windows.some((w) => w.id === "inbox")) return 2;
  return 1;
}

// Whether a tip's moment is happening now (docs/GAME_DESIGN.md > First-time tips).
function tipMoment(id: TipId, state: GameState): boolean {
  const kind = currentRow(state)?.kind;
  switch (id) {
    case "alert":
      return state.phase === "arrived" && currentChallenge(state)?.arrives.by === "alert";
    case "request":
      return state.emails.some((e) => e.key.startsWith("request:"));
    case "repeat":
      return kind === "repeat" && state.phase === "choosing";
    case "triage":
      return state.phase === "triage";
    case "build":
      return kind === "build" && state.phase === "choosing";
    case "tune":
      return state.phase === "tune";
  }
}

// The part of an element that can be seen: its box, cut down by every scrolling or clipping box around it.
function visibleRect(el: HTMLElement, root: HTMLElement): DOMRect | null {
  let { left, top, right, bottom } = el.getBoundingClientRect();
  for (let p = el.parentElement; p && p !== root.parentElement; p = p.parentElement) {
    if (getComputedStyle(p).overflow === "visible") continue;
    const c = p.getBoundingClientRect();
    left = Math.max(left, c.left);
    top = Math.max(top, c.top);
    right = Math.min(right, c.right);
    bottom = Math.min(bottom, c.bottom);
  }
  return right - left > 4 && bottom - top > 4 ? new DOMRect(left, top, right - left, bottom - top) : null;
}

// Finds the thing to light up. It must be on screen and not hidden under a window.
function findTarget(root: HTMLElement, target: TourTarget, overlay: HTMLElement | null): Rect | null {
  const box = root.getBoundingClientRect();
  for (const el of root.querySelectorAll<HTMLElement>(`[data-tour="${target}"]`)) {
    const r = visibleRect(el, root);
    if (!r) continue;
    const top = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2).find((e) => !overlay?.contains(e));
    if (!top || !(el.contains(top) || top.contains(el))) continue;
    return { left: r.left - box.left, top: r.top - box.top, width: r.width, height: r.height };
  }
  return null;
}

export default function Guide({ root, windows, isPhone, tourStep, onTourStep, onActive }: Props) {
  const { state, dispatch } = useGameContext();
  const overlay = useRef<HTMLDivElement>(null);

  // --- What to show ---

  const live =
    typeof state.tutorial === "number" && state.currentId === TUTORIAL_INCIDENT && state.emails.length > 0
      ? Math.max(state.tutorial, reachedStep(state, windows))
      : null;

  // The tutorial has caught up with the player: remember it, so a reload carries on from there.
  useEffect(() => {
    if (live !== null && live !== state.tutorial) dispatch({ type: "tutorial", step: live });
  }, [live, state.tutorial, dispatch]);

  // Step 8 is done once the player opens the Shop.
  const shopOpen = windows.some((w) => w.id === "shop");
  useEffect(() => {
    if (live === LAST_STEP && shopOpen) dispatch({ type: "tutorial", step: "done" });
  }, [live, shopOpen, dispatch]);

  const skip = { label: "Skip tutorial", onClick: () => dispatch({ type: "tutorial", step: "skipped" }) };
  const liveNext = (step: number) => ({
    label: "Next",
    onClick: () => dispatch({ type: "tutorial", step: step >= LAST_STEP ? "done" : step + 1 }),
  });

  let shown: Shown | null = null;

  if (tourStep !== null) {
    const s = tutorialSteps[tourStep - 1];
    shown = {
      key: `tour-${s.step}`,
      title: "Tutorial",
      text: s.text,
      target: s.target,
      tappable: false,
      buttons: [
        { label: "Next", onClick: () => onTourStep(tourStep >= LAST_STEP ? null : tourStep + 1) },
        { label: "Skip tutorial", onClick: () => onTourStep(null) },
      ],
    };
  } else if (live !== null) {
    const s = tutorialSteps[live - 1];
    // Steps 1 to 3 wait for the incident to arrive. Step 7 waits until the fix is in.
    const ready = live <= 3 ? state.phase === "arrived" : live <= 6 ? state.phase === "choosing" : state.phase === "solved";
    if (ready) {
      shown = {
        key: `tutorial-${s.step}`,
        title: "Tutorial",
        text: s.text,
        target: s.target,
        // The failing part, the cards and the counters are for looking. Step 5 shows the cards
        // before step 6 teaches the call, so the cards wait until the spotlight moves on.
        tappable: ![4, 5, 7].includes(s.step),
        buttons: [liveNext(s.step), skip],
      };
    }
  }

  const tipNow = tips.find((t) => !state.tipsSeen.includes(t.id) && tipMoment(t.id, state));
  if (!shown && tipNow && live === null) {
    shown = {
      key: `tip-${tipNow.id}`,
      title: "Tip",
      text: tipNow.text,
      target: tipNow.target,
      tappable: true,
      buttons: [{ label: "OK", onClick: () => dispatch({ type: "tipSeen", id: tipNow.id }) }],
    };
  }

  // A tip is seen once its moment has passed, for example after tapping Investigate.
  const tipShownRef = useRef<TipId | null>(null);
  useEffect(() => {
    const was = tipShownRef.current;
    if (was && was !== tipNow?.id && !state.tipsSeen.includes(was)) dispatch({ type: "tipSeen", id: was });
    tipShownRef.current = shown?.key.startsWith("tip-") ? (tipNow?.id ?? null) : null;
  });

  const active = shown !== null;
  useEffect(() => onActive(active), [active, onActive]);

  // --- Where the thing to light up is. Windows move, so look again on every frame. ---

  const [view, setView] = useState<{ hole: Rect | null; w: number; h: number }>({ hole: null, w: 0, h: 0 });
  const target = shown?.target;
  useEffect(() => {
    if (!target) return;
    let frame = 0;
    let last = "";
    // Bring the thing to light up into view, for example cards lower down a long window.
    scrollWithin(root.current?.querySelector<HTMLElement>(`[data-tour="${target}"]`) ?? null);
    const look = () => {
      const el = root.current;
      if (el) {
        const box = el.getBoundingClientRect();
        const r = findTarget(el, target, overlay.current);
        const key = [box.width, box.height, ...(r ? [r.left, r.top, r.width, r.height] : [])].map(Math.round).join(",");
        if (key !== last) {
          last = key;
          setView({ hole: r, w: box.width, h: box.height });
        }
      }
      frame = requestAnimationFrame(look);
    };
    look();
    return () => {
      cancelAnimationFrame(frame);
      setView({ hole: null, w: 0, h: 0 });
    };
  }, [target, root]);

  if (!shown || view.w === 0) return null;

  const { hole, w, h } = view;
  const lit = hole && {
    left: Math.max(0, hole.left - PAD),
    top: Math.max(0, hole.top - PAD),
    right: Math.min(w, hole.left + hole.width + PAD),
    bottom: Math.min(h, hole.top + hole.height + PAD),
  };

  // The bubble sits below the lit-up thing, or above it if there is no room. With nothing to
  // light up (it is hidden or not built yet), the whole desktop dims and the bubble floats at the top.
  // Its buttons always work, so the player can never get stuck behind the spotlight.
  const bubbleWidth = Math.min(isPhone ? 340 : 380, w - 16);
  const bubbleHeight = 190;
  let bubble: React.CSSProperties = { left: (w - bubbleWidth) / 2, top: 12, width: bubbleWidth };
  if (lit) {
    const left = Math.min(Math.max(8, (lit.left + lit.right) / 2 - bubbleWidth / 2), w - bubbleWidth - 8);
    if (lit.bottom + 12 + bubbleHeight <= h) bubble = { left, top: lit.bottom + 12, width: bubbleWidth };
    else if (lit.top - 12 - bubbleHeight >= 0) bubble = { left, bottom: h - lit.top + 12, width: bubbleWidth };
    else bubble = { left, top: 12, width: bubbleWidth };
  }

  const dim = "absolute bg-[rgba(0,0,0,0.55)] pointer-events-auto";

  return (
    <div ref={overlay} className="pointer-events-none absolute inset-0 z-[1500]">
      {!lit && <div className={dim} style={{ left: 0, top: 0, width: w, height: h }} />}
      {lit && (
        <>
          <div className={dim} style={{ left: 0, top: 0, width: w, height: lit.top }} />
          <div className={dim} style={{ left: 0, top: lit.bottom, width: w, height: h - lit.bottom }} />
          <div className={dim} style={{ left: 0, top: lit.top, width: lit.left, height: lit.bottom - lit.top }} />
          <div className={dim} style={{ left: lit.right, top: lit.top, width: w - lit.right, height: lit.bottom - lit.top }} />
          <div
            className={`absolute rounded-md border-4 border-[#FFD35C] ${shown.tappable ? "" : "pointer-events-auto"}`}
            style={{ left: lit.left, top: lit.top, width: lit.right - lit.left, height: lit.bottom - lit.top }}
            aria-hidden="true"
          />
        </>
      )}
      <div
        role="dialog"
        aria-live="polite"
        aria-label={shown.text}
        className="os-dialog pointer-events-auto absolute flex flex-col overflow-hidden rounded-xl border-2 border-ink bg-cream shadow-[4px_6px_16px_rgba(0,0,0,0.45)]"
        style={bubble}
      >
        <p className="os-dialog-title px-3 py-1.5 text-[18px] font-bold">{shown.title}</p>
        <div className="flex flex-col gap-3 p-4">
          <p className="text-[20px] font-bold leading-normal">{shown.text}</p>
          <div className="flex flex-wrap gap-2">
            {shown.buttons.map((b, i) => (
              <button
                key={b.label}
                type="button"
                onClick={b.onClick}
                className={`os-button ${i === 0 ? "os-button-default" : ""} min-h-12 rounded-md border-2 border-ink px-4 text-[18px] ${
                  i === 0 ? "bg-[#FFE08A] font-bold hover:bg-[#FFD35C]" : "bg-white hover:bg-[#EEF3FD]"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
