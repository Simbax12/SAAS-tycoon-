"use client";

import { useState } from "react";
import { useDesktop } from "@/components/desktop/DesktopContext";
import { useGameContext } from "@/components/useGame";
import { newSeed } from "@/game/rules";

const button = "min-h-12 rounded-md border-2 border-ink px-5 text-[18px] font-bold";

// "Replay tutorial" (docs/GAME_DESIGN.md > Tutorial) and "Reset game" (docs/GAME_DESIGN.md > Saving).
// Text size, motion, sound and wallpaper arrive in later milestones. Reset keeps the settings.
export default function Settings() {
  const { dispatch } = useGameContext();
  const { startTour } = useDesktop();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <div className="flex flex-col items-start gap-3">
        <button type="button" onClick={startTour} className={`${button} bg-white hover:bg-[#EEF3FD]`}>
          Replay tutorial
        </button>
        <button type="button" onClick={() => setConfirming(true)} className={`${button} bg-white hover:bg-[#EEF3FD]`}>
          Reset game
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <p className="text-[18px]">This clears all progress. Are you sure?</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            dispatch({ type: "reset", seed: newSeed() });
            setConfirming(false);
          }}
          className={`${button} bg-[#FBE3E3] hover:bg-[#F6CFCF]`}
        >
          Yes, reset
        </button>
        <button type="button" autoFocus onClick={() => setConfirming(false)} className={`${button} bg-white hover:bg-[#EEF3FD]`}>
          Cancel
        </button>
      </div>
    </div>
  );
}
