"use client";

import { progressMarkers, stageByNumber } from "@/data/stages";
import { fullNumber, shortNumber } from "@/components/desktop/format";
import { useGameContext } from "@/components/useGame";
import { currentStage, progressShare, usersOnScreen } from "@/game/rules";

// The Stats window (docs/UI_THEME.md > Stats): users and the bar to 1 billion, the stage,
// stars so far, and the investor top-ups with the loan still owed.
export default function Stats() {
  const { state } = useGameContext();
  const users = usersOnScreen(state);
  const stage = stageByNumber(currentStage(state));
  const results = Object.values(state.results);
  const stars = results.reduce((sum, r) => sum + r.stars, 0);
  const share = progressShare(users);

  return (
    <div className="flex flex-col gap-5 text-[18px]">
      <section className="flex flex-col gap-2">
        <h3 className="text-[20px] font-bold">Users: {fullNumber(users)}</h3>
        <div
          role="progressbar"
          aria-label="Users, out of 1 billion"
          aria-valuemin={0}
          aria-valuemax={1_000_000_000}
          aria-valuenow={Math.min(users, 1_000_000_000)}
          className="relative h-8 overflow-hidden rounded-md border-2 border-ink bg-white"
        >
          <div className="absolute inset-y-0 left-0 bg-ok" style={{ width: `${share * 100}%` }} />
          {/* Markers between the five equal segments (docs/GAME_DESIGN.md > Progress bar). */}
          {progressMarkers.slice(0, -1).map((m, i) => (
            <div key={m} className="absolute inset-y-0 w-0.5 bg-ink" style={{ left: `${((i + 1) / progressMarkers.length) * 100}%` }} />
          ))}
        </div>
        <div className="grid grid-cols-5 text-right" aria-hidden="true">
          {progressMarkers.map((m) => (
            <span key={m}>{shortNumber(m)}</span>
          ))}
        </div>
      </section>

      <p className="text-[20px] font-bold">
        Stage {stage.stage}: {stage.name}
      </p>

      <p>
        {stars} of {results.length * 3} stars
      </p>

      <div>
        <p>Investor top-ups: {state.topUps}</p>
        <p>Loan owed: £{fullNumber(state.loanOwed)}</p>
      </div>
    </div>
  );
}
