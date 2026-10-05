"use client";

import { challengeById } from "@/data/challenges";
import { everydayPatterns, patternIcons, patternTools } from "@/data/patterns";
import { playOrder } from "@/data/playOrder";
import { PatternIcon, PipIcon } from "@/components/desktop/gameIcons";
import { useGameContext } from "@/components/useGame";
import type { GameState } from "@/game/types";

type Pip = "gold" | "silver" | "empty";

// The Pattern Book is worked out from `results` (docs/GAME_LOGIC.md > Derived values):
// a solved new incident adds its pattern, in play order.
function learned(state: GameState) {
  return playOrder.flatMap((row) => {
    const challenge = challengeById(row.id);
    return challenge && state.results[row.id] ? [challenge.pattern] : [];
  });
}

// docs/GAME_DESIGN.md > Pips and mastery. Pip 1 is always gold. Pips 2 and 3 fill when the
// pattern's two repeats are solved: gold if solved first try, otherwise silver.
function pipsFor(state: GameState, name: string): Pip[] | null {
  const everyday = everydayPatterns.find((p) => p.name === name);
  if (!everyday) return null;
  const repeatPip = (id: string): Pip => {
    const r = state.results[id];
    return !r ? "empty" : r.firstTry ? "gold" : "silver";
  };
  return ["gold", ...everyday.repeats.map(repeatPip)];
}

// Every pattern learned so far (docs/UI_THEME.md > Pattern Book and pattern cards).
// "Also seen as" and "Built in" lines arrive with repeats and Builds in Milestones 5 and 6.
export default function PatternBook() {
  const { state } = useGameContext();
  const patterns = learned(state);

  if (patterns.length === 0) return <p className="text-[18px]">No patterns yet. Fix an incident to learn one.</p>;

  return (
    <ul className="flex flex-col gap-3">
      {patterns.map((p) => {
        const icon = patternIcons[p.name];
        const pips = pipsFor(state, p.name);
        const mastered = pips?.every((x) => x === "gold");
        return (
          <li key={p.name} className="flex items-start gap-3 rounded-lg border-2 border-[#6B3FA0] bg-white px-4 py-3">
            {icon && <PatternIcon id={icon} size={48} />}
            <div className="flex min-w-0 flex-col gap-2">
              <h3 className="text-[20px] font-bold">{p.name}</h3>
              <p className="text-[18px]">{p.useWhen}</p>
              {pips && (
                <p className="flex flex-wrap items-center gap-1 text-[18px]">
                  <span className="sr-only">Pips: {pips.join(", ")}.</span>
                  {pips.map((pip, i) => (
                    <PipIcon key={i} pip={pip} />
                  ))}
                  {mastered && <span className="ml-2 rounded-full bg-[#F2B632] px-2 font-bold">Mastered</span>}
                </p>
              )}
              {patternTools[p.name] && (
                <div className="text-[18px]">
                  <p className="font-bold">Tools you will meet</p>
                  <p>{patternTools[p.name].join(", ")}</p>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
