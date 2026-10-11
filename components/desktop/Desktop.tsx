"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppId } from "@/data/desktopApps";
import WindowBody from "@/components/windows/WindowBody";
import { useGameContext } from "@/components/useGame";
import { osForStage, wallpaperFor } from "@/data/blipOs";
import { appById, desktopApps, otherWindows } from "@/data/desktopApps";
import { itemEffects } from "@/data/upgrades";
import { currentIncident, currentStage, incidentOpen, usersOnScreen } from "@/game/rules";
import { emailView } from "@/game/emails";
import Balloons from "./Balloons";
import { DesktopContext } from "./DesktopContext";
import DesktopIcons, { type IconBadges } from "./DesktopIcons";
import Guide from "./Guide";
import { AppIcon } from "./icons";
import { neededApp, openHint } from "./neededApp";
import ServerAlert from "./ServerAlert";
import StartMenu from "./StartMenu";
import Taskbar from "./Taskbar";
import Wallpaper from "./Wallpaper";
import WindowFrame from "./WindowFrame";
import { type Area, type OpenWindow, type Windows, windowWidth } from "./useWindows";

// Without the Second monitor, these two cannot be open at once (docs/UPGRADES.md > Your setup).
const PAIR: AppId[] = ["incident", "patternBook"];

// The bezel between the two screens, in pixels (docs/UI_THEME.md > The player's setup).
const BEZEL = 14;

export type ZoomView = "out" | "in" | "full";

type Props = {
  isPhone: boolean;
  reducedMotion: boolean;
  windows: Windows;
  // While BlipOS updates, balloons and tips wait.
  paused: boolean;
  onStandUp: () => void;
  // "Stand up" sits in the Start menu on a phone and when zoomed in (docs/ROOM.md > During play).
  standUpInMenu: boolean;
  // The tray's zoom button, on the computer layout only. `view` is the view showing now.
  zoom?: { view: ZoomView; onNext: () => void };
  // The Second monitor's screen shows beside the main one (computer layout, zoomed in or full screen).
  dual: boolean;
};

// The BlipOS desktop: wallpaper, icons, windows and the taskbar (docs/UI_THEME.md > Desktop).
// It fills whatever box it is given: the monitor's screen box, both screens, or the whole phone screen.
export default function Desktop({ isPhone, reducedMotion, windows, paused, onStandUp, standUpInMenu, zoom, dual }: Props) {
  const { state, dispatch } = useGameContext();
  const areaRef = useRef<HTMLDivElement>(null);
  const area2Ref = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // The tutorial replay from Settings. Screen state only, never saved.
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [guiding, setGuiding] = useState(false);
  const [area, setArea] = useState<Area>({ width: 0, height: 0 });
  const [area2, setArea2] = useState<Area>({ width: 0, height: 0 });
  const [startOpen, setStartOpen] = useState(false);
  const { windows: open } = windows;

  useEffect(() => {
    const watch = (el: HTMLDivElement | null, set: (a: Area) => void) => {
      if (!el) return undefined;
      const ro = new ResizeObserver(() => set({ width: el.clientWidth, height: el.clientHeight }));
      ro.observe(el);
      return ro;
    };
    const a = watch(areaRef.current, setArea);
    const b = watch(area2Ref.current, setArea2);
    return () => {
      a?.disconnect();
      b?.disconnect();
    };
  }, [dual]);

  // Once the desktop shows, Maya's first email arrives and the first incident starts
  // (docs/GAME_LOGIC.md > The start of the game). After a reset, the same happens again.
  const begun = state.emails.length > 0;
  useEffect(() => {
    if (!begun) dispatch({ type: "begin" });
  }, [begun, dispatch]);

  // The Second monitor: on a computer its screen shows when zoomed in or full screen; on a phone a
  // switch in the taskbar changes screen (docs/UPGRADES.md > Your setup).
  const monitor = state.owned.includes(itemEffects.secondMonitor);
  const [phoneScreen, setPhoneScreen] = useState<0 | 1>(0);
  const screenOf = useCallback(
    (w: OpenWindow): 0 | 1 => ((isPhone ? monitor : dual) ? (w.screen ?? 0) : 0),
    [isPhone, monitor, dual],
  );

  const openApp = useCallback(
    (id: AppId) => {
      setStartOpen(false);
      // Without the Second monitor, opening the Incident window or the Pattern Book closes the other.
      const other = PAIR.includes(id) ? PAIR.find((p) => p !== id)! : null;
      if (other && !monitor && windows.windows.some((w) => w.id === other)) windows.close(other);
      const already = windows.windows.find((w) => w.id === id);
      windows.open(id, area);
      if (!isPhone) return;
      // On a phone, a window open on the other screen brings that screen into view, and a new
      // window opens on the screen in view.
      if (already) setPhoneScreen(screenOf(already));
      else if (monitor && phoneScreen === 1) windows.toScreen(id, 1, 0, 0, area);
    },
    [windows, area, monitor, isPhone, screenOf, phoneScreen],
  );
  // Apps never open by themselves (docs/GAME_DESIGN.md > Opening apps). "Find in Shop" asks the
  // player to open the Shop, which then opens at that item.
  const [shopFocus, setShopFocus] = useState<{ id: string; n: number } | null>(null);
  const [shopWanted, setShopWanted] = useState(false);
  const openShopAt = useCallback((itemId: string) => {
    setShopFocus((f) => ({ id: itemId, n: (f?.n ?? 0) + 1 }));
    setShopWanted(true);
  }, []);
  const isShowing = (id: AppId) => open.some((w) => w.id === id && !w.minimised);
  const shopShowing = isShowing("shop");
  useEffect(() => {
    if (shopShowing) setShopWanted(false);
  }, [shopShowing]);
  // "Investigate" starts the incident. The step's app is then pointed to, not opened.
  const investigate = useCallback(() => dispatch({ type: "investigate" }), [dispatch]);
  // "Play again" starts a fresh game, so every window from the old one closes (docs/GAME_DESIGN.md > Win screen).
  const wonBefore = useRef(state.won);
  useEffect(() => {
    if (wonBefore.current && !state.won) windows.windows.forEach((w) => windows.close(w.id));
    wonBefore.current = state.won;
  }, [state.won, windows]);

  // The app the player should open now. Its icon and Start menu row pulse until it shows.
  const needed = neededApp(state) ?? (shopWanted ? "shop" : null);
  const pointTo = needed && !isShowing(needed) ? needed : null;
  // The win screen has no icon until the game is won (docs/GAME_DESIGN.md > Win screen).
  const apps = state.won ? [...desktopApps, ...otherWindows] : desktopApps;
  const closeStart = useCallback(() => setStartOpen(false), []);
  const startTour = useCallback(() => {
    windows.close("settings");
    setTourStep(1);
  }, [windows]);
  const tools = useMemo(
    () => ({ openApp, investigate, reducedMotion, startTour, openShopAt, shopFocus }),
    [openApp, investigate, reducedMotion, startTour, openShopAt, shopFocus],
  );

  // The Inbox shows its unread count. The Incident icon shows a red badge while one is waiting.
  const unread = state.emails.filter((e) => !e.read && emailView(e.key)).length;
  const badges: IconBadges = { inbox: unread, incident: incidentOpen(state) ? "dot" : 0 };

  const incident = currentIncident(state);
  const alertText = state.phase === "arrived" && incident?.arrives.by === "alert" ? incident.arrives.text : null;

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
  const wallpaper = wallpaperFor(os, state.settings.wallpaper, state.owned.includes(itemEffects.wallpapers));

  // Which windows show where. Minimised windows keep only their taskbar tab.
  // On a phone only the front window of the screen in view shows, full screen (docs/UI_THEME.md > Windows).
  const onScreen = (screen: 0 | 1) => open.filter((w) => !w.minimised && screenOf(w) === screen);
  const phoneFront = onScreen(phoneScreen).reduce<OpenWindow | null>((m, w) => (!m || w.z > m.z ? w : m), null);
  const shownMain = isPhone ? (phoneFront ? [phoneFront] : []) : onScreen(0);
  const shownSecond = dual ? onScreen(1) : [];
  const frontId = isPhone ? (phoneFront?.id ?? null) : (windows.front?.id ?? null);

  // A window dragged more than half past the edge between the screens moves across.
  const moveWindow = (w: OpenWindow, screen: 0 | 1, x: number, y: number) => {
    const here = screen === 0 ? area : area2;
    const width = Math.min(w.width ?? windowWidth(here), here.width);
    if (dual && screen === 0 && x > area.width - width / 2) windows.toScreen(w.id, 1, x - area.width - BEZEL, y, area2);
    else if (dual && screen === 1 && x < -width / 2) windows.toScreen(w.id, 0, area.width + BEZEL + x, y, area);
    else windows.move(w.id, x, y, here);
  };
  // "Move to other screen" (docs/UI_THEME.md > Windows).
  const otherScreen = (w: OpenWindow, screen: 0 | 1) => {
    const to = screen === 0 ? 1 : 0;
    if (isPhone) {
      windows.toScreen(w.id, to, 0, 0, area);
      setPhoneScreen(to);
    } else windows.toScreen(w.id, to, w.x, w.y, to === 1 ? area2 : area);
  };

  const frame = (w: OpenWindow, screen: 0 | 1, here: Area) => (
    <WindowFrame
      key={w.id}
      win={w}
      area={here}
      isPhone={isPhone}
      onClose={() => windows.close(w.id)}
      onFocus={() => windows.focus(w.id)}
      onMove={(x, y) => moveWindow(w, screen, x, y)}
      onMinimise={() => windows.minimise(w.id)}
      onMaximise={() => windows.toggleMaximise(w.id)}
      onOtherScreen={(isPhone ? monitor : dual) ? () => otherScreen(w, screen) : undefined}
    >
      <WindowBody id={w.id} />
    </WindowFrame>
  );

  // On a phone with the Second monitor, the second screen uses the same box, with no icons.
  const phoneSecond = isPhone && monitor && phoneScreen === 1;

  return (
    <DesktopContext.Provider value={tools}>
      <div
        ref={rootRef}
        data-os-style={os.style}
        style={osVars}
        className="absolute inset-0 flex overflow-hidden bg-[#111111] text-ink"
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <div ref={areaRef} className="relative min-h-0 flex-1 bg-[var(--os-desktop)]">
            <Wallpaper kind={wallpaper} />
            {!phoneSecond && (
              <div className="absolute inset-0">
                <DesktopIcons apps={apps} isPhone={isPhone} badges={badges} pulse={pointTo} reducedMotion={reducedMotion} onOpen={openApp} />
              </div>
            )}
            {area.width > 0 && shownMain.map((w) => frame(w, isPhone ? phoneScreen : 0, area))}
            {/* An alert waits until the BlipOS update and the milestone banner have gone. */}
            {area.width > 0 && alertText && !paused && (
              <ServerAlert key={state.currentId} text={alertText} area={area} isPhone={isPhone} onInvestigate={investigate} />
            )}
            <Balloons
              emails={state.emails}
              stage={currentStage(state)}
              hidden={guiding}
              waiting={paused}
              onOpen={() => openApp("inbox")}
              onOpenShop={() => openApp("shop")}
            />
            {pointTo && !paused && !startOpen && (
              <p
                className="pointer-events-none absolute bottom-3 left-1/2 z-[999] flex w-max max-w-[calc(100%-24px)] -translate-x-1/2 items-center gap-2 rounded-full border-2 border-ink bg-[#FFF3C4] px-4 py-2 text-[18px] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                role="status"
              >
                <AppIcon id={pointTo} size={28} />
                {openHint(appById(pointTo).name)}
              </p>
            )}
            {startOpen && (
              <StartMenu
                apps={apps}
                pulse={pointTo}
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
            frontId={frontId}
            startOpen={startOpen}
            users={usersOnScreen(state)}
            cash={state.cash}
            zoom={zoom}
            centred={os.style === "flat"}
            marks={{ handbook: state.owned.includes(itemEffects.freeFirstCall) }}
            screens={isPhone && monitor ? { current: phoneScreen, onPick: setPhoneScreen } : undefined}
            onStart={() => setStartOpen((v) => !v)}
            onTab={(w) => {
              if (isPhone) setPhoneScreen(screenOf(w));
              windows.focus(w.id);
            }}
          />
        </div>
        {dual && (
          <>
            <div className="shrink-0 bg-[#111111]" style={{ width: BEZEL }} aria-hidden="true" />
            <div ref={area2Ref} className="relative min-w-0 flex-1 bg-[var(--os-desktop)]" role="region" aria-label="Second screen">
              <Wallpaper kind={wallpaper} />
              {area2.width > 0 && shownSecond.map((w) => frame(w, 1, area2))}
            </div>
          </>
        )}
        {!paused && (
          <Guide
            root={rootRef}
            windows={open.filter((w) => !w.minimised)}
            isPhone={isPhone}
            tourStep={tourStep}
            onTourStep={setTourStep}
            onActive={setGuiding}
          />
        )}
      </div>
    </DesktopContext.Provider>
  );
}
