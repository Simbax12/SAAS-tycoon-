"use client";

import { useEffect } from "react";
import { BlipLogo } from "./icons";

// The BlipOS loading bar, 2 seconds at most (docs/UI_THEME.md > Desktop).
export const LOADING_MS = 1600;

// It names the BlipOS version (docs/UI_THEME.md > The upgrade).
export default function LoadingBar({ version, onDone, reducedMotion }: { version: number; onDone: () => void; reducedMotion: boolean }) {
  useEffect(() => {
    const t = setTimeout(onDone, LOADING_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#173A8A] text-white" role="status" aria-label={`BlipOS ${version}`}>
      <div className="flex items-center gap-3 text-[32px] font-bold">
        <BlipLogo size={48} />
        BlipOS {version}
      </div>
      <div className="h-6 w-[min(260px,70%)] overflow-hidden rounded-full border-2 border-white/80 bg-[#0E2560]">
        <div
          className="h-full bg-[#5DAA3C]"
          style={
            reducedMotion
              ? { width: "100%" }
              : { width: "0%", animation: `loading-fill ${LOADING_MS - 200}ms ease-in-out forwards` }
          }
        />
      </div>
    </div>
  );
}
