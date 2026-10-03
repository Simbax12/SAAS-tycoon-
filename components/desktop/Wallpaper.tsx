// The BlipOS wallpaper: a rolling green hill under a bright blue sky with a few soft clouds
// (docs/UI_THEME.md > Desktop). Drawn with a CSS gradient and SVG shapes.

export default function Wallpaper() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "linear-gradient(to bottom, var(--color-sky-top), var(--color-sky-bottom))" }}
      aria-hidden="true"
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5DAA3C" />
            <stop offset="1" stopColor="#3F8A2B" />
          </linearGradient>
          <linearGradient id="hill-back" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7CC25A" />
            <stop offset="1" stopColor="#4E9A35" />
          </linearGradient>
        </defs>
        <g fill="#FFFFFF" opacity="0.85">
          <ellipse cx="80" cy="60" rx="34" ry="11" />
          <ellipse cx="100" cy="52" rx="22" ry="12" />
          <ellipse cx="290" cy="40" rx="40" ry="10" />
          <ellipse cx="310" cy="33" rx="22" ry="10" />
          <ellipse cx="210" cy="95" rx="24" ry="7" opacity="0.7" />
        </g>
        <path d="M0 210 C90 160 170 170 250 195 C310 214 360 200 400 185 V300 H0 Z" fill="url(#hill-back)" />
        <path d="M0 240 C80 190 200 180 290 215 C340 234 380 236 400 232 V300 H0 Z" fill="url(#hill)" />
      </svg>
    </div>
  );
}
