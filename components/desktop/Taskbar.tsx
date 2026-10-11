"use client";

import { useEffect, useState } from "react";
import { appById } from "@/data/desktopApps";
import type { ZoomView } from "./Desktop";
import { AppIcon, BlipLogo, CashIcon, OtherScreenIcon, UsersIcon, ZoomIcon } from "./icons";
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
  // The zoom button steps through three views: out, in, full screen (docs/ROOM.md > During play).
  zoom?: { view: ZoomView; onNext: () => void };
  // On a phone with the Second monitor: which screen shows, and a switch (docs/UPGRADES.md > Your setup).
  screens?: { current: 0 | 1; onPick: (screen: 0 | 1) => void };
  // BlipOS 5 puts Start and the window tabs in the middle (docs/UI_THEME.md > BlipOS versions).
  centred?: boolean;
  // "Your setup" items that show on the tray (docs/UI_THEME.md > The player's setup).
  marks?: { handbook: boolean };
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
// What the zoom button does next, from the view showing now.
const zoomNext: Record<ZoomView, { label: string; icon: "in" | "full" | "out" }> = {
  out: { label: "Zoom in", icon: "in" },
  in: { label: "Full screen", icon: "full" },
  full: { label: "Zoom out", icon: "out" },
};

export default function Taskbar({ isPhone, windows, frontId, startOpen, users, cash, zoom, screens, centred, marks, onStart, onTab }: Props) {
  const clock = useClock();
  const num = isPhone ? shortNumber : fullNumber;

  const start = (
    <button
      type="button"
      onClick={onStart}
      aria-expanded={startOpen}
      aria-haspopup="menu"
      data-tour="startButton"
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
              aria-label={w.minimised ? `${app.name}, minimised` : app.name}
              aria-pressed={active}
              className={`os-tab flex h-12 min-w-12 shrink-0 items-center gap-1.5 px-2 text-[18px] ${isPhone ? "" : "max-w-[180px]"} ${
                w.minimised ? "opacity-70" : ""
              }`}
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
        {/* A small book for the Engineering handbook. */}
        {!isPhone && marks?.handbook && <ShopIcon id="gear-handbook" size={24} />}
        {!isPhone && <span aria-label={`Time: ${clock}`}>{clock}</span>}
      </div>

      {/* The phone's screen switch: shows the number of the screen in view. */}
      {screens && (
        <button
          type="button"
          onClick={() => screens.onPick(screens.current === 0 ? 1 : 0)}
          aria-label={`Screen ${screens.current + 1}. Switch to screen ${screens.current === 0 ? 2 : 1}`}
          title={`Screen ${screens.current === 0 ? 2 : 1}`}
          className="os-tray flex h-12 shrink-0 items-center gap-1 px-2 text-[18px] font-bold"
        >
          <OtherScreenIcon />
          {screens.current + 1}
        </button>
      )}

      {/* Zoomed out, zoomed in, full screen (docs/ROOM.md > During play). */}
      {zoom && (
        <button
          type="button"
          onClick={zoom.onNext}
          aria-label={zoomNext[zoom.view].label}
          title={zoomNext[zoom.view].label}
          className="os-tray flex h-12 w-12 shrink-0 items-center justify-center"
        >
          <ZoomIcon next={zoomNext[zoom.view].icon} />
        </button>
      )}
    </footer>
  );
}
