"use client";

import { useEffect, useRef } from "react";
import { desktopApps, type AppId } from "@/data/desktopApps";
import { AppIcon, StandUpIcon } from "./icons";

type Props = {
  isPhone: boolean;
  onOpen: (id: AppId) => void;
  onStandUp: () => void;
  onClose: () => void;
};

// The Start menu lists the same items as the desktop icons (docs/UI_THEME.md > Desktop).
// On a phone it also holds "Stand up" (docs/ROOM.md > During play).
export default function StartMenu({ isPhone, onOpen, onStandUp, onClose }: Props) {
  const first = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const item = "flex min-h-12 w-full items-center gap-3 rounded-md px-3 text-left text-[18px] hover:bg-[#DCE6FA] focus-visible:bg-[#DCE6FA]";

  return (
    <>
      <div className="absolute inset-0 z-[1001]" onClick={onClose} aria-hidden="true" />
      <div
        role="menu"
        aria-label="Start"
        className={`absolute bottom-0 left-0 z-[1002] flex max-h-full flex-col overflow-y-auto rounded-tr-xl border-2 border-bar bg-cream p-2 shadow-[4px_-4px_16px_rgba(0,0,0,0.35)] ${
          isPhone ? "w-[min(300px,100%)]" : "w-[280px]"
        }`}
      >
        {desktopApps.map((app, i) => (
          <button
            key={app.id}
            ref={i === 0 ? first : undefined}
            type="button"
            role="menuitem"
            className={item}
            onClick={() => onOpen(app.id)}
          >
            <AppIcon id={app.id} size={32} />
            {app.name}
          </button>
        ))}
        {isPhone && (
          <>
            <hr className="my-1 border-[#B9B29A]" />
            <button type="button" role="menuitem" className={item} onClick={onStandUp}>
              <span className="flex w-8 justify-center text-ink">
                <StandUpIcon size={28} />
              </span>
              Stand up
            </button>
          </>
        )}
      </div>
    </>
  );
}
