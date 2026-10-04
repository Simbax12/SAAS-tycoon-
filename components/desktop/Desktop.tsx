"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppId } from "@/data/desktopApps";
import WindowBody from "@/components/windows/WindowBody";
import { useGameContext } from "@/components/useGame";
import { drawnStyle, osForStage } from "@/data/blipOs";
import { appById } from "@/data/desktopApps";
import { itemEffects } from "@/data/upgrades";
import { currentChallenge, currentStage, incidentOpen, usersOnScreen } from "@/game/rules";
import { emailView } from "@/game/emails";
import Balloons from "./Balloons";
import { DesktopContext } from "./DesktopContext";
import DesktopIcons, { type IconBadges } from "./DesktopIcons";
import Guide from "./Guide";
import ServerAlert from "./ServerAlert";
import StartMenu from "./StartMenu";
import Taskbar from "./Taskbar";
import Wallpaper from "./Wallpaper";
import WindowFrame from "./WindowFrame";
import type { Area, Windows } from "./useWindows";

// The Second monitor decides whether these two can be open at once (docs/UPGRADES.md > Your setup).
const PAIR: AppId[] = ["incident", "patternBook"];

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
  const rootRef = useRef<HTMLDivElement>(null);
  // The tutorial replay from Settings. Screen state only, never saved.
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [guiding, setGuiding] = useState(false);
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

  // Without the Second monitor, opening the Incident window or the Pattern Book closes the other.
  // With it, both stay open: side by side on a computer, with tabs on a phone.
  const monitor = state.owned.includes(itemEffects.secondMonitor);
  const openApp = useCallback(
    (id: AppId) => {
      setStartOpen(false);
      const other = PAIR.includes(id) ? PAIR.find((p) => p !== id)! : null;
      const otherOpen = other !== null && windows.windows.some((w) => w.id === other);
      if (otherOpen && !monitor) windows.close(other);
      if (otherOpen && monitor && !isPhone) {
        windows.sideBySide(PAIR[0], PAIR[1], area);
        windows.focus(id);
        return;
      }
      windows.open(id, area);
    },
    [windows, area, monitor, isPhone],
  );
  // "Open in Shop" opens the Shop at one item.
  const [shopFocus, setShopFocus] = useState<{ id: string; n: number } | null>(null);
  const openShopAt = useCallback(
    (itemId: string) => {
      setShopFocus((f) => ({ id: itemId, n: (f?.n ?? 0) + 1 }));
      openApp("shop");
    },
    [openApp],
  );
  const closeStart = useCallback(() => setStartOpen(false), []);
  const startTour = useCallback(() => {
    windows.close("settings");
    setTourStep(1);
  }, [windows]);
  const tools = useMemo(
    () => ({ openApp, reducedMotion, startTour, openShopAt, shopFocus }),
    [openApp, reducedMotion, startTour, openShopAt, shopFocus],
  );

  // The Inbox shows its unread count. The Incident icon shows a red badge while one is waiting.
  const unread = state.emails.filter((e) => !e.read && emailView(e.key)).length;
  const badges: IconBadges = { inbox: unread, incident: incidentOpen(state) ? "dot" : 0 };

  const challenge = currentChallenge(state);
  const alertText = state.phase === "arrived" && challenge?.arrives.by === "alert" ? challenge.arrives.text : null;

  // The desktop shows the BlipOS version for the current stage (docs/UI_THEME.md > The upgrade).
  const os = osForStage(currentStage(state));
  const osVars = {
    "--os-title": os.colours.title,
    "--os-title-end": os.colours.titleEnd,
    "--os-title-text": os.colours.titleText,
    "--os-bar": os.colours.taskbar,
    "--os-bar-text": os.colours.taskbarText,
    "--os-start": os.colours.start,
    "--os-start-text": os.colours.startText,
    "--os-body": os.colours.windowBody,
    "--os-desktop": os.colours.desktop,
  } as React.CSSProperties;

  // On a phone only the front window shows, full screen (docs/UI_THEME.md > Windows).
  const shown = isPhone ? (front ? [front] : []) : open;

  return (
    <DesktopContext.Provider value={tools}>
      <div
        ref={rootRef}
        data-os-style={drawnStyle(os)}
        style={osVars}
        className="absolute inset-0 flex flex-col overflow-hidden bg-[var(--os-desktop)] text-ink"
      >
        <div ref={areaRef} className="relative min-h-0 flex-1">
          <Wallpaper kind={os.wallpaper} />
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
                tabs={isPhone && monitor && PAIR.includes(w.id) && PAIR.every((p) => open.some((o) => o.id === p)) ? (
                  <PairTabs current={w.id} onPick={(id) => windows.focus(id)} />
                ) : undefined}
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
          <Balloons
            emails={state.emails}
            stage={currentStage(state)}
            hidden={guiding}
            onOpen={() => openApp("inbox")}
            onOpenShop={() => openApp("shop")}
          />
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
        <Guide root={rootRef} windows={open} isPhone={isPhone} tourStep={tourStep} onTourStep={setTourStep} onActive={setGuiding} />
      </div>
    </DesktopContext.Provider>
  );
}

// On a phone with the Second monitor, a tab at the top of the Incident window and the Pattern Book
// switches between them without closing either (docs/UI_THEME.md > The player's setup).
function PairTabs({ current, onPick }: { current: AppId; onPick: (id: AppId) => void }) {
  return (
    <div role="tablist" className="flex shrink-0 gap-1 border-b-2 border-ink px-2 pt-2">
      {PAIR.map((id) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={id === current}
          onClick={() => onPick(id)}
          className={`min-h-12 flex-1 rounded-t-md border-2 border-b-0 border-ink px-3 text-[18px] ${
            id === current ? "bg-[var(--os-body)] font-bold" : "bg-[#C9C1A3]"
          }`}
        >
          {appById(id).name}
        </button>
      ))}
    </div>
  );
}
