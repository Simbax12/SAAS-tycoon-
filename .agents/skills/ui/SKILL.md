---
name: ui
description: House rules for building or changing screens, components and styles. Covers where components come from (project kit, the house registry, the catalogue, stock shadcn), the container / view / fixtures split, theme tokens, all states in the first write, the golden screen, icons and motion. Use before writing or planning any UI, adding a component library, or doing branding work. For a small visual change to an existing screen, use a Tiny task with gate.py ui / swap / theme set instead.
paths:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.css"
  - "**/components.json"
---

# /ui — build screens the house way

Small visual change to a screen that already exists? That's a Tiny task: `gate.py ui` finds it, `swap` or `theme set` changes it. This skill is for building.

## 1. Find before you build (stop at the first hit)

1. This project's `components/ui/`. For "a screen that already does this": `python scripts/gate.py ui <words>`.
2. The house registry: `npx shadcn list Simbax12/house-ui#v1`, then `npx shadcn view Simbax12/house-ui/<item>#v1` (address in `registries.json` → `house`).
3. The catalogue (`catalogue.md` beside this file): `npx shadcn search @<ns> -q "<need>"`, `npx shadcn docs <component>`.
4. Stock shadcn: `npx shadcn add <name>`.
5. Compose from the above.
6. Custom CSS last, with a one-line comment saying why nothing above fits.

- Install with `npx shadcn add` (try `--dry-run` first for a new namespace), never by pasting from a website.
- After every add, run `python scripts/gate.py tokens` and fix what it flags in the new files. That re-tokening is what stops the stock look.
- UI plans name each component, icon and animated source they'll use.

## 2. Every screen is three files

```
features/<area>/<screen>.container.tsx   data: queries, mutations, handlers. No className.
features/<area>/<screen>.view.tsx        JSX and styling only. Props in. Under 150 lines.
features/<area>/<screen>.fixtures.ts     default, empty, loading, error: typed by the view's props
```

- A view file exports one component named `<Screen>View` and its props type. The fixtures file exports
  `export const fixtures = { default, empty, loading, error } satisfies Fixtures<ScreenViewProps>`
  (`Fixtures` comes from `@/lib/fixtures`), so typecheck catches fixtures that drift from the props.
  Extra states (e.g. `overflow` for long text) are welcome. Fixtures hold made-up data only.
- The view's root element has `data-screen="<area>.<screen>"`. Controls get `data-tap` (see `testing/TAP_SIGNALS.md`).
- Views may keep UI-only state (open/closed, active tab). No data imports, no `fetch`, no query hooks.
- Too long? Move a section into its own view, with its own fixtures.
- `gate.py views` enforces this on new and changed files. An old mixed page isn't split in passing: don't grow it, and add a split task.

## 3. Tokens, not values

- **Colour:** semantic classes only (`bg-primary`, `text-muted-foreground`, `border-border`; status: `bg-success` /
  `text-success-foreground`, `warning`, `info`, `destructive`). Never palette classes (`bg-blue-500`), `text-white`, or hex / rgb / oklch in code.
- **Repeated surfaces:** `rounded-card | rounded-control | rounded-pill`, `p-card`, `gap-section`, `px-gutter`, `shadow-raised | shadow-elevated | shadow-overlay`. The plain scale (`p-4`, `gap-2`) is fine for everything else. No arbitrary values like `p-[13px]`.
- **Icons:** `size-icon-sm | md | lg | xl`. Stroke weight comes from the `--icon-stroke` token, never `stroke-[…]`.
- **A new token** goes into the theme CSS (`src/index.css`: `:root`, `.dark` and the `@theme inline` mapping) in a Standard task. `gate.py theme show` lists what exists.
- `gate.py tokens` enforces this. A genuine one-off (e.g. a Google sign-in button colour) gets `tokens-ok: <reason>` on that line, and it's reported.

## 4. All states in the first write

Write these in the same pass, not as a second round:
- responsive classes for the viewports in `testing/registry/viewports.ts`
- `hover:`, `focus-visible:`, `active:`, `disabled:`, `aria-invalid:`
- the empty, loading and error rendering that the fixtures describe

## 5. Look like this product, not every other app

- **Before a new screen,** read the golden screen's view (`golden_screen:` in `docs/specs/04-ui-ux.md`). Copy its spacing rhythm, heading scale, card style and motion instead of inventing new ones.
- **No golden screen yet?** The first UI task, "Design system + golden screen" (Risky), creates it and the owner approves it.
- **Follow the aesthetic direction in spec 04.** Never ship stock shadcn tokens (neutral base, default radius). Don't reach for the stock hero or a three-card row by reflex: lay each screen out for its job.

## 6. Icons and images

- **One icon family** (spec 04; Lucide by default), imported from its package (`lucide-react`).
- **Never draw `<svg>` or `<path>` by hand,** and never generate illustrations. An empty state is a large muted icon, one line of text and an action.
- **Animated icons** only where motion means something: copy → check, loading, success, a hover hint on a key button. They come from the set that matches the icon family (catalogue). Give them `className="animated-icon"` so they follow the `--icon-stroke` token like static icons.
- **Logos:** client logos come from storage through `tenant-logo` (wordmark fallback on error). Third-party brand marks are files in `public/brand/`.
- **Avatars:** the image with an initials fallback.

## 7. Motion

- Use `motion` (`import { motion } from "motion/react"`) with the duration and easing tokens. No CSS keyframes for UI motion.
- The app root has `<MotionConfig reducedMotion="user">`, so people who turn motion off still get fades but no movement.
- Use at most 2 animated-component sources per project. Spec 04 names them.

## 8. Check your work

1. Run `python scripts/gate.py tokens` and `python scripts/gate.py views`, then typecheck and lint.
2. Screenshot every state in the workbench: `node testing/macros/shot.mjs <screen> --state all`.
3. Look at the images before calling it done.

**Branding or white-label work:** read `white-label.md` beside this file first.
**Translated text:** `gate.py ui` searches the code, not locale files. Search for the translation key instead.
