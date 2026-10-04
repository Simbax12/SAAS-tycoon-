"use client";

import { useGameContext } from "@/components/useGame";
import Diagram from "./Diagram";

// The diagram of Blip's architecture. It grows as the game goes on (docs/UI_THEME.md > Desktop icons).
export default function SystemMap() {
  const { state } = useGameContext();
  return <Diagram state={state} />;
}
