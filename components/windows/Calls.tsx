"use client";

import { DanaAvatar, PhoneIcon, SenderBadge, VictorAvatar } from "@/components/desktop/gameIcons";
import { fullNumber } from "@/components/desktop/format";
import { useEffect, useRef } from "react";
import { scrollWithin } from "@/components/desktop/scrollWithin";
import { useGameContext } from "@/components/useGame";
import { callButton, cluesGiven } from "@/game/rules";
import { button } from "./incidentBits";

// Calls to Dana: her phone window with every clue so far, then the button for the next call
// (docs/UI_THEME.md > Dana and Victor, and docs/GAME_DESIGN.md > Consultant calls).
// `children` sits beside the call button: the "Test first" button (docs/UI_THEME.md > Test first).
export function Calls({ children }: { children?: React.ReactNode }) {
  const { state, dispatch } = useGameContext();
  const clues = cluesGiven(state);
  const next = callButton(state);
  // Each new clue scrolls into view, so the player sees what they paid for.
  const latest = useRef<HTMLLIElement>(null);
  useEffect(() => scrollWithin(latest.current), [clues.length]);

  return (
    <>
      {clues.length > 0 && (
        <section aria-label="Call with Dana" className="os-dialog overflow-hidden rounded-lg border-2 border-dana bg-paper">
          <header className="flex items-center gap-2 bg-dana px-3 py-1.5 text-paper">
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
              next.affordable ? "bg-paper hover:bg-dana-soft" : "border-off-edge bg-off text-muted"
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
            className={`${button} flex items-center gap-2 self-start bg-paper hover:bg-grey-soft`}
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
            className={`${button} flex items-center gap-2 self-start border-off-edge bg-off text-muted`}
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
