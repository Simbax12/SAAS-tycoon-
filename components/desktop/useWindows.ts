"use client";

import { useCallback, useState } from "react";
import type { AppId } from "@/data/desktopApps";

// Which windows are open and where. This is screen state, not game state:
// it is never saved (docs/GAME_LOGIC.md > The game state).

// A window has the usual size unless it was placed side by side with another.
export type OpenWindow = { id: AppId; x: number; y: number; z: number; width?: number; height?: number };

export type Area = { width: number; height: number };

// On a computer a window's width grows with the desktop, from 600 to 760 pixels, and its height
// grows to fit what is inside, up to the bottom of the desktop (docs/UI_THEME.md > Windows).
export const WINDOW_WIDTH = { min: 600, max: 760 };
const WIDTH_SHARE = 0.7;
// A window never shrinks below this, so a nearly empty one still looks like a window.
export const WINDOW_MIN_HEIGHT = 240;

// Blueprint needs room for its tray and canvas side by side, so it opens up to 1000 pixels wide and
// as tall as the desktop. Its height follows the desktop, so zooming in gives it more room.
const OPEN_SIZE: Partial<Record<AppId, { width: number; height: number }>> = {
  blueprint: { width: 1000, height: Infinity },
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
      if (list.some((w) => w.id === id)) return list.map((w) => (w.id === id ? { ...w, z } : w));
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

  const focus = useCallback((id: AppId) => {
    setWindows((list) => {
      const z = topZ(list);
      const w = list.find((v) => v.id === id);
      if (!w || w.z === z) return list;
      return list.map((v) => (v.id === id ? { ...v, z: z + 1 } : v));
    });
  }, []);

  const move = useCallback((id: AppId, x: number, y: number, area: Area) => {
    setWindows((list) => list.map((w) => (w.id === id ? { ...w, ...clampPosition(x, y, area) } : w)));
  }, []);

  // Two windows side by side, each half the desktop wide (docs/UI_THEME.md > The player's setup).
  // The right one comes to the front.
  const sideBySide = useCallback((left: AppId, right: AppId, area: Area) => {
    setWindows((list) => {
      const z = topZ(list);
      const width = Math.floor(area.width / 2);
      const height = area.height;
      const rest = list.filter((w) => w.id !== left && w.id !== right);
      return [...rest, { id: left, x: 0, y: 0, z: z + 1, width, height }, { id: right, x: width, y: 0, z: z + 2, width, height }];
    });
  }, []);

  const front = windows.reduce<OpenWindow | null>((m, w) => (!m || w.z > m.z ? w : m), null);

  return { windows, front, open, close, focus, move, sideBySide };
}

export type Windows = ReturnType<typeof useWindows>;
