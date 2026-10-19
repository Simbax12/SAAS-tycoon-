"use client";

import { isBuild, isRepeat } from "@/data/incidents";
import { patternIcons } from "@/data/patterns";
import { PatternIcon } from "@/components/desktop/gameIcons";
import { fullNumber } from "@/components/desktop/format";
import { ShopIcon } from "@/components/desktop/shopIcons";
import { useGameContext } from "@/components/useGame";
import { alsoSeenAs, pipsFor } from "@/game/patternBook";
import { computerNeeded, currentIncident, incidentPay } from "@/game/rules";
import { button, Fixed, OpenAppHint, PatternName, Stars } from "./incidentBits";
import { AlsoSeenAs, Pips } from "./PatternBook";

// What was learned or strengthened and earned, then Next. A new incident adds a Pattern Book
// entry. A repeat shows the "Seen before" stamp, fills a pip and adds its "Also seen as" line.
export function Solved({ result }: { result: string }) {
  const { state, dispatch } = useGameContext();
  const incident = currentIncident(state)!;
  const stars = state.results[incident.id].stars;

  return (
    <>
      <Fixed result={result} />

      {isBuild(incident) ? (
        // Each pattern the Build practises gains a "Built in" line in the Pattern Book.
        <ul className="flex flex-col gap-2 rounded-lg border-2 border-pattern bg-paper px-4 py-3">
          {incident.practises.map((p) => (
            <li key={p}>
              <PatternName pattern={p} />
            </li>
          ))}
        </ul>
      ) : isRepeat(incident) ? (
        <Practised pattern={incident.pattern} />
      ) : (
        <div className="flex items-start gap-3 rounded-lg border-2 border-pattern bg-paper px-4 py-3">
          {patternIcons[incident.pattern.name] && <PatternIcon id={patternIcons[incident.pattern.name]} size={44} />}
          <div>
            <p className="text-[18px] font-bold">Pattern learned: {incident.pattern.name}</p>
            <p className="text-[18px]">{incident.pattern.useWhen}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[20px] font-bold">
        <span>+{fullNumber(incident.usersGained)} users</span>
        <span>+£{fullNumber(incidentPay(state))}</span>
        <Stars stars={stars} />
      </div>

      {/* Once the game is won, the win screen shows instead of Next (docs/GAME_DESIGN.md > Win screen).
          At the end of a stage, Next waits for the new computer (docs/GAME_DESIGN.md > Moving to a new stage). */}
      {state.won ? (
        <OpenAppHint id="win" />
      ) : computerNeeded(state) ? (
        <p className="flex items-center gap-2 text-[18px] font-bold" role="status">
          <ShopIcon id={computerNeeded(state)!.id} size={32} />
          Buy the new computer in the Shop.
        </p>
      ) : (
        <button type="button" autoFocus onClick={() => dispatch({ type: "next" })} className={`${button} self-start bg-action hover:bg-action-hover`}>
          Next
        </button>
      )}
    </>
  );
}

// The pattern a repeat strengthened, with the "Seen before" stamp, its pips and "Also seen as" lines
// (docs/GAME_DESIGN.md > Repeat incident flow: recall, not recognition).
function Practised({ pattern }: { pattern: string }) {
  const { state } = useGameContext();
  const pips = pipsFor(state, pattern);
  return (
    <div className="flex flex-col gap-2 rounded-lg border-2 border-pattern bg-paper px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PatternName pattern={pattern} />
        <span className="seen-stamp shrink-0 rounded-md border-4 border-pattern bg-paper px-3 py-1 text-[20px] font-bold text-pattern-ink">
          Seen before
        </span>
      </div>
      {pips && <Pips pips={pips} />}
      <AlsoSeenAs lines={alsoSeenAs(state, pattern)} />
    </div>
  );
}
