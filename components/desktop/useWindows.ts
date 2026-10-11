"use client";

import { useCallback, useState } from "react";
import type { AppId } from "@/data/desktopApps";

// Which windows are open and where. This is screen state, not game state:
// it is never saved (docs/GAME_LOGIC.md > The game state).

// A window has the usual size unless it opens larger (OPEN_SIZE).
// minimised: hidden, with its tab still in the taskbar. maximised: fills its screen above the taskbar.
// screen: 0 is the main screen, 1 the Second monitor's screen (docs/UPGRADES.md > Your setup).
export type OpenWindow = {
  id: AppId;
  x: number;
  y: number;
  z: number;
  width?: number;
  height?: number;
  minimised?: boolean;
  maximised?: boolean;
  screen?: 0 | 1;
};

export type Area = { width: number; height: number };

// On a computer a window's width grows with the desktop, from 600 to 760 pixels, and its height
// grows to fit what is inside, up to the bottom of the desktop (docs/UI_THEME.md > Windows).
export const WINDOW_WIDTH = { min: 600, max: 760 };
const WIDTH_SHARE = 0.7;
// A window never shrinks below this, so a nearly empty one still looks like a window.
export const WINDOW_MIN_HEIGHT = 240;

// Blueprint needs room for its tray and canvas side by side, so it opens up to 1000 pixels wide and
// as tall as the desktop. Its height follows the desktop, so zooming in gives it more room.
// The System Map and the win screen grow wide by Stage 4, so they open up to 1000 pixels wide and
// grow to fit what is inside.
const OPEN_SIZE: Partial<Record<AppId, { width: number; height?: number }>> = {
  blueprint: { width: 1000, height: Infinity },
  systemMap: { width: 1000 },
  // Terminal's lesson and prompt sit side by side.
  terminal: { width: 1000 },
  win: { width: 1000 },
};
const CASCADE = 32;
const EDGE = 8;

// A window may hang off the desktop, but its title bar must stay in reach.
const KEEP_VISIBLE = 96;

export const windowWidth = (area: Area) =>
  Math.min(Math.min(WINDOW_WIDTH.max, Math.max(WINDOW_WIDTH.min, area.width * WIDTH_SHARE)), area.width - EDGE * 2);

export function clampPosition(x: number, y: number, area: Area) {
  const width = windowWidth(area);
  return {
    x: Math.min(Math.max(x, KEEP_VISIBLE - width), area.width - KEEP_VISIBLE),
    y: Math.min(Math.max(y, 0), area.height - 48),
  };
}

export function useWindows() {
  const [windows, setWindows] = useState<OpenWindow[]>([]);

  const topZ = (list: OpenWindow[]) => list.reduce((m, w) => Math.max(m, w.z), 0);

  const open = useCallback((id: AppId, area: Area) => {
    setWindows((list) => {
      const z = topZ(list) + 1;
      // Opening a window that is already open brings it back and to the front.
      if (list.some((w) => w.id === id)) return list.map((w) => (w.id === id ? { ...w, z, minimised: false } : w));
      // Each new window sits a little lower and further right than the last.
      const size = OPEN_SIZE[id];
      if (size) {
        const width = Math.min(size.width, area.width);
        return [...list, { id, x: Math.max(0, (area.width - width) / 2), y: 0, z, width, height: size.height }];
      }
      const step = (list.length % 5) * CASCADE;
      return [...list, { id, ...clampPosition(EDGE + step, EDGE + step, area), z }];
    });
  }, []);

  const close = useCallback((id: AppId) => {
    setWindows((list) => list.filter((w) => w.id !== id));
  }, []);

  // Brings a window to the front, and back from minimised.
  const focus = useCallback((id: AppId) => {
    setWindows((list) => {
      const z = topZ(list);
      const w = list.find((v) => v.id === id);
      if (!w || (w.z === z && !w.minimised)) return list;
      return list.map((v) => (v.id === id ? { ...v, z: w.z === z ? z : z + 1, minimised: false } : v));
    });
  }, []);

  // docs/UI_THEME.md > Windows: minimise hides a window and keeps its tab. Maximise fills the screen.
  const minimise = useCallback((id: AppId) => {
    setWindows((list) => list.map((w) => (w.id === id ? { ...w, minimised: true } : w)));
  }, []);
  const toggleMaximise = useCallback((id: AppId) => {
    setWindows((list) => list.map((w) => (w.id === id ? { ...w, maximised: !w.maximised } : w)));
  }, []);

  // Moves a window to the other screen, at a place on that screen.
  const toScreen = useCallback((id: AppId, screen: 0 | 1, x: number, y: number, area: Area) => {
    setWindows((list) => {
      const z = topZ(list) + 1;
      return list.map((w) => (w.id === id ? { ...w, screen, z, ...clampPosition(x, y, area) } : w));
    });
  }, []);

  const move = useCallback((id: AppId, x: number, y: number, area: Area) => {
    setWindows((list) => list.map((w) => (w.id === id ? { ...w, ...clampPosition(x, y, area) } : w)));
  }, []);

  // The front window that is not minimised.
  const front = windows.reduce<OpenWindow | null>((m, w) => (w.minimised ? m : !m || w.z > m.z ? w : m), null);

  return { windows, front, open, close, focus, move, minimise, toggleMaximise, toScreen };
}

export type Windows = ReturnType<typeof useWindows>;
