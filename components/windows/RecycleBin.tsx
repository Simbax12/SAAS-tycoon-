"use client";

import { challengeById } from "@/data/challenges";
import { CrossIcon } from "@/components/desktop/gameIcons";
import { useGameContext } from "@/components/useGame";

// Every wrong option the player tried, with why it failed, newest first
// (docs/UI_THEME.md > Desktop icons). The words come from the data files, never the save.
export default function RecycleBin() {
  const { state } = useGameContext();
  const entries = [...state.recycleBin].reverse().flatMap((entry, i) => {
    const challenge = challengeById(entry.incidentId);
    const option = challenge?.options.find((o) => o.id === entry.choice);
    return challenge && option ? [{ key: `${i}`, title: challenge.title, option }] : [];
  });

  if (entries.length === 0) return <p className="text-[18px]">The Recycle Bin is empty.</p>;

  return (
    <ul className="flex flex-col gap-3">
      {entries.map((e) => (
        <li key={e.key} className="flex flex-col gap-1 rounded-lg border-2 border-[#8A8A8A] bg-white px-4 py-3">
          <p className="text-[18px] font-bold">{e.title}</p>
          <p className="text-[20px] leading-snug">{e.option.plain}</p>
          <p className="text-[18px] text-[#4A4A4A]">{e.option.label}</p>
          <p className="mt-1 flex items-start gap-2 text-[18px]">
            <CrossIcon size={24} />
            <span>{e.option.result}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
