// SessionStart hook: puts the active resume notes (.claude/resume/*.md) into a
// new session's context, so work interrupted by a usage limit or a pause can
// continue without rereading the old conversation. It also checks GitHub so a
// session never starts on a copy that is behind or has split from the remote.
// See "Checkpoints & resume notes" in ai-context/pipeline.md.
//
// Stays small on purpose: only ACTIVE notes are read (never _archive/ or
// _-prefixed files), the output is a 1-line index of every active note plus
// the full text of the most recently updated one, hard-capped in size. It
// must never block a session from starting, so any error exits 0 silently.
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const MAX_BODY_LINES = 60
const STALE_DAYS = 7

function git(root, args, timeout = 8000) {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8', timeout })
  return r.status === 0 ? r.stdout.trim() : null
}

function remoteState(root) {
  if (git(root, ['rev-parse', '--abbrev-ref', '@{u}']) === null) return null // no upstream: nothing to compare
  git(root, ['fetch', '--quiet'])
  const counts = git(root, ['rev-list', '--left-right', '--count', 'HEAD...@{u}'])
  if (!counts) return null
  const [ahead, behind] = counts.split(/\s+/).map(Number)
  if (ahead && behind) return `SPLIT from GitHub (${ahead} ahead, ${behind} behind): stop and tell the owner before any work.`
  if (behind) return `BEHIND GitHub by ${behind} commit(s): run \`git pull --ff-only\` before anything else.`
  if (ahead) return `Ahead of GitHub by ${ahead} commit(s) (not pushed yet).`
  return 'Identical to GitHub.'
}

try {
  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd()
  const out = []
  const remote = remoteState(root)
  if (remote) out.push(`# GitHub check: ${remote}`)

  const dir = path.join(root, '.claude', 'resume')
  const notes = !fs.existsSync(dir) ? [] : fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => {
      const file = path.join(dir, f)
      const text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
      const fm = /^---\n([\s\S]*?)\n---\n?/.exec(text)
      const meta = {}
      if (fm) {
        for (const line of fm[1].split('\n')) {
          const i = line.indexOf(':')
          if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim()
        }
      }
      // A note without a valid `updated` header still shows (dated by file
      // time, for staleness) but sorts after every proper note and is flagged.
      const headerMs = Date.parse((meta.updated ?? '').replace(' ', 'T'))
      const valid = !Number.isNaN(headerMs)
      const updatedMs = valid ? headerMs : fs.statSync(file).mtimeMs
      return { f, meta, body: fm ? text.slice(fm[0].length) : text, updatedMs, valid }
    })
    .filter((n) => (n.meta.status ?? 'active') !== 'done')
    .sort((a, b) => Number(b.valid) - Number(a.valid) || b.updatedMs - a.updatedMs)

  if (notes.length > 0) {
    const day = 24 * 60 * 60 * 1000
    out.push(`# Resume notes: ${notes.length} unfinished task${notes.length === 1 ? '' : 's'} (.claude/resume/)`)
    out.push('Pick the note matching what the owner asks for. Before continuing, run `git status` and `git log -5`,')
    out.push('since other sessions may have changed things since the note was written. Only read other notes if needed.')
    out.push('')
    for (const n of notes) {
      const age = Math.floor((Date.now() - n.updatedMs) / day)
      const stale = age >= STALE_DAYS ? ` STALE (${age} days old: finish, update or archive it)` : ''
      const broken = n.valid ? '' : ' MISSING HEADER (fix it from _template.md)'
      out.push(
        `- ${n.meta.updated ?? '?'} | ${n.meta.title ?? n.f} [${n.meta.status ?? 'active'}] next: ${n.meta.next ?? '?'} (.claude/resume/${n.f})${stale}${broken}`,
      )
    }
    const newest = notes[0]
    const lines = newest.body.trim().split('\n')
    out.push('')
    out.push(`## Most recent: ${newest.meta.title ?? newest.f}`)
    out.push(...lines.slice(0, MAX_BODY_LINES))
    if (lines.length > MAX_BODY_LINES) {
      out.push(`... (${lines.length - MAX_BODY_LINES} more lines in .claude/resume/${newest.f}; notes should stay under ~40 lines)`)
    }
  }
  if (out.length) process.stdout.write(out.join('\n') + '\n')
} catch {
  process.exit(0)
}
