# Stack Research

**Domain:** Apple-minimal premium UI milestone (v1.2) on existing React/Vite/Tailwind book SPA  
**Researched:** 2026-05-19  
**Confidence:** HIGH (brownfield audit + official Tailwind v4 docs); MEDIUM for optional Radix scope

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Tailwind CSS** (existing) | `^4.2.2` | Design tokens, `dark:` utilities, `light-dark()` | v1.2 is a **token + variant** milestone, not a CSS framework change. v4’s CSS-first `@theme` and `@custom-variant` are the correct dark-mode surface. |
| **Framer Motion** (existing) | `^12.38.0` | Micro-interactions, layout, page/section motion | Already used across public + admin (~30 files). Standardizing on it avoids a second animation runtime and keeps bundle predictable with lazy GSAP only where scroll timelines matter. |
| **GSAP + @gsap/react** (existing) | `^3.14.2` / `^2.1.2` | Hero/scroll choreography (`BookShowcase`) | Keep **scoped** to scroll-heavy sections; do not expand GSAP site-wide. |
| **next-themes** (add) | `^0.4.6` | Light / dark / system toggle, `localStorage`, no FOUC | Official Tailwind dark-mode docs describe the same `class` + `localStorage` pattern; next-themes implements it with ~0 deps and works in Vite SPAs via `attribute="class"` on `<html>`. |
| **Radix Primitives** (extend) | see below | Accessible switches, menus, tabs, tooltips | You already ship Dialog + Slot + Visually Hidden. Add only primitives missing from the component craft pass—no full shadcn install. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **tw-animate-css** | `^1.4.0` (dev) | `animate-in` / `animate-out` for Radix overlays | Pair with `AppDialog` and future drawers; replaces legacy `tailwindcss-animate` plugin (not v4-native). |
| **@radix-ui/react-switch** | `^1.2.6` | Theme toggle, boolean CMS settings | Public nav theme control + admin Design System panel. |
| **@radix-ui/react-dropdown-menu** | `^2.1.16` | Nav overflow, admin actions | Replace bespoke animated menus where focus trap + keyboard nav matter. |
| **@radix-ui/react-tabs** | `^1.1.x` (match Dialog era) | Admin section chrome | Settings / Blog / Events managers already hand-roll tab UI—Radix reduces a11y risk. |
| **@radix-ui/react-tooltip** | `^1.2.x` | Dense admin hints | Icon-only controls in CMS without hover-only tooltips. |
| **@radix-ui/react-label** | `^2.1.x` | Form field association | Admin forms + public lead capture after component craft pass. |
| **@tailwindcss/forms** | `^0.5.x` | Normalize inputs/selects | Optional; use if native form controls still look “off” after token pass. |
| **class-variance-authority**, **clsx**, **tailwind-merge** (existing) | current | Component variants | Already power `Button.tsx`; extend pattern to Input, Card, Badge—no new styling stack. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Playwright** (existing) | Visual + interaction regression | Add dark-mode snapshots (`prefers-color-scheme`, `.dark` class) in premium milestone QA—not a new dependency. |
| **Inline theme boot script** | Prevent flash of wrong theme | Add small blocking script in `index.html` **before** module load (Tailwind docs pattern); `next-themes` documents equivalent `storageKey` behavior. |

## CSS-First Changes (No New npm)

These are **required** stack changes in `src/index.css`, not optional polish:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* Manual toggle + CMS override (extends default prefers-color-scheme) */
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* Semantic surfaces — auto flip with color-scheme on html */
  --color-bg: light-dark(#F2F2F0, #0A0A0A);
  --color-off: light-dark(#EBEBE8, #141414);
  --color-border: light-dark(#D1D1CE, #2A2A2A);
  --color-text: light-dark(#000000, #F5F5F5);
  --color-text2: light-dark(#2D2D2D, #A3A3A3);
  --color-muted: light-dark(#333333, #737373);
  --color-tag: light-dark(#E2E2DF, #1F1F1F);
  /* Keep CMS-driven accent as runtime override on :root */
}

@layer base {
  html {
    color-scheme: light dark; /* enables light-dark() + native form controls */
  }
  .dark {
    color-scheme: dark;
  }
}
```

**CMS integration (Express/Prisma — no new server packages):**

| Layer | Change |
|-------|--------|
| `SiteAppearance` (`websiteData.ts`) | Add `colorScheme: 'light' \| 'dark' \| 'system'` (default `'system'`). |
| `ThemeSynchronizer` (`App.tsx`) | After CMS hydration: apply `next-themes` `setTheme` from `appearance.colorScheme`; keep existing `--color-accent` / typography / radius runtime overrides. |
| `DesignSystemManager` | UI to edit `colorScheme` + optional dark palette overrides (or “use auto dark palette”). |
| Prisma `appearance` JSON | Backward-compatible merge in `WebsiteDataProvider` (same pattern as `typography` / `theme`). |

Accent color stays **CMS-driven** via `document.documentElement.style.setProperty`; neutrals move to **`light-dark()` + `.dark` overrides** so editors don’t maintain two full palettes unless they opt in.

## Installation

```bash
# Theme orchestration (runtime)
npm install next-themes@^0.4.6

# Radix — add only what you implement in the craft pass
npm install @radix-ui/react-switch@^1.2.6 \
  @radix-ui/react-dropdown-menu@^2.1.16 \
  @radix-ui/react-tabs@^1.1.13 \
  @radix-ui/react-tooltip@^1.2.8 \
  @radix-ui/react-label@^2.1.7

# Tailwind v4 animation utilities (build-time CSS import)
npm install -D tw-animate-css@^1.4.0

# Optional form normalization
npm install -D @tailwindcss/forms@^0.5.10
```

**`index.css` additions after install:**

```css
@import "tw-animate-css";
/* optional */ @plugin "@tailwindcss/forms";
```

**`main.tsx` wrapper:**

```tsx
import { ThemeProvider } from 'next-themes'

<ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="book-theme">
  <WebsiteDataProvider>
    <App />
  </WebsiteDataProvider>
</ThemeProvider>
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **next-themes** | ~40-line custom `ThemeProvider` + `index.html` inline script | If you want zero runtime deps; you must reimplement storage, system listener, and tab sync yourself. |
| **Framer Motion** (keep) | GSAP everywhere | Only for complex scroll-scrub timelines; worse fit for hover/focus/list layout animations. |
| **tw-animate-css** | Hand-written `@keyframes` in `index.css` | Fine for 2–3 animations; painful for Radix enter/exit matrix. |
| **`light-dark()` tokens** | Duplicate `dark:bg-*` on every utility | Works but explodes class noise and fights CMS token model. |
| **Selective Radix** | Full **shadcn/ui** CLI | Overkill— you already own `Button`, `Card`, `AppDialog`; copying shadcn creates duplicate primitives and migration churn. |
| **CSS blur-up** | **plaiceholder** / **vite-imagetools** LQIP | Only if hero LCP still fails after `loading`, `fetchpriority`, and fixed `aspect-ratio`; adds build pipeline complexity. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **tailwindcss-animate** (legacy plugin) | JS plugin model; v4 prefers CSS-first `@import` | **tw-animate-css** |
| **Material UI / Chakra / Mantine** | Competing design systems; breaks Tailwind token + CMS model | Existing Tailwind + CVA components |
| **styled-components / Emotion** | Second styling runtime; hurts CWV | Tailwind + CSS variables |
| **DaisyUI / Flowbite** | Opinionated classes conflict with Apple-minimal custom tokens | `@theme` + utilities |
| **Second motion library** (react-spring, anime.js, Lottie site-wide) | Bundle + `prefers-reduced-motion` inconsistency | Framer Motion + targeted GSAP |
| **Migrating to `motion` package rename** now | `framer-motion@12` already installed; rename is churn with no v1.2 payoff | Keep `framer-motion` until a dedicated dep-upgrade phase |
| **@mui/material DarkMode** | Wrong stack | next-themes + Tailwind `dark:` |
| **Server-side theme SSR package** | Vite SPA prerenders static HTML; client theme is correct layer | Inline boot script + next-themes |
| **Heavy image libs** (Cloudinary SDK, etc.) | Out of milestone scope | Native `loading="lazy"`, `decoding="async"`, CSS `blur` placeholder |
| **Adding Framer Motion** | Already in `package.json` | Standardize patterns, lazy-load heavy pages only |

## Stack Patterns by Variant

**If CMS sets `colorScheme: 'system'`:**
- Use `next-themes` `defaultTheme="system"` + `enableSystem`.
- Do not force `.dark` in CSS alone—respect `prefers-color-scheme` until user overrides.

**If CMS sets explicit `light` / `dark`:**
- Call `setTheme(appearance.colorScheme)` from `ThemeSynchronizer` when appearance loads.
- User nav toggle can still override via `localStorage` (document precedence in UI copy).

**If `prefers-reduced-motion: reduce`:**
- Keep existing global CSS neutering in `index.css`.
- In Framer Motion: `const reduce = useReducedMotion();` → `transition: reduce ? { duration: 0 } : spring`.
- Disable `CustomCursor` / magnetic effects when reduced motion is on.

**If admin preview must match public:**
- `LivePreview` iframe should inherit `class="dark"` from parent or sync theme via `postMessage` / shared `ThemeProvider`—no second theme stack.

## Motion Strategy (Consolidation, Not Expansion)

| Use case | Library | Notes |
|----------|---------|-------|
| Button hover, modal, list stagger, page sections | **Framer Motion** | `AnimatePresence`, `layout`, `whileHover`, `useInView` — already in codebase |
| Scroll-scrub, pinned sections | **GSAP + ScrollTrigger** | Dynamic `import()` in section files only |
| Focus rings, color transitions | **Tailwind** `transition-*`, `@utility transition-studio` | Prefer CSS for CWV |
| Dialog open/close | **tw-animate-css** + Radix | `data-[state=open]:animate-in` pattern |

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `tailwindcss@4.2.x` | `@tailwindcss/vite@4.2.x` | Already aligned in repo |
| `next-themes@0.4.6` | `react@19.x` | Framework-agnostic; not Next-only despite name |
| `framer-motion@12.x` | `react@19.x` | Already used in repo |
| `tw-animate-css@1.4.x` | Tailwind v4 | Import in CSS, not `tailwind.config.js` |
| `light-dark()` | `color-scheme` on `html` | Set `scheme-light-dark` or `color-scheme: light dark` on root; watch LightningCSS optimize issues in production—test dark tokens in `vite build` preview |
| Radix `2.x` menus | `@radix-ui/react-dialog@1.1.x` | Keep z-index scale documented in one `index.css` layer |

## Sources

- [Tailwind CSS — Dark mode](https://tailwindcss.com/docs/dark-mode) — `@custom-variant`, manual toggle, `localStorage` pattern (**HIGH**)
- [Tailwind CSS — color-scheme](https://tailwindcss.com/docs/color-scheme) — `scheme-*` utilities (**HIGH**)
- [Tailwind CSS v4.0 blog](https://tailwindcss.com/blog/tailwindcss-v4) — `light-dark()`, CSS-first config (**HIGH**)
- [next-themes npm](https://www.npmjs.com/package/next-themes) — v0.4.6, Vite-compatible `ThemeProvider` (**HIGH**)
- [tw-animate-css npm](https://www.npmjs.com/package/tw-animate-css) — v4-compatible animate utilities (**MEDIUM** — verify import path in milestone spike)
- [Radix Primitives docs](https://www.radix-ui.com/primitives/docs) — unstyled a11y primitives (**HIGH**)
- Brownfield: `package.json`, `src/index.css`, `src/App.tsx` `ThemeSynchronizer`, Framer/GSAP usage grep (**HIGH**)

---
*Stack research for: v1.2 Apple-grade premium UI (incremental on React/Vite/Tailwind CMS book site)*  
*Researched: 2026-05-19*
