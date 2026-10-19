---
type: contract
folder: ".agents/qc-team"
role: factory
---

# CONTEXT.md — .agents/qc-team

The 7 QC agent definitions, and the source of truth for them. `.claude/agents/`
holds copies so Claude Code can run them. When each one runs is in the pipeline
table in `AGENTS.md`. How to brief them and read their reports is in
`ai-context/pipeline.md` (Agent roster; Running agents).

| File | Agent |
|---|---|
| `verify-gate.md` | Static gate: runs `gate.py verify` |
| `critic.md` | Plan critique (Stage 3) and code-vs-plan audit (Stage 5) |
| `security-review.md` | Secrets, RLS, route auth, server-side validation, dependencies |
| `db-migration-guard.md` | Role-simulated checks of migrations, RPCs and RLS for every persona |
| `live-verify.md` | Live proof and Before/After screenshots |
| `suite-runner.md` | Runs `testing/suites/` and classifies failures |
| `bug-logger.md` | Records confirmed bugs in `.agents/bugs/` |

## Rules

- **Edit here, never in `.claude/agents/`.** Then run
  `python scripts/gate.py check-agents --sync`.
- These files come from the project-context-architect skill. A change that should
  apply to every project goes into the skill's master copy, which the skill's
  `scaffold.py --sync` brings in. A project-only change stays here and gets a
  `CHANGELOG.md` line, so a later sync doesn't silently overwrite it.
- Every agent follows the report contract (inline in each definition, the same as in `pipeline.md`): the verdict
  word first, 25 lines at most.
- Adding or removing an agent also means updating the pipeline table in
  `AGENTS.md` and the Agent roster in `ai-context/pipeline.md`.
