"use client";

import { useEffect, useState } from "react";
import { appById } from "@/data/desktopApps";
import { AppIcon, BlipLogo, CashIcon, UsersIcon, ZoomIcon } from "./icons";
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
export default function Taskbar({ isPhone, windows, frontId, startOpen, users, cash, zoom, onStart, onTab }: Props) {
  const clock = useClock();
  const num = isPhone ? shortNumber : fullNumber;

  return (
    <footer className={`relative z-[1000] flex shrink-0 items-center gap-1 bg-bar px-1 text-white ${isPhone ? "h-14" : "h-[52px]"}`}>
      <button
        type="button"
        onClick={onStart}
        aria-expanded={startOpen}
        aria-haspopup="menu"
        className="flex h-12 shrink-0 items-center gap-2 rounded-r-2xl rounded-l-md bg-start px-3 text-[18px] font-bold shadow-[inset_0_-3px_0_rgba(0,0,0,0.25)] hover:brightness-110"
      >
        <BlipLogo size={26} />
        Start
      </button>

      <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto" role="group" aria-label="Open windows">
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
              className={`flex h-12 min-w-12 shrink-0 items-center gap-1.5 rounded-md px-2 text-[18px] ${
                active ? "bg-[#1A3F96] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]" : "bg-[#3B6FDE] hover:bg-[#4A7BE6]"
              } ${isPhone ? "" : "max-w-[180px]"}`}
            >
              <AppIcon id={w.id} size={26} />
              {!isPhone && <span className="truncate">{app.name}</span>}
            </button>
          );
        })}
      </div>

      <div className="flex h-12 shrink-0 items-center gap-2 rounded-md bg-[#1E4BB0] px-2 text-[18px]" data-tour="trayCounters">
        <span className="flex items-center gap-1" aria-label={`Users: ${fullNumber(users)}`}>
          <UsersIcon />
          <span aria-hidden="true">{num(users)}</span>
        </span>
        <span className="flex items-center gap-1" aria-label={`Cash: £${fullNumber(cash)}`}>
          <CashIcon />
          <span aria-hidden="true">£{num(cash)}</span>
        </span>
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
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#1E4BB0] hover:bg-[#2A5FD0]"
        >
          <ZoomIcon zoomedIn={zoom.zoomed} />
        </button>
      )}
    </footer>
  );
}
