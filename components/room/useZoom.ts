"use client";

import { useCallback, useEffect, useState } from "react";

// Zoomed in or out on the computer layout (docs/ROOM.md > During play).
// The choice is kept on this device, like a setting. It is not part of the game's save.
const KEY = "blip.zoomed";

export function useZoom() {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    try {
      setZoomed(localStorage.getItem(KEY) === "1");
    } catch {
      // Storage can be blocked. The game still works, zoomed out.
    }
  }, []);

  const toggle = useCallback(() => {
    setZoomed((z) => {
      try {
        localStorage.setItem(KEY, z ? "0" : "1");
      } catch {
        // Not remembered this time. Nothing else changes.
      }
      return !z;
    });
  }, []);

  return { zoomed, toggle };
}
