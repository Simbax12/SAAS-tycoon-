"use client";

import { incidentById } from "@/data/incidents";
import { playOrder } from "@/data/playOrder";
import {
  bonuses,
  lessonFor,
  LOG_FILE,
  logLevels,
  logSources,
  terminalText,
  triageFor,
  triageText,
  triageWrong,
  type LogLevel,
  type LogLine,
  type TriageStep,
} from "@/data/extraSteps";
import { toolboxPart } from "@/data/blueprints";
import { useEffect, useRef, useState } from "react";
import { fullNumber } from "@/components/desktop/format";
import { scrollWithin } from "@/components/desktop/scrollWithin";
import { useGameContext } from "@/components/useGame";
import { baseCash, shuffled } from "@/game/rules";
import { isTaskCommand, normalise, runCommand, words, type CommandResult } from "@/game/terminal";
import { useDesktop } from "@/components/desktop/DesktopContext";
import { InfoBox, InfoButton } from "./InfoButton";
import { MayaSays, OpenAppHint } from "./Incident";

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

// What a line's source and level mean, shown by its info button (docs/EXTRA_STEPS.md > Log sources).
function LineInfo({ line }: { line: LogLine }) {
  const source = logSources[line.source];
  const part = source && toolboxPart(source.part);
  return (
    <InfoBox dark>
      {source && (
        <p>
          <span className="font-bold">{line.source}</span> · {source.name}
        </p>
      )}
      {part && (
        <p>
          <span className="font-bold">{part.name}:</span> {part.what}.
        </p>
      )}
      <p>
        <span className="font-bold">{line.level}:</span> {logLevels[line.level]}
      </p>
    </InfoBox>
  );
}

// A log line with its info button at the right end. `row` is the line itself: a button while the
// step waits for a tap, or plain text in the past logs.
function LogRow({ line, open, onToggle, row }: { line: LogLine; open: boolean; onToggle: () => void; row: React.ReactNode }) {
  return (
    <li>
      <div className="flex items-stretch gap-1">
        <div className="min-w-0 flex-1">{row}</div>
        <InfoButton dark label={`${line.source}, ${line.level}`} open={open} onToggle={onToggle} />
      </div>
      {open && <LineInfo line={line} />}
    </li>
  );
}

// The six lines in the save's fixed shuffled order (docs/GAME_LOGIC.md > Derived values).
const linesOf = (step: TriageStep, seed: number) => shuffled(step.lines, seed, step.incidentId);

// What the terminal has printed in this step: each command, and what it printed back.
// Screen state, kept while the window is closed and opened again, but never saved.
type Entry = { command: string; result: CommandResult | null; task: boolean };
const histories = new Map<string, Entry[]>();

// Words for the phone's tiles that do not belong in the command (docs/GAME_DESIGN.md > Triage, in Terminal).
const SPARE_WORDS = ["cat", "tail", "grep", "-v", "-i", "INFO", "WARN", "ERROR", "node", "nginx", LOG_FILE];
const TYPE_MS = 1000 / 30;
const LINE_MS = 150;

// The log viewer and command line (docs/UI_THEME.md > Terminal, and docs/GAME_DESIGN.md > Triage, in Terminal).
// After the typing ends, nothing moves and nothing blinks: the lines wait for the player.
export default function Terminal() {
  const { state } = useGameContext();
  const { reducedMotion } = useDesktop();
  const { phase, run } = state;
  const step = triageFor(state.currentId);
  // Which lines have their info box open. Screen state only, never saved.
  const [info, setInfo] = useState<string[]>([]);
  const toggle = (key: string) => setInfo((open) => (open.includes(key) ? open.filter((k) => k !== key) : [...open, key]));
  const live = step && !["waiting", "arrived"].includes(phase) && (phase === "triage" || run.triageTaps.includes("cause")) ? step : null;

  const shell = "-m-4 flex min-h-[calc(100%+2rem)] flex-col gap-4 bg-[#1E1E1E] p-4 text-[18px] text-[#F4F0E0]";

  if (live) return <Lesson step={live} info={info} toggle={toggle} reducedMotion={reducedMotion} key={`${state.seed}:${live.id}`} />;

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
              <LogRow
                key={line.id}
                line={line}
                open={info.includes(`${t.id}:${line.id}`)}
                onToggle={() => toggle(`${t.id}:${line.id}`)}
                row={
                  <div
                    className={`flex min-h-12 items-center gap-3 rounded-md border-2 px-3 py-2 ${
                      line.kind === "cause" ? "border-[#8FD07A] bg-[#24361F]" : "border-transparent"
                    }`}
                  >
                    {line.kind === "cause" && <Mark kind="tick" />}
                    <LineText line={line} />
                  </div>
                }
              />
            ))}
          </ul>
          <p>{t.why}</p>
        </section>
      ))}
    </div>
  );
}

type LessonProps = { step: TriageStep; info: string[]; toggle: (key: string) => void; reducedMotion: boolean };

// A Triage step as a short lesson: the lesson on the left and the prompt on the right, or the lesson
// above the prompt on a phone (docs/GAME_DESIGN.md > Triage, in Terminal).
function Lesson({ step, info, toggle, reducedMotion }: LessonProps) {
  const { state, dispatch } = useGameContext();
  const { phase, run } = state;
  const lesson = lessonFor(step.id);
  const key = `${state.seed}:${step.id}`;
  const [history, setHistory] = useState<Entry[]>(() => histories.get(key) ?? []);
  const [typed, setTyped] = useState("");
  const [wrong, setWrong] = useState(0);
  const [hint, setHint] = useState(false);
  // How far the newest command has typed itself out, then how many of its lines have printed.
  const [shownChars, setShownChars] = useState(Infinity);
  const [shownLines, setShownLines] = useState(Infinity);
  const bottom = useRef<HTMLDivElement>(null);
  const message = useRef<HTMLDivElement>(null);

  useEffect(() => {
    histories.set(key, history);
  }, [key, history]);

  const lines = linesOf(step, state.seed);
  const found = run.triageTaps.includes("cause");
  // Task 1 is done once the task's command has run. A line already tapped means it ran before a reload.
  const ran = history.some((e) => e.task) || run.triageTaps.length > 0;
  const last = step.lines.find((l) => l.id === run.triageTaps[run.triageTaps.length - 1]);
  const incident = incidentById(step.incidentId);
  const bonus = incident ? `£${fullNumber(Math.round(baseCash(incident.stage) * bonuses.triage))}` : "";
  // Maya explains logs in the first Triage step of the play order (docs/GAME_DESIGN.md > Triage, in Terminal).
  const firstStep = playOrder.find((row) => triageFor(row.id))?.id === step.incidentId;

  // The newest command types itself out, then prints line by line. With reduced motion, at once.
  const newest = history[history.length - 1];
  const newestCount = newest?.result?.kind === "lines" ? newest.result.lines.length : 1;
  const typing = !!newest && shownChars < newest.command.length;
  const printing = !!newest && !typing && shownLines < newestCount;
  useEffect(() => {
    if (!newest) return;
    if (typing) {
      const t = setTimeout(() => setShownChars((c) => c + 1), TYPE_MS);
      return () => clearTimeout(t);
    }
    if (printing) {
      const t = setTimeout(() => setShownLines((c) => c + 1), LINE_MS);
      return () => clearTimeout(t);
    }
  }, [newest, typing, printing, shownChars, shownLines]);
  useEffect(() => scrollWithin(bottom.current), [history.length, shownLines]);
  useEffect(() => scrollWithin(message.current), [run.triageTaps.length]);

  const run_ = (command: string) => {
    if (!lesson || !command.trim()) return;
    const result = runCommand(command, lines);
    const task = isTaskCommand(command, lesson.command);
    if (result?.kind === "clear") {
      setHistory([]);
    } else {
      const extra: Entry[] = !task && result?.kind === "lines" ? [{ command: "", result: { kind: "text", text: terminalText.notTask }, task: false }] : [];
      setHistory((h) => [...h, { command: normalise(command), result, task }, ...extra]);
      setShownChars(reducedMotion ? Infinity : 0);
      setShownLines(reducedMotion ? Infinity : 0);
    }
    if (!task && result?.kind !== "clear") {
      setWrong((n) => n + 1);
      // After two wrong commands, Hint shows the command (docs/GAME_DESIGN.md > Triage, in Terminal).
      if (wrong + 1 >= 2) setHint(true);
    }
    setTyped("");
  };

  // The phone's word tiles: the command's words, shuffled, plus two that do not belong.
  const commandWords = lesson ? words(lesson.command).map((w) => (w.includes(" ") || w.includes("|") ? `"${w}"` : w)) : [];
  const spare = SPARE_WORDS.filter((w) => !commandWords.includes(w)).slice(0, 2);
  const tiles = shuffled([...commandWords, ...spare], state.seed, `${step.id}:tiles`);

  const prompt = (
    <div className="flex flex-col gap-2" data-tour="terminalPrompt">
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          run_(typed);
        }}
      >
        <label className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-md border-2 border-[#5A5A5A] bg-black px-3 font-mono">
          <span aria-hidden="true">$</span>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            aria-label="Command"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent py-2 font-mono text-[18px] text-[#F4F0E0] caret-[#F4F0E0] outline-none"
          />
        </label>
        <button type="submit" className="min-h-12 rounded-md border-2 border-[#F4F0E0] bg-[#2E7D32] px-4 font-bold text-white">
          Run
        </button>
      </form>
      {/* Word tiles: tap them in order. They also work with a mouse (docs/UI_THEME.md > Terminal). */}
      <div className="flex flex-wrap gap-2" aria-label="Word tiles">
        {tiles.map((w, i) => (
          <button
            key={`${w}-${i}`}
            type="button"
            onClick={() => setTyped((t) => (t.trim() ? `${t.trim()} ${w}` : w))}
            className="min-h-12 rounded-md border-2 border-[#8A8A8A] bg-[#2E2E2E] px-3 font-mono text-[18px] hover:border-[#F4F0E0]"
          >
            {w}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setTyped((t) => t.trim().split(" ").slice(0, -1).join(" "))}
          className="min-h-12 rounded-md border-2 border-[#8A8A8A] px-3 text-[18px] hover:border-[#F4F0E0]"
        >
          Delete
        </button>
        <button type="button" onClick={() => setHint(true)} className="min-h-12 rounded-md border-2 border-[#C9A400] px-3 text-[18px] font-bold text-[#FFD35C]">
          Hint
        </button>
      </div>
      {hint && lesson && (
        <p className="rounded-md border-2 border-[#C9A400] px-3 py-2" role="status">
          <span className="font-bold">Hint:</span> <code className="font-mono">{lesson.command}</code>
        </p>
      )}
    </div>
  );

  const output = (
    <div className="flex flex-col gap-2 font-mono" aria-live="polite">
      {history.map((e, i) => {
        const isNewest = i === history.length - 1;
        const chars = isNewest ? shownChars : Infinity;
        const count = isNewest ? (typing ? 0 : shownLines) : Infinity;
        const done = !isNewest || (!typing && !printing);
        return (
          <div key={i} className="flex flex-col gap-1">
            {e.command && (
              <p>
                <span aria-hidden="true">$ </span>
                {e.command.slice(0, chars)}
              </p>
            )}
            {e.result?.kind === "text" && count > 0 && <p>{e.result.text}</p>}
            {e.result?.kind === "error" && count > 0 && <p className="text-[#F2A0A0]">{e.result.text}</p>}
            {e.result?.kind === "lines" &&
              (e.task && !found ? (
                // The task's output: each line is a button. The player taps the cause.
                <ul className="flex flex-col gap-2">
                  {e.result.lines.slice(0, count).map((line) => {
                    const tapped = run.triageTaps.includes(line.id);
                    const grey = tapped && line.kind !== "cause";
                    return (
                      <LogRow
                        key={line.id}
                        line={line}
                        open={info.includes(`${i}:${line.id}`)}
                        onToggle={() => toggle(`${i}:${line.id}`)}
                        row={
                          <button
                            type="button"
                            disabled={!done || tapped || found}
                            onClick={() => dispatch({ type: "tapLine", lineId: line.id })}
                            className={`flex min-h-12 w-full items-center gap-3 rounded-md border-2 px-3 py-2 text-left ${
                              grey ? "border-[#4A4A4A] text-[#9A968A]" : "border-[#5A5A5A] enabled:hover:border-[#F4F0E0] enabled:hover:bg-[#2E2E2E]"
                            }`}
                          >
                            {grey && <Mark kind="cross" />}
                            <LineText line={line} />
                          </button>
                        }
                      />
                    );
                  })}
                </ul>
              ) : (
                <ul className="flex flex-col gap-1">
                  {e.result.lines.slice(0, count).map((line) => (
                    <li
                      key={line.id}
                      className={`flex min-h-12 items-center gap-3 rounded-md border-2 px-3 py-2 ${
                        e.task && line.kind === "cause" && found ? "border-[#8FD07A] bg-[#24361F]" : "border-transparent"
                      }`}
                    >
                      {e.task && line.kind === "cause" && found && <Mark kind="tick" />}
                      <LineText line={line} />
                    </li>
                  ))}
                </ul>
              ))}
          </div>
        );
      })}
      <div ref={bottom} />
    </div>
  );

  const task = (n: number, done: boolean, text: string) => (
    <li className="flex items-start gap-2">
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded border-2 ${done ? "border-[#8FD07A]" : "border-[#9A968A]"}`}
        aria-hidden="true"
      >
        {done && <Mark kind="tick" />}
      </span>
      <span>
        <span className="sr-only">{done ? "Done: " : ""}</span>
        {n}. {text}
      </span>
    </li>
  );

  return (
    // Side by side when the window is wide enough, one above the other when it is not.
    <div className="@container -m-4 min-h-[calc(100%+2rem)] bg-[#1E1E1E] text-[18px] text-[#F4F0E0]">
    <div className="grid min-h-full grid-cols-1 @[720px]:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <section className="flex flex-col gap-3 border-b-2 border-[#3A3A3A] bg-[#262626] p-4 @[720px]:border-b-0 @[720px]:border-r-2" aria-label="Lesson">
        <h3 className="text-[20px] font-bold">{incident?.title}</h3>
        {firstStep && !found && (
          <div className="flex flex-col gap-2 text-ink">
            {triageText.firstTime.map((line) => (
              <MayaSays key={line}>{line}</MayaSays>
            ))}
          </div>
        )}
        <p className="text-[20px] font-bold">{triageText.goal}</p>
        {incident && (
          <p>
            <span className="font-bold">{triageText.whatHappened}</span> {incident.arrives.text}
          </p>
        )}
        {lesson && <p>{lesson.learn}</p>}
        <ol className="flex flex-col gap-2">
          {lesson && task(1, ran, lesson.task)}
          {task(2, found, terminalText.task2)}
        </ol>
        {!found && <p>{triageText.bonusOffer(bonus)}</p>}
        {found ? (
          // The answer, the bonus and the way on stay together, so all of them scroll into view.
          <div ref={message} className="flex flex-col gap-3">
            <p className="rounded-md border-2 border-[#8FD07A] px-3 py-2" role="status">
              {step.why}
            </p>
            {run.triageTaps[0] === "cause" && <p className="font-bold">{triageText.bonusEarned(bonus)}</p>}
            {phase !== "solved" && <OpenAppHint id="incident" text={triageText.nextStep} />}
          </div>
        ) : (
          last &&
          last.kind !== "cause" && (
            <div ref={message}>
              <p className="rounded-md border-2 border-[#9A968A] px-3 py-2" role="status">
                {triageWrong[last.kind]}
              </p>
            </div>
          )
        )}
      </section>
      <section className="flex min-w-0 flex-col gap-3 p-4" aria-label="Terminal">
        {output}
        {prompt}
      </section>
    </div>
    </div>
  );
}
