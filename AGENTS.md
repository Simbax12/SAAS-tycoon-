# AGENTS.md — Zero to a Billion

Router for every AI tool. It holds no game content. The project hub is
`CLAUDE.md`: it says where every game fact lives and what to update when
something changes. This file adds the Agent OS around it: tasks, gates,
history search and the QC agents.

**QC agents (`.agents/qc-team/`): skip this read order.** Your definition is your brief.

## Read order (main session)

1. `CLAUDE.md`: the hub. The doc map, one fact one home, the rules for working here
2. `ai-context/operation-manual.md`: role, Hard Stops, how to work with the owner (before any task)
3. `ai-context/5w.md`: what this project is, in pointers
4. `ai-context/next-steps.md`: what's next
5. For a task: `/step` runs it. The task file, `python scripts/gate.py where <domain>`, the
   domain's state file, and only the `docs/` sections the task links.
   `ai-context/pipeline.md` is opened **by section** when a rule is needed, never whole.

Where `pipeline.md` says `docs/specs/`, read the game docs in `docs/` (CLAUDE.md > The map).
Where it says `develop`, read `main`: this project has one branch (`.agents/gate.json`).

## Finding things (search, don't scan)

| Need | Do this |
|---|---|
| Which doc owns a game fact | `CLAUDE.md` > One fact, one home |
| The files for a feature | `python scripts/gate.py where <domain or keyword>` |
| How a feature got here | `.agents/domains/<domain>.md` (Current state + History) |
| Why something was decided, or a past bug | `python scripts/gate.py search "<words>"` (covers all archived history) |
| A screen, button or visible text | `python scripts/gate.py ui "<words>"` (or `ui --screen <name>`) |
| Building or planning any UI | `/ui` first, then `docs/UI_THEME.md` for this game's look |
| Where the whole project is up to | `ai-context/roadmap.md` (generated; `/roadmap` changes the plan) |

Never read `.agents/archive/` directly. It's kept out of normal search on purpose.
Read any file over 400 lines by range, never whole.

## Repo map

| Path | Holds |
|---|---|
| `docs/`, `CLAUDE.md` | The game docs and their hub: the source of truth |
| `app/`, `components/`, `data/`, `game/`, `public/` | The game (CLAUDE.md > Code map) |
| `ai-context/` | Operating manual, task pipeline, 5 W's, next steps, roadmap |
| `.agents/` | Agent OS: tasks, plans, domains, bugs, changelogs, archive, QC team, skills |
| `.claude/` | Claude Code copies of `.agents/qc-team/` and `.agents/skills/`, plus the resume hook (never edit the copies) |
| `scripts/` | `check-docs.mjs` (docs agree) and `gate.py` (tasks, gates, lookup: `python scripts/gate.py -h`) |
| `testing/` | TAP signal registry, tap macros, viewports, suites 01–05 (Playwright, `playwright.config.ts`) |

## Zones

<!-- zones:start -->
_No zones: one Next.js app, one session at a time (decided 2026-10-19, see CHANGELOG). Add `.agents/zones.json` and run `python scripts/gate.py zones` if parallel sessions start._
<!-- zones:end -->

## 6-Agent QC pipeline

Definitions live in `.agents/qc-team/` (the source) and are mirrored to `.claude/agents/`.
Rules: `ai-context/pipeline.md`, sections "Agent roster" and "Running agents".
There is no database, so `db-migration-guard` is not installed.

| Stage | Agent | Runs when | Verdicts |
|---|---|---|---|
| 3 | `critic` (plan mode) | Standard: Sonnet. Risky: Sonnet + Opus in parallel. Tiny: skipped | SOUND / REVISE / BLOCK |
| 3 + 7 | `live-verify` | UI changes: Before shot at 3, After shot at 7. Live proof at 7 | CAPTURED / PASS / FAIL |
| 5 | `verify-gate` | Every task (guards always run) | PASS / FAIL |
| 5 | `critic` (code mode) | Standard and Risky | MATCHES / DRIFT |
| 6 | `security-review` | Saves, routes, forms or dependencies | PASS / PASS WITH WARNINGS / BLOCK |
| 7 | `suite-runner` | Standard and Risky, once suites exist | PASS / FAIL / FLAKY |
| 7 | `bug-logger` | After a bug's root cause and fix are confirmed | LOGGED / NEEDS ROOT CAUSE |

Skills: `/step` runs one task through the whole pipeline. `/critique` runs Stage 3.
`/ui` holds the UI build rules. `/roadmap` sets the deadline and milestones.

## Agent OS (`.agents/`)

| Path | Holds |
|---|---|
| `tasks/` | One task per file; `depends_on` builds the DAG (`gate.py status`, `gate.py next`) |
| `plans/` | One plan and critique ledger per task |
| `domains.json`, `domains/` | Lookup Router (feature → files) and one capped state file per domain |
| `bugs/` | `open/`, `fixed/`, `recurring/` (patterns): the greppable known-bugs record |
| `changelogs/` | `CHANGELOG.md`: decisions and changes, newest 30; task entries are written by `gate.py` |
| `archive/` | Cold history, rolled automatically; query it with `gate.py search` |
| `qc-team/`, `skills/` | Source of truth for the agents and skills above |
| `gate.json` | Gate settings (guards, checks, budgets, archive) |
| `milestones.json`, `kit.json` | Roadmap plan (written by `/roadmap`); which skill version the project was synced from |

Each folder's `CONTEXT.md` says exactly what belongs in it.

## Subagent rules (beyond the QC team)

- The default answer is **no**. One agent reading the right files can switch modes.
- Spawn one only for real concurrency, isolation (a long search that would flood the main
  context), or a bounded job with a clear deliverable.
- Brief it in 3–5 lines and point it at files and line ranges. Never paste context that
  already lives in a file.
- It reports back; it never decides scope, architecture, or anything on the Hard Stop List.
  It follows the report contract in `pipeline.md`. Close it once its output is merged.
- Log any ad-hoc (non-QC) subagent in `CHANGELOG.md`: what, why, what it returned.
