"use client";

import { useState } from "react";
import { tuneFor, type TuneStep } from "@/data/extraSteps";
import { stageByNumber } from "@/data/stages";
import { CrossIcon, TickIcon, WarningIcon } from "@/components/desktop/gameIcons";
import { fullNumber } from "@/components/desktop/format";
import { useDesktop } from "@/components/desktop/DesktopContext";
import { useGameContext } from "@/components/useGame";
import { baseCash, currentStage, progressShare, usersOnScreen } from "@/game/rules";
import { OpenAppButton } from "./Incident";

type Band = "low" | "right" | "high";

const button = "min-h-12 rounded-md border-2 border-ink px-5 text-[18px] font-bold";

const bandOf = (stop: number, right: number): Band => (stop < right ? "low" : stop > right ? "high" : "right");

// Each band has an icon and its words, never colour alone (docs/UI_THEME.md > SysDash).
const bands: { id: Band; words: string; colour: string; icon: React.ReactNode }[] = [
  { id: "low", words: "Too low", colour: "#A86F00", icon: <WarningIcon size={24} /> },
  { id: "right", words: "Just right", colour: "#2E8B3D", icon: <TickIcon size={24} /> },
  { id: "high", words: "Too high", colour: "#C83232", icon: <CrossIcon size={24} /> },
];

// A half-circle gauge. `share` from 0 to 1 places the needle. With `banded`, the arc is cut into
// the three bands. Without, it fills up to the needle.
function Gauge({ share, banded, label }: { share: number | null; banded?: boolean; label: string }) {
  const { reducedMotion } = useDesktop();
  const at = (t: number, r: number) => {
    const a = Math.PI * (1 - t);
    return { x: 100 + r * Math.cos(a), y: 100 - r * Math.sin(a) };
  };
  const arc = (from: number, to: number, r: number) => {
    const p = at(from, r);
    const q = at(to, r);
    return `M${p.x} ${p.y} A${r} ${r} 0 0 1 ${q.x} ${q.y}`;
  };
  const needle = share === null ? null : at(Math.min(1, Math.max(0, share)), 70);
  return (
    <svg viewBox="0 0 200 112" className="mx-auto block w-full max-w-[320px]" role="img" aria-label={label}>
      <path d={arc(0, 1, 80)} fill="none" stroke="#DDDAD0" strokeWidth="22" />
      {banded
        ? bands.map((b, i) => <path key={b.id} d={arc(i / 3 + 0.005, (i + 1) / 3 - 0.005, 80)} fill="none" stroke={b.colour} strokeWidth="22" />)
        : share !== null && share > 0 && <path d={arc(0, Math.min(1, share), 80)} fill="none" stroke="#2A5FD0" strokeWidth="22" />}
      {needle && (
        <line
          x1="100"
          y1="100"
          x2={needle.x}
          y2={needle.y}
          stroke="#1E1E1E"
          strokeWidth="5"
          strokeLinecap="round"
          style={reducedMotion ? undefined : { transition: "all 500ms ease-out" }}
        />
      )}
      <circle cx="100" cy="100" r="8" fill="#1E1E1E" />
    </svg>
  );
}

// The live dashboard (docs/UI_THEME.md > SysDash, and docs/GAME_DESIGN.md > Tune, in SysDash).
// There is no timer: each wave waits for "Run wave".
export default function SysDash() {
  const { state } = useGameContext();
  const step = tuneFor(state.currentId);
  const live = step && (state.phase === "tune" || (state.phase === "solved" && state.run.tuneWaves.length > 0)) ? step : null;
  return live ? <Tune step={live} /> : <Idle />;
}

function Tune({ step }: { step: TuneStep }) {
  const { state, dispatch } = useGameContext();
  const waves = state.run.tuneWaves;
  // The wave whose result is showing. Screen state only: the player taps Next to see the next wave.
  const [seen, setSeen] = useState(waves.length);
  const showing = seen < waves.length ? seen : null;
  const done = waves.length === step.waves.length && showing === null;
  const n = showing ?? waves.length;
  const wave = step.waves[Math.min(n, step.waves.length - 1)];
  const [stop, setStop] = useState(0);
  const ran = showing !== null ? waves[showing] : null;
  const band = ran ? bandOf(ran.stop, wave.right) : null;
  const sentence = band === "low" ? step.tooLow : band === "high" ? step.tooHigh : step.justRight;
  const bandInfo = bands.find((b) => b.id === band);

  return (
    <div className="flex flex-col gap-4 text-[18px]">
      <p className="rounded-md border-2 border-[#2A5FD0] bg-[#EEF3FD] px-3 py-2">{step.fact}</p>

      {done ? (
        <>
          <ul className="flex flex-col gap-2">
            {waves.map((w, i) => (
              <li key={i} className="flex items-start gap-2">
                {w.right ? <TickIcon /> : <CrossIcon />}
                <span>{step.waves[i].text}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-md border-2 border-ok bg-[#E4F3E2] px-3 py-2 font-bold" role="status">
            {step.lesson}
          </p>
          <OpenAppButton id="incident" />
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold">
              Wave {n + 1} of {step.waves.length}
            </p>
          </div>
          <p className="text-[20px] leading-normal">{wave.text}</p>

          <div>
            <Gauge share={ran ? (ran.stop < wave.right ? 1 / 6 : ran.stop > wave.right ? 5 / 6 : 0.5) : null} banded label={bandInfo?.words ?? step.dial} />
            <div className="mx-auto flex max-w-[320px] justify-between gap-1">
              {bands.map((b) => (
                <span key={b.id} className={`flex flex-1 flex-col items-center gap-1 text-center ${b.id === band ? "font-bold" : ""}`}>
                  {b.icon}
                  {b.words}
                </span>
              ))}
            </div>
          </div>

          {ran && (
            <p className="flex items-start gap-2 rounded-md border-2 px-3 py-2" style={{ borderColor: bandInfo?.colour }} role="status">
              {bandInfo?.icon}
              <span>{sentence}</span>
            </p>
          )}

          <Dial step={step} stop={ran ? ran.stop : stop} right={ran && !ran.right ? wave.right : null} disabled={!!ran} onChange={setStop} />

          {ran ? (
            <button type="button" autoFocus onClick={() => setSeen(seen + 1)} className={`${button} self-start bg-[#FFE08A] hover:bg-[#FFD35C]`}>
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                dispatch({ type: "runWave", stop });
                setSeen(waves.length);
              }}
              className={`${button} self-start bg-[#FFE08A] hover:bg-[#FFD35C]`}
            >
              Run wave
            </button>
          )}
        </>
      )}
    </div>
  );
}

// One slider that snaps to the step's stops, each labelled, with minus and plus buttons beside it
// so dragging is never required. After a wrong wave, the right stop is marked.
function Dial({
  step,
  stop,
  right,
  disabled,
  onChange,
}: {
  step: TuneStep;
  stop: number;
  right: number | null;
  disabled: boolean;
  onChange: (stop: number) => void;
}) {
  const last = step.stops.length - 1;
  const small = "flex h-12 w-12 shrink-0 items-center justify-center rounded-md border-2 border-ink bg-white text-[24px] font-bold enabled:hover:bg-[#EEF3FD] disabled:opacity-50";
  return (
    <div className="flex flex-col gap-2" data-tour="dial">
      <label htmlFor="sysdash-dial" className="font-bold">
        {step.dial}
      </label>
      <div className="flex items-center gap-2">
        <button type="button" disabled={disabled || stop === 0} onClick={() => onChange(stop - 1)} className={small}>
          −
        </button>
        <input
          id="sysdash-dial"
          type="range"
          min={0}
          max={last}
          step={1}
          value={stop}
          disabled={disabled}
          aria-valuetext={step.stops[stop]}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-12 min-w-0 flex-1 accent-[#2A5FD0]"
        />
        <button type="button" disabled={disabled || stop === last} onClick={() => onChange(stop + 1)} className={small}>
          +
        </button>
      </div>
      <ol className="grid gap-1" style={{ gridTemplateColumns: `repeat(${step.stops.length}, minmax(0, 1fr))` }}>
        {step.stops.map((s, i) => (
          <li
            key={s}
            className={`flex flex-col items-center gap-1 rounded-md border-2 px-1 py-1 text-center ${
              i === right ? "border-ok bg-[#E4F3E2]" : i === stop ? "border-[#2A5FD0] font-bold" : "border-transparent"
            }`}
          >
            {i === right && <TickIcon size={22} />}
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}

// No Tune step is waiting: users, cash and the current stage as simple gauges.
function Idle() {
  const { state } = useGameContext();
  const stage = currentStage(state);
  const users = usersOnScreen(state);
  // The cash gauge is full at ten times the stage's base cash, so it means the same in every stage.
  const cashShare = state.cash / (baseCash(stage) * 10);
  const tiles = [
    { label: "Users", value: fullNumber(users), share: progressShare(users) },
    { label: "Cash", value: `£${fullNumber(state.cash)}`, share: cashShare },
    { label: "Stage", value: `${stage}: ${stageByNumber(stage).name}`, share: stage / 5 },
  ];
  return (
    <ul className="grid gap-4 text-[18px] sm:grid-cols-3">
      {tiles.map((t) => (
        <li key={t.label} className="flex flex-col items-center gap-1 rounded-lg border-2 border-[#C9C1A3] bg-[#FBF8EC] p-3">
          <p className="font-bold">{t.label}</p>
          <Gauge share={t.share} label={`${t.label}: ${t.value}`} />
          <p className="text-[20px] font-bold">{t.value}</p>
        </li>
      ))}
    </ul>
  );
}
