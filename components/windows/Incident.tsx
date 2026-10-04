"use client";

import { thanksText } from "@/data/emails";
import { patternIcons } from "@/data/patterns";
import { CrossIcon, MayaAvatar, PatternIcon, StarIcon, TickIcon, WarningIcon } from "@/components/desktop/gameIcons";
import { fullNumber } from "@/components/desktop/format";
import { useGameContext } from "@/components/useGame";
import { currentChallenge, currentRow, nextIncident, payFor, shuffled } from "@/game/rules";
import type { Stars as StarCount } from "@/game/types";
import Diagram from "./Diagram";

const button = "min-h-12 rounded-md border-2 border-ink px-5 text-[18px] font-bold";

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
      <p className="relative rounded-2xl border-2 border-[#2E7D32] bg-[#EAF5E4] px-4 py-2 text-[18px]">
        <span className="sr-only">Maya: </span>
        {children}
      </p>
    </div>
  );
}

// The current incident, following docs/GAME_DESIGN.md > New incident flow: teach before testing.
export default function Incident() {
  const { state, dispatch } = useGameContext();
  const challenge = currentChallenge(state);
  const row = currentRow(state);
  const { phase, run } = state;

  if (!challenge || !row || phase === "waiting") {
    return <p className="text-[18px]">No incident right now.</p>;
  }

  const best = challenge.options.find((o) => o.type === "best")!;
  const showing = shuffled(challenge.options, state.seed, challenge.id).filter((o) => !run.removed.includes(o.id));
  const lastTried = challenge.options.find((o) => o.id === run.tried[run.tried.length - 1]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[20px] font-bold">{challenge.title}</h3>
        <Stars stars={phase === "solved" ? state.results[challenge.id]?.stars ?? run.stars : run.stars} />
      </div>

      <Diagram state={state} />

      {run.dip > 0 && (
        <p className="flex items-center gap-2 rounded-md border-2 border-alert bg-[#FBE3E3] px-3 py-2 text-[18px]">
          <WarningIcon />
          Outage: {fullNumber(run.dip)} users lost until fixed.
        </p>
      )}

      {phase === "arrived" && (
        <>
          <p className="text-[18px]">{challenge.arrives.text}</p>
          <button type="button" onClick={() => dispatch({ type: "investigate" })} className={`${button} self-start bg-[#FFE08A] hover:bg-[#FFD35C]`}>
            Investigate
          </button>
        </>
      )}

      {phase === "choosing" && (
        <>
          <MayaSays>{challenge.maya}</MayaSays>

          {lastTried && (
            <p className="flex items-start gap-2 rounded-md border-2 border-alert bg-[#FBE3E3] px-3 py-2 text-[18px]" role="status">
              <CrossIcon />
              <span>
                {lastTried.result} Try again.
              </span>
            </p>
          )}

          <div className="flex flex-col gap-3">
            {showing.map((o) => {
              const tried = run.tried.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  disabled={tried}
                  onClick={() => dispatch({ type: "pick", optionId: o.id })}
                  className={`flex flex-col items-start gap-1 rounded-lg border-2 px-4 py-3 text-left ${
                    tried ? "border-[#8A8A8A] bg-[#DDDAD0] text-[#4A4A4A]" : "border-bar bg-white hover:bg-[#EEF3FD]"
                  }`}
                >
                  {tried && (
                    <span className="flex items-center gap-1 text-[18px] font-bold">
                      <CrossIcon size={22} />
                      Tried
                    </span>
                  )}
                  <span className="text-[20px] leading-snug">{o.plain}</span>
                  <span className="text-[18px] text-[#4A4A4A]">{o.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {phase === "guided" && (
        <>
          <MayaSays>{best.result}</MayaSays>
          <button type="button" autoFocus onClick={() => dispatch({ type: "applyGuided" })} className={`${button} self-start bg-[#FFE08A] hover:bg-[#FFD35C]`}>
            Apply this fix
          </button>
        </>
      )}

      {phase === "solved" && <Solved />}
    </div>
  );
}

// Step 6 and 7: what was learned and earned, then Next (docs/GAME_DESIGN.md > New incident flow: teach before testing).
function Solved() {
  const { state, dispatch } = useGameContext();
  const challenge = currentChallenge(state)!;
  const row = currentRow(state)!;
  const result = state.results[challenge.id];
  const best = challenge.options.find((o) => o.type === "best")!;
  const icon = patternIcons[challenge.pattern.name];
  const upNext = nextIncident(state);
  // Next sends the thank-you email first. If the next incident is not built yet, play then stops here.
  const thanksDue =
    challenge.arrives.by === "email" &&
    !!thanksText(challenge.arrives.from) &&
    !state.emails.some((e) => e.key === `thanks:${challenge.id}`);
  const stopped = !!upNext?.blocked && !thanksDue;

  return (
    <>
      <p className="flex items-start gap-2 rounded-md border-2 border-ok bg-[#E4F3E2] px-3 py-2 text-[18px]" role="status">
        <TickIcon />
        <span>{best.result}</span>
      </p>

      <div className="flex items-start gap-3 rounded-lg border-2 border-[#6B3FA0] bg-white px-4 py-3">
        {icon && <PatternIcon id={icon} size={44} />}
        <div>
          <p className="text-[18px] font-bold">Pattern learned: {challenge.pattern.name}</p>
          <p className="text-[18px]">{challenge.pattern.useWhen}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[20px] font-bold">
        <span>+{fullNumber(challenge.usersGained)} users</span>
        <span>+£{fullNumber(payFor(row.kind, row.stage, result.stars))}</span>
        <Stars stars={result.stars} />
      </div>

      {stopped ? (
        <p className="text-[18px] font-bold">Stage {upNext!.row.stage} is coming soon. Thanks for playing!</p>
      ) : (
        <button type="button" autoFocus onClick={() => dispatch({ type: "next" })} className={`${button} self-start bg-[#FFE08A] hover:bg-[#FFD35C]`}>
          Next
        </button>
      )}
    </>
  );
}
