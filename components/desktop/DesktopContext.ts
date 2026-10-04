"use client";

import { createContext, useContext } from "react";
import type { AppId } from "@/data/desktopApps";

// What windows need from the desktop around them.
export type DesktopTools = { openApp: (id: AppId) => void; reducedMotion: boolean };

export const DesktopContext = createContext<DesktopTools>({ openApp: () => {}, reducedMotion: false });

export const useDesktop = () => useContext(DesktopContext);
