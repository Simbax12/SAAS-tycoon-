// Copied from docs/UI_THEME.md > BlipOS versions and > Version colours. The docs win if the two disagree.

import type { StageNumber } from "./stages";

// How a version draws its windows and taskbar.
// classic: square, grey, raised 3D edges (1995 and 1998). rounded: the early 2000s look.
// glass (2009) and flat (today) are drawn when their stages are built. Until then they use "rounded".
export type OsStyle = "classic" | "rounded" | "glass" | "flat";

// The Wallpaper pack's three extra wallpapers (docs/UI_THEME.md > The player's setup).
export const packWallpapers = [
  { id: "sunset", name: "Sunset hill" },
  { id: "night", name: "Night sky" },
  { id: "snow", name: "Snowy hill" },
] as const;

export type WallpaperId = "plain" | "hill" | (typeof packWallpapers)[number]["id"];

// The setting is "standard" for the version's own wallpaper, or a pack wallpaper's id.
// A pack wallpaper only shows while the pack is owned, because a reset keeps the settings.
export function wallpaperFor(version: BlipOsVersion, setting: string, packOwned: boolean): WallpaperId {
  const pack = packWallpapers.find((w) => w.id === setting);
  return pack && packOwned ? pack.id : version.wallpaper;
}

export type BlipOsVersion = {
  version: StageNumber;
  stage: StageNumber;
  style: OsStyle;
  wallpaper: "plain" | "hill";
  colours: {
    title: string;
    titleEnd: string;
    titleText: string;
    taskbar: string;
    taskbarText: string;
    start: string;
    startText: string;
    windowBody: string;
    desktop: string;
  };
};

export const blipOsVersions: BlipOsVersion[] = [
  {
    version: 1,
    stage: 1,
    style: "classic",
    wallpaper: "plain",
    colours: { title: "#1B2A80", titleEnd: "#1B2A80", titleText: "#FFFFFF", taskbar: "#C3C0B6", taskbarText: "#1E1E1E", start: "#C3C0B6", startText: "#1E1E1E", windowBody: "#E0DDD6", desktop: "#2B7F7A" },
  },
  {
    version: 2,
    stage: 2,
    style: "classic",
    wallpaper: "hill",
    colours: { title: "#1B2A80", titleEnd: "#3A6EA5", titleText: "#FFFFFF", taskbar: "#C3C0B6", taskbarText: "#1E1E1E", start: "#C3C0B6", startText: "#1E1E1E", windowBody: "#E0DDD6", desktop: "#4A9DE0" },
  },
  {
    version: 3,
    stage: 3,
    style: "rounded",
    wallpaper: "hill",
    colours: { title: "#2A5FD0", titleEnd: "#2A5FD0", titleText: "#FFFFFF", taskbar: "#2A5FD0", taskbarText: "#FFFFFF", start: "#2E7D32", startText: "#FFFFFF", windowBody: "#F4F0E0", desktop: "#4A9DE0" },
  },
  {
    version: 4,
    stage: 4,
    style: "glass",
    wallpaper: "hill",
    colours: { title: "#1F2A38", titleEnd: "#2C3E55", titleText: "#FFFFFF", taskbar: "#18212C", taskbarText: "#FFFFFF", start: "#2A5FD0", startText: "#FFFFFF", windowBody: "#F4F0E0", desktop: "#13294B" },
  },
  {
    version: 5,
    stage: 5,
    style: "flat",
    wallpaper: "hill",
    colours: { title: "#E4E1D8", titleEnd: "#E4E1D8", titleText: "#1E1E1E", taskbar: "#EDEAE2", taskbarText: "#1E1E1E", start: "#2A5FD0", startText: "#FFFFFF", windowBody: "#F4F0E0", desktop: "#9EC5E8" },
  },
];

// The desktop shows the version for the current stage (docs/UI_THEME.md > The upgrade).
export const osForStage = (stage: StageNumber): BlipOsVersion => blipOsVersions.find((v) => v.stage === stage)!;

// The CSS look actually drawn. Glass and flat arrive with Stages 4 and 5.
export const drawnStyle = (v: BlipOsVersion): "classic" | "rounded" => (v.style === "classic" ? "classic" : "rounded");
