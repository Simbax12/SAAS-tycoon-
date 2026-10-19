---
type: contract
folder: "testing"
role: factory
---

# CONTEXT.md — testing

Checked-in tests, plus the shared vocabulary every test, every macro and
`live-verify` uses. **Zero-discovery:** nobody hunts the DOM for selectors.
Everything taps a named signal.

| Path | Holds |
|---|---|
| `TAP_SIGNALS.md` | The source of truth: every `data-tap` selector name |
| `registry/tap-signals.ts` | **Generated** from TAP_SIGNALS.md by `python scripts/gate.py signals` |
| `registry/viewports.ts` | Named viewports shared by suites and Before/After screenshots |
| `macros/` | One-line tap macros for common flows (`flows.ts`; split per product area as it grows) |
| `suites/` | The five suites below |

## Suites

| Suite | Proves | Runs |
|---|---|---|
| `01-smoke` | The game starts, the player sits down and the main windows open | Every task |
| `02-core-flows` | Incidents can be played end to end | Standard and Risky tasks |
| `03-permissions` | Stays empty: the game has no accounts or roles | Standard and Risky tasks |
| `04-visual-regression` | Key screens still look right at every named viewport | Release Gate |
| `05-chaos-edge-cases` | Offline, slow network, double-taps, retries, bad data, two devices at once | Release Gate |

All five run at the Release Gate. Settings are in `playwright.config.ts` (Chromium, the `desktop` and `phone` viewports, reduced motion, the dev server on port 3000). Install the browser once with `npm run e2e:install`. `suite-runner` runs them through
`python scripts/gate.py suite <name>`, using the commands in `.agents/gate.json`.

## Rules

- Tests use only `TAP` names, named viewports and personas. No raw CSS selectors.
- Every test cleans up the data it creates.
- A new interactive element gets its signal in the same task (`critic` checks).
- Installing the test runner (e.g. Playwright) is a new dependency, so it's a
  Hard Stop: ask the owner first.
