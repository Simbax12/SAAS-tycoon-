"use client";

import { useEffect } from "react";
import { BlipLogo } from "./icons";

// The BlipOS loading bar, 2 seconds at most (docs/UI_THEME.md > Desktop).
export const LOADING_MS = 1600;

// It names the BlipOS version. A new stage shows the update screen instead (OsUpdate.tsx).
type Props = { version: number; onDone: () => void; reducedMotion: boolean };

export default function LoadingBar({ version, onDone, reducedMotion }: Props) {
  const words = `BlipOS ${version}`;
  const ms = LOADING_MS;
  useEffect(() => {
    const t = setTimeout(onDone, ms);
    return () => clearTimeout(t);
  }, [onDone, ms]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#173A8A] text-white" role="status" aria-label={words}>
      <div className="flex items-center gap-3 px-4 text-center text-[32px] font-bold">
        <BlipLogo size={48} />
        {words}
      </div>
      <div className="h-6 w-[min(260px,70%)] overflow-hidden rounded-full border-2 border-white/80 bg-[#0E2560]">
        <div
          className="h-full bg-[#5DAA3C]"
          style={
            reducedMotion
              ? { width: "100%" }
              : { width: "0%", animation: `loading-fill ${ms - 200}ms ease-in-out forwards` }
          }
        />
      </div>
    </div>
  );
}
