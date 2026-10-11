"use client";

import { useEffect, useState } from "react";
import type { BlipOsVersion } from "@/data/blipOs";
import { BlipLogo } from "./icons";

// The BlipOS update when a new stage starts (docs/UI_THEME.md > The upgrade): the new version's
// colours, a bar that counts from 0% to 100%, and "Please do not switch off your computer."
export const UPDATE_MS = 3000;

type Props = { os: BlipOsVersion; onDone: () => void; reducedMotion: boolean };

export default function OsUpdate({ os, onDone, reducedMotion }: Props) {
  const [percent, setPercent] = useState(reducedMotion ? 100 : 0);

  useEffect(() => {
    if (reducedMotion) {
      const t = setTimeout(onDone, 1000);
      return () => clearTimeout(t);
    }
    const start = Date.now();
    const tick = setInterval(() => {
      const share = Math.min(1, (Date.now() - start) / UPDATE_MS);
      setPercent(Math.round(share * 100));
      if (share >= 1) {
        clearInterval(tick);
        setTimeout(onDone, 300);
      }
    }, 60);
    return () => clearInterval(tick);
  }, [onDone, reducedMotion]);

  const words = `Updating to BlipOS ${os.version}`;
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-4 text-center"
      style={{ background: `linear-gradient(to bottom, ${os.colours.title}, ${os.colours.titleEnd})`, color: os.colours.titleText }}
      role="status"
      aria-label={`${words}, ${percent}%`}
    >
      <div className="flex items-center gap-3 text-[32px] font-bold">
        <BlipLogo size={48} />
        {words}
      </div>
      <div className="h-6 w-[min(320px,80%)] overflow-hidden rounded-full border-2 border-current">
        <div className="h-full" style={{ width: `${percent}%`, background: os.colours.start }} />
      </div>
      <p className="text-[24px] font-bold" aria-hidden="true">
        {percent}%
      </p>
      <p className="text-[18px]">Please do not switch off your computer.</p>
    </div>
  );
}
