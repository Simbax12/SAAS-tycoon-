// Shop item icons (docs/UI_THEME.md > Shop item icons). Plain SVG shapes only, no logos
// (docs/UI_THEME.md > Original artwork only). "lifeline" is Victor's lifeline.

const INK = "#1E1E1E";
const s = { stroke: INK, strokeWidth: 1.5 };

const drawings: Record<string, React.ReactNode> = {
  // Credit card
  "feat-payments": (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2" fill="#2A5FD0" {...s} />
      <rect x="2.5" y="8.5" width="19" height="2.5" fill={INK} />
      <rect x="5" y="13.5" width="4.5" height="3" rx="0.5" fill="#F2B632" />
    </>
  ),
  // Camera
  "feat-photos": (
    <>
      <path d="M3 8 H7.5 L9 5.5 H15 L16.5 8 H21 V19 H3 Z" fill="#9AA4B2" {...s} />
      <circle cx="12" cy="13" r="3.8" fill="#7FB8F0" {...s} />
    </>
  ),
  // Envelope with a bell
  "feat-email": (
    <>
      <rect x="2.5" y="7" width="15" height="11" rx="1" fill="#F4F0E0" {...s} />
      <path d="M2.5 7 L10 13 L17.5 7" fill="none" {...s} />
      <path d="M16 9 C16 5.5 22 5.5 22 9 V12 H16 Z" fill="#F2B632" {...s} />
      <circle cx="19" cy="13.2" r="1" fill={INK} />
    </>
  ),
  // Round badge with a tick
  "feat-verified": (
    <>
      <circle cx="12" cy="12" r="9.5" fill="#2A5FD0" {...s} />
      <path d="M7.5 12.5 L10.5 15.5 L16.5 9" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  // Rocket
  "feat-global": (
    <>
      <path d="M12 2 C16 5 16.5 10 15.5 15 H8.5 C7.5 10 8 5 12 2 Z" fill="#F4F0E0" {...s} />
      <circle cx="12" cy="9" r="2" fill="#7FB8F0" {...s} />
      <path d="M8.5 12 L5 16.5 H8.8 M15.5 12 L19 16.5 H15.2" fill="#C83232" {...s} />
      <path d="M10 15.5 L12 21 L14 15.5 Z" fill="#F2B632" {...s} />
    </>
  ),
  // Crescent moon
  "feat-darkmode": <path d="M15.5 3 A9 9 0 1 0 21 15.5 A7 7 0 0 1 15.5 3 Z" fill="#F2B632" {...s} />,
  // Three speech bubbles
  "feat-groups": (
    <>
      <rect x="2" y="3" width="10" height="7" rx="2" fill="#7FB8F0" {...s} />
      <rect x="12" y="7" width="10" height="7" rx="2" fill="#F2B632" {...s} />
      <rect x="5" y="14" width="10" height="7" rx="2" fill="#5DAA3C" {...s} />
    </>
  ),
  // Microphone
  "feat-voice": (
    <>
      <rect x="9" y="2.5" width="6" height="11" rx="3" fill="#9AA4B2" {...s} />
      <path d="M6 11 C6 18 18 18 18 11 M12 17 V21 M8.5 21 H15.5" fill="none" {...s} strokeWidth="1.8" />
    </>
  ),
  // Two letters joined by an arrow
  "feat-translate": (
    <>
      <rect x="1.5" y="3" width="9" height="9" rx="1.5" fill="#7FB8F0" {...s} />
      <path d="M4 10 L6 5 L8 10 M4.8 8.2 H7.2" fill="none" {...s} />
      <rect x="13.5" y="12" width="9" height="9" rx="1.5" fill="#F2B632" {...s} />
      <path d="M15.5 14.5 H20.5 L15.5 19 H20.5" fill="none" {...s} />
      <path d="M8 15.5 H12 M10 13.5 L12 15.5 L10 17.5" fill="none" {...s} strokeWidth="1.8" />
    </>
  ),
  // Flask
  "srv-test": (
    <>
      <path d="M9.5 2.5 H14.5 M10.5 2.5 V9 L4.5 19 C4 20.2 4.8 21.5 6 21.5 H18 C19.2 21.5 20 20.2 19.5 19 L13.5 9 V2.5" fill="#F4F0E0" {...s} />
      <path d="M7.5 15 H16.5 L19.3 19.5 C19.6 20.3 19 21 18.2 21 H5.8 C5 21 4.4 20.3 4.7 19.5 Z" fill="#5DAA3C" />
    </>
  ),
  // Tall server tower
  "srv-bigger": (
    <>
      <rect x="6.5" y="1.5" width="11" height="21" rx="1.5" fill="#9AA4B2" {...s} />
      <path d="M8.5 6 H15.5 M8.5 10 H15.5 M8.5 14 H15.5" {...s} />
      <circle cx="15" cy="18.5" r="1.2" fill="#2E8B3D" />
    </>
  ),
  // Heartbeat line on a screen
  "srv-monitoring": (
    <>
      <rect x="2" y="3.5" width="20" height="14" rx="1.5" fill="#1E1E1E" {...s} />
      <path d="M4 11 H8 L10 7 L13 15 L15 11 H20" fill="none" stroke="#5DAA3C" strokeWidth="1.8" />
      <path d="M9 21 H15 M12 17.5 V21" {...s} />
    </>
  ),
  // Two servers, one dimmed
  "srv-standby": (
    <>
      <rect x="2" y="4" width="9" height="16" rx="1" fill="#9AA4B2" {...s} />
      <rect x="13" y="4" width="9" height="16" rx="1" fill="#D9D9D9" stroke="#8A8A8A" strokeWidth="1.5" strokeDasharray="2 1.5" />
      <path d="M4 8 H9 M4 11 H9 M15 8 H20 M15 11 H20" {...s} />
      <circle cx="8.5" cy="16.5" r="1.1" fill="#2E8B3D" />
    </>
  ),
  // Pie chart
  "srv-analytics": (
    <>
      <circle cx="12" cy="12" r="9.5" fill="#7FB8F0" {...s} />
      <path d="M12 12 V2.5 A9.5 9.5 0 0 1 21 15 Z" fill="#F2B632" {...s} />
    </>
  ),
  // Alarm bell
  "srv-drills": (
    <>
      <path d="M5 17 C6.5 15.5 6.5 13 6.5 10 C6.5 6.5 9 4 12 4 C15 4 17.5 6.5 17.5 10 C17.5 13 17.5 15.5 19 17 Z" fill="#C83232" {...s} />
      <circle cx="12" cy="19.5" r="1.8" fill="#F2B632" {...s} />
      <path d="M2.5 7 C3 5 4 3.8 5.5 3 M21.5 7 C21 5 20 3.8 18.5 3" fill="none" {...s} />
    </>
  ),
  // Two screens side by side
  "gear-monitor": (
    <>
      <rect x="1.5" y="4" width="10" height="9" rx="1" fill="#7FB8F0" {...s} />
      <rect x="12.5" y="4" width="10" height="9" rx="1" fill="#7FB8F0" {...s} />
      <path d="M6.5 13 V17 M17.5 13 V17 M4 17.5 H9 M15 17.5 H20" {...s} strokeWidth="1.8" />
    </>
  ),
  // Framed picture of a hill
  "gear-wallpapers": (
    <>
      <rect x="2.5" y="3.5" width="19" height="17" rx="1" fill="#BFE3FF" {...s} />
      <path d="M3.3 17 C8 11 13 11 20.7 15 V19.7 H3.3 Z" fill="#5DAA3C" />
      <circle cx="16.5" cy="8" r="2" fill="#F2B632" />
    </>
  ),
  // Thick book
  "gear-handbook": (
    <>
      <path d="M4 5 C4 3.5 5 3 6 3 H20 V18 H6 C5 18 4 18.5 4 20 Z" fill="#2A5FD0" {...s} />
      <path d="M4 20 C4 21 5 21.5 6 21.5 H20 V18" fill="#F4F0E0" {...s} />
      <path d="M8 7.5 H16" stroke="#FFFFFF" strokeWidth="1.6" />
    </>
  ),
  // Tower PC with a lightning mark
  "gear-pc": (
    <>
      <rect x="5.5" y="2" width="13" height="20" rx="1.5" fill="#9AA4B2" {...s} />
      <path d="M13 5.5 L9 12.5 H12 L10.5 18.5 L15 10.5 H12 Z" fill="#F2B632" {...s} strokeWidth="1" />
    </>
  ),
  // Life ring
  lifeline: (
    <>
      <circle cx="12" cy="12" r="9.5" fill="#FFFFFF" {...s} />
      <circle cx="12" cy="12" r="4.5" fill="#F4F0E0" {...s} />
      <path d="M12 2.5 V7.5 M12 16.5 V21.5 M2.5 12 H7.5 M16.5 12 H21.5" stroke="#C83232" strokeWidth="4" />
      <circle cx="12" cy="12" r="9.5" fill="none" {...s} />
      <circle cx="12" cy="12" r="4.5" fill="none" {...s} />
    </>
  ),
};

export function ShopIcon({ id, size = 44 }: { id: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0" aria-hidden="true" focusable="false" strokeLinejoin="round" strokeLinecap="round">
      {drawings[id] ?? <circle cx="12" cy="12" r="8" fill="#F2B632" {...s} />}
    </svg>
  );
}
