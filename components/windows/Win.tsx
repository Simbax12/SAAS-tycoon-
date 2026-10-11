"use client";

import { useState } from "react";
import { openers } from "@/data/emails";
import { everydayPatterns } from "@/data/patterns";
import { playOrder } from "@/data/playOrder";
import { fullNumber } from "@/components/desktop/format";
import { useGameContext } from "@/components/useGame";
import { isMastered, pipsFor } from "@/game/patternBook";
import { newSeed } from "@/game/rules";
import Diagram from "./Diagram";
import { MayaSays } from "./Incident";

const button = "min-h-12 rounded-md border-2 border-ink px-5 text-[18px] font-bold";

// The win screen (docs/GAME_DESIGN.md > Win screen). Everything on it is worked out from
// results, users, cash, the loan and the top-ups (docs/GAME_LOGIC.md > The end of the game).
export default function Win() {
  const { state, dispatch } = useGameContext();
  const [confirming, setConfirming] = useState(false);
  const results = Object.values(state.results);
  const stars = results.reduce((sum, r) => sum + r.stars, 0);
  const firstTry = results.filter((r) => r.firstTry).length;
  const mastered = everydayPatterns.filter((p) => isMastered(pipsFor(state, p.name))).length;

  if (!state.won) return null;

  const rows: [string, string][] = [
    ["Users", fullNumber(state.users)],
    ["Stars", `${stars} of ${playOrder.length * 3}`],
    ["Solved first try", `${firstTry} of ${playOrder.length}`],
    ["Patterns mastered", `${mastered} of ${everydayPatterns.length}`],
    ["Cash in the bank", `£${fullNumber(state.cash)}`],
    ["Investor top-ups", String(state.topUps)],
    ["Loan still owed", `£${fullNumber(state.loanOwed)}`],
  ];

  return (
    <div className="flex flex-col gap-4 text-[18px]">
      <MayaSays>{openers.win}</MayaSays>
      <Diagram state={state} />
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt>{label}</dt>
            <dd className="text-right font-bold">{value}</dd>
          </div>
        ))}
      </dl>
      {/* "Play again" asks to confirm first, like "Reset game" (docs/GAME_DESIGN.md > Saving). */}
      {confirming ? (
        <div className="flex flex-col items-start gap-3">
          <p>This clears all progress. Are you sure?</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: "reset", seed: newSeed() })}
              className={`${button} bg-[#FBE3E3] hover:bg-[#F6CFCF]`}
            >
              Yes, play again
            </button>
            <button type="button" autoFocus onClick={() => setConfirming(false)} className={`${button} bg-white hover:bg-[#EEF3FD]`}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className={`${button} self-start bg-[#FFE08A] hover:bg-[#FFD35C]`}>
          Play again
        </button>
      )}
    </div>
  );
}
