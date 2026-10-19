"use client";

import { itemEffects, upgradeById } from "@/data/upgrades";
import { patternIcons } from "@/data/patterns";
import { MayaAvatar, PatternIcon, StarIcon, TickIcon } from "@/components/desktop/gameIcons";
import { AppIcon } from "@/components/desktop/icons";
import type { AppId } from "@/data/desktopApps";
import { appById } from "@/data/desktopApps";
import { openHint } from "@/components/desktop/neededApp";
import { useGameContext } from "@/components/useGame";
import type { Stars as StarCount } from "@/game/types";

// Small pieces the Incident window shares with Calls, Solved and the other windows.

export const button = "min-h-12 rounded-md border-2 border-ink px-5 text-[18px] font-bold";

export function Stars({ stars }: { stars: StarCount }) {
  return (
    <span className="flex items-center gap-0.5" role="img" aria-label={`${stars} of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <StarIcon key={n} filled={n <= stars} />
      ))}
    </span>
  );
}

// Maya speaks in a speech bubble of 25 words or fewer (docs/UI_THEME.md > Maya).
export function MayaSays({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <MayaAvatar />
      <p className="relative rounded-2xl border-2 border-maya bg-maya-soft px-4 py-2 text-[18px]">
        <span className="sr-only">Maya: </span>
        {children}
      </p>
    </div>
  );
}

// The Standby server saved this incident's outage (docs/UPGRADES.md > Servers).
export function StandbyLine() {
  const { state } = useGameContext();
  const line = upgradeById(itemEffects.standby)?.maya;
  return state.run.standbySaved && line ? <MayaSays>{line}</MayaSays> : null;
}

// Apps never open by themselves. This says where to open one, with its icon
// (docs/GAME_DESIGN.md > Opening apps). `text` replaces the usual words where the docs give others.
export function OpenAppHint({ id, text }: { id: AppId; text?: string }) {
  return (
    <p className="flex items-center gap-2 self-start rounded-md border-2 border-hint-edge bg-hint px-3 py-2 text-[18px] font-bold text-ink" role="status">
      <AppIcon id={id} size={30} />
      {text ?? openHint(appById(id).name)}
    </p>
  );
}

export function Fixed({ result }: { result: string }) {
  return (
    <p className="flex items-start gap-2 rounded-md border-2 border-ok bg-ok-soft px-3 py-2 text-[18px]" role="status">
      <TickIcon />
      <span>{result}</span>
    </p>
  );
}

export function PatternName({ pattern }: { pattern: string }) {
  const icon = patternIcons[pattern];
  return (
    <p className="flex items-center gap-3 text-[20px] font-bold">
      {icon && <PatternIcon id={icon} size={44} />}
      {pattern}
    </p>
  );
}
