// Copied from docs/UI_THEME.md > Desktop icons. The docs win if the two disagree.

export type AppId =
  | "inbox"
  | "incident"
  | "systemMap"
  | "blueprint"
  | "terminal"
  | "sysdash"
  | "shop"
  | "patternBook"
  | "stats"
  | "howToPlay"
  | "settings"
  | "recycleBin";

export type DesktopApp = {
  id: AppId;
  name: string;
  // The "Opens" column. Shown in the window until the milestone that builds it.
  opens: string;
};

export const desktopApps: DesktopApp[] = [
  { id: "inbox", name: "Inbox", opens: "Every email, newest first, each with its sender badge" },
  { id: "incident", name: "Incident", opens: "The current incident. Shows a red badge when one is waiting" },
  { id: "systemMap", name: "System Map", opens: "The diagram of Blip's architecture. It grows as the game goes on" },
  { id: "blueprint", name: "Blueprint", opens: "The drawing app for Build incidents, and every design the player has finished" },
  { id: "terminal", name: "Terminal", opens: "The log viewer for Triage steps" },
  { id: "sysdash", name: "SysDash", opens: "The live dashboard for Tune steps" },
  { id: "shop", name: "Shop", opens: "The store, in three tabs: Features, Servers, Your setup" },
  { id: "patternBook", name: "Pattern Book", opens: "Every pattern learned, with its \"Use this when\" line and pips" },
  { id: "stats", name: "Stats", opens: "Progress bar to 1 billion, current stage, stars, investor top-ups" },
  { id: "howToPlay", name: "How to Play", opens: "The instructions from GAME_DESIGN.md" },
  { id: "settings", name: "Settings", opens: "Text size, motion, sound, wallpaper, replay tutorial, reset game" },
  { id: "recycleBin", name: "Recycle Bin", opens: "Every wrong option the player tried, with why it failed" },
];

export const appById = (id: AppId): DesktopApp => desktopApps.find((a) => a.id === id)!;
