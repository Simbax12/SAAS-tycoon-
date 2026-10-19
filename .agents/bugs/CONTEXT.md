---
type: contract
folder: ".agents/bugs"
role: product
---

# CONTEXT.md — .agents/bugs

Confirmed bugs, one atomic record per bug, so the same mistake is recognised
next time instead of re-diagnosed. This file is the authority on format:
`bug-logger` follows it, and if its prompt ever disagrees with this file, this
file wins.

**A wrong root cause recorded here is worse than no record.** It misleads the
next investigation. Only confirmed root causes go in.

## Folders

| Folder | Holds | Written by |
|---|---|---|
| `open/` | Confirmed bugs (real root cause known) that aren't fixed yet | Main session |
| `fixed/` | Bugs whose root cause and fix are confirmed and verified | `bug-logger` |
| `recurring/` | `PATTERN-<slug>.md` files: one per bug shape that has happened more than once, linking every occurrence | `bug-logger` |

When an `open/` bug gets fixed, `bug-logger` writes the `fixed/` record and the
main session deletes the `open/` file in the same commit. `recurring/` pattern
files only link to records, and pattern files themselves never move.

Records refer to each other **by id** (`BUG-2026-10-14-x`), never by path: `fixed/`
keeps the newest 50, and `gate.py archive` moves older ones to
`.agents/archive/bugs/YYYY/`. Find any record with `python scripts/gate.py search <id or words>`.

## Record format: `BUG-YYYY-MM-DD-<slug>.md`

```
---
id: BUG-YYYY-MM-DD-<slug>
type: logic | ui | data | rls | auth | security | perf | integration | build | other
zone: <zone id>
status: open | fixed
task: TASK-NNNN
pattern: ""        # recurring/PATTERN-<slug>.md, if this matches a known shape
---

## Symptom
What the user or test saw.

## Root cause
The real underlying cause, precisely. Not the symptom restated.

## Fix
What changed, and why it fixes the cause rather than hiding the symptom.

## Tradeoffs considered
Any Problem B this fix risked, and what the owner chose (if asked).

## How it was verified
The live check or test that proved it.
```

## Pattern format: `recurring/PATTERN-<slug>.md`

The bug shape in one sentence, every occurrence (links into `fixed/`), and the
**prevention rule**: what to check so it doesn't happen again. Add the rule as a
check in the relevant agent, or a line in operation-manual section 6, when it's
generic enough.

## Inputs, outputs, human check

- **Reads:** the confirmed root cause and fix from the main session.
- **Produces:** records `critic` and `db-migration-guard` find through `gate.py search` when judging a
  similar change.
- **The owner checks:** recurrence flags, which are reported in the Stage 7 walkthrough.
