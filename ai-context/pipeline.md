---
type: process
scope: shared
last_updated: "2026-10-14"
---

# Pipeline — the 7-stage task pipeline

The master copy lives in the project-context-architect skill and is copied into every project's `ai-context/`. It is **not** read at session start. `/step` carries the running order; open single sections of this file by heading (search for the heading, read that range) when you need a rule. QC agents never read it: their report contract is inline in their own definitions.

Run the stages in order, but size the effort to the task. The subagents do the heavy checking in their own context, so the main chat stays small. The main session reads their verdicts, not their working.

## Size the task first

Say the size in one line in chat (for example: "Sizing: Standard, because it adds a new screen but touches no data rules").

| Size | What it looks like | What runs |
|---|---|---|
| **Tiny** | Copy change, small styling change, or a one-file bug fix with no ambiguity. Touches no data, access, or security. | A one-line plan, no critique, Stage 4, Stage 5 with `verify-gate` and an inline code audit, and Stage 7 with a quick live check (with Before/After shots if it is UI). `01-smoke` runs inside `verify-gate` through the task's verify list; `suite-runner` is called only if it fails. A suite with no tests yet reports NO TESTS: not a failure, but tell the owner it wasn't verified. |
| **Standard** | A normal feature or a multi-file fix. | All 7 stages. Stage 3 runs `critic` once (Sonnet, all four lenses). Stage 5 adds `critic` in code mode. Stage 6 is an inline security check, plus agents only if the change touches data, access, secrets, routes, forms, or dependencies. |
| **Risky** | Anything on the Hard Stop List, anything touching Supabase, RLS, RPCs, auth, or permissions, a new dependency, or a change to how data flows. | All 7 stages in full: Stage 3 runs `critic` twice in parallel (Sonnet + Opus), and every agent that applies runs. |

- When unsure, size up, never down.
- Anything on the Hard Stop List is automatically Risky.
- The size can change mid-task. If a Tiny fix turns out to touch data or access, stop and re-size.
- **Small visual changes are Tiny tasks** that never read whole files:
  1. `gate.py ui <words>` finds the line (or `theme show <words>` for app-wide looks).
  2. `gate.py swap <file:line> "old" "new"` or `theme set` makes the edit.
  3. Workbench shots give Before/After.

  Anything touching data, logic, access, more than 2 files or a shared component is re-sized up.
- **Model tiering for UI:**
  - the design system + golden screen: one Risky task at high effort, done once
  - new screens: Standard
  - micro-polish: Tiny tasks with `ui` / `swap` / `theme set`

## Agent roster

| Agent | Stage | Runs when | Returns |
|---|---|---|---|
| `critic` (plan mode) | 3 | Standard (Sonnet) and Risky (Sonnet + Opus, in parallel) | SOUND, REVISE, or BLOCK, with findings appended to the plan's critique ledger |
| `verify-gate` | 5, and the Release Gate | Every size | PASS, or FAIL with the first real error for each guard (gaps, budget, map, zone-check, tokens, views) and each check in `.agents/gate.json` (run through `python scripts/gate.py verify`) |
| `critic` (code mode) | 5 | Standard and Risky | MATCHES or DRIFT: does the code implement the plan, stay in its zone (`gate.py zone-check`), and register its TAP signals |
| `security-review` | 6, and the Release Gate | Per task: Standard or Risky changes that touch data, access, secrets, routes, forms, or dependencies. Always at the Release Gate. | PASS, PASS WITH WARNINGS, or BLOCK, with findings |
| `db-migration-guard` | 6 | Only for migrations, RPCs, and RLS policies | VERIFIED for every persona, CONCERN, or NEEDS CONFIRMATION. It never applies a migration itself. |
| `live-verify` | 3 (Before shot) and 7 | UI changes, and anything that needs live proof | PASS or FAIL, screenshot file paths, and confirmation that test data was cleaned up |
| `suite-runner` | 7, and the Release Gate | Standard and Risky: `01-smoke 02-core-flows 03-permissions`. Tiny: only if the smoke run inside `verify-gate` fails. All five at the Release Gate | PASS, FAIL, or FLAKY, with each failure classed as product bug, stale signal, or flaky |
| `bug-logger` | 7 | Only after a bug's real root cause and fix are confirmed | The entry filename, a one-line summary, and any recurrence flag |

The agent definitions live in the project's `.agents/qc-team/` (mirrored to `.claude/agents/`); `AGENTS.md` has the pipeline table. Stage 2 prior-art research and the Tiny-task code audit are done inline by the main session, not through the user-level `code-reviewer` and `prior-art-research` agents in `~/.claude/agents/`.

## Running agents (the report contract)

- **Brief each agent in 3 to 5 lines:** what changed, which files **with line ranges** (from `python scripts/gate.py where <domain>`), what "working" means, and the plan path. Agents start with no memory of the chat. Never paste the plan or code into the brief.
- **QC agents skip the session read order.** Their definition is their brief; they never read the manual or this file.
- **Read by range:** never read a whole file over 400 lines (main session or agent). Find the symbol with search, then read only that range. `gate.py where` marks big files "read by range".
- **Report contract (every agent follows it, and the main session expects it):**
  - The first line is the verdict word.
  - The whole report is 25 lines at most.
  - PASS gets the verdict plus one line saying what was checked.
  - A failure lists at most 5 findings (location, what is wrong, one-line proposed fix), with any others given as a count.
  - Full detail is sent only when the main session asks for it.
- **Read the verdict first.** Open the findings only when the verdict is not a pass. Tell the owner in plain English, never by pasting the report.
- **Run independent agents in the same step.** Do not edit files while they run, or their results go stale.
- **Re-run only what a fix could affect.** A CSS fix needs `verify-gate` again, not `security-review`.
- **Screenshots go to files** in the scratch folder (never committed). Look at each image once, at Stage 7.

## Loopback rule

If any stage fails, do not stop to ask the owner how to fix it (unless the fix needs a Hard Stop decision). Leave a brief plain-English note in chat saying what failed and why, then go back to the right stage:

| What failed | Go back to |
|---|---|
| `critic` REVISE on the plan (Stage 3) | Stage 1: revise the plan and fill in the ledger's Resolution column |
| `critic` BLOCK on the plan (Stage 3) | Hard Stop: ask the owner through the pop-up questionnaire, one card per finding |
| Type, lint, or build error (Stage 5) | Stage 4 |
| `critic` DRIFT, or `gate.py zone-check` fails (Stage 5) | Stage 4 |
| `suite-runner` FAIL: product bug or stale signal (Stage 7) | Stage 4. A FLAKY result goes in `.agents/bugs/open/`, and the owner is told. |
| A security finding (Stage 6) | Stage 4. If the fix changes data rules, access, or security boundaries, it is a Hard Stop: ask the owner through the pop-up questionnaire first. |
| Broken behaviour in the live check (Stage 7) | Stage 1 if the plan itself was wrong, otherwise Stage 4 |
| A visual regression in the After shot | Stage 4 |

After a fix, re-run only the gates it could affect. After 3 loops on the same problem, stop and ask the owner through the pop-up questionnaire.

## Stage 1: Planner (Draft & Spec Check)
- Read the task file, the `docs/specs/` sections it links, and the domain's state file. Run `python scripts/gate.py where <domain>` for the exact files instead of exploring.
- Check for past decisions and bugs with `python scripts/gate.py search "<topic>"`, not by reading CHANGELOG or archive folders.
- A task that starts a new feature area adds its domain to `.agents/domains.json` now (`status: planned`).
- Map out the intended behavior, user flow, system rules, and implementation steps against the owner's brief.
- **UI tasks:** the plan names the components (found through the `/ui` lookup order), icons, animated sources and states (empty, loading, error) it will use.
- Write the plan as 3 short lines. Standard and Risky: in `.agents/plans/PLAN-<task>-<slug>.md` (copy `_plan-template.md`), with options rejected and the decision. Tiny: the resume note only. Copy the 3 lines into the resume note's "Plan" field too, so agents can be briefed from it.
- *If the brief has missing logic or triggers a Hard Stop:* Immediately use the **pop-up questionnaire tool** (`AskUserQuestion`) to get the owner's answers one by one before moving forward.

## Stage 2: Researcher (Prior Art & Codebase Fit)
- Skip for Tiny tasks.
- Check existing patterns in the project first so new work behaves consistently with the rest of the app.
- For new features or open-ended problems, research how proven production systems solve the same problem (inline) and adapt what fits this project.
- Revise the Stage 1 plan with these findings.

## Stage 3: Logic & Reasoning Checker (Pre-Code Critique + "Before" UI Capture)
Before writing any code, critique the plan and fix any holes. Run `/critique`, which briefs the `critic` agent in plan mode. The main session plans on Opus and the critic runs on Sonnet, so every critique is cross-model without the cost of four models.

- **Tiny tasks:** skipped.
- **Standard tasks:** one Sonnet pass covering all four lenses.
- **Risky tasks:** a Sonnet pass and an Opus pass, started together. Where they disagree, take the stricter verdict.

The four lenses:
1. **L1, Business & Product Logic:** Does this fulfill the owner's exact intent? Do the rules, user permissions, and edge-case scenarios make complete logical sense without contradictions?
2. **L2, Real-World Failure Modes:** What happens if the user double-clicks, has a slow connection or goes offline, submits empty/weird data, or leaves midway? Could two actions (or two devices) clash at the same time?
3. **L3, Simplicity & Side Effects:** Is there a simpler, more reliable way to achieve this goal? Could this change accidentally break an existing workflow, contradict `CHANGELOG.md`, or spill outside its zone?
4. **L4, Security & Data Boundaries:** Who can see or change what? Is tenant isolation kept? Does it trust ids, roles, or validation from the client?

Every finding goes in the plan's critique ledger (`.agents/plans/PLAN-...critique.md`), and the main session fills in how each one was resolved. REVISE: fix the plan. BLOCK: a Hard Stop, so ask the owner through the pop-up questionnaire.

*Mandatory Pre-Code Step for UI Changes ("Before" Photo):*
- If the task modifies or adds anything visible in the UI, capture a clean **"Before" screenshot** of the target screen or component (or the parent view for a brand-new feature) **right now, before Stage 4 edits any files**:
  - **A view with fixtures:** run `node testing/macros/shot.mjs <view> --out before` yourself. It uses the workbench, so no login or data is needed, and it prints the file paths.
  - **A full-app flow, or a screen not yet split:** ask `live-verify` (baseline mode). It saves `before-<feature>.png` in the scratch folder and reports the path and viewport.
  - **White-label projects:** add `--preset <a>,<b>` with two contrasting presets.

*Narrate in chat:* Output a compact `[STAGE 1–3: LOGIC & REASONING CHECK]` bullet block explaining the approach chosen, any logical holes caught and fixed, and any tradeoffs. Then **immediately proceed to Stage 4** (unless a Hard Stop decision is required, in which case trigger the pop-up questionnaire).

## Stage 4: Code Writer
- **Take the zone lock first** if the task has a zone: `python scripts/gate.py lock <zone> --task <ID>`. Edit only inside that zone, plus the shared folders listed in `AGENTS.md`. If the zone is locked by another task, pick another ready task or ask the owner. Never break a lock.
- Before using a library, check its entry in `docs/stack-cheat-sheet.md` and follow the "Do" pattern for the pinned version.
- **UI:** follow `/ui` (it loads automatically for UI files): container / view / fixtures, tokens only, every state in the first write.
- Write the code cleanly within the existing stack. Register every new interactive element in `testing/TAP_SIGNALS.md`, then run `python scripts/gate.py signals`.
- **Size budget:** new files stay under 400 lines; an oversized legacy file may shrink but never grow. If a small fix truly must grow one, list it under `budget_override` in the task with the reason (reported to the owner), or move the touched code into a new module first.
- **Strict boundary:** No new dependencies without asking. No auto-formatting, and no unrelated restructuring of files outside the task scope.

## Stages 5 and 6 run together
When Stage 4 is done, start `verify-gate`, `critic` in code mode (Standard and Risky), and any Stage 6 agents that apply, all in the same step. Do the inline security check (and, for Tiny, the inline code audit) while they run. Do not edit files until they all report back.

## Stage 5: Code Checker (Static Gates & Internal Technical Audit)
Because the owner does not inspect the code directly, you act as a strict internal reviewer:
- **Static Gate:** `verify-gate` runs `python scripts/gate.py verify --task <ID>`: first the guards (open gaps in the docs this task links, size budget, Lookup Router, zone check, hard-coded styles, screen split), which always run, then the stack checks in `.agents/gate.json` (the same as CI). All must pass with zero errors.
- **Code Audit:** For Standard and Risky, `critic` in code mode verifies that the code faithfully implements the plan, stays inside its zone (`gate.py zone-check`), handles errors gracefully, registers its TAP signals, and introduces no silent regressions. For Tiny, do the same audit inline.
- *Loopback on failure:* see the Loopback rule.

## Stage 6: Security Checker (Post-Write Security Gate)
- **Inline check (always, even for Standard):** Audit new code for exposed secrets or keys, unsafe trust of browser/client data, injection risks, or missing input checks.
- **`security-review`:** Run when the change touches secrets, routes or endpoints, forms, RLS, login/auth, admin/service permissions, or dependencies.
- **`db-migration-guard`:** Run when the change touches migrations, RPCs, or RLS policies. It tests access as a logged-out user, a normal user, and an unauthorized user trying to reach someone else's data.
- `db-migration-guard` never applies a migration on its own. If its check needs one applied, it stops and says so. Treat that as a Hard Stop and ask the owner through the pop-up questionnaire.
- *Loopback on failure:* any data leak or permission gap fails the gate. See the Loopback rule.

## Stage 7: Implementer, Live Verifier & Plain-English Walkthrough
- **Live Verification & "After" Photo:** Ask `live-verify` to test the feature live against the running app and real data to prove it works in practice, not just on paper. Run it only after Stages 5 and 6 have passed.
  - **For any UI/visual change:** It captures the matching **"After" screenshot** (`after-<feature>.png`) from the exact same viewport and state as the Stage 3 "Before" screenshot. For a workbench Before shot, run `shot.mjs <view> --out after` with the same options instead. Look at both images yourself first. If the layout is broken, misaligned, or did not actually update, fail the gate and loop back before showing the owner.
  - It must confirm that any test data it created in the shared project has been cleaned up.
- **Suites:** For Standard and Risky, ask `suite-runner` for `01-smoke 02-core-flows 03-permissions`, alongside `live-verify`. Tiny tasks rely on the smoke run inside `verify-gate`.
- **Bug Logging:** If the task fixed a bug, once the root cause and fix are confirmed, ask `bug-logger` to record them in `.agents/bugs/`. If it flags a likely recurrence of an earlier bug, tell the owner.
- **Close the task:** write one plain-English line in the task's `outcome:` field, then run `python scripts/gate.py done <ID>`. It re-runs verify, marks the task done, **writes the CHANGELOG entry and the domain History line from the task file**, rolls old history into the archive, regenerates the master checklist, and stages all of it. Never edit `CHANGELOG.md` by hand for a task. **The zone lock stays until you commit:** the pre-commit zone check needs it, and the post-commit hook releases it. A lock held by a done task never blocks other tasks.
- **Then, on the work branch (`develop`):** overwrite `ai-context/next-steps.md` (3-7 items) and the domain's **Current state** (20 lines max).
- **Scannable, Plain-English Walkthrough for the owner:** Present the completed work one feature/change at a time using short, easy-to-read bullets:
  - **What Changed & Why:** 2–4 short bullets on what the feature/fix does now and the reasoning behind it.
  - **Before & After Photos (Required for all UI changes):** Display or embed both the **Before** and **After** screenshots right in the response so the owner can visually confirm the result immediately.
  - **What Was Tested Live:** Short bullets listing the real user actions and data verified.
  - **Obstacles, Reverts & Tradeoffs:** Short bullets covering anything that failed during loopbacks and why it was changed, plus any remaining tradeoffs. (If any follow-up decisions are needed from the owner, present them via the **pop-up questionnaire tool**).

## Branches and pushing
- **`develop` (the work branch, `gate.json` → `main_branch`):** every finished task lands here.
  Push it once a task's own gates have passed and `gate.py done` has run. The full Release
  Gate isn't needed, so push often: CI runs and the owner's dashboard stays current.
- **`main` (the release branch, `gate.json` → `release_branch`):** what's live. It only ever
  changes through a release.
- **Safety valve:** if `gate.json` → `deploys.develop` is `production`, a push to develop is
  a deploy, so it needs the full Release Gate. `unknown` is treated as preview: ask the owner
  to fill it in before the first push.
- **One-branch projects** (`main_branch` = `release_branch`): every push is a release.

## Releasing (develop → main)
1. Run the Release Gate (below) on develop.
2. Show the owner what's going out: the CHANGELOG entries since the last release, in plain
   English. **Releasing deploys production, so it needs the owner's go-ahead every time.**
3. `gh pr create --base main --head develop`, merge it after CI passes, then `git switch develop`.

## Release Gate (before every release and every deploy)
This is separate from the per-task stages. Nothing reaches the release branch, or deploys, until it passes.
- Run `verify-gate`, `security-review`, and `suite-runner` (all five suites) together. `security-review` does its full repo-wide sweeps here, not only the diff.
- Add `db-migration-guard` if the push includes migrations that have not been verified yet.
- **BLOCK or FAIL:** do not push or deploy. Fix the findings using the loopback rule. Any fix that changes security posture is a Hard Stop.
- **PASS WITH WARNINGS:** the push can go ahead. Tell the owner the warnings in plain English so they can decide what to do about them.
- Always tell the owner about anything in a "Could not verify" section (for example, `npm audit` had no network). A gap is not a pass.
- The owner's go-ahead for a task does not cover skipping the Release Gate.

## Checkpoints & resume notes (so a usage limit never loses work)
A usage limit stops the session with no warning and no last turn, so wrap-up can't happen *at* the limit. It has to already be done.
- **When:** any task with more than one step. After **each verified step** (not each edit), do both:
  1. **Overwrite the resume note** at `.claude/resume/YYYY-MM-DD-<task-slug>.md` (copy `_template.md`). Overwrite it, never append. Keep it under ~40 lines: goal, done + how verified, next steps, waiting on the owner, live state to clean up (test data, servers, ports), key files. Also keep the 3-line **Plan** and the list of **files changed** here, because agent briefs are built from them.
  2. **Commit only the files you changed** (never `git add -A`: other sessions may share this repo), including the resume note and `ai-context/next-steps.md` once it's overwritten. `gate.py done` has already staged its own bookkeeping (CHANGELOG, domain history, archive moves). Lock files are local and never committed.
- **One note per task**, so parallel sessions never overwrite each other's notes.
- **Finishing:** set `status: done`, move the note to `.claude/resume/_archive/YYYY-MM/`, and make sure the outcome is recorded: the task's `outcome:` line (which `gate.py done` turns into the CHANGELOG entry), `.agents/bugs/` for bugs, `ai-context/next-steps.md` for what's next. The note is a bookmark, not the history.
- **Starting:** a startup hook (`.claude/hooks/resume-context.mjs`) loads every active note as a 1-line index, plus the newest note in full. It never loads the archive, so it stays fast however many tasks pile up. It also **fetches from GitHub first** and says whether this copy is identical, behind, ahead or **split**. Behind: `git pull --ff-only` before anything else. Split: stop and tell the owner before any work. Then check `git status` / `git log`, since other sessions may have changed things.
- **Housekeeping:** the index flags notes untouched for 7+ days as **STALE**. Finish, update or archive them rather than letting them pile up.
- **After a limit resets:** the same session carries on by itself, in view in VS Code, if `autoContinueAtUsageLimit` is turned on in the owner's user settings. **A go-ahead the owner gave for the task still stands after the pause. Don't re-ask for it.** Only a genuinely new ask-first decision (outside what was approved) needs a question, the same as if there had been no limit. **No headless/background restarts**: a brand-new session is always started by the owner, and the resume note gets it going.

## Parallel sessions (worktrees)

Use this only when the owner runs two or more task sessions at the same time. One session at a time works in the main checkout as normal.

- **Start from the main checkout:** `python scripts/gate.py worktree start <ID>`. It takes the zone lock, creates `../<repo>-worktrees/<ID>` on branch `task/<ID>`, and runs `worktree_setup` (e.g. `npm ci`). Open that folder in its own session and run `/step <ID>` there.
- **While any worktree is active, every task runs in a worktree.** The main checkout (on the work branch) is only for coordination: finishing, `next-steps.md`, domain Current state. `gate.py lock` in main refuses while worktrees are active.
- **Single-writer rule:** task branches never edit CHANGELOG, `next-steps.md`, domain History, the archive or `ai-context/roadmap.md` / `roadmap.json`, because every task would touch the same lines and every merge would conflict. `gate.py done` inside a worktree only marks the task done and keeps the lock.
- **Finish from the main checkout:** `python scripts/gate.py worktree finish <ID>`. It merges the work branch into the task branch and verifies there (so the work branch is never left broken), merges into the work branch, writes the CHANGELOG and domain History from the task's `outcome:`, archives, regenerates the master checklist and TAP signals, commits that bookkeeping, removes the worktree and releases the lock. On CONFLICT, resolve inside the worktree and run finish again.
- **Generated files are never hand-merged:** after a merge, re-run `gate.py signals` / `gate.py zones`. `TAP_SIGNALS.md` uses git's union merge, so both sides' rows survive.
- **Abandoning a worktree deletes its unmerged work:** it's a Hard Stop. Ask the owner, then `python scripts/gate.py worktree abandon <ID> --yes`.
- **Locks are local to this machine** (gitignored). Sessions on other machines coordinate through GitHub: fetch first, and stop if the copies have split.
