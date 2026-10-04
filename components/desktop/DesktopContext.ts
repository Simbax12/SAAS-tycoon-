"use client";

import { createContext, useContext } from "react";
import type { AppId } from "@/data/desktopApps";

// What windows need from the desktop around them.
// startTour replays the tutorial from Settings (docs/GAME_DESIGN.md > Tutorial).
export type DesktopTools = { openApp: (id: AppId) => void; reducedMotion: boolean; startTour: () => void };

export const DesktopContext = createContext<DesktopTools>({ openApp: () => {}, reducedMotion: false, startTour: () => {} });

export const useDesktop = () => useContext(DesktopContext);
