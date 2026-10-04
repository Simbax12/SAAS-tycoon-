"use client";

import { useRef, useState } from "react";
import { WarningIcon } from "./gameIcons";
import type { Area } from "./useWindows";

type Props = { text: string; area: Area; isPhone: boolean; onInvestigate: () => void };

const WIDTH = 380;
const KEY_STEP = 24;

// A server alert opens by itself in the middle of the desktop. It has no close button:
// only "Investigate" puts it away, but it can be dragged aside (docs/UI_THEME.md > Server alerts).
export default function ServerAlert({ text, area, isPhone, onInvestigate }: Props) {
  const width = Math.min(WIDTH, area.width - 16);
  const [pos, setPos] = useState(() => ({ x: (area.width - width) / 2, y: Math.max(8, area.height / 2 - 120) }));
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  const place = (x: number, y: number) =>
    setPos({ x: Math.min(Math.max(x, 96 - width), area.width - 96), y: Math.min(Math.max(y, 0), area.height - 48) });

  const onPointerDown = (e: React.PointerEvent) => {
    if (isPhone) return;
    drag.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (d) place(d.x + e.clientX - d.px, d.y + e.clientY - d.py);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-KEY_STEP, 0],
      ArrowRight: [KEY_STEP, 0],
      ArrowUp: [0, -KEY_STEP],
      ArrowDown: [0, KEY_STEP],
    };
    const m = moves[e.key];
    if (isPhone || !m) return;
    e.preventDefault();
    place(pos.x + m[0], pos.y + m[1]);
  };

  const style: React.CSSProperties = isPhone ? { inset: 0 } : { left: pos.x, top: pos.y, width };

  return (
    <section
      role="alertdialog"
      aria-labelledby="server-alert-title"
      aria-describedby="server-alert-text"
      className={`absolute z-[900] flex flex-col overflow-hidden bg-cream ${
        isPhone ? "" : "rounded-t-lg border-2 border-alert shadow-[4px_6px_16px_rgba(0,0,0,0.45)]"
      }`}
      style={style}
    >
      <header
        className={`flex h-12 shrink-0 select-none items-center gap-2 bg-alert px-2 text-white ${isPhone ? "" : "cursor-move touch-none"}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onKeyDown={onKeyDown}
        tabIndex={isPhone ? undefined : 0}
      >
        <WarningIcon size={30} />
        <h2 id="server-alert-title" className="text-[18px] font-bold">
          Server alert
        </h2>
      </header>
      <div className={`flex flex-col gap-4 p-4 ${isPhone ? "flex-1 justify-center" : ""}`}>
        <p id="server-alert-text" className="text-[22px] leading-normal">
          {text}
        </p>
        <button
          type="button"
          autoFocus
          data-tour="alertInvestigate"
          onClick={onInvestigate}
          className="min-h-12 self-start rounded-md border-2 border-ink bg-[#FFE08A] px-5 text-[18px] font-bold hover:bg-[#FFD35C]"
        >
          Investigate
        </button>
      </div>
    </section>
  );
}
