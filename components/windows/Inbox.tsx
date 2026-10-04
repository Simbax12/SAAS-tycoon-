"use client";

import { useState } from "react";
import { SenderBadge } from "@/components/desktop/gameIcons";
import { useDesktop } from "@/components/desktop/DesktopContext";
import { useGameContext } from "@/components/useGame";
import { emailView, type EmailView } from "@/game/emails";
import { incidentOpen } from "@/game/rules";
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
              <span>{e.view.name}</span>
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
  const { state, dispatch } = useGameContext();
  const { openApp } = useDesktop();
  // "Investigate" shows while its incident is still open.
  const canInvestigate = view.investigate === state.currentId && incidentOpen(state);

  return (
    <article className="flex flex-col items-start gap-4">
      <button type="button" onClick={onBack} className="min-h-12 rounded-md border-2 border-ink bg-white px-4 text-[18px] hover:bg-[#EEF3FD]">
        Back
      </button>
      <p className="flex items-center gap-2 text-[18px] font-bold">
        <SenderBadge from={view.from} />
        {view.name}
      </p>
      <p className="text-[20px] leading-normal">{view.text}</p>
      {canInvestigate && (
        <button
          type="button"
          data-tour="investigate"
          onClick={() => {
            dispatch({ type: "investigate" });
            openApp("incident");
          }}
          className="min-h-12 rounded-md border-2 border-ink bg-[#FFE08A] px-5 text-[18px] font-bold hover:bg-[#FFD35C]"
        >
          Investigate
        </button>
      )}
    </article>
  );
}
