"use client";

import { BUILD_BRIEF, type Build } from "@/data/blueprints";
import { isBuild, isRepeat, type IncidentData } from "@/data/incidents";
import { victorLine } from "@/data/people";
import { triageText } from "@/data/extraSteps";
import { patternIcons } from "@/data/patterns";
import { CrossIcon, PatternIcon, VictorAvatar, WarningIcon } from "@/components/desktop/gameIcons";
import { fullNumber } from "@/components/desktop/format";
import { useDesktop } from "@/components/desktop/DesktopContext";
import { useEffect, useRef, useState } from "react";
import { ShopIcon } from "@/components/desktop/shopIcons";
import { scrollWithin } from "@/components/desktop/scrollWithin";
import { useGameContext } from "@/components/useGame";
import { useWhenFor } from "@/game/patternBook";
import {
  canTestFirst,
  incidentOpen,
  currentIncident,
  currentRow,
  removalLines,
  shuffled,
} from "@/game/rules";
import Diagram from "./Diagram";
import { button, Fixed, MayaSays, OpenAppHint, PatternName, StandbyLine, Stars } from "./incidentBits";
import { Calls } from "./Calls";
import { Solved } from "./Solved";

// Other windows import these from here, as before the split.
export { MayaSays, OpenAppHint, Stars } from "./incidentBits";
export { Calls } from "./Calls";
export { Solved } from "./Solved";

// One option card in a new incident, or one pattern card in a repeat, as the window shows it.
type Choice = {
  id: string;
  right: boolean;
  // The Result sentence, or a wrong card's "Why not" sentence.
  result: string;
  // New incidents: the plain description and the industry label.
  plain?: string;
  label?: string;
  // Repeats: the card's pattern, shown with its icon, and its "Use this when" line for "Remind me".
  pattern?: string;
  remind?: string;
};

function choicesOf(incident: Exclude<IncidentData, Build>): Choice[] {
  if (isRepeat(incident)) {
    return incident.cards.map((c) => ({ id: c.pattern, right: c.right, result: c.text, pattern: c.pattern, remind: useWhenFor(c.pattern) }));
  }
  return incident.options.map((o) => ({ id: o.id, right: o.type === "best", result: o.result, plain: o.plain, label: o.label }));
}

// The current incident. New incidents follow docs/GAME_DESIGN.md > New incident flow: teach before testing,
// and repeats follow docs/GAME_DESIGN.md > Repeat incident flow: recall, not recognition.
export default function Incident() {
  const { state, dispatch } = useGameContext();
  const { investigate } = useDesktop();
  const incident = currentIncident(state);
  const row = currentRow(state);
  const { phase, run } = state;
  // "Test first" (docs/UI_THEME.md > Test first): picking the card to test, then its Result.
  // Screen state only. It belongs to one incident, so a new incident starts without it.
  const [test, setTest] = useState<{ incident: string; option: string | null } | null>(null);
  // "Remind me" shows a card's "Use this when" line. Screen state only, and free.
  const [reminded, setReminded] = useState<{ incident: string; ids: string[] }>({ incident: "", ids: [] });
  // The tested card's Result sits above the cards, so bring it into view.
  const testBox = useRef<HTMLDivElement>(null);
  useEffect(() => scrollWithin(testBox.current), [test?.option]);

  if (!incident || !row || phase === "waiting") {
    return <p className="text-[18px]">No incident right now.</p>;
  }
  if (isBuild(incident)) return <BuildIncident build={incident} />;

  const repeat = isRepeat(incident);
  const choices = choicesOf(incident);
  const right = choices.find((c) => c.right)!;
  const showing = shuffled(choices, state.seed, incident.id).filter((c) => !run.removed.includes(c.id));
  const lastTried = choices.find((c) => c.id === run.tried[run.tried.length - 1]);
  const testHere = test?.incident === incident.id ? test : null;
  const choosingTest = testHere !== null && testHere.option === null && canTestFirst(state);
  const tested = choices.find((c) => c.id === testHere?.option);
  const remindedHere = reminded.incident === incident.id ? reminded.ids : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[20px] font-bold">{incident.title}</h3>
        <Stars stars={phase === "solved" ? state.results[incident.id]?.stars ?? run.stars : run.stars} />
      </div>

      <Diagram state={state} />
      {/* What the diagram shows, in words, while the incident is open (docs/UI_THEME.md > The System Map and incident diagram). */}
      {incidentOpen(state) && <p className="-mt-2 text-[18px] italic text-[#4A4A4A]">{incident.sees}</p>}

      {run.dip > 0 && (
        <p className="flex items-center gap-2 rounded-md border-2 border-alert bg-[#FBE3E3] px-3 py-2 text-[18px]">
          <WarningIcon />
          Outage: {fullNumber(run.dip)} users lost until fixed.
        </p>
      )}

      {phase === "arrived" && (
        <>
          <p className="text-[18px]">{incident.arrives.text}</p>
          <button
            type="button"
            data-tour="investigate"
            onClick={investigate}
            className={`${button} self-start bg-[#FFE08A] hover:bg-[#FFD35C]`}
          >
            Investigate
          </button>
        </>
      )}

      {/* The Triage step runs in Terminal, before the fix (docs/GAME_DESIGN.md > Triage, in Terminal). */}
      {phase === "triage" && (
        <>
          <p className="text-[18px]">{incident.arrives.text}</p>
          <OpenAppHint id="terminal" />
        </>
      )}

      {/* The Tune step runs in SysDash, after the fix (docs/GAME_DESIGN.md > Tune, in SysDash). */}
      {phase === "tune" && (
        <>
          <Fixed result={right.result} />
          <OpenAppHint id="sysdash" />
        </>
      )}

      {phase === "choosing" && (
        <>
          {/* A repeat does not explain the problem again (docs/GAME_DESIGN.md > Repeat incident flow: recall, not recognition). */}
          {repeat ? (
            <>
              {/* What the person reported, without naming the cause. */}
              <p className="text-[18px]">
                <span className="font-bold">{triageText.whatHappened}</span> {incident.arrives.text}
              </p>
              <p className="text-[20px] font-bold">Which pattern fixes this?</p>
            </>
          ) : (
            <>
              {removalLines(state).map((line) => (
                <MayaSays key={line}>{line}</MayaSays>
              ))}
              <MayaSays>{incident.maya}</MayaSays>
            </>
          )}

          {tested && (
            <div ref={testBox} className="flex items-start gap-2 rounded-md border-2 border-[#2A5FD0] bg-[#EEF3FD] px-3 py-2 text-[18px]" role="status">
              <ShopIcon id="srv-test" size={26} />
              <p className="flex flex-col gap-1">
                <span className="font-bold">Test</span>
                <span>{tested.result}</span>
                {tested.right && <span className="font-bold">This would work</span>}
              </p>
            </div>
          )}

          {lastTried && !tested && (
            <p className="flex items-start gap-2 rounded-md border-2 border-alert bg-[#FBE3E3] px-3 py-2 text-[18px]" role="status">
              <CrossIcon />
              <span>
                {lastTried.result} Try again.
              </span>
            </p>
          )}
          <StandbyLine />

          <div className="flex flex-col gap-3" data-tour={repeat ? "repeatCards" : "options"}>
            {showing.map((c) => {
              const tried = run.tried.includes(c.id);
              const onPick = () => {
                if (choosingTest) {
                  dispatch({ type: "testFirst", optionId: c.id });
                  setTest({ incident: incident.id, option: c.id });
                } else {
                  dispatch({ type: "pick", optionId: c.id });
                  setTest(null);
                }
              };
              const look = tried ? "border-[#8A8A8A] bg-[#DDDAD0] text-[#4A4A4A]" : "border-bar bg-white hover:bg-[#EEF3FD]";
              const triedMark = tried && (
                <span className="flex items-center gap-1 text-[18px] font-bold">
                  <CrossIcon size={22} />
                  Tried
                </span>
              );

              if (!c.pattern) {
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={tried}
                    onClick={onPick}
                    className={`flex flex-col items-start gap-1 rounded-lg border-2 px-4 py-3 text-left ${look}`}
                  >
                    {triedMark}
                    <span className="text-[20px] leading-snug">{c.plain}</span>
                    <span className="text-[18px] text-[#4A4A4A]">{c.label}</span>
                  </button>
                );
              }

              // A pattern card: the icon large, its name, and a small "Remind me" button
              // (docs/UI_THEME.md > Pattern Book and pattern cards).
              const icon = patternIcons[c.pattern];
              const showRemind = remindedHere.includes(c.id);
              return (
                <div key={c.id} className={`flex flex-col gap-2 rounded-lg border-2 px-3 py-3 ${tried ? look : "border-bar bg-white"}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={tried}
                      onClick={onPick}
                      className={`flex min-h-12 min-w-0 flex-1 basis-[220px] items-center gap-3 rounded-md px-2 py-1 text-left ${tried ? "" : "hover:bg-[#EEF3FD]"}`}
                    >
                      {icon && <PatternIcon id={icon} size={56} />}
                      <span className="flex min-w-0 flex-col items-start gap-1">
                        {triedMark}
                        <span className="text-[20px] font-bold leading-snug">{c.pattern}</span>
                      </span>
                    </button>
                    {c.remind && (
                      <button
                        type="button"
                        aria-expanded={showRemind}
                        onClick={() =>
                          setReminded({
                            incident: incident.id,
                            ids: showRemind ? remindedHere.filter((id) => id !== c.id) : [...remindedHere, c.id],
                          })
                        }
                        className="min-h-12 rounded-md border-2 border-ink bg-[#F4F0E0] px-3 text-[18px] hover:bg-[#EEF3FD]"
                      >
                        Remind me
                      </button>
                    )}
                  </div>
                  {showRemind && <p className="px-2 text-[18px]">{c.remind}</p>}
                </div>
              );
            })}
          </div>

          <Calls>
            {choosingTest ? (
              <span className="flex flex-wrap items-center gap-2 text-[18px]" role="status">
                Tap a fix to test it.
                <button type="button" onClick={() => setTest(null)} className={`${button} bg-white hover:bg-[#EEF3FD]`}>
                  Cancel
                </button>
              </span>
            ) : (
              canTestFirst(state) && (
                <button
                  type="button"
                  onClick={() => setTest({ incident: incident.id, option: null })}
                  className={`${button} flex items-center gap-2 bg-white hover:bg-[#EEF3FD]`}
                >
                  <ShopIcon id="srv-test" size={26} />
                  Test first
                </button>
              )
            )}
          </Calls>
        </>
      )}

      {phase === "guided" && (
        <>
          {run.lifelineUsed && (
            <div className="flex items-start gap-3">
              <VictorAvatar />
              <p className="rounded-2xl border-2 border-[#4A4A4A] bg-white px-4 py-2 text-[18px]">
                <span className="sr-only">Victor: </span>
                {victorLine}
              </p>
            </div>
          )}
          <StandbyLine />
          {repeat && <PatternName pattern={right.id} />}
          <MayaSays>{right.result}</MayaSays>
          <button type="button" autoFocus onClick={() => dispatch({ type: "applyGuided" })} className={`${button} self-start bg-[#FFE08A] hover:bg-[#FFD35C]`}>
            Apply this fix
          </button>
        </>
      )}

      {phase === "solved" && <Solved result={right.result} />}
    </div>
  );
}

// A Build is drawn in Blueprint. The Incident window says so and opens it
// (docs/GAME_DESIGN.md > Build incident flow: draw the design).
function BuildIncident({ build }: { build: Build }) {
  const { state } = useGameContext();
  const { investigate } = useDesktop();
  const { phase, run } = state;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[20px] font-bold">{build.title}</h3>
        <Stars stars={phase === "solved" ? state.results[build.id]?.stars ?? run.stars : run.stars} />
      </div>
      {phase === "arrived" && (
        <>
          <p className="text-[18px]">{build.arrives.text}</p>
          <button type="button" data-tour="investigate" onClick={investigate} className={`${button} self-start bg-[#FFE08A] hover:bg-[#FFD35C]`}>
            Investigate
          </button>
        </>
      )}
      {(phase === "choosing" || phase === "guided") && (
        <>
          <MayaSays>{phase === "guided" ? build.result : BUILD_BRIEF}</MayaSays>
          <OpenAppHint id="blueprint" />
        </>
      )}
      {phase === "solved" && <Solved result={build.result} />}
    </div>
  );
}
