# Project Research Summary

**Project:** Book Website (Superhumanly Monograph) — v1.2 Apple-Grade Premium Experience  
**Domain:** Brownfield React/Vite/Tailwind v4 CMS book marketing SPA with Express/Prisma backend  
**Researched:** 2026-05-19  
**Confidence:** HIGH overall (brownfield audit + official Tailwind/next-themes docs); MEDIUM on optional Radix scope and derived dark palettes

## Executive Summary

v1.2 is not a greenfield UI rebuild — it is a **token, variant, and primitive** milestone on an existing React/Vite/Tailwind book site that already ships Phase 16 foundations (spacing/type tokens, Radix modals, section utilities, reduced-motion hooks). Experts deliver “Apple-minimal premium” on this stack by fixing **semantic light/dark surfaces first**, then unifying components, then sweeping public pages and admin — while keeping Framer Motion + scoped GSAP and CMS-driven accent/fonts via the existing `ThemeSynchronizer` bridge.

The recommended approach is **incremental stack extension, not replacement**: add `next-themes` + Tailwind v4 `light-dark()` / `@custom-variant dark`, extract `applyAppearance()` into `src/theme/`, migrate `ui/*` and `@utility` glass/CTA layers to semantic tokens, and extend CMS `appearance` with optional `colorScheme` — avoid shadcn CLI, second animation runtimes, or full dark palette pickers in admin. Motion stays restrained (transform/opacity only); glass blur is capped to one above-the-fold layer.

The dominant risks are **FOUC/FOUDT** (CMS theme and dark mode applied only after JS), **accent-only theming** (hardcoded light `bg-white` / glass rgba), and **CWV regressions** (backdrop-filter stacking, LCP hidden behind entrance animations, prerender capturing SEO head but not theme-accurate body). Mitigate with CSS-first `prefers-color-scheme`, blocking inline theme boot in `index.html`, semantic token refactor before component polish, prerender token assertions, and Playwright dark-mode snapshots.

## Key Findings

### Recommended Stack

Keep Tailwind v4.2, Framer Motion 12, and GSAP scoped to scroll-heavy sections. Add **`next-themes@^0.4.6`** for light/dark/system + `localStorage` without FOUC; extend Radix selectively (Switch, DropdownMenu, Tabs, Tooltip, Label) — no full shadcn install. Add **`tw-animate-css`** (dev) for Radix enter/exit; optional **`@tailwindcss/forms`**. Required **CSS-first** changes in `index.css`: `@custom-variant dark`, `light-dark()` semantic neutrals, `color-scheme` on `html`, inline boot script before module load. CMS: extend `SiteAppearance` with `colorScheme: 'light' | 'dark' | 'system'`; `ThemeSynchronizer` calls `setTheme` after hydration while keeping runtime `--color-accent` overrides.

**Core technologies:**
- **Tailwind CSS v4** — `@theme` + `light-dark()` + `dark:` — correct surface for token milestone without config-file churn
- **next-themes** — class-based theme on `<html>`, system preference, storage — official Tailwind dark-mode pattern without Next.js lock-in
- **Framer Motion (existing)** — micro-interactions, modals, section motion — consolidate; gate with `useReducedMotion`
- **GSAP (existing, scoped)** — hero/scroll only — do not expand site-wide
- **Selective Radix** — a11y for switch/tabs/menus — extend existing Dialog/Slot, not duplicate primitives
- **tw-animate-css** — v4-native overlay animations — replaces legacy `tailwindcss-animate`

**Avoid:** Material/Chakra/DaisyUI, second motion libs, `tailwindcss-animate` plugin, shadcn full CLI, client-only theme in `useEffect` without CSS path.

### Expected Features

**Must have (table stakes):**
- Semantic design tokens (light + dark neutrals, elevation ladder) — CMS-compatible
- System dark mode + `color-scheme` meta + no FOUC
- Two-role typography (serif display + sans UI) with optical/fluid scale site-wide
- Generous whitespace / `section-*` consistency on all public routes + admin
- Unified components (buttons, inputs, cards, modals, lists) on one token system
- `prefers-reduced-motion` on all new motion; GPU-safe transform/opacity only
- Visible `focus-visible` rings; 44px touch targets on mobile CTAs
- Imagery baseline — aspect ratios, dimensions, LCP-safe hero, meaningful `alt`
- Admin visual parity with public tokens (not a separate gray admin design system)

**Should have (differentiators):**
- Manual theme toggle (light/dark/system) with persistence — after system tokens stable
- CMS-driven theme tokens in both modes (accent/fonts; optional dark overrides later)
- Scroll-triggered section reveals (restrained, once-only, not on LCP hero)
- Blur-up below-fold on card grids only
- Refined glass/nav blur with dark variants

**Defer (v1.2.x / v3+):**
- CMS full dark palette pickers (12 color fields) — derive neutrals algorithmically first
- Cinematic video hero, per-section motion in CMS, PWA install splash
- Heavy image pipelines (plaiceholder) unless LCP still fails after native optimizations
- Full admin shell dark mode — LivePreview dark parity is enough for v1.2

**Anti-features to reject:** custom cursor/magnetic everywhere, scrolljacking, glass on every card, theme cross-fades, third display font, auto-playing hero video with sound.

### Architecture Approach

Extend the existing **three-tier token stack**: framework tokens (`@theme` static spacing/type), semantic tokens (`@theme` + `@variant dark` / `light-dark()` for bg/surface/text/border/glass), brand tokens (`applyAppearance()` from CMS for accent, fonts, radius, shadow). Extract `ThemeSynchronizer` logic to `src/theme/applyAppearance.ts` + thin `ThemeProvider`; migrate `ui/Button`, `Card`, `AppDialog`, new `Input` to semantic classes; keep section `@utility` layer but replace hardcoded `bg-white` with `bg-surface`. Admin shell may stay light-only; **LivePreview** must inherit public theme including dark.

**Major components:**
1. **`index.css` `@theme` + variants** — semantic palette, glass vars, section utilities
2. **`src/theme/applyAppearance`** — single CMS → `:root` bridge for public + preview
3. **`WebsiteDataProvider`** — unchanged; `previewData || data` drives preview
4. **`components/ui/*`** — CVA primitives consuming semantic + `buttonStyle`
5. **`DesignSystemManager`** — appearance editor + `setPreview`; add `colorScheme` when ready

### Critical Pitfalls

1. **CMS theme only after JS (FOUC + prerender drift)** — inline critical `:root` tokens at build/prerender; extend `prerender.mjs` to wait for theme-ready; don’t rely on `useEffect` alone
2. **Dark mode in React only (FOUDT)** — CSS-first `prefers-color-scheme` + blocking `index.html` script; `next-themes` with `attribute="class"`; set `color-scheme` on `html`
3. **Accent-only CMS mapping** — refactor `glass-*`, `btn-cta-*`, `body` off hardcoded `#fff` / white rgba; paired contrast-safe accent tokens
4. **Backdrop-filter stacking (INP jank)** — one above-the-fold blur (nav); solid fallbacks; drop or gate `CustomCursor` global listeners on mobile
5. **LCP hidden by entrance animations** — never `opacity: 0` on LCP; use `motionInitial()` / reduced-motion everywhere; explicit image dimensions

## Implications for Roadmap

Based on research, **dark mode and semantic tokens block everything else**. Component craft on light-only hex creates rework. Recommended phase order for v1.2:

### Phase 1: Token Foundation & Theme Architecture
**Rationale:** FEATURES dependency graph and PITFALLS 1–3 — semantic tokens must exist before unified components or dark mode polish.  
**Delivers:** `src/theme/` (`applyAppearance`, color utils), `index.css` semantic palette + `@custom-variant dark` + `light-dark()`, `body` → `bg-bg`, `next-themes` + inline boot script, extend `SiteAppearance`/`ThemeSynchronizer` for `colorScheme`.  
**Addresses:** Semantic tokens, system dark mode (CSS path), FOUC prevention, CMS compatibility.  
**Avoids:** Client-only theme, accent-only mapping, per-component `.dark:bg-gray-*` sprawl.

### Phase 2: Shared UI Primitives
**Rationale:** ARCHITECTURE Pattern 3 — one `Button`/`Input`/`Card`/`AppDialog` on semantic tokens before sweeping 40+ section files.  
**Delivers:** Migrated `ui/*`, selective Radix installs, `tw-animate-css` on dialogs, CVA wired to `appearance.theme.buttonStyle`.  
**Addresses:** Unified components (table stakes).  
**Uses:** Existing CVA/clsx/tailwind-merge; Radix Switch for future theme toggle.  
**Avoids:** Split button systems (`btn-cta-*` vs slate `Button.tsx`).

### Phase 3: Public Surface Polish
**Rationale:** Depends on primitives; bounded migration landing → blog → events → community → 404.  
**Delivers:** Section sweep (`bg-surface`), optical type scale, imagery (aspect-ratio, LCP hero), mobile nav/CTAs, 404 brand moment.  
**Addresses:** Full public polish, imagery CLS, whitespace consistency.  
**Avoids:** LCP motion regression; blur-up on hero (below-fold only if added here).

### Phase 4: Motion, Glass & Performance Guardrails
**Rationale:** PITFALLS 4 & 6 — audit after surfaces exist; cap blur and gate Framer/GSAP.  
**Delivers:** Token-backed glass, shared motion constants, `useReducedMotion` on all entrances, tame/remove `CustomCursor`, Playwright + Lighthouse CWV checks.  
**Addresses:** Motion pass, reduced-motion, elevation discipline.  
**Avoids:** INP regression, vestibular issues.

### Phase 5: Admin Parity & Preview
**Rationale:** Admin trust depends on same tokens; LivePreview must match production dark/light.  
**Delivers:** `studio-input` on forms, managers on shared primitives, `DesignSystemManager` colorScheme UI, LivePreview theme sync, optional manual nav toggle (P2).  
**Addresses:** Admin visual parity, CMS preview accuracy.  
**Avoids:** Duplicate theme logic in admin; preview diverging from `applyAppearance`.

### Phase 6: Prerender & Infra Hardening
**Rationale:** PITFALLS 1 & 5 — can run parallel late but must complete before v1.2 exit.  
**Delivers:** Prerender inline `:root` from API fixture, `data-theme-ready` wait, CI token diff, deploy doc for rebuild-on-CMS-change.  
**Addresses:** Static HTML vs hydrated parity for brand/SEO stakeholders.

### Phase Ordering Rationale

- **Tokens → primitives → pages** matches FEATURES dependency: dark mode blocks component pass; unified components block admin parity.
- **Motion/glass after surfaces** prevents painting over hardcoded light utilities and catches INP issues on real DOM.
- **Prerender last** still early in planning flags — needs token contract from Phase 1 but implementation fits after theme API is stable.
- Grouping avoids “looks done” dark mode that fails with JS disabled or View Source mismatch.

### Research Flags

Phases likely needing `/gsd:plan-phase --research-phase`:
- **Phase 1:** `light-dark()` + LightningCSS production behavior; prerender inline token injection pattern
- **Phase 6:** Puppeteer `prefers-color-scheme` emulation + CI assertion design

Phases with standard patterns (skip research-phase):
- **Phase 2:** CVA + Radix — established in repo; follow existing `Button.tsx` / `AppDialog`
- **Phase 3:** Section utilities already documented in `index.css`
- **Phase 4:** `src/lib/motion.ts` and global `prefers-reduced-motion` exist

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Brownfield `package.json` + Tailwind v4 official dark-mode docs |
| Features | HIGH | MDN/web.dev a11y/motion; brownfield gap analysis (dark mode, split buttons) |
| Architecture | HIGH | Verified `ThemeSynchronizer`, `WebsiteDataProvider`, `index.css` |
| Pitfalls | HIGH | Codebase-specific FOUC/prerender/glass paths traced |

**Overall confidence:** HIGH

### Gaps to Address

- **Derived dark palette quality:** Auto neutrals from CMS accent may fail WCAG on edge colors — validate with contrast check in Design System save flow during Phase 1/5.
- **`light-dark()` production build:** Spike `vite build` preview for dark token rendering (LightningCSS optimize edge cases).
- **Manual toggle vs CMS `colorScheme` precedence:** Document UX when editor forces `dark` but user has `localStorage` override — decide in Phase 5 planning.
- **Prerender dual-theme static HTML:** Product default is light-canonical static snapshot; confirm with stakeholders before two-variant prerender.

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS — Dark mode](https://tailwindcss.com/docs/dark-mode) — `@custom-variant`, manual toggle, `localStorage`
- [Tailwind CSS — color-scheme](https://tailwindcss.com/docs/color-scheme)
- [next-themes npm](https://www.npmjs.com/package/next-themes) — v0.4.6, Vite SPA pattern
- [Apple Design Tips](https://developer.apple.com/design/tips/) — spacing, contrast, touch targets
- [MDN prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [web.dev prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion)
- Brownfield: `package.json`, `src/index.css`, `src/App.tsx`, `scripts/prerender.mjs`, `.planning/PROJECT.md`

### Secondary (MEDIUM confidence)
- [tw-animate-css npm](https://www.npmjs.com/package/tw-animate-css) — verify import path in milestone spike
- [web.dev backdrop-filter](https://web.dev/articles/backdrop-filter) — performance caution
- [design.dev dark mode CSS guide](https://design.dev/guides/dark-mode-css/) — FOUC patterns
- [Radix Primitives](https://www.radix-ui.com/primitives/docs)

### Detailed research files
- [STACK.md](./STACK.md) — versions, install commands, motion strategy
- [FEATURES.md](./FEATURES.md) — table stakes, MVP, anti-features, dependency graph
- [ARCHITECTURE.md](./ARCHITECTURE.md) — three-tier tokens, data flow, anti-patterns
- [PITFALLS.md](./PITFALLS.md) — phase mapping, recovery strategies, verification checklist

---
*Research completed: 2026-05-19*  
*Ready for roadmap: yes*
