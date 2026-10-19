---
type: contract
folder: ".agents/skills"
role: factory
---

# CONTEXT.md — .agents/skills

Project skills: the source of truth. `.claude/skills/` holds copies so Claude
Code exposes them as slash commands.

| Skill | Command | Does |
|---|---|---|
| `step/SKILL.md` | `/step [TASK-id]` | Runs one task through the whole 7-stage pipeline |
| `critique/SKILL.md` | `/critique [plan]` | Stage 3: critic in plan mode (Sonnet, plus Opus on Risky), then revise and record |
| `ui/SKILL.md` (+ `catalogue.md`, `white-label.md`) | `/ui` | UI build rules: lookup order, container/view/fixtures, tokens, icons, motion. Loads automatically for UI files |
| `roadmap/SKILL.md` (+ `format.md`) | `/roadmap` | Deadline, dated milestones and the master checklist (`ai-context/roadmap.md` / `.json`); `format.md` is the dashboard contract |

Same rules as `.agents/qc-team/CONTEXT.md`: edit here, then run
`python scripts/gate.py check-agents --sync`. Changes meant for every project go
into the skill's master copy.
