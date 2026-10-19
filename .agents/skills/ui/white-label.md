# White-label branding

Read this only for branding work: projects where each client (tenant) gets their
own colours, corners, fonts and logo at runtime. Spec 04 says whether this project
is single-brand or white-label.

## Install

`npx shadcn add Simbax12/house-ui/white-label#v1` gives you:

| File | What it does |
|---|---|
| `src/lib/brand-tokens.ts` | `validateBrand(input, { fixForeground })` → `{ ok, brand, errors }`; `contrastRatio(a, b)`, `readableTextFor(bg)`, `brandVars(brand, mode)`, `isSafeLogoUrl(url)` |
| `src/components/white-label/tenant-theme-provider.tsx` | `<TenantThemeProvider brand>` goes inside the light/dark `ThemeProvider`. It applies the brand with `setProperty()`, follows the `.dark` class, loads the brand's fonts and caches both modes. `useTenantTheme()` returns `{ brand, mode }` |
| `src/components/white-label/no-flash-snippet.html` | Paste into `index.html` `<head>`: applies the saved light/dark choice and the cached brand before first paint. With a Content-Security-Policy, add its sha256 hash to `script-src` |
| `src/components/white-label/tenant-logo.tsx` | `<TenantLogo src name>`: the logo, or a wordmark of the name if there's none or it fails to load |
| `src/components/white-label/tenant-avatar.tsx` | `<TenantAvatar src name>`: the picture with an initials fallback |
| `src/components/white-label/industry-icon.tsx` | `<IndustryIcon industry>`: a fixed industry → Lucide icon map, for tenants with no logo and empty states |
| `src/components/white-label/preset-picker.tsx` | `<PresetPicker value onValueChange mode>`: the house presets, each previewed live in its own box |
| `supabase/migrations/*_tenant_brand.sql` | The `tenant_brand` table, a server-side `house_brand_valid()` check, and RLS (members read, tenant admins write). Has `ADAPT` notes |

**Loading a brand:** read the `tenant_brand` row, turn `logo_path` into a storage URL, then
`validateBrand({ name: row.company_name, preset: row.preset, overrides: row.overrides, logoUrl })`
and pass `.brand` to the provider. Bad values are dropped and listed in `.errors`.
**Saving a brand:** refuse when `validateBrand(...).ok` is false, or offer `{ fixForeground: true }`
for unreadable text colours. The database check then refuses anything malformed.

## Rules

1. **Brand values are data, never code.** They live in `tenant_brand`, one row per tenant:
   a preset id plus overrides.
2. **Only allowlisted tokens:** the colours, `radius`, `spacing`, `icon-stroke` and `font-sans` /
   `font-heading` (font ids from `brand-presets.json`). Anything else is dropped.
3. **Validate twice:** on save (server side: a check constraint or edge function) and on load
   (`validateBrand`). Colours must be `oklch()` or hex, lengths must sit in range, and
   nothing may contain `; { } < > url( \`.
4. **Apply only with `style.setProperty('--token', value)`.** Never build CSS text, never
   `<style>{…}</style>`, never `dangerouslySetInnerHTML`.
5. **Contrast:** every colour/foreground pair needs 4.5:1. On save, either refuse or set
   the foreground with `readableTextFor`. Never store an unreadable pair.
6. **Clients with no brand** pick a house preset (`preset-picker`); only the preset id is stored.
7. **Logos:** PNG, JPEG or WebP uploads only (an SVG can carry script), a size cap, and a
   storage bucket with RLS. They're shown through `tenant-logo`, never a raw `<img>`.
8. **Fonts:** only from the allowlist, loaded by family name. Never a client-supplied URL.
9. **Brand outside the browser** isn't covered by this block: emails, PDFs, the app manifest
   and favicons, social-share images, native app icons. Each is a question in spec 04
   ("Design system and branding") and becomes its own task.

## Roadmap: the `branding` domain (4 tasks)

1. **Brand storage (Risky):** install `Simbax12/house-ui/white-label#v1`, add the `tenant_brand` migration and
   RLS, and wire validation on save.
2. **Provider and no-flash load (Standard):** wire `TenantThemeProvider` at the app root, add the
   `index.html` snippet, and add the fallbacks (wordmark, initials, industry icon).
3. **Brand settings screen (Standard):** preset picker, colour and radius inputs with a live
   contrast warning, and logo upload. Admins only.
4. **Brand outside the browser (Standard):** what spec 04 asks for (emails, PDFs, manifest).

## Checking it

- **After shots** use 2 contrasting presets plus dark mode:
  `node testing/macros/shot.mjs <screen> --preset <a>,<b> --theme light,dark`.
- **The tokens guard** must pass: screens use semantic tokens only, so every brand reaches them.
- **`security-review`** checks brand validation, SVG uploads, style injection and `tenant_brand` RLS.
