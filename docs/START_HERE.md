# Zero to a Billion: start here

This folder is the source of truth for the game. CLAUDE.md in the repo root is the hub: it maps these files, shows how they connect and holds the rules for working here. Read CLAUDE.md first, then this file. Open the other files when you reach the part they cover.

## What we are building

A story game that teaches real system design.

The player is the first engineer at Blip, a made-up app for posts, messages, photos and payments. Blip starts with 0 users. Problems arrive as server alerts and as emails from the boss, the team and customers. The player fixes them, earns money, buys upgrades and grows Blip to 1 billion users.

The everyday problems come back again and again in new disguises, so what the player learns sticks.

The whole game looks like an early 2000s computer desktop. The player opens parts of the game by clicking icons.

## Who it is for

A visual learner who is new to backend architecture. The game must be dyslexia-friendly. The player should learn from watching the system change, not from reading.

## The files

| File | What it holds | Read it when |
|---|---|---|
| GAME_DESIGN.md | The rules: story, cast, play order, alerts and emails, both incident flows, users, stars, money, hints, saving | Building any game logic |
| CHALLENGES.md | The 15 new incidents with options, answers, hints and users gained | Building new incidents or their data file |
| REPEATS.md | The 10 repeat incidents with pattern cards, answers and hints | Building repeat incidents, pips or refreshers |
| UPGRADES.md | The 19 Shop items with prices, users gained, effects and request emails | Building the Shop, request emails or any upgrade effect |
| UI_THEME.md | Desktop look, icons, windows, alerts, sender badges, readability rules | Building anything on screen |

## Rules for the AI building this

The rules are in CLAUDE.md in the repo root. They live there so they are written in one place only.

After any change to these files, run `node scripts/check-docs.mjs`. It must print "0 problems".

## Tech

- Next.js (App Router), React, TypeScript, Tailwind CSS
- Everything runs in the browser. No backend, no database.
- One reducer holds all game state.
- Progress saves to localStorage.
- No extra libraries unless you ask first.

## Folder layout

```
CLAUDE.md        the hub: map, links, rules
/docs            these six files
/scripts         check-docs.mjs (checks the docs agree with each other)
/data            challenges.ts, repeats.ts, upgrades.ts, emails.ts, stages.ts, playOrder.ts
                 (typed copies of the docs)
/game            reducer, types, rules (users, stars, money, hints, pips)
/components
  /desktop       wallpaper, icons, taskbar, window frame, server alert, balloon
  /windows       Inbox, Incident, SystemMap, Shop, PatternBook, Stats, HowToPlay, Settings, RecycleBin
/app             the single page
PROGRESS.md
```

## Build order

| Milestone | What gets built | Done when |
|---|---|---|
| 1. Desktop | Wallpaper, icons, taskbar, windows that open and close | Every icon opens its window on a phone and on a computer |
| 2. Engine and Stage 1 | Data files, reducer, server alerts, Inbox and emails, new incident flow, stars, users, saving | Stage 1 can be played from start to finish and survives a page refresh |
| 3. Help | Tutorial, first-time tips, How to Play, hints, Pattern Book, Recycle Bin | A player who picks wrong twice is guided to the answer |
| 4. Shop and money | Cash, Shop cards with price dots, request emails, all Stage 1 items and their effects, feature unlocks, investor top-up | Buying Payments unlocks incident 1.3, and the game cannot get stuck |
| 5. Repeats and Stage 2 | Repeat incident flow, pattern cards, "Remind me", pips, refreshers, thank-you emails, all Stage 2 content | R1 and R2 can be played, and the Pattern Book shows their pips |
| 6. Stages 3 to 5 | Remaining incidents and Shop items, growing System Map, win screen | The game can be played from 0 to 1 billion users |
| 7. Polish | Animation, sound, balance, readability check | Every rule in UI_THEME.md passes at 375px wide |

## First message to send the AI

```
Read CLAUDE.md and docs/START_HERE.md, then the five files START_HERE.md lists.

Tell me in a few lines:
1. How the game plays, in your own words
2. How you will build Milestone 1
3. Anything in the files that is unclear or does not add up

Do not write any code until I say go.
```

## Message for each later milestone

```
Read CLAUDE.md, docs/START_HERE.md and PROGRESS.md.
Build Milestone [number] only.
Re-read the files that milestone depends on before you start.
When finished, update PROGRESS.md and tell me how to test it.
```
