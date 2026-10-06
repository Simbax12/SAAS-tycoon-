// The BlipOS wallpaper, set by the version (docs/UI_THEME.md > BlipOS versions).
// plain: one flat colour, the desktop colour of the version. hill: a rolling green hill under a
// bright blue sky with a few soft clouds (docs/UI_THEME.md > Desktop), drawn with a CSS gradient and SVG shapes.
// The Wallpaper pack adds three more: sunset hill, night sky and snowy hill (docs/UI_THEME.md > The player's setup).

import type { WallpaperId } from "@/data/blipOs";

type Look = {
  sky: [string, string];
  hillBack: [string, string];
  hill: [string, string];
  clouds?: string;
};

const looks: Record<Exclude<WallpaperId, "plain">, Look> = {
  hill: { sky: ["var(--color-sky-top)", "var(--color-sky-bottom)"], hillBack: ["#7CC25A", "#4E9A35"], hill: ["#5DAA3C", "#3F8A2B"], clouds: "#FFFFFF" },
  sunset: { sky: ["#5B3A8C", "#F29E5C"], hillBack: ["#6E7A3A", "#4D5A26"], hill: ["#4E6A2E", "#33481C"], clouds: "#FFD9B8" },
  night: { sky: ["#0B1736", "#24406E"], hillBack: ["#24452E", "#17301F"], hill: ["#1B3A23", "#0F2415"] },
  snow: { sky: ["#9FB8CC", "#E4EEF5"], hillBack: ["#F4F7FA", "#D5E0EA"], hill: ["#FFFFFF", "#DCE6EE"], clouds: "#FFFFFF" },
};

// Small stars for the night sky, in the 400 by 300 drawing.
const stars = [
  [30, 90], [70, 130], [120, 80], [160, 115], [210, 95], [250, 140], [290, 85], [300, 160], [375, 100], [95, 160], [190, 150], [365, 150],
];

export default function Wallpaper({ kind }: { kind: WallpaperId }) {
  if (kind === "plain") return <div className="absolute inset-0 bg-[var(--os-desktop)]" aria-hidden="true" />;
  const look = looks[kind];
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: `linear-gradient(to bottom, ${look.sky[0]}, ${look.sky[1]})` }}
      aria-hidden="true"
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id={`hill-${kind}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={look.hill[0]} />
            <stop offset="1" stopColor={look.hill[1]} />
          </linearGradient>
          <linearGradient id={`hill-back-${kind}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={look.hillBack[0]} />
            <stop offset="1" stopColor={look.hillBack[1]} />
          </linearGradient>
        </defs>
        {kind === "night" && (
          <g fill="#F4F0E0">
            {stars.map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" />
            ))}
            {/* A crescent: the moon with a smaller circle cut out of it. */}
            <mask id="moon-cut">
              <rect x="300" y="95" width="60" height="60" fill="#FFFFFF" />
              <circle cx="337" cy="120" r="14" fill="#000000" />
            </mask>
            <circle cx="330" cy="125" r="16" mask="url(#moon-cut)" />
          </g>
        )}
        {kind === "sunset" && <circle cx="300" cy="190" r="34" fill="#FFC27A" opacity="0.9" />}
        {look.clouds && (
          <g fill={look.clouds} opacity="0.85">
            <ellipse cx="80" cy="60" rx="34" ry="11" />
            <ellipse cx="100" cy="52" rx="22" ry="12" />
            <ellipse cx="290" cy="40" rx="40" ry="10" />
            <ellipse cx="310" cy="33" rx="22" ry="10" />
            <ellipse cx="210" cy="95" rx="24" ry="7" opacity="0.7" />
          </g>
        )}
        <path d="M0 210 C90 160 170 170 250 195 C310 214 360 200 400 185 V300 H0 Z" fill={`url(#hill-back-${kind})`} />
        <path d="M0 240 C80 190 200 180 290 215 C340 234 380 236 400 232 V300 H0 Z" fill={`url(#hill-${kind})`} />
      </svg>
    </div>
  );
}
