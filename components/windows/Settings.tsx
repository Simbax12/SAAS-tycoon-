"use client";

import { useState } from "react";
import { useGameContext } from "@/components/useGame";
import { newSeed } from "@/game/rules";

const button = "min-h-12 rounded-md border-2 border-ink px-5 text-[18px] font-bold";

// Milestone 2 builds "Reset game" only. The other settings arrive in Milestone 3
// (docs/GAME_DESIGN.md > Saving). Reset clears all progress but keeps the settings.
export default function Settings() {
  const { dispatch } = useGameContext();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={`${button} bg-white hover:bg-[#EEF3FD]`}>
        Reset game
      </button>
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
