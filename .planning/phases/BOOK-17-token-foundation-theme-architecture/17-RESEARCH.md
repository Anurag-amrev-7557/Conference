# Phase 17 — Technical Research

**Phase:** Token Foundation & Theme Architecture  
**Date:** 2026-05-19  
**Sources:** `17-CONTEXT.md`, v1.2 `.planning/research/*`, codebase skim

## Stack decisions (locked in context)

- **`next-themes@^0.4.6`:** Add dependency; wrap app in `ThemeProvider` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, storage key agreed in implementation (e.g. `book-theme`).
- **Tailwind v4:** Use `dark` class on `<html>` (matches `next-themes`). Semantic colors as `@theme` entries so utilities like `bg-bg`, `bg-surface`, `text-foreground` exist.
- **`light-dark()` vs `dark:`:** Prefer explicit `dark:` overrides for marketing control (per CONTEXT stepped dark ladder). `light-dark()` optional for simple pairs where it reduces duplication.

## FOUC / first paint

- **`index.html`:** Blocking inline script before `main.tsx`: read `localStorage[storageKey]` + `matchMedia('(prefers-color-scheme: dark)')` to set `document.documentElement.classList.add('dark')` when appropriate **only when** stored value is `dark` or (`system` and OS dark). Cannot know CMS `light`/`dark`/`system` until API returns — **after hydration**, `applyAppearance` + `setTheme` must **override** inline guess per hybrid rules (D-17-05, D-17-06).
- **Static CSS:** Set default `body` background to cool light canvas hex (match D-17-01) so first paint is not `#fff` if inline script misses edge case.
- **`<meta name="color-scheme" content="light dark">`:** Per D-17-15.

## Data layer

- **Prisma:** `Website.appearance` is `String` (JSON). No column migration strictly required — add `colorScheme` inside JSON with **read-time default** `system` when key missing, and **write** on next admin save.
- **Risk:** Old cached client bundles — server should merge defaults when serving `GET /api/v1/content`.

## Pitfalls (from research + context)

- **CMS `dark` + user had `light` in localStorage:** On load, inline script may set `light`; `useEffect` must apply CMS authority and call `setTheme('dark')` and optionally clear or ignore conflicting storage when CMS is not `system` (document in PLAN verify steps).
- **customCss (D-17-11):** Injected as-is — dark mode may break; no auto-fix in Phase 17.
- **Backdrop-filter (D-17-20):** Audit nav vs hero — only one above-fold blur.

## Out of scope (Phase 17)

- `scripts/prerender.mjs` theme parity → Phase 22.
- Section/page visual polish → Phase 19.
