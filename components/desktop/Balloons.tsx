"use client";

import { useEffect, useRef, useState } from "react";
import { emailView } from "@/game/emails";
import type { Email } from "@/game/types";

const SHOW_MS = 3500;

// A speech balloon rises from the tray for each new email, one after another
// (docs/UI_THEME.md > Desktop, and docs/GAME_DESIGN.md > The order emails arrive in).
// While the spotlight shows, balloons stay hidden so they never cover the thing to tap.
export default function Balloons({ emails, hidden, onOpen }: { emails: Email[]; hidden: boolean; onOpen: () => void }) {
  const [queue, setQueue] = useState<string[]>([]);
  // Emails already there when the desktop appears are not new.
  const seen = useRef(emails.length);

  useEffect(() => {
    if (emails.length > seen.current) {
      const fresh = emails.slice(seen.current).map((e) => e.key);
      setQueue((q) => [...q, ...fresh]);
    }
    seen.current = emails.length;
  }, [emails]);

  const key = queue[0];
  useEffect(() => {
    if (!key) return;
    const t = setTimeout(() => setQueue((q) => q.slice(1)), SHOW_MS);
    return () => clearTimeout(t);
  }, [key]);

  const view = key ? emailView(key) : undefined;
  return (
    <div className="pointer-events-none absolute bottom-2 right-2 z-[950]" aria-live="polite">
      {view && !hidden && (
        <button
          key={key}
          type="button"
          onClick={() => {
            setQueue([]);
            onOpen();
          }}
          className="os-note balloon-rise pointer-events-auto relative min-h-12 rounded-2xl border-2 border-ink bg-[#FFF8D6] px-4 py-2 text-left text-[18px] shadow-[2px_4px_10px_rgba(0,0,0,0.35)]"
        >
          New email from {view.name}
          <span className="os-note-tail absolute -bottom-[10px] right-8 h-4 w-4 rotate-45 border-b-2 border-r-2 border-ink bg-[#FFF8D6]" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
