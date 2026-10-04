import { desktopApps, type AppId } from "@/data/desktopApps";
import { AppIcon } from "./icons";

// A number on an icon, or "dot" for a red badge with no number. 0 shows nothing.
export type IconBadges = Partial<Record<AppId, number | "dot">>;

type Props = { isPhone: boolean; badges: IconBadges; onOpen: (id: AppId) => void };

// The icon grid on the left side of the desktop. One tap opens a window
// (docs/UI_THEME.md > Desktop icons). On a phone, 3 per row (docs/UI_THEME.md > Phone layout).
export default function DesktopIcons({ isPhone, badges, onOpen }: Props) {
  return (
    <nav
      aria-label="Desktop"
      className={
        isPhone
          ? "grid h-full grid-cols-3 content-start gap-2 overflow-y-auto p-2"
          : "grid h-full auto-cols-[112px] grid-flow-col grid-rows-[repeat(auto-fill,100px)] content-start justify-start gap-1 overflow-auto p-2"
      }
    >
      {desktopApps.map((app) => {
        const badge = badges[app.id];
        const label = badge === "dot" ? `${app.name}, waiting` : badge ? `${app.name}, ${badge} unread` : app.name;
        return (
          <button
            key={app.id}
            type="button"
            onClick={() => onOpen(app.id)}
            aria-label={label}
            className="flex min-h-[48px] flex-col items-center justify-start gap-1 rounded-md p-1 text-center hover:bg-white/25 focus-visible:bg-white/25"
          >
            <span className="relative">
              <AppIcon id={app.id} size={40} />
              {badge ? (
                <span
                  className="absolute -right-3 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-alert px-1 text-[16px] font-bold leading-none text-white"
                  aria-hidden="true"
                >
                  {badge === "dot" ? "!" : badge}
                </span>
              ) : null}
            </span>
            <span className="rounded bg-[rgba(30,30,30,0.72)] px-1.5 text-[18px] leading-tight text-cream">{app.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
