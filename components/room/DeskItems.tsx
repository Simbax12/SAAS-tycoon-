"use client";

import { useGameContext } from "@/components/useGame";

// Items bought from "Your setup", drawn on the desk at the bottom left, outside the screen
// (docs/ROOM.md > During play, and > The desk). Small 2D pictures, so no new clip is needed.
// The Wallpaper pack shows nothing in the room.

const INK = "#1E1E1E";

const drawings: Record<string, { label: string; picture: React.ReactNode }> = {
  // A second monitor beside the main one.
  "gear-monitor": {
    label: "Second monitor",
    picture: (
      <svg width="150" height="120" viewBox="0 0 150 120" aria-hidden="true">
        <rect x="6" y="6" width="138" height="88" rx="8" fill="#D8CFB8" stroke={INK} strokeWidth="3" />
        <rect x="18" y="16" width="114" height="66" rx="3" fill="#0F7F7F" stroke={INK} strokeWidth="2" />
        <path d="M60 94 L56 108 H94 L90 94 Z" fill="#C2B89E" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <rect x="40" y="106" width="70" height="10" rx="3" fill="#C2B89E" stroke={INK} strokeWidth="3" />
      </svg>
    ),
  },
  // A thick book lying on the desk.
  "gear-handbook": {
    label: "Engineering handbook",
    picture: (
      <svg width="110" height="60" viewBox="0 0 110 60" aria-hidden="true">
        <path d="M6 22 L60 8 L104 20 L50 36 Z" fill="#2A5FD0" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M6 22 V40 L50 54 V36 Z" fill="#F4F0E0" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M50 36 V54 L104 38 V20 Z" fill="#1F4BA8" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      </svg>
    ),
  },
  // A newer tower PC with a small light.
  "gear-pc": {
    label: "Faster PC",
    picture: (
      <svg width="64" height="120" viewBox="0 0 64 120" aria-hidden="true">
        <rect x="6" y="4" width="52" height="112" rx="5" fill="#2B2F36" stroke={INK} strokeWidth="3" />
        <path d="M16 20 H48 M16 30 H48" stroke="#5A6270" strokeWidth="3" />
        <circle cx="32" cy="96" r="5" fill="#4AD0FF" />
      </svg>
    ),
  },
};

export default function DeskItems() {
  const { state } = useGameContext();
  const owned = Object.keys(drawings).filter((id) => state.owned.includes(id));
  if (owned.length === 0) return null;
  return (
    <ul className="pointer-events-none absolute bottom-4 left-4 flex items-end gap-4">
      {owned.map((id) => (
        <li key={id} title={drawings[id].label} className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
          {drawings[id].picture}
          <span className="sr-only">{drawings[id].label}</span>
        </li>
      ))}
    </ul>
  );
}
