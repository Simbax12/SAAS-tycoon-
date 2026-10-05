import { ROOM_PICTURE, type Box, type Room } from "@/data/rooms";

export type Rect = { left: number; top: number; width: number; height: number };

// Space kept clear above and below the screen box on the computer layout, so the
// stage name and the "Stand up" button never cover the desktop.
const MARGIN_Y = 72;
const MARGIN_X = 16;
// Zoomed in, this much of the room picture shows on every side of the screen box,
// so a thin strip of the monitor's frame stays visible (docs/ROOM.md > During play).
const ZOOM_BEZEL = 20;

const centre = (b: Box) => ({ x: (b.left + b.width / 2) / 100, y: (b.top + b.height / 2) / 100 });
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

// Where to draw the room picture (and its clips) in a window of vw by vh pixels.
// Every clip and still of one stage uses the same place, so they line up exactly.
export function placePicture(vw: number, vh: number, room: Room, isPhone: boolean, zoomed = false): Rect {
  const { width: pw, height: ph } = ROOM_PICTURE;
  const cover = Math.max(vw / pw, vh / ph);

  if (isPhone) {
    // Fill the screen and keep the monitor in the middle (docs/ROOM.md > During play).
    const width = pw * cover;
    const height = ph * cover;
    const c = centre(room.deskBox);
    return {
      width,
      height,
      left: clamp(vw / 2 - c.x * width, vw - width, 0),
      top: clamp(vh / 2 - c.y * height, vh - height, 0),
    };
  }

  const box = room.screenBox;
  if (zoomed) {
    const s = Math.min((vw - 2 * ZOOM_BEZEL) / ((box.width / 100) * pw), (vh - 2 * ZOOM_BEZEL) / ((box.height / 100) * ph));
    const width = pw * s;
    const height = ph * s;
    // Put the middle of the screen box in the middle of the window.
    return {
      width,
      height,
      left: vw / 2 - ((box.left + box.width / 2) / 100) * width,
      top: vh / 2 - ((box.top + box.height / 2) / 100) * height,
    };
  }

  const scale = Math.min(
    cover,
    (vw - 2 * MARGIN_X) / ((box.width / 100) * pw),
    (vh - 2 * MARGIN_Y) / ((box.height / 100) * ph),
  );
  const width = pw * scale;
  const height = ph * scale;
  let left = (vw - width) / 2;
  let top = (vh - height) / 2;
  // Keep the whole screen box inside the window, clear of the margins.
  const boxLeft = left + (box.left / 100) * width;
  const boxRight = boxLeft + (box.width / 100) * width;
  const boxTop = top + (box.top / 100) * height;
  const boxBottom = boxTop + (box.height / 100) * height;
  if (boxLeft < MARGIN_X) left += MARGIN_X - boxLeft;
  else if (boxRight > vw - MARGIN_X) left -= boxRight - (vw - MARGIN_X);
  if (boxTop < MARGIN_Y) top += MARGIN_Y - boxTop;
  else if (boxBottom > vh - MARGIN_Y) top -= boxBottom - (vh - MARGIN_Y);
  return { left, top, width, height };
}

export const boxStyle = (b: Box): React.CSSProperties => ({
  position: "absolute",
  left: `${b.left}%`,
  top: `${b.top}%`,
  width: `${b.width}%`,
  height: `${b.height}%`,
});
