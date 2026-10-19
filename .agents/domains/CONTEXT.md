---
type: contract
folder: ".agents/domains"
role: product
---

# CONTEXT.md — .agents/domains

One small state file per feature domain: what the feature is **now**, and how it
got here. Reading one costs the same however old the project gets, because both
parts are capped.

The registry of domains (which files, tables, contracts and specs belong to
each) is `../domains.json`. Ask it with `python scripts/gate.py where <domain>`
instead of searching the code.

## Each `<domain>.md` has two parts

| Part | Written by | Rule |
|---|---|---|
| **Current state** | The AI, on the main checkout, after each task in this domain | At most 20 lines, **overwritten** (never appended): what the feature does now, its key files, its edge rules |
| **History** | `gate.py` only, between the `history` markers | One verbatim line per finished task, newest first. Older than 40 lines (fewer if the file nears its 100-line cap) rolls into `.agents/archive/domains/` |

The whole file is capped at 100 lines (`gate.py budget`). Never edit the History
part by hand. For anything older, use `python scripts/gate.py search "<words>"`.

## Lifecycle

- **Onboarding step 7** proposes the domains from the confirmed specs, alongside the zones.
- **A task that starts a new feature area** adds its domain to `domains.json` at Stage 1, with `status: planned`.
- **`gate.py done` / `worktree finish`** writes the History line, and flips the domain to `active` once its files exist.
- **`project`** is the built-in domain for docs, tooling and CI tasks.

Copy `_domain-template.md` by hand only if needed. `gate.py` creates missing state files itself.
