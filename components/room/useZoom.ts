"use client";

import { useCallback, useEffect, useState } from "react";
import type { ZoomView } from "@/components/desktop/Desktop";

// The three views on the computer layout: zoomed out, zoomed in and full screen
// (docs/ROOM.md > During play). The choice is kept on this device, like a setting. It is not part
// of the game's save.
const KEY = "blip.zoomView";
// The older on-or-off setting, read once so a player who was zoomed in stays zoomed in.
const OLD_KEY = "blip.zoomed";
const ORDER: ZoomView[] = ["out", "in", "full"];

export function useZoom() {
  const [view, setView] = useState<ZoomView>("out");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && (ORDER as string[]).includes(saved)) setView(saved as ZoomView);
      else if (localStorage.getItem(OLD_KEY) === "1") setView("in");
    } catch {
      // Storage can be blocked. The game still works, zoomed out.
    }
  }, []);

  // Steps to the next view: out, in, full screen, then back to out.
  const next = useCallback(() => {
    setView((v) => {
      const to = ORDER[(ORDER.indexOf(v) + 1) % ORDER.length];
      try {
        localStorage.setItem(KEY, to);
      } catch {
        // Not remembered this time. Nothing else changes.
      }
      return to;
    });
  }, []);

  return { view, next };
}
