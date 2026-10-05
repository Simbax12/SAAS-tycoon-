"use client";

import { useEffect, useState } from "react";

// The computer layout needs room around the monitor. Anything smaller gets the phone layout,
// where the desktop fills the screen (docs/ROOM.md > During play).
const COMPUTER_MIN_WIDTH = 768;
const COMPUTER_MIN_HEIGHT = 560;

export type Screen = { width: number; height: number; isPhone: boolean; reducedMotion: boolean };

function read(): Screen {
  const width = window.innerWidth;
  const height = window.innerHeight;
  return {
    width,
    height,
    isPhone: width < COMPUTER_MIN_WIDTH || height < COMPUTER_MIN_HEIGHT,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}

export function useScreen(): Screen | null {
  const [screen, setScreen] = useState<Screen | null>(null);
  useEffect(() => {
    const update = () => setScreen(read());
    update();
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    window.addEventListener("resize", update);
    motion.addEventListener("change", update);
    return () => {
      window.removeEventListener("resize", update);
      motion.removeEventListener("change", update);
    };
  }, []);
  return screen;
}
