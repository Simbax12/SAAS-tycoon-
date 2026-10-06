"use client";

import { thanksText } from "@/data/emails";
import { isRepeat, type IncidentData } from "@/data/incidents";
import { victorLine } from "@/data/people";
import { patternIcons } from "@/data/patterns";
import {
  CrossIcon,
  DanaAvatar,
  MayaAvatar,
  PatternIcon,
  PhoneIcon,
  SenderBadge,
  StarIcon,
  TickIcon,
  VictorAvatar,
  WarningIcon,
} from "@/components/desktop/gameIcons";
import { fullNumber } from "@/components/desktop/format";
import { useEffect, useRef, useState } from "react";
import { ShopIcon } from "@/components/desktop/shopIcons";
import { scrollWithin } from "@/components/desktop/scrollWithin";
import { useGameContext } from "@/components/useGame";
import { alsoSeenAs, pipsFor, useWhenFor } from "@/game/patternBook";
import {
  callButton,
  canTestFirst,
  cluesGiven,
  currentIncident,
  currentRow,
  nextIncident,
  payFor,
  removalLines,
  shuffled,
} from "@/game/rules";
import type { Stars as StarCount } from "@/game/types";
import Diagram from "./Diagram";
import { AlsoSeenAs, Pips } from "./PatternBook";

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

function choicesOf(incident: IncidentData): Choice[] {
  if (isRepeat(incident)) {
    return incident.cards.map((c) => ({ id: c.pattern, right: c.right, result: c.text, pattern: c.pattern, remind: useWhenFor(c.pattern) }));
  }
  return incident.options.map((o) => ({ id: o.id, right: o.type === "best", result: o.result, plain: o.plain, label: o.label }));
}

// The current incident. New incidents follow docs/GAME_DESIGN.md > New incident flow: teach before testing,
// and repeats follow docs/GAME_DESIGN.md > Repeat incident flow: recall, not recognition.
export default function Incident() {
  const { state, dispatch } = useGameContext();
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
            onClick={() => dispatch({ type: "investigate" })}
            className={`${button} self-start bg-[#FFE08A] hover:bg-[#FFD35C]`}
          >
            Investigate
          </button>
        </>
      )}

      {phase === "choosing" && (
        <>
          {/* A repeat does not explain the problem again (docs/GAME_DESIGN.md > Repeat incident flow: recall, not recognition). */}
          {repeat ? (
            <p className="text-[20px] font-bold">Which pattern fixes this?</p>
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

function PatternName({ pattern }: { pattern: string }) {
  const icon = patternIcons[pattern];
  return (
    <p className="flex items-center gap-3 text-[20px] font-bold">
      {icon && <PatternIcon id={icon} size={44} />}
      {pattern}
    </p>
  );
}

// Calls to Dana: her phone window with every clue so far, then the button for the next call
// (docs/UI_THEME.md > Dana and Victor, and docs/GAME_DESIGN.md > Consultant calls).
// `children` sits beside the call button: the "Test first" button (docs/UI_THEME.md > Test first).
function Calls({ children }: { children?: React.ReactNode }) {
  const { state, dispatch } = useGameContext();
  const clues = cluesGiven(state);
  const next = callButton(state);
  // Each new clue scrolls into view, so the player sees what they paid for.
  const latest = useRef<HTMLLIElement>(null);
  useEffect(() => scrollWithin(latest.current), [clues.length]);

  return (
    <>
      {clues.length > 0 && (
        <section aria-label="Call with Dana" className="os-dialog overflow-hidden rounded-lg border-2 border-[#A8431C] bg-white">
          <header className="flex items-center gap-2 bg-[#A8431C] px-3 py-1.5 text-white">
            <PhoneIcon size={22} />
            <span className="text-[18px] font-bold">Dana</span>
          </header>
          <ol className="flex flex-col gap-3 p-3">
            {clues.map((clue, i) => (
              <li
                key={i}
                ref={i === clues.length - 1 ? latest : undefined}
                className="flex items-start gap-3"
                aria-live={i === clues.length - 1 ? "polite" : undefined}
              >
                <DanaAvatar size={40} />
                <p className="flex flex-col items-start gap-1 text-[18px]">
                  <SenderBadge from="dana" />
                  {clue}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {next.kind === "call" && (
          <button
            type="button"
            data-tour="callDana"
            disabled={!next.affordable}
            onClick={() => dispatch({ type: "call" })}
            className={`${button} flex items-center gap-2 ${
              next.affordable ? "bg-white hover:bg-[#FBEDE6]" : "border-[#8A8A8A] bg-[#DDDAD0] text-[#4A4A4A]"
            }`}
          >
            <PhoneIcon />
            Call Dana
            <span className="font-normal">{next.price === 0 ? "Free call" : `£${fullNumber(next.price)}`}</span>
            {!next.affordable && <span className="font-normal">Not enough cash</span>}
          </button>
        )}
        {next.kind === "lifeline" && (
          <button
            type="button"
            data-tour="callDana"
            onClick={() => dispatch({ type: "useLifeline" })}
            className={`${button} flex items-center gap-2 self-start bg-white hover:bg-[#EEEEEE]`}
          >
            <VictorAvatar size={32} />
            Use Victor&apos;s lifeline
          </button>
        )}
        {next.kind === "noMore" && (
          <button
            type="button"
            data-tour="callDana"
            disabled
            className={`${button} flex items-center gap-2 self-start border-[#8A8A8A] bg-[#DDDAD0] text-[#4A4A4A]`}
          >
            <PhoneIcon />
            No more calls
          </button>
        )}
        {children}
      </div>
    </>
  );
}

// What was learned or strengthened and earned, then Next. A new incident adds a Pattern Book
// entry. A repeat shows the "Seen before" stamp, fills a pip and adds its "Also seen as" line.
function Solved({ result }: { result: string }) {
  const { state, dispatch } = useGameContext();
  const incident = currentIncident(state)!;
  const row = currentRow(state)!;
  const stars = state.results[incident.id].stars;
  const upNext = nextIncident(state);
  // Next sends the thank-you email first. If the next incident is not built yet, play then stops here.
  const thanksDue =
    incident.arrives.by === "email" &&
    !!thanksText(incident.arrives.from) &&
    !state.emails.some((e) => e.key === `thanks:${incident.id}`);
  const stopped = !!upNext?.blocked && !thanksDue;

  return (
    <>
      <p className="flex items-start gap-2 rounded-md border-2 border-ok bg-[#E4F3E2] px-3 py-2 text-[18px]" role="status">
        <TickIcon />
        <span>{result}</span>
      </p>

      {isRepeat(incident) ? (
        <Practised pattern={incident.pattern} />
      ) : (
        <div className="flex items-start gap-3 rounded-lg border-2 border-[#6B3FA0] bg-white px-4 py-3">
          {patternIcons[incident.pattern.name] && <PatternIcon id={patternIcons[incident.pattern.name]} size={44} />}
          <div>
            <p className="text-[18px] font-bold">Pattern learned: {incident.pattern.name}</p>
            <p className="text-[18px]">{incident.pattern.useWhen}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[20px] font-bold">
        <span>+{fullNumber(incident.usersGained)} users</span>
        <span>+£{fullNumber(payFor(row.kind, row.stage, stars))}</span>
        <Stars stars={stars} />
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

// The pattern a repeat strengthened, with the "Seen before" stamp, its pips and "Also seen as" lines
// (docs/GAME_DESIGN.md > Repeat incident flow: recall, not recognition).
function Practised({ pattern }: { pattern: string }) {
  const { state } = useGameContext();
  const pips = pipsFor(state, pattern);
  return (
    <div className="flex flex-col gap-2 rounded-lg border-2 border-[#6B3FA0] bg-white px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PatternName pattern={pattern} />
        <span className="seen-stamp shrink-0 rounded-md border-4 border-[#6B3FA0] bg-white px-3 py-1 text-[20px] font-bold text-[#4B2A75]">
          Seen before
        </span>
      </div>
      {pips && <Pips pips={pips} />}
      <AlsoSeenAs lines={alsoSeenAs(state, pattern)} />
    </div>
  );
}
