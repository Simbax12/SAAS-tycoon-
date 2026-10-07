"use client";

import { useState } from "react";
import { patternIcons } from "@/data/patterns";
import { repeatById } from "@/data/repeats";
import { nameBesideBadge, PatternIcon, SenderBadge } from "@/components/desktop/gameIcons";
import { useDesktop } from "@/components/desktop/DesktopContext";
import { useGameContext } from "@/components/useGame";
import { emailView, type EmailView } from "@/game/emails";
import { alsoSeenAs, useWhenFor } from "@/game/patternBook";
import { incidentOpen } from "@/game/rules";
import { AlsoSeenAs } from "./PatternBook";
import { TUTORIAL_INCIDENT } from "@/data/tutorial";

// Every email, newest first, each with its sender badge (docs/UI_THEME.md > Emails and sender badges).
// Emails are never deleted, so the Inbox is the story so far.
export default function Inbox() {
  const { state, dispatch } = useGameContext();
  const [openKey, setOpenKey] = useState<string | null>(null);

  const list = [...state.emails]
    .reverse()
    .map((e) => ({ ...e, view: emailView(e.key) }))
    .filter((e): e is typeof e & { view: EmailView } => e.view !== undefined);
  const opened = list.find((e) => e.key === openKey);

  if (opened) return <OpenEmail view={opened.view} onBack={() => setOpenKey(null)} />;

  return (
    <ul className="flex flex-col gap-2">
      {list.map((e) => (
        <li key={e.key}>
          <button
            type="button"
            data-tour={e.view.investigate === TUTORIAL_INCIDENT ? "tutorialEmail" : undefined}
            onClick={() => {
              setOpenKey(e.key);
              dispatch({ type: "openEmail", key: e.key });
            }}
            className={`flex min-h-12 w-full flex-col items-start gap-1 rounded-md border-2 px-3 py-2 text-left text-[18px] hover:bg-[#EEF3FD] ${
              e.read ? "border-[#C9C1A3] bg-cream" : "border-bar bg-white font-bold"
            }`}
          >
            <span className="flex items-center gap-2">
              {!e.read && <span className="h-3 w-3 shrink-0 rounded-full bg-bar" aria-hidden="true" />}
              <SenderBadge from={e.view.from} />
              {nameBesideBadge(e.view.from, e.view.name) && <span>{e.view.name}</span>}
              {!e.read && <span className="sr-only">, unread</span>}
            </span>
            <span className="w-full truncate">{e.view.text}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function OpenEmail({ view, onBack }: { view: EmailView; onBack: () => void }) {
  const { state } = useGameContext();
  const { investigate, openShopAt } = useDesktop();
  // "Investigate" shows while its incident is still open.
  const canInvestigate = view.investigate === state.currentId && incidentOpen(state);

  return (
    <article className="flex flex-col items-start gap-4">
      <button type="button" onClick={onBack} className="min-h-12 rounded-md border-2 border-ink bg-white px-4 text-[18px] hover:bg-[#EEF3FD]">
        Back
      </button>
      <p className="flex items-center gap-2 text-[18px] font-bold">
        <SenderBadge from={view.from} />
        {nameBesideBadge(view.from, view.name)}
      </p>
      {view.refresher ? <Refresher repeatId={view.refresher} /> : <p className="text-[20px] leading-normal">{view.text}</p>}
      {canInvestigate && (
        <button
          type="button"
          data-tour="investigate"
          onClick={investigate}
          className="min-h-12 rounded-md border-2 border-ink bg-[#FFE08A] px-5 text-[18px] font-bold hover:bg-[#FFD35C]"
        >
          Investigate
        </button>
      )}
      {view.shopItem && (
        <button
          type="button"
          onClick={() => openShopAt(view.shopItem!)}
          className="min-h-12 rounded-md border-2 border-ink bg-[#FFE08A] px-5 text-[18px] font-bold hover:bg-[#FFD35C]"
        >
          Open in Shop
        </button>
      )}
    </article>
  );
}

// A refresher shows the pattern's icon, its name, its "Use this when" line and its "Also seen as"
// lines. There is no test and no reward (docs/GAME_DESIGN.md > Refreshers).
function Refresher({ repeatId }: { repeatId: string }) {
  const { state } = useGameContext();
  const pattern = repeatById(repeatId)!.pattern;
  const icon = patternIcons[pattern];
  return (
    <div className="flex items-start gap-3 rounded-lg border-2 border-[#6B3FA0] bg-white px-4 py-3">
      {icon && <PatternIcon id={icon} size={48} />}
      <div className="flex min-w-0 flex-col gap-2">
        <h3 className="text-[20px] font-bold">{pattern}</h3>
        <p className="text-[18px]">{useWhenFor(pattern)}</p>
        <AlsoSeenAs lines={alsoSeenAs(state, pattern)} />
      </div>
    </div>
  );
}
