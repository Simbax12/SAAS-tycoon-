import { desktopApps, type AppId } from "@/data/desktopApps";
import { AppIcon } from "./icons";

type Props = { isPhone: boolean; onOpen: (id: AppId) => void };

// The icon grid on the left side of the desktop. One tap opens a window
// (docs/UI_THEME.md > Desktop icons). On a phone, 3 per row (docs/UI_THEME.md > Phone layout).
export default function DesktopIcons({ isPhone, onOpen }: Props) {
  return (
    <nav
      aria-label="Desktop"
      className={
        isPhone
          ? "grid h-full grid-cols-3 content-start gap-2 overflow-y-auto p-2"
          : "grid h-full auto-cols-[112px] grid-flow-col grid-rows-[repeat(auto-fill,100px)] content-start justify-start gap-1 overflow-auto p-2"
      }
    >
      {desktopApps.map((app) => (
        <button
          key={app.id}
          type="button"
          onClick={() => onOpen(app.id)}
          className="flex min-h-[48px] flex-col items-center justify-start gap-1 rounded-md p-1 text-center hover:bg-white/25 focus-visible:bg-white/25"
        >
          <AppIcon id={app.id} size={40} />
          <span className="rounded bg-[rgba(30,30,30,0.72)] px-1.5 text-[18px] leading-tight text-cream">
            {app.name}
          </span>
        </button>
      ))}
    </nav>
  );
}
