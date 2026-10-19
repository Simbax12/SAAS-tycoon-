---
type: contract
folder: ".agents/changelogs"
role: product
---

# CONTEXT.md — .agents/changelogs

Where "why did we do it this way?" gets answered, without bloating `5w.md` or
`AGENTS.md`. **To answer that question, search; don't read this file top to
bottom:** `python scripts/gate.py search "<topic>"` covers this file and every
archived year.

## What belongs here

- `CHANGELOG.md`: the live index. **Newest entry at the top. At most 30 entries:**
  `gate.py archive` (run by every `done`) rolls older ones into
  `.agents/archive/changelog/CHANGELOG-YYYY.md` automatically.
- `RELEASE-YYYY-MM-DD.md` (optional): release notes for a push or deploy that
  passed the Release Gate. Link it from its CHANGELOG entry.

## Who writes entries

| Event | Written by |
|---|---|
| A task is done | **`gate.py` only**, from the task's `outcome:` line, during `done` (main checkout) or `worktree finish`. Never by hand: parallel branches would conflict on it. |
| A decision outside any task (structure, re-scope, a Hard Stop answer, a Release Gate pass, an ad-hoc subagent) | The AI, on the main checkout, using the format below |

```
## YYYY-MM-DD — Short title
What happened or was decided, and why, in 1–3 sentences. → link to the plan, bug or release file
```

Never edit or delete old entries. Correct one by adding a new entry that says so.

## Human check

The owner may skim it. Nothing here needs approval.
