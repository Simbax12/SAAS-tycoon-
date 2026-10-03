// Copied from docs/ROOM.md > Desk boxes and Screen boxes. The docs win if the two disagree.
// Boxes are in percent of the 1280 by 720 picture.

import type { StageNumber } from "./stages";

export type Box = { left: number; top: number; width: number; height: number };

export type Room = {
  stage: StageNumber;
  deskBox: Box;
  screenBox: Box;
};

export const ROOM_PICTURE = { width: 1280, height: 720 };

export const rooms: Room[] = [
  {
    stage: 1,
    deskBox: { left: 43.5, top: 36.5, width: 15.6, height: 21.2 },
    screenBox: { left: 30.3, top: 16.9, width: 44.7, height: 62.5 },
  },
  {
    stage: 2,
    deskBox: { left: 38.4, top: 33.9, width: 22.9, height: 23.3 },
    screenBox: { left: 20.2, top: 13.2, width: 58.6, height: 59.7 },
  },
  {
    stage: 3,
    deskBox: { left: 39.1, top: 32.9, width: 21.2, height: 20.6 },
    screenBox: { left: 22.5, top: 13.3, width: 55.0, height: 52.5 },
  },
  {
    stage: 4,
    deskBox: { left: 41.4, top: 26.8, width: 17.0, height: 16.9 },
    screenBox: { left: 15.5, top: 6.7, width: 68.3, height: 70.3 },
  },
  {
    stage: 5,
    deskBox: { left: 41.4, top: 38.3, width: 17.0, height: 12.6 },
    screenBox: { left: 17.1, top: 23.1, width: 64.8, height: 47.6 },
  },
];

export const roomByStage = (n: StageNumber): Room => rooms.find((r) => r.stage === n)!;

// docs/ROOM.md > Files for each stage
export const roomFiles = (n: StageNumber) => ({
  walk: [`/room/stage${n}-walk.webm`, `/room/stage${n}-walk.mp4`],
  sit: [`/room/stage${n}-sit.webm`, `/room/stage${n}-sit.mp4`],
  desk: `/room/stage${n}-desk.webp`,
  seat: `/room/stage${n}-seat.webp`,
  poster: `/room/stage${n}-poster.webp`,
});
