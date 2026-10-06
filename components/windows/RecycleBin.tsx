"use client";

import { incidentById, isRepeat } from "@/data/incidents";
import { patternIcons } from "@/data/patterns";
import { CrossIcon, PatternIcon } from "@/components/desktop/gameIcons";
import { useGameContext } from "@/components/useGame";
import type { BinEntry } from "@/game/types";

type Shown = { title: string; plain: string; label?: string; pattern?: string; why: string };

// The words for one entry: a wrong option from a new incident, or a wrong card from a repeat.
// They come from the data files, never the save. An entry whose id no longer exists is hidden.
function shown(entry: BinEntry): Shown | undefined {
  const incident = incidentById(entry.incidentId);
  if (!incident) return undefined;
  if (isRepeat(incident)) {
    const card = incident.cards.find((c) => c.pattern === entry.choice);
    return card && { title: incident.title, plain: card.pattern, pattern: card.pattern, why: card.text };
  }
  const option = incident.options.find((o) => o.id === entry.choice);
  return option && { title: incident.title, plain: option.plain, label: option.label, why: option.result };
}

// Every wrong option the player tried, with why it failed, newest first
// (docs/UI_THEME.md > Desktop icons).
export default function RecycleBin() {
  const { state } = useGameContext();
  const entries = [...state.recycleBin]
    .reverse()
    .flatMap((entry, i) => {
      const e = shown(entry);
      return e ? [{ key: `${i}`, ...e }] : [];
    });

  if (entries.length === 0) return <p className="text-[18px]">The Recycle Bin is empty.</p>;

  return (
    <ul className="flex flex-col gap-3">
      {entries.map((e) => {
        const icon = e.pattern ? patternIcons[e.pattern] : undefined;
        return (
          <li key={e.key} className="flex flex-col gap-1 rounded-lg border-2 border-[#8A8A8A] bg-white px-4 py-3">
            <p className="text-[18px] font-bold">{e.title}</p>
            <p className="flex items-center gap-2 text-[20px] leading-snug">
              {icon && <PatternIcon id={icon} size={32} />}
              {e.plain}
            </p>
            {e.label && <p className="text-[18px] text-[#4A4A4A]">{e.label}</p>}
            <p className="mt-1 flex items-start gap-2 text-[18px]">
              <CrossIcon size={24} />
              <span>{e.why}</span>
            </p>
          </li>
        );
      })}
    </ul>
  );
}
