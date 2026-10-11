// The app the current step happens in (docs/GAME_DESIGN.md > Opening apps). Apps never open by
// themselves: while this app is not open, its icon pulses and the desktop says where to find it.

import type { AppId } from "@/data/desktopApps";
import { currentBuild } from "@/game/rules";
import type { GameState } from "@/game/types";

export function neededApp(state: GameState): AppId | null {
  if (state.won) return "win";
  if (state.phase === "triage") return "terminal";
  if (state.phase === "tune") return "sysdash";
  if (state.phase === "choosing" || state.phase === "guided") return currentBuild(state) ? "blueprint" : "incident";
  return null;
}

// "Open Terminal from the desktop or the Start menu." The app's name comes from data/desktopApps.ts.
export const openHint = (name: string) => `Open ${name} from the desktop or the Start menu.`;
