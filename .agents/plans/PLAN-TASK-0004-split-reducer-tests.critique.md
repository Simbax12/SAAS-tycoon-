---
type: ledger
plan: PLAN-TASK-0004-split-reducer-tests.md
---

# Critique ledger — TASK-0004

Append-only. `critic` adds one row per finding, or one "no findings" row per
lens. The main session fills in Resolution after revising the plan or the code.

- **Stage:** 3 (plan mode) or 5 (code mode).
- **Lens:** L1 logic, L2 failure modes, L3 simplicity and side effects, L4 security and data boundaries, or `code`.
- **Verdict:** SOUND / REVISE / BLOCK for plan mode. MATCHES / DRIFT for code mode.

| # | Date | Stage | Model | Lens | Verdict | Finding | Resolution |
|---|---|---|---|---|---|---|---|
| 1 | 2026-10-19 | 3 | sonnet | L3 | REVISE | Plan names helpers vaguely ("and others"). Real cross-section use: `memoryStorage` (first section 192, M6 828, M7 998/1010), `call` (defined M3 line 223; used M5 618, M6 725, M7 952), `buy` (defined M4 287; used first section 165 and M5-M7), `drawRight` (defined M5 433; used first section 156 and M6/M7), `deploy`, `solveNext` (M5 and M7), `rightChoice`/`runTune` (needed by `playTo`/`solveNext`). Moving them wrongly gives a compile error or a duplicate. | Plan line 2 names the cross-section helpers; the split script places every helper by measured use. |
| 2 | 2026-10-19 | 3 | sonnet | L2 | SOUND | `withTuneOn` (pushes onto shared `tuneSteps`, restores in `finally`) is used only by M6 (687, 708), so it stays in `workApps.test.ts`; node --test runs each file in its own process, so no cross-file leak. Keep it out of `testHelpers.ts`. | No change needed. withTuneOn stays in workApps.test.ts. |
| 3 | 2026-10-19 | 3 | sonnet | L3 | REVISE | ESLint (next/typescript) covers game/; the original 36-line import block is used by different sections, so each new file will have unused imports (warns) unless trimmed. Also `testHelpers.ts` sits in game/ and is part of the Next typecheck, so it must not import `node:test`. Plan should say lint is run with zero warnings and list helper imports. | Imports trimmed per file by use; lint must show zero warnings; testHelpers.ts has no node:test import. |
| 4 | 2026-10-19 | 3 | sonnet | L1 | SOUND | Line budget fine: biggest section M5 ~225 lines plus imports; the split avoids touching `npm test` glob. Verify `reducer.test.ts` header comment (Worked examples) stays. | No change needed. |
| 5 | 2026-10-19 | 5 | sonnet | code | MATCHES | Helpers placed as planned (14 shared; withTuneOn, tap, waitingForPayments, solveAndNext stay local), no duplicates, all five milestone markers in place, imports trimmed, docs updated. Budget note "legacy oversized: game/reducer.test.ts (181 lines)" is the wording quirk in gatekit/checks.py (see TASK-0003 row 8). | No change needed. The note clears once the change is committed. |
