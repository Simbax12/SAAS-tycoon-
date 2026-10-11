"use client";

import { useEffect, useState } from "react";
import { appById } from "@/data/desktopApps";
import { AppIcon, BlipLogo, CashIcon, UsersIcon, ZoomIcon } from "./icons";
import { ShopIcon } from "./shopIcons";
import { fullNumber, shortNumber } from "./format";
import type { OpenWindow } from "./useWindows";

type Props = {
  isPhone: boolean;
  windows: OpenWindow[];
  frontId: string | null;
  startOpen: boolean;
  users: number;
  cash: number;
  zoom?: { zoomed: boolean; onToggle: () => void };
  // BlipOS 5 puts Start and the window tabs in the middle (docs/UI_THEME.md > BlipOS versions).
  centred?: boolean;
  // "Your setup" items that show on the tray (docs/UI_THEME.md > The player's setup).
  marks?: { handbook: boolean; fasterPc: boolean };
  onStart: () => void;
  onTab: (w: OpenWindow) => void;
};

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(t);
  }, []);
  return now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// The blue bar along the bottom: Start, a tab per open window, and the tray
// with users, cash and a clock (docs/UI_THEME.md > Desktop).
export default function Taskbar({ isPhone, windows, frontId, startOpen, users, cash, zoom, centred, marks, onStart, onTab }: Props) {
  const clock = useClock();
  const num = isPhone ? shortNumber : fullNumber;

  const start = (
    <button
      type="button"
      onClick={onStart}
      aria-expanded={startOpen}
      aria-haspopup="menu"
      className="os-start flex h-12 shrink-0 items-center gap-2 px-3 text-[18px] font-bold"
    >
      <BlipLogo size={26} />
      Start
    </button>
  );

  return (
    <footer className={`os-taskbar relative z-[1000] flex shrink-0 items-center gap-1 px-1 ${isPhone ? "h-14" : "h-[52px]"}`}>
      {!centred && start}
      <div className={`flex min-w-0 flex-1 gap-1 overflow-x-auto ${centred ? "justify-center" : ""}`} role="group" aria-label="Open windows">
        {centred && start}
        {windows.map((w) => {
          const app = appById(w.id);
          const active = w.id === frontId;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => onTab(w)}
              aria-label={app.name}
              aria-pressed={active}
              className={`os-tab flex h-12 min-w-12 shrink-0 items-center gap-1.5 px-2 text-[18px] ${isPhone ? "" : "max-w-[180px]"}`}
            >
              <AppIcon id={w.id} size={26} />
              {!isPhone && <span className="truncate">{app.name}</span>}
            </button>
          );
        })}
      </div>

      <div className="os-tray flex h-12 shrink-0 items-center gap-2 px-2 text-[18px]" data-tour="trayCounters">
        <span className="flex items-center gap-1" aria-label={`Users: ${fullNumber(users)}`}>
          <UsersIcon />
          <span aria-hidden="true">{num(users)}</span>
        </span>
        <span className="flex items-center gap-1" aria-label={`Cash: £${fullNumber(cash)}`}>
          <CashIcon />
          <span aria-hidden="true">£{num(cash)}</span>
        </span>
        {/* A small book for the Engineering handbook, a lightning mark for the Faster PC. */}
        {!isPhone && marks?.handbook && <ShopIcon id="gear-handbook" size={24} />}
        {!isPhone && marks?.fasterPc && <LightningMark />}
        {!isPhone && <span aria-label={`Time: ${clock}`}>{clock}</span>}
      </div>

      {/* Zoom in or out on the monitor (docs/ROOM.md > During play). */}
      {zoom && (
        <button
          type="button"
          onClick={zoom.onToggle}
          aria-pressed={zoom.zoomed}
          aria-label={zoom.zoomed ? "Zoom out" : "Zoom in"}
          title={zoom.zoomed ? "Zoom out" : "Zoom in"}
          className="os-tray flex h-12 w-12 shrink-0 items-center justify-center"
        >
          <ZoomIcon zoomedIn={zoom.zoomed} />
        </button>
      )}
    </footer>
  );
}

function LightningMark() {
  return (
    <svg width="20" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="shrink-0">
      <path d="M14 2 L5 13.5 H11 L9.5 22 L19 9.5 H13 Z" fill="#F2B632" stroke="#1E1E1E" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
