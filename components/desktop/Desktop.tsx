"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppId } from "@/data/desktopApps";
import WindowBody from "@/components/windows/WindowBody";
import { useGameContext } from "@/components/useGame";
import { currentChallenge, incidentOpen, usersOnScreen } from "@/game/rules";
import { emailView } from "@/game/emails";
import Balloons from "./Balloons";
import { DesktopContext } from "./DesktopContext";
import DesktopIcons, { type IconBadges } from "./DesktopIcons";
import ServerAlert from "./ServerAlert";
import StartMenu from "./StartMenu";
import Taskbar from "./Taskbar";
import Wallpaper from "./Wallpaper";
import WindowFrame from "./WindowFrame";
import type { Area, Windows } from "./useWindows";

type Props = {
  isPhone: boolean;
  reducedMotion: boolean;
  windows: Windows;
  onStandUp: () => void;
  // "Stand up" sits in the Start menu on a phone and when zoomed in (docs/ROOM.md > During play).
  standUpInMenu: boolean;
  // The tray's zoom button, on the computer layout only.
  zoom?: { zoomed: boolean; onToggle: () => void };
};

// The BlipOS desktop: wallpaper, icons, windows and the taskbar (docs/UI_THEME.md > Desktop).
// It fills whatever box it is given: the monitor's screen box, or the whole phone screen.
export default function Desktop({ isPhone, reducedMotion, windows, onStandUp, standUpInMenu, zoom }: Props) {
  const { state, dispatch } = useGameContext();
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

  // Once the desktop shows, Maya's first email arrives and the first incident starts
  // (docs/GAME_LOGIC.md > The start of the game). After a reset, the same happens again.
  const begun = state.emails.length > 0;
  useEffect(() => {
    if (!begun) dispatch({ type: "begin" });
  }, [begun, dispatch]);

  const openApp = useCallback(
    (id: AppId) => {
      setStartOpen(false);
      windows.open(id, area);
    },
    [windows, area],
  );
  const closeStart = useCallback(() => setStartOpen(false), []);
  const tools = useMemo(() => ({ openApp, reducedMotion }), [openApp, reducedMotion]);

  // The Inbox shows its unread count. The Incident icon shows a red badge while one is waiting.
  const unread = state.emails.filter((e) => !e.read && emailView(e.key)).length;
  const badges: IconBadges = { inbox: unread, incident: incidentOpen(state) ? "dot" : 0 };

  const challenge = currentChallenge(state);
  const alertText = state.phase === "arrived" && challenge?.arrives.by === "alert" ? challenge.arrives.text : null;

  // On a phone only the front window shows, full screen (docs/UI_THEME.md > Windows).
  const shown = isPhone ? (front ? [front] : []) : open;

  return (
    <DesktopContext.Provider value={tools}>
      <div className="absolute inset-0 flex flex-col overflow-hidden bg-sky-top text-ink">
        <div ref={areaRef} className="relative min-h-0 flex-1">
          <Wallpaper />
          <div className="absolute inset-0">
            <DesktopIcons isPhone={isPhone} badges={badges} onOpen={openApp} />
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
          {area.width > 0 && alertText && (
            <ServerAlert
              key={state.currentId}
              text={alertText}
              area={area}
              isPhone={isPhone}
              onInvestigate={() => {
                dispatch({ type: "investigate" });
                openApp("incident");
              }}
            />
          )}
          <Balloons emails={state.emails} onOpen={() => openApp("inbox")} />
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
          users={usersOnScreen(state)}
          cash={state.cash}
          zoom={zoom}
          onStart={() => setStartOpen((v) => !v)}
          onTab={(w) => windows.focus(w.id)}
        />
      </div>
    </DesktopContext.Provider>
  );
}
