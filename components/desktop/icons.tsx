// Original icon drawings for BlipOS (docs/UI_THEME.md > Desktop icons).
// Every icon is drawn here with plain SVG shapes. No logos.

import type { AppId } from "@/data/desktopApps";

type IconProps = { size?: number; className?: string };

const OUTLINE = "#1E1E1E";

function Svg({ size = 48, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      focusable="false"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {children}
    </svg>
  );
}

const drawings: Record<AppId, React.ReactNode> = {
  // Envelope
  inbox: (
    <>
      <rect x="5" y="11" width="38" height="27" rx="3" fill="#F7E7B4" stroke={OUTLINE} strokeWidth="2" />
      <path d="M6 13 L24 27 L42 13" fill="none" stroke={OUTLINE} strokeWidth="2" />
    </>
  ),
  // Warning triangle
  incident: (
    <>
      <path d="M24 5 L44 41 H4 Z" fill="#F2B632" stroke={OUTLINE} strokeWidth="2" />
      <rect x="22" y="16" width="4" height="14" rx="2" fill={OUTLINE} />
      <circle cx="24" cy="35" r="2.4" fill={OUTLINE} />
    </>
  ),
  // Network of boxes
  systemMap: (
    <>
      <path d="M14 14 L34 14 M14 14 L24 34 M34 14 L24 34" stroke={OUTLINE} strokeWidth="2" fill="none" />
      <rect x="6" y="7" width="15" height="13" rx="2" fill="#7FB8F0" stroke={OUTLINE} strokeWidth="2" />
      <rect x="27" y="7" width="15" height="13" rx="2" fill="#7FB8F0" stroke={OUTLINE} strokeWidth="2" />
      <rect x="16" y="28" width="16" height="13" rx="2" fill="#8FD07A" stroke={OUTLINE} strokeWidth="2" />
    </>
  ),
  // Rolled-up plan
  blueprint: (
    <>
      <rect x="10" y="10" width="32" height="28" fill="#4C7FD8" stroke={OUTLINE} strokeWidth="2" />
      <path d="M16 18 H34 M16 24 H28 M16 30 H32" stroke="#DCEBFF" strokeWidth="2" />
      <rect x="5" y="8" width="8" height="32" rx="4" fill="#3561B5" stroke={OUTLINE} strokeWidth="2" />
    </>
  ),
  // Dark screen with a prompt
  terminal: (
    <>
      <rect x="5" y="8" width="38" height="30" rx="3" fill="#1E1E1E" stroke={OUTLINE} strokeWidth="2" />
      <path d="M11 17 L17 22 L11 27" fill="none" stroke="#F4F0E0" strokeWidth="2.5" />
      <path d="M20 28 H30" stroke="#F4F0E0" strokeWidth="2.5" />
      <rect x="18" y="38" width="12" height="4" fill="#9A9A9A" stroke={OUTLINE} strokeWidth="1.5" />
    </>
  ),
  // Dial gauge
  sysdash: (
    <>
      <path d="M6 34 A18 18 0 0 1 42 34 Z" fill="#F4F0E0" stroke={OUTLINE} strokeWidth="2" />
      <path d="M9 34 A15 15 0 0 1 15 22" fill="none" stroke="#2E8B3D" strokeWidth="4" />
      <path d="M17 20 A15 15 0 0 1 31 20" fill="none" stroke="#A86F00" strokeWidth="4" />
      <path d="M33 22 A15 15 0 0 1 39 34" fill="none" stroke="#C83232" strokeWidth="4" />
      <path d="M24 34 L31 21" stroke={OUTLINE} strokeWidth="2.5" />
      <circle cx="24" cy="34" r="3" fill={OUTLINE} />
    </>
  ),
  // Shopping trolley
  shop: (
    <>
      <path d="M4 9 H10 L15 31 H38 L42 15 H12" fill="#F4F0E0" stroke={OUTLINE} strokeWidth="2" />
      <path d="M14 22 H40" stroke={OUTLINE} strokeWidth="1.5" />
      <circle cx="18" cy="38" r="3.5" fill="#2A5FD0" stroke={OUTLINE} strokeWidth="2" />
      <circle cx="34" cy="38" r="3.5" fill="#2A5FD0" stroke={OUTLINE} strokeWidth="2" />
    </>
  ),
  // Open book
  patternBook: (
    <>
      <path d="M24 12 C18 8 10 8 4 10 V38 C10 36 18 36 24 40 Z" fill="#FFF6D8" stroke={OUTLINE} strokeWidth="2" />
      <path d="M24 12 C30 8 38 8 44 10 V38 C38 36 30 36 24 40 Z" fill="#FFF6D8" stroke={OUTLINE} strokeWidth="2" />
      <path d="M9 17 H19 M9 23 H19 M29 17 H39 M29 23 H39" stroke="#6B3FA0" strokeWidth="2" />
    </>
  ),
  // Bar chart
  stats: (
    <>
      <path d="M6 41 H42 M6 41 V7" stroke={OUTLINE} strokeWidth="2" fill="none" />
      <rect x="11" y="26" width="7" height="15" fill="#2E8B3D" stroke={OUTLINE} strokeWidth="1.5" />
      <rect x="21" y="18" width="7" height="23" fill="#2A5FD0" stroke={OUTLINE} strokeWidth="1.5" />
      <rect x="31" y="10" width="7" height="31" fill="#F2B632" stroke={OUTLINE} strokeWidth="1.5" />
    </>
  ),
  // Text file
  howToPlay: (
    <>
      <path d="M10 5 H30 L39 14 V43 H10 Z" fill="#FFFFFF" stroke={OUTLINE} strokeWidth="2" />
      <path d="M30 5 V14 H39" fill="#DDDDDD" stroke={OUTLINE} strokeWidth="2" />
      <path d="M15 21 H34 M15 27 H34 M15 33 H28" stroke="#2A5FD0" strokeWidth="2" />
    </>
  ),
  // Cog
  settings: (
    <>
      <g fill="#9AA4B2" stroke={OUTLINE} strokeWidth="2">
        {[0, 45, 90, 135].map((r) => (
          <rect key={r} x="20" y="4" width="8" height="40" rx="2" transform={`rotate(${r} 24 24)`} />
        ))}
        <circle cx="24" cy="24" r="14" />
      </g>
      <circle cx="24" cy="24" r="6" fill="#F4F0E0" stroke={OUTLINE} strokeWidth="2" />
    </>
  ),
  // Bin
  recycleBin: (
    <>
      <rect x="8" y="10" width="32" height="5" rx="2" fill="#B9C4CF" stroke={OUTLINE} strokeWidth="2" />
      <path d="M19 10 V6 H29 V10" fill="none" stroke={OUTLINE} strokeWidth="2" />
      <path d="M11 15 L14 43 H34 L37 15 Z" fill="#D7E0E8" stroke={OUTLINE} strokeWidth="2" />
      <path d="M19 20 V38 M24 20 V38 M29 20 V38" stroke="#5F6B78" strokeWidth="2" />
    </>
  ),
};

export function AppIcon({ id, size, className }: IconProps & { id: AppId }) {
  return (
    <Svg size={size} className={className}>
      {drawings[id]}
    </Svg>
  );
}

// A little hill in a circle, for the Start button.
export function BlipLogo({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="11" fill="#BFE3FF" stroke="#FFFFFF" strokeWidth="1.5" />
      <path d="M2 15 C7 10 12 11 16 13 C19 14 21 13 22 12.5 A11 11 0 0 1 2 15 Z" fill="#5DAA3C" />
    </svg>
  );
}

export function UsersIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="8" r="4.5" fill="#FFFFFF" />
      <path d="M3 22 C3 15 21 15 21 22 Z" fill="#FFFFFF" />
    </svg>
  );
}

export function CashIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10" fill="#F2B632" stroke="#FFFFFF" strokeWidth="1.5" />
      <path d="M15 8.5 C14 6.5 9.5 6.5 9.5 10 V16.5 M7.5 12.5 H13 M7.5 16.5 H16" fill="none" stroke="#1E1E1E" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M5 5 L15 15 M15 5 L5 15" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

export function StandUpIcon({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="4.5" r="2.5" fill="currentColor" />
      <path d="M12 8 V15 M12 15 L8 22 M12 15 L16 22 M7 11 H17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// A magnifying glass: a plus to zoom in, a minus to zoom out (docs/UI_THEME.md > Desktop).
export function ZoomIcon({ size = 26, zoomedIn = false }: IconProps & { zoomedIn?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="2.2" fill="none" />
      <path d="M15 15 L21 21" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d={zoomedIn ? "M7 10 H13" : "M7 10 H13 M10 7 V13"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
