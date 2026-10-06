"use client";

import { patternIcons, patternTools } from "@/data/patterns";
import { PatternIcon, PipIcon } from "@/components/desktop/gameIcons";
import { useGameContext } from "@/components/useGame";
import { isMastered, patternBook, type Pip } from "@/game/patternBook";

// A pattern's three pips, with a "Mastered" badge when all are gold (docs/UI_THEME.md > Pattern Book and pattern cards).
export function Pips({ pips }: { pips: Pip[] }) {
  return (
    <p className="flex flex-wrap items-center gap-1 text-[18px]">
      <span className="sr-only">Pips: {pips.join(", ")}.</span>
      {pips.map((pip, i) => (
        <PipIcon key={i} pip={pip} />
      ))}
      {isMastered(pips) && <span className="ml-2 rounded-full bg-[#F2B632] px-2 font-bold">Mastered</span>}
    </p>
  );
}

// The "Also seen as" lines a pattern has gathered from its repeats.
export function AlsoSeenAs({ lines }: { lines: string[] }) {
  if (lines.length === 0) return null;
  return (
    <div className="text-[18px]">
      <p className="font-bold">Also seen as</p>
      <ul className="flex flex-col gap-1">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

// Every pattern learned so far (docs/UI_THEME.md > Pattern Book and pattern cards).
// Each entry also lists the Builds that practised it, under "Built in".
export default function PatternBook() {
  const { state } = useGameContext();
  const patterns = patternBook(state);

  if (patterns.length === 0) return <p className="text-[18px]">No patterns yet. Fix an incident to learn one.</p>;

  return (
    <ul className="flex flex-col gap-3">
      {patterns.map((p) => {
        const icon = patternIcons[p.name];
        return (
          <li key={p.name} className="flex items-start gap-3 rounded-lg border-2 border-[#6B3FA0] bg-white px-4 py-3">
            {icon && <PatternIcon id={icon} size={48} />}
            <div className="flex min-w-0 flex-col gap-2">
              <h3 className="text-[20px] font-bold">{p.name}</h3>
              <p className="text-[18px]">{p.useWhen}</p>
              {p.pips && <Pips pips={p.pips} />}
              <AlsoSeenAs lines={p.alsoSeenAs} />
              {p.builtIn.length > 0 && (
                <div className="text-[18px]">
                  <p className="font-bold">Built in</p>
                  <ul className="flex flex-col gap-1">
                    {p.builtIn.map((title) => (
                      <li key={title}>{title}</li>
                    ))}
                  </ul>
                </div>
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
