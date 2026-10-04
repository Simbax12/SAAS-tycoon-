"use client";

import { useRef } from "react";
import { appById } from "@/data/desktopApps";
import { AppIcon, CloseIcon } from "./icons";
import { type Area, type OpenWindow, clampPosition, windowSize } from "./useWindows";

type Props = {
  win: OpenWindow;
  area: Area;
  isPhone: boolean;
  isFront: boolean;
  onClose: () => void;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
  // Shown above the body, for example the tabs that switch between two windows on a phone.
  tabs?: React.ReactNode;
  children: React.ReactNode;
};

const KEY_STEP = 24;

// A window: blue title bar with icon, name and close button, and a cream body
// (docs/UI_THEME.md > Windows). On a computer it can be dragged by the title bar.
export default function WindowFrame({ win, area, isPhone, isFront, onClose, onFocus, onMove, tabs, children }: Props) {
  const app = appById(win.id);
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const titleId = `window-title-${win.id}`;

  const onPointerDown = (e: React.PointerEvent) => {
    onFocus();
    if (isPhone || (e.target as HTMLElement).closest("button")) return;
    drag.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    onMove(d.x + e.clientX - d.px, d.y + e.clientY - d.py);
  };
  const endDrag = () => {
    drag.current = null;
  };

  // Arrow keys move a window too, so dragging is never required.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (isPhone) return;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-KEY_STEP, 0],
      ArrowRight: [KEY_STEP, 0],
      ArrowUp: [0, -KEY_STEP],
      ArrowDown: [0, KEY_STEP],
    };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    onMove(pos.x + m[0], pos.y + m[1]);
  };

  const usual = windowSize(area);
  const width = Math.min(win.width ?? usual.width, area.width);
  const height = Math.min(win.height ?? usual.height, area.height);
  // The desktop can shrink when the browser is resized, so keep the title bar in reach.
  const pos = clampPosition(win.x, win.y, area);
  const place: React.CSSProperties = isPhone
    ? { left: 0, top: 0, right: 0, bottom: 0, zIndex: win.z }
    : { left: pos.x, top: pos.y, width, height, zIndex: win.z };

  return (
    <section
      role="dialog"
      aria-labelledby={titleId}
      className={`os-window absolute flex flex-col overflow-hidden ${isPhone ? "" : "os-framed"} ${
        !isPhone && !isFront ? "opacity-95" : ""
      }`}
      style={place}
      onPointerDown={onFocus}
    >
      <header
        className={`os-titlebar flex h-12 shrink-0 select-none items-center gap-2 pl-2 ${
          isPhone ? "" : "cursor-move touch-none"
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        tabIndex={isPhone ? undefined : 0}
        aria-label={isPhone ? undefined : app.name}
      >
        <AppIcon id={win.id} size={30} />
        <h2 id={titleId} className="min-w-0 flex-1 truncate text-[18px] font-bold leading-none">
          {app.name}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${app.name}`}
          className="os-close flex h-12 w-12 shrink-0 items-center justify-center"
        >
          <CloseIcon />
        </button>
      </header>
      {tabs}
      <div className="min-h-0 flex-1 overflow-auto p-4">{children}</div>
    </section>
  );
}
