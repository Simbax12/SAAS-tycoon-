---
type: contract
folder: ".agents/archive"
role: product
---

# CONTEXT.md — .agents/archive (Cold)

Everything that has rolled out of the live files. **Kept, committed, searchable,
but out of the normal search path:** the root `.ignore` file hides it from code
search, so agents never pay to scan it by accident.

**Never read this folder directly.** Ask it a question instead:

```
python scripts/gate.py search "webhook retry idempotency"
```

That returns the top matches (file, date, a short snippet) in about 150 tokens.
Open a file only when the snippet says it's the one you need.

## What lands here (written only by `gate.py archive`, which `done` runs)

| Folder | Holds | Rolled when |
|---|---|---|
| `tasks/YYYY-MM/` | Done task files | More than 20 done tasks are live |
| `plans/YYYY-MM/` | Their plans and critique ledgers | With their task |
| `plans/redteam/` | Spec red-team ledgers | Older than 90 days |
| `changelog/CHANGELOG-YYYY.md` | CHANGELOG entries | More than 30 are live |
| `bugs/YYYY/` | Fixed bug records | More than 50 are live |
| `domains/<domain>-history.md` | Domain history lines | More than 60 in a domain file |
| `legacy/` | Old history imported from a project's previous setup (handover notes, old changelogs, old bug logs) | By hand, during a restructure |

Thresholds live in `.agents/gate.json` → `archive`. Nothing here is ever
deleted. `.agents/search-index.db` is the generated search index (gitignored;
rebuilt automatically).
