"use client";

import { useEffect } from "react";
import type { BlipOsVersion } from "@/data/blipOs";
import { stageByNumber, type StageNumber } from "@/data/stages";
import { useGameContext } from "@/components/useGame";
import { fullNumber } from "./format";
import { AppIcon } from "./icons";

// The milestone banner after the BlipOS update (docs/GAME_DESIGN.md > Moving to a new stage, and
// docs/UI_THEME.md > The upgrade). It goes away when tapped, or after 5 seconds.
const SHOW_MS = 5000;

type Props = { os: BlipOsVersion; stage: StageNumber; onDone: () => void; reducedMotion: boolean };

export default function MilestoneBanner({ os, stage, onDone, reducedMotion }: Props) {
  const { state } = useGameContext();
  useEffect(() => {
    const t = setTimeout(onDone, SHOW_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  const { name } = stageByNumber(stage);
  return (
    <div className="absolute inset-x-0 top-0 z-[2100] flex justify-center px-4 pt-[6%]">
      <button
        type="button"
        autoFocus
        onClick={onDone}
        className={`flex w-full max-w-[720px] items-center gap-4 rounded-xl border-2 border-ink px-5 py-4 text-left shadow-[0_8px_24px_rgba(0,0,0,0.45)] ${
          reducedMotion ? "" : "banner-drop"
        }`}
        style={{ background: `linear-gradient(to right, ${os.colours.title}, ${os.colours.titleEnd})`, color: os.colours.titleText }}
        role="status"
      >
        <span className="shrink-0 rounded-full bg-[#F4F0E0] p-2">
          <AppIcon id="win" size={48} />
        </span>
        <span className="flex flex-col">
          <span className="text-[18px]">Milestone reached</span>
          <span className="text-[28px] font-bold leading-tight">
            Stage {stage}: {name}
          </span>
          <span className="text-[20px]">{fullNumber(state.users)} users</span>
        </span>
      </button>
    </div>
  );
}
