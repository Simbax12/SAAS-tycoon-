"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AppId } from "@/data/desktopApps";
import WindowBody from "@/components/windows/WindowBody";
import DesktopIcons from "./DesktopIcons";
import StartMenu from "./StartMenu";
import Taskbar from "./Taskbar";
import Wallpaper from "./Wallpaper";
import WindowFrame from "./WindowFrame";
import type { Area, Windows } from "./useWindows";

type Props = {
  isPhone: boolean;
  windows: Windows;
  onStandUp: () => void;
  // "Stand up" sits in the Start menu on a phone and when zoomed in (docs/ROOM.md > During play).
  standUpInMenu: boolean;
  // The tray's zoom button, on the computer layout only.
  zoom?: { zoomed: boolean; onToggle: () => void };
};

// The BlipOS desktop: wallpaper, icons, windows and the taskbar (docs/UI_THEME.md > Desktop).
// It fills whatever box it is given: the monitor's screen box, or the whole phone screen.
export default function Desktop({ isPhone, windows, onStandUp, standUpInMenu, zoom }: Props) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [area, setArea] = useState<Area>({ width: 0, height: 0 });
  const [startOpen, setStartOpen] = useState(false);
  const { windows: open, front } = windows;

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setArea({ width: el.clientWidth, height: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const openApp = useCallback(
    (id: AppId) => {
      setStartOpen(false);
      windows.open(id, area);
    },
    [windows, area],
  );
  const closeStart = useCallback(() => setStartOpen(false), []);

  // On a phone only the front window shows, full screen (docs/UI_THEME.md > Windows).
  const shown = isPhone ? (front ? [front] : []) : open;

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-sky-top text-ink">
      <div ref={areaRef} className="relative min-h-0 flex-1">
        <Wallpaper />
        <div className="absolute inset-0">
          <DesktopIcons isPhone={isPhone} onOpen={openApp} />
        </div>
        {area.width > 0 &&
          shown.map((w) => (
            <WindowFrame
              key={w.id}
              win={w}
              area={area}
              isPhone={isPhone}
              isFront={w.id === front?.id}
              onClose={() => windows.close(w.id)}
              onFocus={() => windows.focus(w.id)}
              onMove={(x, y) => windows.move(w.id, x, y, area)}
            >
              <WindowBody id={w.id} />
            </WindowFrame>
          ))}
        {startOpen && (
          <StartMenu
            isPhone={isPhone}
            showStandUp={standUpInMenu}
            onOpen={openApp}
            onClose={closeStart}
            onStandUp={() => {
              setStartOpen(false);
              onStandUp();
            }}
          />
        )}
      </div>
      <Taskbar
        isPhone={isPhone}
        windows={open}
        frontId={front?.id ?? null}
        startOpen={startOpen}
        users={0}
        cash={0}
        zoom={zoom}
        onStart={() => setStartOpen((v) => !v)}
        onTab={(w) => windows.focus(w.id)}
      />
    </div>
  );
}
