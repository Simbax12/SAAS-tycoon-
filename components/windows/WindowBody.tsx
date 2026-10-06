import type { AppId } from "@/data/desktopApps";
import Blueprint from "./Blueprint";
import HowToPlay from "./HowToPlay";
import Inbox from "./Inbox";
import Incident from "./Incident";
import PatternBook from "./PatternBook";
import RecycleBin from "./RecycleBin";
import Settings from "./Settings";
import Shop from "./Shop";
import Stats from "./Stats";
import SysDash from "./SysDash";
import SystemMap from "./SystemMap";
import Terminal from "./Terminal";

// The body of each desktop window (docs/UI_THEME.md > Desktop icons).
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
    case "shop":
      return <Shop />;
    case "stats":
      return <Stats />;
    case "blueprint":
      return <Blueprint />;
    case "terminal":
      return <Terminal />;
    case "sysdash":
      return <SysDash />;
  }
}
