"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { osForStage } from "@/data/blipOs";
import { roomByStage, roomFiles } from "@/data/rooms";
import { stageByNumber, type StageNumber } from "@/data/stages";
import Desktop from "@/components/desktop/Desktop";
import LoadingBar from "@/components/desktop/LoadingBar";
import MilestoneBanner from "@/components/desktop/MilestoneBanner";
import OsUpdate from "@/components/desktop/OsUpdate";
import { StandUpIcon } from "@/components/desktop/icons";
import type { Windows } from "@/components/desktop/useWindows";
import type { Screen } from "@/components/useScreen";
import DeskItems from "./DeskItems";
import { boxStyle, placePicture } from "./placePicture";
import { useZoom } from "./useZoom";
import { useGameContext } from "@/components/useGame";
import { itemEffects } from "@/data/upgrades";
import { ROOM_PICTURE, type Box } from "@/data/rooms";

// Zoomed in with the Second monitor: two screens side by side, each the shape of this room's
// screen but no wider than 4 by 3, so two fit with room to read, in a plain frame (docs/ROOM.md > During play).
const PAIR_FRAME = 10;
const PAIR_GAP = 14;
const PAIR_MARGIN = 24;
function pairBox(vw: number, vh: number, box: Box): React.CSSProperties {
  const aspect = Math.min((box.width * ROOM_PICTURE.width) / (box.height * ROOM_PICTURE.height), 4 / 3);
  const w = Math.min((vw - 2 * PAIR_MARGIN - 2 * PAIR_FRAME - PAIR_GAP) / 2, (vh - 2 * PAIR_MARGIN - 2 * PAIR_FRAME) * aspect);
  const width = 2 * w + PAIR_GAP + 2 * PAIR_FRAME;
  const height = w / aspect + 2 * PAIR_FRAME;
  return { left: (vw - width) / 2, top: (vh - height) / 2, width, height };
}

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

  // When a new stage starts during play, the player walks into the new room and sits down
  // (docs/ROOM.md > When a new stage starts). Then BlipOS updates and the milestone banner shows
  // (docs/UI_THEME.md > The upgrade). The new stage's emails wait until the banner has gone.
  const [moving, setMoving] = useState(false);
  const [arrival, setArrival] = useState<"update" | "banner" | null>(null);
  const lastStage = useRef(stage);
  useEffect(() => {
    if (stage > lastStage.current && phase === "seated") {
      setMoving(true);
      setPhase(reducedMotion ? "desk" : "walk");
    }
    lastStage.current = stage;
  }, [stage, phase, reducedMotion]);

  const afterSit = useCallback(() => {
    if (moving) {
      setMoving(false);
      setArrival("update");
      setPhase("seated");
    } else setPhase(booted ? "seated" : "loading");
  }, [booted, moving]);
  const updated = useCallback(() => setArrival("banner"), []);
  const bannerGone = useCallback(() => setArrival(null), []);
  const sitDown = () => (reducedMotion ? afterSit() : setPhase("sit"));
  const booted_ = useCallback(() => {
    setBooted(true);
    setPhase("seated");
  }, []);

  // Zoom only applies to the desktop on the computer layout (docs/ROOM.md > During play).
  const { view: zoomChoice, next: nextZoom } = useZoom();
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
    nextZoom();
  }, [reducedMotion, nextZoom]);

  const clip = phase === "walk" || phase === "sit";
  const onDesktop = phase === "loading" || phase === "seated";
  const view = onDesktop && !isPhone ? zoomChoice : "out";
  const zoomed = view !== "out";
  // The Second monitor's screen shows beside the main one when zoomed in or full screen
  // (docs/UPGRADES.md > Your setup). Not during the loading bar.
  const { state } = useGameContext();
  const dual = zoomed && phase === "seated" && state.owned.includes(itemEffects.secondMonitor);
  // Full screen, and the phone, show no room and no monitor frame. So does zoomed in with two screens,
  // which draws its own frames over the darkened room.
  const fullScreenDesktop = (isPhone && onDesktop) || view === "full";
  const framedPair = view === "in" && dual;

  const pic = placePicture(screen.width, screen.height, room, isPhone, zoomed && !framedPair);
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
      <>
        <Desktop
          isPhone={isPhone}
          reducedMotion={reducedMotion}
          windows={windows}
          paused={arrival !== null}
          onStandUp={() => setPhase("desk")}
          standUpInMenu={isPhone || zoomed}
          zoom={isPhone ? undefined : { view, onNext: onZoom }}
          dual={dual}
        />
        {arrival === "update" && (
          <div className="absolute inset-0 z-[2000]">
            <OsUpdate os={osForStage(stage)} onDone={updated} reducedMotion={reducedMotion} />
          </div>
        )}
        {arrival === "banner" && <MilestoneBanner os={osForStage(stage)} stage={stage} onDone={bannerGone} reducedMotion={reducedMotion} />}
      </>
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
      {(!fullScreenDesktop || framedPair) && (
        <div style={picStyle} className={framedPair ? "brightness-[0.35]" : undefined}>
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

          {onDesktop && !isPhone && !framedPair && !fullScreenDesktop && (
            <div className="overflow-hidden" style={boxStyle(room.screenBox)}>
              {desktop}
            </div>
          )}
        </div>
      )}

      {fullScreenDesktop && !framedPair && <div className="absolute inset-0">{desktop}</div>}
      {framedPair && (
        <div
          className="absolute overflow-hidden rounded-lg"
          style={{ ...pairBox(screen.width, screen.height, room.screenBox), border: `${PAIR_FRAME}px solid ${osForStage(stage).colours.taskbar}` }}
        >
          <div className="relative h-full w-full">{desktop}</div>
        </div>
      )}

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
