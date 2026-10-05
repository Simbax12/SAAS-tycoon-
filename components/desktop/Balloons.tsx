"use client";

import { useEffect, useRef, useState } from "react";
import { emailView } from "@/game/emails";
import type { Email } from "@/game/types";

const SHOW_MS = 3500;

// A speech balloon rises from the tray for each new email, one after another
// (docs/UI_THEME.md > Desktop, and docs/GAME_DESIGN.md > The order emails arrive in).
// When a stage starts, a balloon says "New in the Shop" after that stage's emails (docs/UPGRADES.md > Request emails).
// While the spotlight shows, balloons stay hidden so they never cover the thing to tap.

// The queue holds email keys, and this for the Shop balloon.
const SHOP = "shop";

type Props = { emails: Email[]; stage: number; hidden: boolean; onOpen: () => void; onOpenShop: () => void };

export default function Balloons({ emails, stage, hidden, onOpen, onOpenShop }: Props) {
  const [queue, setQueue] = useState<string[]>([]);
  // Emails already there when the desktop appears are not new, and neither is the stage.
  const seen = useRef(emails.length);
  const seenStage = useRef(stage);

  useEffect(() => {
    const fresh = emails.length > seen.current ? emails.slice(seen.current).map((e) => e.key) : [];
    const newStage = stage > seenStage.current ? [SHOP] : [];
    if (fresh.length + newStage.length > 0) setQueue((q) => [...q, ...fresh, ...newStage]);
    seen.current = emails.length;
    seenStage.current = stage;
  }, [emails, stage]);

  const key = queue[0];
  useEffect(() => {
    if (!key) return;
    const t = setTimeout(() => setQueue((q) => q.slice(1)), SHOW_MS);
    return () => clearTimeout(t);
  }, [key]);

  const view = key === SHOP ? { text: "New in the Shop" } : key ? emailView(key) : undefined;
  const text = view && ("name" in view ? `New email from ${view.name}` : view.text);
  return (
    <div className="pointer-events-none absolute bottom-2 right-2 z-[950]" aria-live="polite">
      {view && !hidden && (
        <button
          key={key}
          type="button"
          onClick={() => {
            setQueue([]);
            if (key === SHOP) onOpenShop();
            else onOpen();
          }}
          className="os-note balloon-rise pointer-events-auto relative min-h-12 rounded-2xl border-2 border-ink bg-[#FFF8D6] px-4 py-2 text-left text-[18px] shadow-[2px_4px_10px_rgba(0,0,0,0.35)]"
        >
          {text}
          <span className="os-note-tail absolute -bottom-[10px] right-8 h-4 w-4 rotate-45 border-b-2 border-r-2 border-ink bg-[#FFF8D6]" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
