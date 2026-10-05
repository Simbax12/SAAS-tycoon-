"use client";

import { createContext, useContext } from "react";
import type { AppId } from "@/data/desktopApps";

// What windows need from the desktop around them.
// startTour replays the tutorial from Settings (docs/GAME_DESIGN.md > Tutorial).
// openShopAt opens the Shop at one item, for "Open in Shop" (docs/UPGRADES.md > Request emails).
// shopFocus is that item, with a count that goes up each time so the same item can be shown again.
export type DesktopTools = {
  openApp: (id: AppId) => void;
  reducedMotion: boolean;
  startTour: () => void;
  openShopAt: (itemId: string) => void;
  shopFocus: { id: string; n: number } | null;
};

export const DesktopContext = createContext<DesktopTools>({
  openApp: () => {},
  reducedMotion: false,
  startTour: () => {},
  openShopAt: () => {},
  shopFocus: null,
});

export const useDesktop = () => useContext(DesktopContext);
