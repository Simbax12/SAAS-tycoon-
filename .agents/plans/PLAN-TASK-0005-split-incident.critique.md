---
type: ledger
plan: PLAN-TASK-0005-split-incident.md
---

# Critique ledger — TASK-0005

Append-only. `critic` adds one row per finding, or one "no findings" row per
lens. The main session fills in Resolution after revising the plan or the code.

- **Stage:** 3 (plan mode) or 5 (code mode).
- **Lens:** L1 logic, L2 failure modes, L3 simplicity and side effects, L4 security and data boundaries, or `code`.
- **Verdict:** SOUND / REVISE / BLOCK for plan mode. MATCHES / DRIFT for code mode.

| # | Date | Stage | Model | Lens | Verdict | Finding | Resolution |
|---|---|---|---|---|---|---|---|
| 1 | 2026-10-19 | 3 | sonnet | L3 | REVISE | Tokens guard (scripts/gatekit/tokens.py) also flags `bg-white`/`text-white` ("black/white" rule) in every new file. The plan counts 23 hex hits only. About 10 white classes move too (Calls section and buttons, Solved boxes, Practised stamp, and `text-white` on the Dana header). The plan names `paper` but never says it replaces these, or what `text-white` becomes. New files then fail `gate.py tokens`. | Plan line 2 now counts the whites (the 23 hits already included 6 bg-white + 1 text-white) and maps them to bg-paper / text-paper |
| 2 | 2026-10-19 | 3 | sonnet | L2 | REVISE | The Before/After list misses the states that use the most moved colours. Not covered: Call Dana disabled/"Not enough cash" (off, off-edge, muted), Victor lifeline button (grey-soft), "No more calls", hover states (dana-soft, grey-soft, action-hover), Next versus "Buy the new computer" versus win hint, standby Maya line. A wrong token mapping there ships unseen. | Added to "working": a script checks token value = old hex for every swap, and a browser probe checks each new class (hover included) computes the old colour, covering states the shots can't reach |
| 3 | 2026-10-19 | 3 | sonnet | L3 | REVISE | Plan does not say to prune Incident.tsx's imports (CrossIcon, PhoneIcon, DanaAvatar, scrollWithin, useRef/useEffect, patternIcons etc. may become unused) and give each new file its own imports plus `"use client"`. Unused imports fail lint. Also `button` must be exported from incidentBits.tsx because Incident.tsx still uses it. | Plan revision: each new file gets its own imports and "use client", button is exported from incidentBits.tsx, Incident.tsx imports are trimmed; lint proves none left unused |
| 4 | 2026-10-19 | 3 | sonnet | L1 | REVISE | `maya` (#2E7D32) duplicates existing `start`, and `maya`/`dana` tokens have no `-foreground` partner. Fine, but record that the plan's "same value" check should be a script diff of old hex vs token values, since 15 hand-copied hex values are easy to mistype. | Duplicate value kept on purpose (different meaning, already in plan); hex-vs-token compared by script (row 2) |
| 5 | 2026-10-19 | 5 | sonnet | code | DRIFT | `.agents/domains/windows.md` is in the plan's "Files expected to change" but is untouched. Its Current state still says "Incident.tsx 545 lines" (now 331) and omits the three new files. | Update the Current state line (Incident.tsx split; Blueprint.tsx still oversized) |
| 6 | 2026-10-19 | 5 | sonnet | code | MATCHES | zone-check PASS (no zones.json); budget PASS with legacy warns only (Incident.tsx 331, globals.css 229, both legacy oversized but not grown past old size); tokens PASS (15 legacy hard-codes left in Incident.tsx); views PASS. No import cycle: Incident -> Calls/Solved/incidentBits; Calls/Solved -> incidentBits; incidentBits and PatternBook import nothing from Incident. All four files start with "use client". Re-exports cover Blueprint (Calls, MayaSays, Solved, Stars), Shop, SysDash, Terminal, Win. Tailwind 4.3.3 compile of globals.css with the new class names emits all 18 --color vars; utilities generated. CLAUDE.md code map updated. | none |
