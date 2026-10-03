import { appById, type AppId } from "@/data/desktopApps";
import { AppIcon } from "@/components/desktop/icons";
import HowToPlay from "./HowToPlay";

// Until a later milestone builds a window, it shows its icon and what it will hold
// (the "Opens" column in docs/UI_THEME.md > Desktop icons).
function Placeholder({ id }: { id: AppId }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <AppIcon id={id} size={72} />
      <p className="text-[18px]">{appById(id).opens}.</p>
    </div>
  );
}

export default function WindowBody({ id }: { id: AppId }) {
  if (id === "howToPlay") return <HowToPlay />;
  return <Placeholder id={id} />;
}
