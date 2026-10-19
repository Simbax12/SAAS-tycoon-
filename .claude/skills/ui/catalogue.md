# UI catalogue: approved add-on libraries

Read by `/ui` at step 3 of the lookup order. Each entry has been reviewed for
quality, licence, activity and fit with Base UI. **Checked: 2026-10-14**
(stars, licence file, last push on GitHub; registry health from the shadcn
directory). Re-check anything older than 6 months before relying on it.

## Rules

- **Licence:** MIT, Apache-2.0 or ISC only. Keep the library's notice when code is copied.
- **App-only (MIT + Commons Clause):** these may be installed straight into one client
  app, never copied, restyled or republished through the house registry.
- **Activity:** no push in 6 months means stale. Don't install it without the owner's OK.
  Stock shadcn items that depend on a stale package (`command` uses `cmdk`) are fine,
  because shadcn maintains the wrapper.
- **Registry health "degraded":** run `npx shadcn add <item> --dry-run` first and check the files it lists.
- **Behaviour layer:** prefer Base UI. A Radix-based item is allowed only when no Base UI
  equivalent exists; say so in the plan.
- **After install:** run `gate.py tokens` and re-token what it flags. Every library ships
  its own look, and keeping it is how apps end up looking the same.
- **Animation:** at most 2 animated-component sources per project, picked to match
  the aesthetic direction in spec 04.
- **Never:** coss ui (AGPL), Aceternity (no open repo), daisyUI / HeroUI / Mantine (their
  own styling systems), Tremor (stale), and any library not in this file until the owner approves it.

## Foundations (every project)

| Need | Package | Licence | Notes |
|---|---|---|---|
| Behaviour layer | `@base-ui/react` (shadcn `--base base`) | MIT | 11.1k★, pushed 2026-10 |
| Components, tokens, registry CLI | `shadcn` | MIT | 125.6k★. `init --template vite --base base` |
| Icons (default) | `lucide-react` | ISC | 25.0k★, 108M/wk |
| Animation | `motion` (`motion/react`) | MIT | 34.1k★. Not `framer-motion` |
| Toasts | shadcn `sonner` → `sonner` | MIT | 13.0k★. The shadcn item imports `next-themes`: in Vite, swap `useTheme` for the house theme provider's hook |
| Charts | shadcn `chart` → `recharts` | MIT | 27.6k★. The item pins recharts 3.8 |
| Data tables | `@tanstack/react-table` | MIT | 28.5k★. Now v9: check the cheat sheet before copying v8 examples |
| Click-to-source (dev only) | `code-inspector-plugin` | MIT | 3.0k★. Alt+click a component → opens `file:line` |

## Icon families (one per project, chosen at onboarding)

| Family | Package | Licence | Use when | Matching animated set |
|---|---|---|---|---|
| Lucide | `lucide-react` | ISC | Default | `@lucide-animated` (8.2k★, MIT), `@itshover` (2.7k★, Apache-2.0), `@animateicons` (1.3k★, MIT, health degraded) |
| Phosphor | `@phosphor-icons/react` | MIT | The direction wants weights or duotone | None: Iconimate (57★) has no recognisable licence, so it's excluded. Animate the wrapper with Motion instead. The last Phosphor React release was 2025-05; icon sets change slowly, so that's acceptable |
| Tabler | `@tabler/icons-react` | MIT | Data-heavy B2B apps needing niche icons | None checked yet |

Switch families with `npx shadcn migrate icons --from lucide --to <family> --yes` (it also
updates `iconLibrary` in `components.json`). `itshover` isn't in the shadcn directory, so
its `@itshover` namespace is defined in `registries.json` beside this file.

## Product UI

| Library | Namespace | ★ | Licence | Last push | Layer | Use for |
|---|---|---|---|---|---|---|
| ReUI | `@reui` | 3.7k | MIT | 2026-10 | Base UI build (`{style}` URLs) | Data grids, filters, cascaders, timelines, steppers, file upload. The 82 components and `c-*` examples are free; its 645 page blocks are a paid tier (401 without a licence): ask the owner first |
| Dice UI | `@diceui` | 2.1k | MIT | 2026-10 | Base UI build; health degraded | Accessible extras: sortable, kanban, mask input, tags input, combobox |
| Kibo UI | `@kibo-ui` | 4.0k | MIT | 2026-05 | **Radix** | Gantt, calendar, kanban, code block. Moved to `shadcnblocks/kibo`. Only when ReUI / Dice UI have no equivalent. `status` needed 8 colours re-tokened (to `success` / `warning` / `info`) |
| Supabase UI | `@supabase` | – | MIT | 2026-10 | shadcn | Auth forms, realtime cursors, file dropzone wired to Supabase. Install into containers' feature folders; the views stay data-free |

## Marketing pages

No block library is approved. Build marketing sections from the kit and the golden screen's patterns,
with Magic UI or Motion Primitives for motion. That also keeps us away from the most-copied layouts.
**Removed on 2026-10-14:** Tailark (`@tailark`). Its registry now needs a paid plan (401: "Sign in with
a plan that includes blocks").

## Animated components (pick at most 2)

| Library | Namespace | ★ | Licence | Last push | Feel |
|---|---|---|---|---|---|
| Magic UI | `@magicui` | 22.7k | MIT | 2026-10 | Showy marketing effects: marquee, number ticker, shimmer button |
| Motion Primitives | `@motion-primitives` | 6.6k | MIT | 2026-09 | Quiet, product-grade: text effects, morphing dialogs, transitions |
| Cult UI | `@cult-ui` | 6.5k | MIT | 2026-10 | Tactile, playful product pieces (mixed layers: some Radix) |
| Kokonut UI | `@kokonutui` | 2.2k | MIT | 2026-10 | Polished, AI-product style. Ships palette colours: `bell-button` needed 11 re-tokened |
| Eldora UI | `@eldoraui` | 2.0k | MIT | 2026-09 | Marketing sections with motion |
| SmoothUI | `@smoothui` | 1.0k | MIT | 2026-10 | Small, subtle micro-interactions |
| React Bits | `@react-bits` | 49.1k | **MIT + Commons Clause: app-only** | 2026-10 | Backgrounds, text and cursor effects |

**Removed on 2026-10-14:** Animate UI (`@animate-ui`, MIT + Commons Clause). No commit
since 2025-12-31, so it's stale under the activity rule. Re-check before adding it back.

## Designer-supplied animation (never AI-generated)

| Need | Package | Licence | Notes |
|---|---|---|---|
| Lottie files | `@lottiefiles/dotlottie-react` | MIT | Plays `.lottie` / JSON from a designer. Check each file's own licence |
| Rive files | `@rive-app/react-canvas` | MIT | Interactive state-machine animations from a designer |

**Install test, 2026-10-14** (one item from each namespace into a fresh Vite + Base UI app,
then typecheck, lint and `gate.py tokens`):
- **Clean on all three:** ReUI `rating`, Dice UI `tags-input`, Magic UI `number-ticker`, SmoothUI
  `animated-input`, React Bits `CountUp-TS-TW`, lucide-animated `copy`, itshover `copy-icon`.
- **Small fixes:** Motion Primitives (1 unused variable), AnimateIcons (2 `any` types), Kibo UI (1 unused
  prop + 8 colours to re-token).
- **Real work:**
  - Kokonut UI: 11 colours and a hooks-order lint error
  - Cult UI `text-animate`: 5 strict-TypeScript errors
  - Supabase UI `dropzone-react`: 3 type errors + 1 colour
- **Next.js only:** Eldora UI `animated-badge` imports `next/link`. Check imports before using Eldora in Vite.
- **Paid (so removed):** Tailark.

So after every `shadcn add`: typecheck, lint and `gate.py tokens`, and fix what they flag before using the component.

## Adding a library

1. Get the evidence: stars, the actual LICENSE file, last push, open issues,
   dependencies (does it pull in Radix, a second animation library or its own CSS?),
   and its health in `https://ui.shadcn.com/r/registries.json`.
2. Install one item into a scratch branch, then run `gate.py tokens`. How much
   re-tokening it needs is the real cost.
3. Ask the owner, then add a row here with today's date. A library meant for the house registry
   also goes through the house-ui review checklist.
