// Icons for the parts in the Blueprint toolbox (docs/BLUEPRINTS.md > The toolbox).
// Original drawings, never a product's logo (docs/UI_THEME.md > Original artwork only).
// Parts that are also System Map boxes use the same drawing as the box.

import { toolboxPart } from "@/data/blueprints";
import { BoxSvg } from "@/components/desktop/gameIcons";
import type { BoxIconId } from "@/data/systemMap";

const INK = "#1E1E1E";

const asBox: Record<string, BoxIconId> = {
  Users: "users",
  "Web server": "server",
  Database: "database",
  "Payment provider": "payments",
  Cache: "cache",
  CDN: "cdn",
  "File storage": "storage",
  "Load balancer": "lb",
  "Session store": "session",
  "Message queue": "queue",
  "Background worker": "worker",
};

const drawings: Record<string, React.ReactNode> = {
  "Web servers": (
    <>
      <rect x="2" y="4" width="9" height="16" rx="1.2" fill="#9AA4B2" stroke={INK} strokeWidth="1.4" />
      <rect x="13" y="4" width="9" height="16" rx="1.2" fill="#9AA4B2" stroke={INK} strokeWidth="1.4" />
      <path d="M4.5 8 H8.5 M15.5 8 H19.5" stroke={INK} strokeWidth="1.4" />
      <circle cx="6.5" cy="15" r="1.4" fill="#2E8B3D" stroke={INK} strokeWidth="1" />
      <circle cx="17.5" cy="15" r="1.4" fill="#2E8B3D" stroke={INK} strokeWidth="1" />
    </>
  ),
  "Primary database": (
    <>
      <path d="M4 5 V19 C4 21.5 20 21.5 20 19 V5" fill="#7FB8F0" stroke={INK} strokeWidth="1.4" />
      <ellipse cx="12" cy="5" rx="8" ry="2.6" fill="#BFE3FF" stroke={INK} strokeWidth="1.4" />
      <path d="M12 9.5 L13.4 12.4 L16.5 12.7 L14.2 14.8 L14.9 17.8 L12 16.3 L9.1 17.8 L9.8 14.8 L7.5 12.7 L10.6 12.4 Z" fill="#F2B632" stroke={INK} strokeWidth="1" />
    </>
  ),
  "Plain-text password file": (
    <>
      <path d="M5 2 H15 L20 7 V22 H5 Z" fill="#F4F0E0" stroke={INK} strokeWidth="1.4" />
      <path d="M15 2 V7 H20" fill="none" stroke={INK} strokeWidth="1.4" />
      <path d="M8 11 H17 M8 14.5 H17 M8 18 H14" stroke="#C83232" strokeWidth="1.6" />
    </>
  ),
  "One big server": (
    <>
      <rect x="3" y="1.5" width="18" height="21" rx="1.5" fill="#9AA4B2" stroke={INK} strokeWidth="1.4" />
      <path d="M6 5.5 H18 M6 9 H18 M6 12.5 H18" stroke={INK} strokeWidth="1.4" />
      <circle cx="7.5" cy="18" r="1.6" fill="#2E8B3D" stroke={INK} strokeWidth="1" />
      <circle cx="12" cy="18" r="1.6" fill="#2E8B3D" stroke={INK} strokeWidth="1" />
    </>
  ),
};

// A tray name may carry a place, such as "CDN (Tokyo)". It uses the part's own drawing.
export function PartIcon({ name, size = 32 }: { name: string; size?: number }) {
  const base = toolboxPart(name)?.name ?? name;
  const box = asBox[base];
  if (box) return <BoxSvg id={box} size={size} />;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0" aria-hidden="true" focusable="false" strokeLinejoin="round" strokeLinecap="round">
      {drawings[base] ?? <circle cx="12" cy="12" r="8" fill="#F2B632" stroke={INK} strokeWidth="1.6" />}
    </svg>
  );
}
