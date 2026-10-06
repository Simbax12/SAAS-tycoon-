"use client";

import { useState } from "react";
import { packWallpapers } from "@/data/blipOs";
import { itemEffects } from "@/data/upgrades";
import { useDesktop } from "@/components/desktop/DesktopContext";
import { useGameContext } from "@/components/useGame";
import { newSeed } from "@/game/rules";

const button = "min-h-12 rounded-md border-2 border-ink px-5 text-[18px] font-bold";

// "Replay tutorial" (docs/GAME_DESIGN.md > Tutorial) and "Reset game" (docs/GAME_DESIGN.md > Saving).
// With the Wallpaper pack, a choice of wallpaper (docs/UPGRADES.md > Your setup).
// Text size, motion and sound arrive in later milestones. Reset keeps the settings.
export default function Settings() {
  const { state, dispatch } = useGameContext();
  const { startTour } = useDesktop();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <div className="flex flex-col items-start gap-3">
        {state.owned.includes(itemEffects.wallpapers) && <WallpaperPicker />}
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

// "Standard" is the wallpaper of the BlipOS version. The pack adds three more.
function WallpaperPicker() {
  const { state, dispatch } = useGameContext();
  const choices = [{ id: "standard", name: "Standard" }, ...packWallpapers];
  const current = choices.some((c) => c.id === state.settings.wallpaper) ? state.settings.wallpaper : "standard";
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-[18px] font-bold">Wallpaper</legend>
      <div className="flex flex-wrap gap-2">
        {choices.map((c) => (
          <label
            key={c.id}
            className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-md border-2 px-3 text-[18px] ${
              current === c.id ? "border-ink bg-[#FFE08A] font-bold" : "border-[#8A8A8A] bg-white"
            }`}
          >
            <input
              type="radio"
              name="wallpaper"
              value={c.id}
              checked={current === c.id}
              onChange={() => dispatch({ type: "setting", settings: { wallpaper: c.id } })}
              className="h-5 w-5"
            />
            {c.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
