# The room: the world around the computer

The game has two layers.

- **The desktop** is where all the play happens. It is 2D, drawn in the browser, and described in UI_THEME.md.
- **The room** is the place the computer sits in. It is a low-poly 3D space, shown as short video clips and still pictures. It gives the game the feeling of sitting down at a real desk to do a real job.

The room is never interactive in 3D. Everything the player clicks is 2D. The only room actions are "sit down" and "stand up".

## How to read this file

- **Clip:** a short video made outside the game, with Wan 2.2. The game only plays it.
- **Still:** one picture of the room, taken from the last frame of a clip, so the two match exactly. Each stage has two:
  - the **desk still**, at the end of the walk-in clip: the whole desk, where the player taps to sit down.
  - the **seat still**, at the end of the sit-down clip: the monitor close up. The desktop sits inside it during play.
- **Screen box:** where the monitor's screen sits in the seat still, as left, top, width and height in percent of the picture. The desktop is laid exactly over this box.
- **Computer layout** and **phone layout** are the two layouts in UI_THEME.md (see UI_THEME.md > Windows).

---

# Part 1: What the player sees

## The first time the game is opened

1. The walk-in clip for Stage 1 plays: the camera moves through the garage to the desk and stops facing the monitor.
2. The clip ends on the Stage 1 desk still. The words "Tap the screen to sit down" appear, with a pulsing outline around the monitor.
3. The player taps the monitor. The sit-down clip plays: the camera moves in until the screen fills the view.
4. The BlipOS loading bar and Maya's welcome email follow (see UI_THEME.md > Desktop).

A "Skip" button shows during every clip. Skipping jumps to the end of the clip.

## Every later visit

The game opens on the desk still for the current stage, with "Tap the screen to sit down". No walk-in clip plays. Tapping plays the sit-down clip, then the desktop appears.

## When a new stage starts

Blip has moved somewhere bigger. Before Maya's stage opening email, the new stage's walk-in clip plays, then its desk still with "Tap the screen to sit down", then the sit-down clip. The player sees the new place before they read about it.

## During play

**Computer layout:** the desktop sits inside the monitor, laid over the screen box of the current stage's seat still. The screen box can be any shape: the garage's old monitor is nearly square, later ones are wide. The desktop fits itself to the box. Around it, outside the screen:

- Top left: the stage name, for example "Garage".
- Bottom left: items the player bought from "Your setup", drawn on the desk (see "The desk" below).
- Bottom right: a "Stand up" button. It shows the desk still and "Tap the screen to sit down". This is the pause screen. The game state does not change.

**Phone layout:** the desktop fills the whole screen, with no room around it. Every pixel is needed at 375px wide. The clips still play, cropped to keep the monitor in the middle. "Stand up" is in the Start menu.

## Reduced motion

When motion is turned off in Settings, or the device asks for reduced motion, no clip plays. The game shows the desk still instead, then goes straight to the desktop when the player taps.

## Sound

Clips are silent. Room sounds, if any, are added with the rest of the sound in the Polish milestone (see START_HERE.md > Build order).

---

# Part 2: The rooms

Each stage has its own room. The rooms tell the story of Blip growing up.

| Stage | Room | The monitor | Around the desk |
|---|---|---|---|
| 1 | A garage with a bare brick wall and a concrete floor | A chunky beige box monitor with a curved glass screen | A workbench, one old tower PC, a desk lamp, a cardboard box of cables |
| 2 | A small rented office with one window | A flat grey monitor on a stand | A second-hand desk, a whiteboard, a pot plant |
| 3 | An open-plan office with rows of desks | A wide flat monitor | Other desks in soft focus, a coffee mug, sticky notes on the wall |
| 4 | A tall office with glass walls and a city view | A large thin monitor | A standing desk, a server rack light glowing behind glass |
| 5 | The top floor of a glass tower at night | A wide curved monitor | City lights below, a world map glowing on a far wall |

The monitor's screen must always show the BlipOS wallpaper (see UI_THEME.md > Desktop), never a real product's wallpaper.

## The desk

Items from "Your setup" in the Shop appear in the room on the computer layout, so spending feels real (see UI_THEME.md > The player's setup).

| Item | What appears |
|---|---|
| gear-monitor | A second monitor beside the main one |
| gear-handbook | A thick book lying on the desk |
| gear-pc | A newer tower PC with a small light |
| gear-wallpapers | Nothing in the room. The wallpaper changes on the screen |

These are small 2D pictures laid over the seat still, so no new clip is needed when one is bought.

---

# Part 3: Making the clips

## Files for each stage

| File | What it is | Length |
|---|---|---|
| `stage<N>-walk.mp4` and `.webm` | The walk-in clip. Starts at the room's door, ends facing the monitor, straight on | 2 to 6 seconds |
| `stage<N>-sit.mp4` and `.webm` | The sit-down clip. Starts on the desk still, ends close up on the monitor | 2 to 4 seconds |
| `stage<N>-desk.webp` | The desk still: the last frame of the walk-in clip | |
| `stage<N>-seat.webp` | The seat still: the last frame of the sit-down clip | |
| `stage<N>-poster.webp` | The first frame of the walk-in clip, shown while it loads | |

They live in `public/room/`. Each clip is 1280 by 720, silent, and under 3 MB.

## One take, cut in two

Wan 2.2 can make the whole move in one take: from the door, past the desk, up to the monitor. That is the easiest way, because the two clips then match perfectly. Cut it at a moment when the whole desk is in view and the monitor is straight on and in the middle. Everything before the cut is the walk-in clip, everything after is the sit-down clip.

Before cutting:

- Trim any jump or flicker in the last frames. Video tools often glitch right at the end.
- Crop to 16 by 9 from the middle, then resize to 1280 by 720.
- Remove the sound track.

## Rules for every clip

- Low-poly look with flat colours and soft light, like a simple 3D toy room.
- No words, numbers, logos or brand names anywhere in the picture. Video tools draw text badly. All text is added by the game.
- The monitor's screen shows only a plain green hill and blue sky, which the game covers with the real desktop.
- The monitor is straight on and in the middle of the picture at the end of both clips, so the screen box is a clean rectangle.
- The sit-down clip ends with the camera still for at least half a second, and the screen at least 60% of the picture's height. Closer is better: the desktop has to be readable inside it.
- Never name a real game, product or artist in the prompt. The rooms must be our own.

## Screen boxes

Measure these from each seat still once it is made. Until then the game uses a placeholder still with the box in the middle.

| Stage | Left | Top | Width | Height |
|---|---|---|---|---|
| 1 | 30.3% | 16.9% | 44.7% | 62.5% |
| 2 | To measure | To measure | To measure | To measure |
| 3 | To measure | To measure | To measure | To measure |
| 4 | To measure | To measure | To measure | To measure |
| 5 | To measure | To measure | To measure | To measure |
