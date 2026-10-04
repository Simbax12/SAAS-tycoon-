"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { osForStage } from "@/data/blipOs";
import { roomByStage, roomFiles } from "@/data/rooms";
import { stageByNumber, type StageNumber } from "@/data/stages";
import Desktop from "@/components/desktop/Desktop";
import LoadingBar from "@/components/desktop/LoadingBar";
import { StandUpIcon } from "@/components/desktop/icons";
import type { Windows } from "@/components/desktop/useWindows";
import type { Screen } from "@/components/useScreen";
import DeskItems from "./DeskItems";
import { boxStyle, placePicture } from "./placePicture";
import { useZoom } from "./useZoom";

// Where the player is in the room (docs/ROOM.md > Part 1: What the player sees).
// walk: the walk-in clip. desk: the desk still, waiting for a tap. sit: the sit-down clip.
// loading: the BlipOS loading bar. seated: the desktop.
type Phase = "walk" | "desk" | "sit" | "loading" | "seated";

type Props = {
  stage: StageNumber;
  screen: Screen;
  windows: Windows;
  firstVisit: boolean;
};

const pill = "rounded-full bg-cream px-5 py-2 text-[18px] text-ink shadow-[0_2px_10px_rgba(0,0,0,0.5)]";

export default function RoomFrame({ stage, screen, windows, firstVisit }: Props) {
  const { isPhone, reducedMotion } = screen;
  const room = roomByStage(stage);
  const files = roomFiles(stage);

  // With reduced motion no clip plays (docs/ROOM.md > Reduced motion).
  const [phase, setPhase] = useState<Phase>(firstVisit && !reducedMotion ? "walk" : "desk");
  // The loading bar shows the first time the player sits down in this visit.
  const [booted, setBooted] = useState(false);

  const afterSit = useCallback(() => setPhase(booted ? "seated" : "loading"), [booted]);
  const sitDown = () => (reducedMotion ? afterSit() : setPhase("sit"));
  const booted_ = useCallback(() => {
    setBooted(true);
    setPhase("seated");
  }, []);

  // Zoom only applies to the desktop on the computer layout (docs/ROOM.md > During play).
  const { zoomed: zoomChoice, toggle: toggleZoom } = useZoom();
  // The view slides only when the player zooms, never while the browser window is resized.
  const [sliding, setSliding] = useState(false);
  const slideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(slideTimer.current), []);
  const onZoom = useCallback(() => {
    if (!reducedMotion) {
      setSliding(true);
      clearTimeout(slideTimer.current);
      slideTimer.current = setTimeout(() => setSliding(false), 550);
    }
    toggleZoom();
  }, [reducedMotion, toggleZoom]);

  const clip = phase === "walk" || phase === "sit";
  const onDesktop = phase === "loading" || phase === "seated";
  const fullScreenDesktop = isPhone && onDesktop;
  const zoomed = zoomChoice && onDesktop && !isPhone;

  const pic = placePicture(screen.width, screen.height, room, isPhone, zoomed);
  const picStyle: React.CSSProperties = {
    position: "absolute",
    left: pic.left,
    top: pic.top,
    width: pic.width,
    height: pic.height,
    transition: sliding ? "left 500ms ease, top 500ms ease, width 500ms ease, height 500ms ease" : undefined,
  };

  const desktop =
    phase === "loading" ? (
      <LoadingBar version={osForStage(stage).version} onDone={booted_} reducedMotion={reducedMotion} />
    ) : (
      <Desktop
        isPhone={isPhone}
        reducedMotion={reducedMotion}
        windows={windows}
        onStandUp={() => setPhase("desk")}
        standUpInMenu={isPhone || zoomed}
        zoom={isPhone ? undefined : { zoomed, onToggle: onZoom }}
      />
    );

  return (
    <main
      className="fixed inset-0 overflow-hidden bg-[#111111]"
      // The room never scrolls. Moving focus to a button can nudge a clipped box, so put it back.
      onScroll={(e) => {
        e.currentTarget.scrollLeft = 0;
        e.currentTarget.scrollTop = 0;
      }}
    >
      {!fullScreenDesktop && (
        <div style={picStyle}>
          {clip ? (
            <video
              key={phase}
              className="absolute inset-0 h-full w-full"
              autoPlay
              muted
              playsInline
              preload="auto"
              poster={phase === "walk" ? files.poster : files.desk}
              onEnded={phase === "walk" ? () => setPhase("desk") : afterSit}
              onError={phase === "walk" ? () => setPhase("desk") : afterSit}
              aria-hidden="true"
            >
              {(phase === "walk" ? files.walk : files.sit).map((src) => (
                <source key={src} src={src} type={src.endsWith(".webm") ? "video/webm" : "video/mp4"} />
              ))}
            </video>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={onDesktop ? files.seat : files.desk}
              alt=""
              className="absolute inset-0 h-full w-full select-none"
              draggable={false}
            />
          )}

          {phase === "desk" && <div className="monitor-pulse rounded-sm" style={boxStyle(room.deskBox)} aria-hidden="true" />}

          {onDesktop && !isPhone && (
            <div className="overflow-hidden" style={boxStyle(room.screenBox)}>
              {desktop}
            </div>
          )}
        </div>
      )}

      {fullScreenDesktop && <div className="absolute inset-0">{desktop}</div>}

      {/* Tap anywhere on the desk still to sit down. */}
      {phase === "desk" && (
        <button
          type="button"
          onClick={sitDown}
          className="absolute inset-0 flex items-end justify-center pb-[8vh]"
          autoFocus
        >
          <span className={pill}>Tap the screen to sit down</span>
        </button>
      )}

      {/* Skipping jumps to the end of the clip. */}
      {clip && (
        <button
          type="button"
          onClick={phase === "walk" ? () => setPhase("desk") : afterSit}
          className={`absolute bottom-4 right-4 min-h-12 ${pill}`}
        >
          Skip
        </button>
      )}

      {/* Around the screen, on the computer layout only, and hidden when zoomed in (docs/ROOM.md > During play). */}
      {onDesktop && !isPhone && !zoomed && (
        <>
          <div className={`absolute left-4 top-4 ${pill}`}>{stageByNumber(stage).name}</div>
          <DeskItems />
          {phase === "seated" && (
            <button
              type="button"
              onClick={() => setPhase("desk")}
              className={`absolute bottom-4 right-4 flex min-h-12 items-center gap-2 ${pill}`}
            >
              <StandUpIcon />
              Stand up
            </button>
          )}
        </>
      )}
    </main>
  );
}
