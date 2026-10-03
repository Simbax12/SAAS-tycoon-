"use client";

import RoomFrame from "@/components/room/RoomFrame";
import { useWindows } from "@/components/desktop/useWindows";
import { useScreen } from "@/components/useScreen";

// The single page. Milestone 1 has no game state yet: the player is always in Stage 1,
// and every visit counts as the first one, so the intro plays (docs/ROOM.md > The first time the game is opened).
export default function Game() {
  const screen = useScreen();
  const windows = useWindows();
  if (!screen) return null;
  return <RoomFrame stage={1} screen={screen} windows={windows} firstVisit />;
}
