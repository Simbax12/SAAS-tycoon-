// Original drawings for the game itself: pattern icons, System Map boxes, sender badges, Maya and stars.
// Plain SVG shapes only, no logos (docs/UI_THEME.md > Original artwork only).

import type { PersonId } from "@/data/people";
import type { PatternIconId } from "@/data/patterns";
import type { BoxIconId } from "@/data/systemMap";

const INK = "#1E1E1E";

type Props = { size?: number; className?: string };

function Svg({ size = 24, className, children }: Props & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className ?? ""}`} aria-hidden="true" focusable="false" strokeLinejoin="round" strokeLinecap="round">
      {children}
    </svg>
  );
}

// docs/UI_THEME.md > Pattern Book and pattern cards. Patterns not yet in play show a plain disc until their stage is built.
const patternDrawings: Partial<Record<PatternIconId, React.ReactNode>> = {
  shield: <path d="M12 2 L20 5 V11 C20 16 16.5 20 12 22 C7.5 20 4 16 4 11 V5 Z" fill="#7FB8F0" stroke={INK} strokeWidth="1.6" />,
  padlock: (
    <>
      <path d="M7.5 11 V8 A4.5 4.5 0 0 1 16.5 8 V11" fill="none" stroke={INK} strokeWidth="1.8" />
      <rect x="4.5" y="10.5" width="15" height="11" rx="2" fill="#F2B632" stroke={INK} strokeWidth="1.6" />
      <circle cx="12" cy="15.5" r="1.6" fill={INK} />
    </>
  ),
  key: (
    <>
      <circle cx="7.5" cy="12" r="4.5" fill="#F2B632" stroke={INK} strokeWidth="1.6" />
      <circle cx="7.5" cy="12" r="1.5" fill="#F4F0E0" stroke={INK} strokeWidth="1" />
      <path d="M12 12 H21 M18 12 V15.5 M15.5 12 V14.5" fill="none" stroke={INK} strokeWidth="2" />
    </>
  ),
  safe: (
    <>
      <rect x="3" y="3.5" width="18" height="17" rx="2" fill="#9AA4B2" stroke={INK} strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.5" fill="#F4F0E0" stroke={INK} strokeWidth="1.4" />
      <path d="M12 8.5 V12 L14.5 13.5" fill="none" stroke={INK} strokeWidth="1.6" />
      <path d="M5.5 20.5 V22 M18.5 20.5 V22" stroke={INK} strokeWidth="1.8" />
    </>
  ),
  lightning: <path d="M14 2 L5 13.5 H11 L9.5 22 L19 9.5 H13 Z" fill="#F2B632" stroke={INK} strokeWidth="1.6" />,
  bookmark: (
    <>
      <rect x="4" y="3" width="13" height="18" rx="1.5" fill="#F4F0E0" stroke={INK} strokeWidth="1.6" />
      <path d="M7 8 H13 M7 12 H13 M7 16 H11" stroke={INK} strokeWidth="1.2" />
      <path d="M15 3 H20 V12 L17.5 10 L15 12 Z" fill="#C83232" stroke={INK} strokeWidth="1.4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" fill="#7FB8F0" stroke={INK} strokeWidth="1.6" />
      <path d="M3 12 H21 M12 3 C8 7 8 17 12 21 M12 3 C16 7 16 17 12 21" fill="none" stroke={INK} strokeWidth="1.2" />
      <circle cx="7" cy="8" r="1.6" fill="#F2B632" stroke={INK} strokeWidth="1" />
      <circle cx="17" cy="9" r="1.6" fill="#F2B632" stroke={INK} strokeWidth="1" />
      <circle cx="10" cy="17" r="1.6" fill="#F2B632" stroke={INK} strokeWidth="1" />
    </>
  ),
  basket: (
    <>
      <path d="M7 10 L10 4 M17 10 L14 4" fill="none" stroke={INK} strokeWidth="1.6" />
      <path d="M2.5 10 H21.5 L19 20.5 H5 Z" fill="#E0A458" stroke={INK} strokeWidth="1.6" />
      <path d="M8.5 13 V18 M12 13 V18 M15.5 13 V18" stroke={INK} strokeWidth="1.3" />
    </>
  ),
};

export function PatternIcon({ id, size, className }: Props & { id: PatternIconId }) {
  return <Svg size={size} className={className}>{patternDrawings[id] ?? <circle cx="12" cy="12" r="8" fill="#F2B632" stroke={INK} strokeWidth="1.6" />}</Svg>;
}

// Icons inside System Map boxes. Drawn into a 24 by 24 box at the given place, for use inside a bigger SVG.
const boxDrawings: Record<BoxIconId, React.ReactNode> = {
  users: (
    <>
      <circle cx="8" cy="8" r="3.5" fill="#F2B632" stroke={INK} strokeWidth="1.4" />
      <path d="M2 20 C2 14 14 14 14 20 Z" fill="#2A5FD0" stroke={INK} strokeWidth="1.4" />
      <circle cx="16.5" cy="9" r="3" fill="#F2B632" stroke={INK} strokeWidth="1.4" />
      <path d="M12 20 C12 15 22 15 22 20 Z" fill="#2E8B3D" stroke={INK} strokeWidth="1.4" />
    </>
  ),
  server: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="1.5" fill="#9AA4B2" stroke={INK} strokeWidth="1.4" />
      <path d="M8 7 H16 M8 11 H16" stroke={INK} strokeWidth="1.4" />
      <circle cx="12" cy="17" r="1.6" fill="#2E8B3D" stroke={INK} strokeWidth="1" />
    </>
  ),
  database: (
    <>
      <path d="M4 5 V19 C4 21.5 20 21.5 20 19 V5" fill="#7FB8F0" stroke={INK} strokeWidth="1.4" />
      <ellipse cx="12" cy="5" rx="8" ry="2.6" fill="#BFE3FF" stroke={INK} strokeWidth="1.4" />
      <path d="M4 12 C4 14.5 20 14.5 20 12" fill="none" stroke={INK} strokeWidth="1.4" />
    </>
  ),
  payments: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" fill="#8FD07A" stroke={INK} strokeWidth="1.4" />
      <path d="M2 9.5 H22" stroke={INK} strokeWidth="2.4" />
      <path d="M5 15 H11" stroke={INK} strokeWidth="1.4" />
    </>
  ),
  secrets: patternDrawings.safe,
  cache: patternDrawings.lightning,
  storage: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="1.5" fill="#E0A458" stroke={INK} strokeWidth="1.4" />
      <path d="M3 9 H21" stroke={INK} strokeWidth="1.4" />
      <rect x="9" y="12" width="6" height="3" rx="0.8" fill="#F4F0E0" stroke={INK} strokeWidth="1.2" />
    </>
  ),
  // A ring of small CDN boxes (docs/CHALLENGES.md > 2.3 The Heavy Photos).
  cdn: (
    <>
      <circle cx="12" cy="12" r="7" fill="none" stroke={INK} strokeWidth="1.2" strokeDasharray="2 2" />
      <rect x="9" y="1.5" width="6" height="5" rx="1" fill="#7FB8F0" stroke={INK} strokeWidth="1.2" />
      <rect x="1.5" y="12" width="6" height="5" rx="1" fill="#7FB8F0" stroke={INK} strokeWidth="1.2" />
      <rect x="16.5" y="12" width="6" height="5" rx="1" fill="#7FB8F0" stroke={INK} strokeWidth="1.2" />
      <rect x="9" y="17.5" width="6" height="5" rx="1" fill="#7FB8F0" stroke={INK} strokeWidth="1.2" />
    </>
  ),
};

export function BoxIcon({ id, x, y, size = 24 }: { id: BoxIconId; x: number; y: number; size?: number }) {
  return (
    <svg x={x} y={y} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" strokeLinejoin="round" strokeLinecap="round">
      {boxDrawings[id]}
    </svg>
  );
}

// A System Map box's icon on its own, for use outside the diagram.
export function BoxSvg({ id, size }: Props & { id: BoxIconId }) {
  return <Svg size={size}>{boxDrawings[id]}</Svg>;
}

// Sender badges (docs/UI_THEME.md > Emails and sender badges).
type BadgeStyle = { colour: string; word: string; icon: React.ReactNode };

const W = "#FFFFFF";
const badgeIcons = {
  spanner: <path d="M15 3 A5 5 0 0 0 10.5 9.5 L3 17 L7 21 L14.5 13.5 A5 5 0 0 0 21 9 L17.5 11 L13 6.5 Z" fill="none" stroke={W} strokeWidth="1.8" />,
  tie: <path d="M9 2 H15 L13.5 6 L16 18 L12 22 L8 18 L10.5 6 Z" fill="none" stroke={W} strokeWidth="1.8" />,
  clipboard: (
    <>
      <rect x="4.5" y="4" width="15" height="18" rx="1.5" fill="none" stroke={W} strokeWidth="1.8" />
      <rect x="8.5" y="2" width="7" height="4" rx="1" fill={W} />
      <path d="M8 11 H16 M8 15 H16" stroke={W} strokeWidth="1.6" />
    </>
  ),
  speech: <path d="M3 5 H21 V16 H11 L6 20 V16 H3 Z" fill="none" stroke={W} strokeWidth="1.8" />,
  phone: <path d="M6 3 L9.5 3 L11 8 L8.5 9.5 A11 11 0 0 0 14.5 15.5 L16 13 L21 14.5 L21 18 A3 3 0 0 1 18 21 A15 15 0 0 1 3 6 A3 3 0 0 1 6 3 Z" fill="none" stroke={W} strokeWidth="1.8" />,
  ring: (
    <>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke={W} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="none" stroke={W} strokeWidth="1.8" />
      <path d="M6 6 L9.2 9.2 M18 6 L14.8 9.2 M6 18 L9.2 14.8 M18 18 L14.8 14.8" stroke={W} strokeWidth="1.8" />
    </>
  ),
};

const badgeStyles: Record<PersonId, BadgeStyle> = {
  maya: { colour: "#2E7D32", word: "Maya", icon: badgeIcons.spanner },
  sam: { colour: "#2A5FD0", word: "Boss", icon: badgeIcons.tie },
  lena: { colour: "#6B3FA0", word: "Team", icon: badgeIcons.clipboard },
  omar: { colour: "#6B3FA0", word: "Team", icon: badgeIcons.clipboard },
  zoe: { colour: "#6B3FA0", word: "Team", icon: badgeIcons.clipboard },
  customer: { colour: "#0F6E6E", word: "Customer", icon: badgeIcons.speech },
  dana: { colour: "#A8431C", word: "Consultant", icon: badgeIcons.phone },
  victor: { colour: "#4A4A4A", word: "Lifeline", icon: badgeIcons.ring },
};

// The name beside a badge, or nothing when the badge word already is the name (docs/UI_THEME.md > Emails and sender badges).
export const nameBesideBadge = (from: PersonId, name: string): string | null => (badgeStyles[from].word === name ? null : name);

export function SenderBadge({ from }: { from: PersonId }) {
  const b = badgeStyles[from];
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[18px] font-bold leading-tight text-white" style={{ background: b.colour }}>
      <Svg size={18}>{b.icon}</Svg>
      {b.word}
    </span>
  );
}

// Maya's round avatar, a friendly face (docs/UI_THEME.md > Maya).
export function MayaAvatar({ size = 56 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false" className="shrink-0">
      <circle cx="24" cy="24" r="23" fill="#2E7D32" />
      <path d="M9 26 C8 12 16 7 24 7 C32 7 40 12 39 26 C37 18 30 15 24 15 C18 15 11 18 9 26 Z" fill="#4A2E1E" />
      <circle cx="24" cy="27" r="13" fill="#E8B48A" />
      <path d="M11 24 C12 16 18 13 24 13 C30 13 36 16 37 24 C33 19 28 18 24 18 C20 18 15 19 11 24 Z" fill="#4A2E1E" />
      <circle cx="19.5" cy="27" r="1.8" fill={INK} />
      <circle cx="28.5" cy="27" r="1.8" fill={INK} />
      <path d="M19 32.5 C21.5 35.5 26.5 35.5 29 32.5" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function StarIcon({ filled, size = 26 }: { filled: boolean; size?: number }) {
  return (
    <Svg size={size}>
      <path d="M12 2.5 L14.9 8.6 L21.5 9.4 L16.6 13.9 L17.9 20.5 L12 17.2 L6.1 20.5 L7.4 13.9 L2.5 9.4 L9.1 8.6 Z" fill={filled ? "#F2B632" : "none"} stroke={INK} strokeWidth="1.6" />
    </Svg>
  );
}

export function TickIcon({ size = 26 }: Props) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="10" fill="#2E8B3D" />
      <path d="M7 12.5 L10.5 16 L17 8.5" fill="none" stroke="#FFFFFF" strokeWidth="2.4" />
    </Svg>
  );
}

export function CrossIcon({ size = 26 }: Props) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="10" fill="#C83232" />
      <path d="M8 8 L16 16 M16 8 L8 16" stroke="#FFFFFF" strokeWidth="2.4" />
    </Svg>
  );
}

export function WarningIcon({ size = 26 }: Props) {
  return (
    <Svg size={size}>
      <path d="M12 2.5 L22 20.5 H2 Z" fill="#F2B632" stroke={INK} strokeWidth="1.5" />
      <rect x="11" y="8.5" width="2" height="6.5" rx="1" fill={INK} />
      <circle cx="12" cy="17.5" r="1.2" fill={INK} />
    </Svg>
  );
}

// Dana's round avatar: a consultant with a headset (docs/UI_THEME.md > Dana and Victor).
export function DanaAvatar({ size = 48 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false" className="shrink-0">
      <circle cx="24" cy="24" r="23" fill="#A8431C" />
      <path d="M10 30 C9 14 16 8 24 8 C32 8 39 14 38 30 L34 30 C34 20 30 16 24 16 C18 16 14 20 14 30 Z" fill="#1E1E1E" />
      <circle cx="24" cy="27" r="12" fill="#8D5A3B" />
      <path d="M12 26 A12 12 0 0 1 36 26" fill="none" stroke="#F4F0E0" strokeWidth="2.4" />
      <rect x="9.5" y="24" width="5" height="8" rx="2" fill="#F4F0E0" />
      <path d="M12 32 C12 37 16 38 20 37" fill="none" stroke="#F4F0E0" strokeWidth="2" />
      <circle cx="19.5" cy="27" r="1.8" fill={INK} />
      <circle cx="28.5" cy="27" r="1.8" fill={INK} />
      <path d="M20 32 C22 34 26 34 28 32" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// Victor's round avatar: blunt, short hair, a straight mouth.
export function VictorAvatar({ size = 48 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false" className="shrink-0">
      <circle cx="24" cy="24" r="23" fill="#4A4A4A" />
      <circle cx="24" cy="26" r="13" fill="#D9A47E" />
      <path d="M11 22 C12 13 18 11 24 11 C30 11 36 13 37 22 C33 18 29 17 24 17 C19 17 15 18 11 22 Z" fill="#9A9A9A" />
      <path d="M17 23 H22 M26 23 H31" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <circle cx="19.5" cy="26.5" r="1.8" fill={INK} />
      <circle cx="28.5" cy="26.5" r="1.8" fill={INK} />
      <path d="M20 33 H28" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PhoneIcon({ size = 24 }: Props) {
  return (
    <Svg size={size}>
      <path d="M6 3 L9.5 3 L11 8 L8.5 9.5 A11 11 0 0 0 14.5 15.5 L16 13 L21 14.5 L21 18 A3 3 0 0 1 18 21 A15 15 0 0 1 3 6 A3 3 0 0 1 6 3 Z" fill="currentColor" />
    </Svg>
  );
}

// A Pattern Book pip (docs/UI_THEME.md > Pattern Book and pattern cards): gold has a small star,
// silver is filled, empty is an outline.
export function PipIcon({ pip, size = 26 }: { pip: "gold" | "silver" | "empty"; size?: number }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="9.5" fill={pip === "gold" ? "#F2B632" : pip === "silver" ? "#B9BEC6" : "none"} stroke={INK} strokeWidth="1.6" />
      {pip === "gold" && <path d="M12 6.5 L13.6 10 L17.3 10.3 L14.5 12.7 L15.4 16.4 L12 14.5 L8.6 16.4 L9.5 12.7 L6.7 10.3 L10.4 10 Z" fill="#FFFFFF" stroke={INK} strokeWidth="0.8" />}
    </Svg>
  );
}
