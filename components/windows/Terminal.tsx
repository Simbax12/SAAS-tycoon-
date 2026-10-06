"use client";

import { incidentById } from "@/data/incidents";
import { playOrder } from "@/data/playOrder";
import { triageFor, triageWrong, type LogLevel, type LogLine, type TriageStep } from "@/data/extraSteps";
import { useEffect, useRef } from "react";
import { scrollWithin } from "@/components/desktop/scrollWithin";
import { useGameContext } from "@/components/useGame";
import { shuffled } from "@/game/rules";
import { OpenAppButton } from "./Incident";

const CREAM = "#F4F0E0";

// INFO is a circle, WARN a triangle and ERROR a cross, each with its word (docs/UI_THEME.md > Terminal).
function LevelBadge({ level }: { level: LogLevel }) {
  const shape =
    level === "INFO" ? (
      <circle cx="10" cy="10" r="6.5" fill="none" stroke={CREAM} strokeWidth="2.4" />
    ) : level === "WARN" ? (
      <path d="M10 3 L17.5 16.5 H2.5 Z" fill="none" stroke={CREAM} strokeWidth="2.2" strokeLinejoin="round" />
    ) : (
      <path d="M4 4 L16 16 M16 4 L4 16" stroke={CREAM} strokeWidth="2.6" strokeLinecap="round" />
    );
  return (
    <span className="flex w-[92px] shrink-0 items-center gap-1.5 font-bold">
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        {shape}
      </svg>
      {level}
    </span>
  );
}

function Mark({ kind }: { kind: "tick" | "cross" }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0" aria-hidden="true" focusable="false">
      {kind === "tick" ? (
        <path d="M4 12 L10 18 L20 6" fill="none" stroke="#8FD07A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M6 6 L18 18 M18 6 L6 18" stroke="#9A968A" strokeWidth="3" strokeLinecap="round" />
      )}
    </svg>
  );
}

function LineText({ line }: { line: LogLine }) {
  return (
    <>
      <LevelBadge level={line.level} />
      <span className="flex min-w-0 flex-1 flex-wrap gap-x-2">
        <span className="font-bold">{line.source}</span>
        <span className="min-w-0">{line.message}</span>
      </span>
    </>
  );
}

// The six lines in the save's fixed shuffled order (docs/GAME_LOGIC.md > Derived values).
const linesOf = (step: TriageStep, seed: number) => shuffled(step.lines, seed, step.incidentId);

// The log viewer (docs/UI_THEME.md > Terminal, and docs/GAME_DESIGN.md > Triage, in Terminal).
// Nothing scrolls by itself and nothing blinks: the lines wait for the player.
export default function Terminal() {
  const { state, dispatch } = useGameContext();
  const { phase, run } = state;
  const step = triageFor(state.currentId);
  // This incident's step, once it has begun. Before "Investigate" Terminal shows past steps.
  // Each new message scrolls into view, so the player sees what their tap did.
  const message = useRef<HTMLParagraphElement>(null);
  useEffect(() => scrollWithin(message.current), [run.triageTaps.length]);
  const live = step && !["waiting", "arrived"].includes(phase) && (phase === "triage" || run.triageTaps.includes("cause")) ? step : null;

  const shell = "-m-4 flex min-h-[calc(100%+2rem)] flex-col gap-4 bg-[#1E1E1E] p-4 text-[18px] text-[#F4F0E0]";

  if (live) {
    const found = run.triageTaps.includes("cause");
    const last = live.lines.find((l) => l.id === run.triageTaps[run.triageTaps.length - 1]);
    return (
      <div className={shell}>
        <h3 className="text-[20px] font-bold">{incidentById(live.incidentId)?.title}</h3>
        <ul className="flex flex-col gap-2" data-tour="logLines">
          {linesOf(live, state.seed).map((line) => {
            const tapped = run.triageTaps.includes(line.id);
            const isCause = line.kind === "cause" && found;
            const grey = tapped && line.kind !== "cause";
            return (
              <li key={line.id}>
                <button
                  type="button"
                  disabled={found || tapped}
                  onClick={() => dispatch({ type: "tapLine", lineId: line.id })}
                  className={`flex min-h-12 w-full items-center gap-3 rounded-md border-2 px-3 py-2 text-left ${
                    isCause
                      ? "border-[#8FD07A] bg-[#24361F]"
                      : grey
                        ? "border-[#4A4A4A] text-[#9A968A]"
                        : "border-[#5A5A5A] enabled:hover:border-[#F4F0E0] enabled:hover:bg-[#2E2E2E]"
                  }`}
                >
                  {isCause && <Mark kind="tick" />}
                  {grey && <Mark kind="cross" />}
                  <LineText line={line} />
                </button>
              </li>
            );
          })}
        </ul>
        {found ? (
          <>
            <p ref={message} className="rounded-md border-2 border-[#8FD07A] px-3 py-2" role="status">
              {live.why}
            </p>
            {phase !== "solved" && <OpenAppButton id="incident" />}
          </>
        ) : (
          last &&
          last.kind !== "cause" && (
            <p ref={message} className="rounded-md border-2 border-[#9A968A] px-3 py-2" role="status">
              {triageWrong[last.kind]}
            </p>
          )
        )}
      </div>
    );
  }

  // No step is waiting: the lines from past Triage steps, each cause marked.
  const past = playOrder.flatMap((row) => {
    const t = triageFor(row.id);
    return t && state.results[row.id] ? [t] : [];
  });
  if (past.length === 0) {
    return (
      <div className={shell}>
        <p>No logs yet.</p>
      </div>
    );
  }
  return (
    <div className={shell}>
      {[...past].reverse().map((t) => (
        <section key={t.id} className="flex flex-col gap-2">
          <h3 className="text-[20px] font-bold">{incidentById(t.incidentId)?.title}</h3>
          <ul className="flex flex-col gap-1">
            {linesOf(t, state.seed).map((line) => (
              <li
                key={line.id}
                className={`flex min-h-12 items-center gap-3 rounded-md border-2 px-3 py-2 ${
                  line.kind === "cause" ? "border-[#8FD07A] bg-[#24361F]" : "border-transparent"
                }`}
              >
                {line.kind === "cause" && <Mark kind="tick" />}
                <LineText line={line} />
              </li>
            ))}
          </ul>
          <p>{t.why}</p>
        </section>
      ))}
    </div>
  );
}
