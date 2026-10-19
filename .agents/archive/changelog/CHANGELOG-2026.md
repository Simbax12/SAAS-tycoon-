# Changelog archive 2026

Rolled out of the live files by `python scripts/gate.py archive`. Search it with `python scripts/gate.py search "<words>"`.

## 2026-10-11 — "Stage 3 is coming soon" and the code that stopped play at a missing …
"Stage 3 is coming soon" and the code that stopped play at a missing incident are gone. Why: Every incident is in the data files now

## 2026-10-11 — The Faster PC halves the loading bar to 0.8 seconds
The Faster PC halves the loading bar to 0.8 seconds. Why: UI_THEME.md says "quicker" without a number

## 2026-10-11 — The tray shows the handbook's book and the Faster PC's lightning mark …
The tray shows the handbook's book and the Faster PC's lightning mark on the computer layout only. Why: There is no room at 375 pixels, the same reason the clock is left out

## 2026-10-11 — The tray's users icon and the cash icon's edge now follow the …
The tray's users icon and the cash icon's edge now follow the taskbar's text colour. Why: They were white, and disappeared on BlipOS 5's light taskbar

## 2026-10-11 — BlipOS 4's wallpaper is the hill at night with a moon and no stars
BlipOS 4's wallpaper is the hill at night with a moon and no stars. BlipOS 5's is a soft gradient from its desktop colour. Why: The pack's "Night sky" keeps its stars, so the two still look different

## 2026-10-11 — The run remembers `lateItems`: items bought while the incident was open
The run remembers `lateItems`: items bought while the incident was open. Monitoring, the Standby server and the Faster PC only work from the next incident. It replaces the planned Faster PC flag. Why: GAME_DESIGN.md > The Shop in brief says every item bought during an incident only changes later ones. Monitoring had been halving penalties at once. GAME_LOGIC.md updated

## 2026-10-11 — The run remembers `standbySaved`, so Maya's Standby line shows for …
The run remembers `standbySaved`, so Maya's Standby line shows for the rest of that incident. Why: The line must show after the bad pick, and the dip alone cannot tell

## 2026-10-11 — The save is version 3
The save is version 3. Version 2 saves get the two new run fields, both empty. Why: No save could reach Stage 3 before, so no item effect is lost
