# Changelog archive 2026

Rolled out of the live files by `python scripts/gate.py archive`. Search it with `python scripts/gate.py search "<words>"`.

## 2026-10-11 — The run remembers `lateItems`: items bought while the incident was open
The run remembers `lateItems`: items bought while the incident was open. Monitoring, the Standby server and the Faster PC only work from the next incident. It replaces the planned Faster PC flag. Why: GAME_DESIGN.md > The Shop in brief says every item bought during an incident only changes later ones. Monitoring had been halving penalties at once. GAME_LOGIC.md updated

## 2026-10-11 — The run remembers `standbySaved`, so Maya's Standby line shows for …
The run remembers `standbySaved`, so Maya's Standby line shows for the rest of that incident. Why: The line must show after the bad pick, and the dip alone cannot tell

## 2026-10-11 — The save is version 3
The save is version 3. Version 2 saves get the two new run fields, both empty. Why: No save could reach Stage 3 before, so no item effect is lost
