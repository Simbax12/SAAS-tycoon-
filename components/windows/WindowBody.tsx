import { appById, type AppId } from "@/data/desktopApps";
import { AppIcon } from "@/components/desktop/icons";
import HowToPlay from "./HowToPlay";
import Inbox from "./Inbox";
import Incident from "./Incident";
import PatternBook from "./PatternBook";
import RecycleBin from "./RecycleBin";
import Settings from "./Settings";
import SystemMap from "./SystemMap";

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
  switch (id) {
    case "howToPlay":
      return <HowToPlay />;
    case "inbox":
      return <Inbox />;
    case "incident":
      return <Incident />;
    case "systemMap":
      return <SystemMap />;
    case "patternBook":
      return <PatternBook />;
    case "recycleBin":
      return <RecycleBin />;
    case "settings":
      return <Settings />;
    default:
      return <Placeholder id={id} />;
  }
}
