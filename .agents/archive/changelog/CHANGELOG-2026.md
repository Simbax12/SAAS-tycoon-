# Changelog archive 2026

Rolled out of the live files by `python scripts/gate.py archive`. Search it with `python scripts/gate.py search "<words>"`.

## 2026-10-11 — The run remembers `lateItems`: items bought while the incident was open
The run remembers `lateItems`: items bought while the incident was open. Monitoring, the Standby server and the Faster PC only work from the next incident. It replaces the planned Faster PC flag. Why: GAME_DESIGN.md > The Shop in brief says every item bought during an incident only changes later ones. Monitoring had been halving penalties at once. GAME_LOGIC.md updated
