"use client";

import RoomFrame from "@/components/room/RoomFrame";
import { useWindows } from "@/components/desktop/useWindows";
import { GameContext, useGame } from "@/components/useGame";
import { useScreen } from "@/components/useScreen";
import { currentStage } from "@/game/rules";

// The single page. The walk-in clip plays only when there is no save yet
// (docs/ROOM.md > The first time the game is opened, and > Every later visit).
export default function Game() {
  const screen = useScreen();
  const windows = useWindows();
  const { state, dispatch, hadSave } = useGame();
  if (!screen || hadSave === null) return null;
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      <RoomFrame stage={currentStage(state)} screen={screen} windows={windows} firstVisit={!hadSave} />
    </GameContext.Provider>
  );
}
