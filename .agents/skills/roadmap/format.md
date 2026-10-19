# Checklist format `roadmap/1`: the dashboard contract

Every repo built with the project-context-architect skill carries the same two
machine-readable files. A dashboard can read them from GitHub to show where every
project is up to. This file is the contract: what the files hold, how to fetch them,
and the edge cases. Build against it, not against `gatekit/roadmap.py`.

| File | Written by | When |
|---|---|---|
| `ai-context/roadmap.json` | `python scripts/gate.py roadmap` | Every `gate.py done` (main checkout), `worktree finish` and `/roadmap` run; only when the content changed |
| `.agents/kit.json` | the skill's `scaffold.py` | On scaffold and `--sync` |

`ai-context/roadmap.md` is the human version of `roadmap.json`. It shows the same
facts, with done milestones collapsed. Don't parse it.

**Versioning:** `format` is `roadmap/<major>`. New optional keys may appear within a
major version, so ignore keys you don't know. Removing or renaming a key, or changing
its meaning, bumps the major version. Show an unknown major as "project needs
`scaffold.py --sync`" rather than failing.

## `roadmap.json` fields

| Key | Type | Meaning |
|---|---|---|
| `format` | string | `"roadmap/1"` |
| `generated_at` | string | UTC `YYYY-MM-DDTHH:MM:SSZ` of the last content change (not of the last run) |
| `branch` | string | The branch this file is maintained on (`gate.json` → `main_branch`, normally `develop`) |
| `release_branch` | string | The branch that's released and deployed (`gate.json` → `release_branch`, normally `main`) |
| `project` | string | Project name |
| `one_liner` | string | What it is and who it's for (`5w.md` → What this project is). `""` if not filled |
| `phase` | string | e.g. "active build" (`5w.md` → Current phase) |
| `onboarded` | bool | `5w.md` is `status: confirmed` |
| `stack` | string[] | 2–4 main technologies |
| `links.live`, `links.preview` | string \| null | First URL on `5w.md`'s Live URL / Preview URL lines |
| `deadline.date` | string \| null | `YYYY-MM-DD`; null = no deadline |
| `deadline.type` | string | `hard`, `soft` or `none` |
| `deadline.due` | string | What must be ready by the deadline |
| `cadence` | string | How often the project gets worked on, in the owner's words |
| `current_milestone` | string \| null | Id of the first milestone that has tasks and isn't done |
| `counts.tasks_done`, `counts.tasks_total` | int | Tasks in milestones (parked tasks excluded) |
| `counts.ready` | int | Open tasks whose dependencies are all done |
| `counts.waiting_on_tasks` | int | Open tasks still waiting on other tasks |
| `counts.blocked_on_owner` | int | Tasks with `status: blocked` (waiting on the owner) |
| `counts.parked` | int | Tasks deferred by the owner (shown under "After launch") |
| `counts.later_ideas` | int | Deferred ideas that aren't tasks yet |
| `next_up` | `{id, title, milestone}[]` | Up to 3 ready tasks, earliest milestone first. One may already be in progress on a developer's machine: in-progress state is local, never committed |
| `waiting_on_owner` | `{id, title, reason}[]` | Blocked tasks and why |
| `last_done` | `{id, title, date}` \| null | The most recently finished task |
| `milestones[]` | object[] | In plan order: `id`, `title`, `goal` ("You'll be able to…"), `target` (date \| null), `status` (`done`, `started`, `not started`), `done`, `total`, `finished` (date \| null) |
| `tasks[]` | object[] | Every task, by id: `id`, `title`, `milestone` (id \| null), `size`, `status` (`done`, `todo`, `blocked`, `parked`), `done` (date \| null), `blocked_reason` (string \| null) |
| `later` | string[] | Deferred ideas |
| `problems` | `{code, detail}[]` | Checklist health. Codes: `no_deadline_line`, `bad_date`, `unknown_milestone`, `targets_out_of_order`, `target_after_deadline`, `task_without_milestone`, `milestone_order`, `depends_on_parked` |

Dates are local calendar dates (`YYYY-MM-DD`). `todo` includes tasks in progress.

## `.agents/kit.json` fields

| Key | Meaning |
|---|---|
| `skill_commit` | The skill repo's HEAD when the project was scaffolded or synced |
| `synced_paths_commit`, `synced_paths_date` | The newest skill commit (and its UTC date) that touched a synced path |
| `dirty` | true = synced from uncommitted skill changes, so "up to date" can't be judged |
| `synced` | Local date of the scaffold or sync |

Every field can be null when the skill folder wasn't a git repo.

**Synced paths** in the skill repo: `operation-manual.md`, `pipeline.md`,
`assets/scaffold/.agents/qc-team`, `assets/scaffold/.agents/skills`,
`assets/scaffold/scripts`, `assets/scaffold/.claude/hooks` and
`assets/scaffold/testing/macros/shot.mjs`.

## Fetching: one GraphQL request for every repo

Tested on 2026-10-15 against a real account of 10 repos: one request, cost 1 point.
`object(expression: "<branch>:<path>")` returns the file, or `null` when the file or
the branch doesn't exist.

```graphql
query Dashboard($cursor: String, $skillOwner: String!, $skillRepo: String!) {
  viewer {
    repositories(first: 100, after: $cursor, ownerAffiliations: OWNER, isArchived: false, isFork: false,
                 orderBy: {field: PUSHED_AT, direction: DESC}) {
      pageInfo { hasNextPage endCursor }
      nodes {
        nameWithOwner
        url
        isPrivate
        pushedAt
        defaultBranchRef {
          name
          target { ... on Commit { committedDate statusCheckRollup { state } } }
        }
        checklistOnDevelop: object(expression: "develop:ai-context/roadmap.json") { ... on Blob { text isTruncated } }
        checklist: object(expression: "HEAD:ai-context/roadmap.json") { ... on Blob { text isTruncated } }
        checklistOnMain: object(expression: "main:ai-context/roadmap.json") { ... on Blob { text isTruncated } }
        kitOnDevelop: object(expression: "develop:.agents/kit.json") { ... on Blob { text } }
        kit: object(expression: "HEAD:.agents/kit.json") { ... on Blob { text } }
        kitOnMain: object(expression: "main:.agents/kit.json") { ... on Blob { text } }
        agentsMd: object(expression: "HEAD:AGENTS.md") { ... on Blob { byteSize } }
        pullRequests(states: OPEN) { totalCount }
        taskBranches: refs(refPrefix: "refs/heads/task/", first: 20) {
          totalCount
          nodes { name target { ... on Commit { committedDate } } }
        }
      }
    }
  }
  skill: repository(owner: $skillOwner, name: $skillRepo) {
    defaultBranchRef {
      target {
        ... on Commit {
          manual: history(first: 1, path: "operation-manual.md") { nodes { oid committedDate } }
          pipeline: history(first: 1, path: "pipeline.md") { nodes { oid committedDate } }
          qcTeam: history(first: 1, path: "assets/scaffold/.agents/qc-team") { nodes { oid committedDate } }
          skills: history(first: 1, path: "assets/scaffold/.agents/skills") { nodes { oid committedDate } }
          scripts: history(first: 1, path: "assets/scaffold/scripts") { nodes { oid committedDate } }
          hooks: history(first: 1, path: "assets/scaffold/.claude/hooks") { nodes { oid committedDate } }
          shot: history(first: 1, path: "assets/scaffold/testing/macros/shot.mjs") { nodes { oid committedDate } }
        }
      }
    }
  }
}
```

`skillOwner` / `skillRepo` = wherever your copy of this skill is pushed. Loop on
`pageInfo.hasNextPage` with `cursor = endCursor`.

## Rules for each repo

| What the query returns | Show |
|---|---|
| `defaultBranchRef` is null | Empty repo: skip it |
| `checklistOnDevelop` present | Use it, and `kitOnDevelop`: the latest progress. Projects work on `develop` and release to `main` |
| Only `checklist` (the default branch) present | Use it, and `kit` (a one-branch project) |
| Only `checklistOnMain` present | Use that, and `kitOnMain`. Flag "default branch is X" |
| `checklistOnMain` differs from the one used | Optional: show "released" (main's copy) beside "done". The same format on both branches |
| Both null, `agentsMd` present | "Set up, no roadmap yet: run `/roadmap`" |
| All null | "Not set up with the skill" |
| `isTruncated` true | Error: the file is too big to read this way |
| `text` isn't valid JSON | Error: show the repo, never crash the dashboard |
| `format` major isn't 1 | "Needs `scaffold.py --sync`" |
| `kit` missing | Version unknown (scaffolded before kit.json existed): suggest `--sync` |
| `kit.dirty` true | Version unknown |
| Newest `committedDate` in `skill` > `kit.synced_paths_date` | "Skill files out of date: run `scaffold.py --sync`" |
| `taskBranches` | Parallel work in progress. Only branches that were pushed are visible |
| `statusCheckRollup` null | No CI on the default branch. Otherwise `SUCCESS`, `FAILURE`, `PENDING`, `ERROR` or `EXPECTED` |

Seen on real repos:
- **No `main` branch.** One repo's default branch was a feature branch and it had no `main` at all.
- **`master` instead of `main`.** One repo used `master`. A project on `master` must have `main_branch: "master"` in its `gate.json`, so the checklist lives on the default branch.
- **An empty repo** returned no default branch.

**Freshness:** the file changes when a task is finished and the commit is pushed.
Work committed locally but not pushed isn't visible. Compare `generated_at` with
`pushedAt` and the last commit's `committedDate` to tell "idle" from "working on a
long task".

## Auth and safety

- **Token:** a fine-grained personal access token, **read-only**, limited to the repos the dashboard shows. It needs these permissions:
  - Contents
  - Metadata
  - Pull requests
  - Commit statuses
  - Checks

  This list hasn't been tested with a fine-grained token yet (the fetch test used the GitHub CLI's own token), so confirm it when you build the dashboard.
- **Keep the token server-side** (an API route or server function), never in browser code, and never commit it.
- **Public repos** expose their `roadmap.json` to everyone: the deadline, `due` and the preview URL. `/roadmap` reminds the owner of this.
