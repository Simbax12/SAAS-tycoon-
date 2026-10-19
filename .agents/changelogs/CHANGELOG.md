---
type: log
project: "Zero to a Billion"
---

# Changelog — Zero to a Billion

Append-only, newest at the top. Format and rules: `CONTEXT.md` in this folder.

---

## 2026-10-19 — TASK-0007 Milestone 7: Stages 3 to 5
Milestone 7 built on main before the Agent OS branch joined it: Stages 3 to 5, R3 to R10, B3 to B5, the System Map through Stage 5 and the win screen. The owner played it on 2026-10-19

## 2026-10-19 — TASK-0003 Split game/reducer.ts under 400 lines
game/reducer.ts (512 lines after Milestone 7) is now 133 lines: its actions moved unchanged into game/flow.ts, choices.ts, spending.ts and drawing.ts, by action group

## 2026-10-19 — TASK-0002 Add Playwright and a smoke suite
Playwright now plays the game in Chromium; 01-smoke proves a first visit reaches incident 1.1 at desktop and phone sizes, and the game has 27 named test signals.

## 2026-10-19 — TASK-0001 Add ESLint and a lint script
ESLint 9 with Next.js rules now checks the game code, and every task is gated on npm run lint; 21 first-run findings settled per the owner.

## 2026-10-19 — No deadline; old branches deleted
The owner set no deadline, so the roadmap will show milestones without dates. The four merged `claude/*` branches were deleted from GitHub; every commit was already in main.

## 2026-10-19 — Agent OS added, selectively
Added AGENTS.md, ai-context/, .agents/, .claude/, gate.py, testing/ and CI from the New-App kit. CLAUDE.md stays the hub. Skipped docs/specs, docs/security, docs/architecture, the cheat sheet, onboarding.md and db-migration-guard: the game docs are the specs and there is no backend. Owner's choice.

## 2026-10-19 — PROGRESS.md split
Decisions and the change log moved to `.agents/archive/legacy/` (searchable with `gate.py search`). The newest 25 decisions are below. Next moved to `ai-context/next-steps.md`. PROGRESS.md keeps Done and the on-screen text to check. CLAUDE.md rules 7 and 8 updated to match.

## 2026-10-19 — One branch, no zones
main_branch and release_branch are both `main`, matching CLAUDE.md rule 10. No zones.json: one Next.js app, worked one session at a time. Add zones if parallel sessions start.

## 2026-10-19 — Oversized files split before Milestone 7
Budget guard stays on. reducer.ts, reducer.test.ts, Incident.tsx and Blueprint.tsx get split tasks (TASK-0003 to TASK-0006) that Milestone 7 depends on. check-docs.mjs and docs/CHALLENGES.md are exempt: splitting CHALLENGES.md by stage needs check-docs.mjs to read folders first.

## 2026-10-19 — Tokens guard on; ESLint and Playwright approved
`data/blipOs.ts` and `app/globals.css` are token definition files. About 600 legacy colour literals are cleaned only when their lines are touched. The owner approved ESLint (TASK-0001) and Playwright (TASK-0002) as new dev dependencies.

## 2026-10-11 — A repeat shows "What happened:" with its alert or email text above …
A repeat shows "What happened:" with its alert or email text above "Which pattern fixes this?". Every open incident shows its "Sees" sentence as a caption under the diagram. Why: Played R2: nothing said what the problem was. Maya still does not name the cause, so it stays recall. The caption stands in for the "Sees" animations until Milestone 8

## 2026-10-11 — The milestone banner and the OS update screen use the new version's …
The milestone banner and the OS update screen use the new version's title bar colours. The update takes 3 seconds. Why: UI_THEME.md > The upgrade

## 2026-10-11 — Without the second screen showing (zoomed out), every window shows on …
Without the second screen showing (zoomed out), every window shows on the main screen. Why: Otherwise a window on screen 2 would be lost

## 2026-10-11 — A window dragged more than half past the edge between the screens …
A window dragged more than half past the edge between the screens jumps to the other screen, and the drag ends there. Why: Simple to build, and the "Move to other screen" button does the same in one tap

## 2026-10-11 — Zoomed in with two screens, each screen is at most 4 by 3
Zoomed in with two screens, each screen is at most 4 by 3. Why: The wide rooms made two side by side too short to read

## 2026-10-11 — The phone's screen switch shows a screen icon and the number of the …
The phone's screen switch shows a screen icon and the number of the screen in view, with "Screen 1" or "Screen 2" read out. Why: "Screen 1" in words did not fit in the taskbar at 375 pixels

## 2026-10-11 — The word tiles also show on a computer
The word tiles also show on a computer. Why: They help anyone who is not sure how to type a command

## 2026-10-11 — Terminal opens up to 1000 pixels wide
Terminal opens up to 1000 pixels wide. The lesson and prompt sit side by side when the window is at least 720 pixels wide. Why: Two panels need the room

## 2026-10-11 — Terminal lessons: the commands run for real on the step's six lines
Terminal lessons: the commands run for real on the step's six lines. Any command in the table runs, but only the task's command ticks Task 1 and makes its lines tappable. Two wrong commands show the hint. The terminal's history is kept while the window is closed, but not after a reload. Why: Like an online coding course, and the check script proves each lesson's command keeps its cause

## 2026-10-11 — A server alert waits until the BlipOS update and the milestone banner …
A server alert waits until the BlipOS update and the milestone banner have gone. Why: 2.1's alert showed under the banner

## 2026-10-11 — The win screen has a "You did it" trophy icon on the desktop and in …
The win screen has a "You did it" trophy icon on the desktop and in the Start menu once the game is won. Why: It no longer opens by itself, and it had no icon

## 2026-10-11 — The tutorial has a new step 4, "Now open the Incident window."
The tutorial has a new step 4, "Now open the Incident window.". When a window covers an app's icon, the spotlight lights the Start button, then the app's row in the Start menu. Why: The player could get stuck behind the spotlight when the Inbox covered the Incident icon

## 2026-10-11 — "Open in Shop" is now "Find in Shop"
"Open in Shop" is now "Find in Shop". The Shop opens on the tab of the item Needed next. Why: It no longer opens the Shop

## 2026-10-11 — Nothing opens by itself
Nothing opens by itself. "Investigate", "Find in Shop", Triage, Builds, Tune and the win screen point to the app instead: a line says where to open it, and its desktop icon and Start menu row glow. Why: Asked for, so players learn the desktop like a real computer. Tapping an email balloon still opens the Inbox, because the player chose to tap it

## 2026-10-11 — Old saves that own the Faster PC lose it and get £6,000 back
Old saves that own the Faster PC lose it and get £6,000 back. A save that finished a stage gets the computer email when it loads. Why: Never wipe or strand a player

## 2026-10-11 — A computer's request email is sent the moment the stage's last …
A computer's request email is sent the moment the stage's last incident is solved, not after "Next". Why: "Next" is locked until the computer is bought, so the email must come first

## 2026-10-11 — Each new stage needs its new computer: pc-office, pc-loft, pc-hall …
Each new stage needs its new computer: pc-office, pc-loft, pc-hall and pc-tower, at £300, £1,200, £6,000 and £30,000 by the price rule. "Next" waits until it is bought, and the investor lends if needed. They replace the Faster PC. Why: Asked for after playing Milestone 7. One "PC" idea that matches each room's new computer

## 2026-10-11 — "Stage 3 is coming soon" and the code that stopped play at a missing …
"Stage 3 is coming soon" and the code that stopped play at a missing incident are gone. Why: Every incident is in the data files now

## 2026-10-11 — The Faster PC halves the loading bar to 0.8 seconds
The Faster PC halves the loading bar to 0.8 seconds. Why: UI_THEME.md says "quicker" without a number

## 2026-10-11 — The tray shows the handbook's book and the Faster PC's lightning mark …
The tray shows the handbook's book and the Faster PC's lightning mark on the computer layout only. Why: There is no room at 375 pixels, the same reason the clock is left out
