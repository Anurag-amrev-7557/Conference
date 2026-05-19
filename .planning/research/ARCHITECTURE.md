# Architecture Research

**Domain:** Premium marketing SPA + CMS-driven theming (React/Vite, Tailwind v4, Express/Prisma)  
**Milestone:** v1.2 Apple-Grade Premium Experience  
**Researched:** 2026-05-19  
**Confidence:** HIGH (brownfield `index.css`, `ThemeSynchronizer`, `SiteAppearance` verified); MEDIUM for derived dark palettes (pattern standard, not yet implemented)

## Executive Integration Answer

Dark mode, design tokens, and shared premium components **extend the existing token bridge** — they do not replace `WebsiteDataProvider` or the CMS. Today:

- **Static layer:** `@theme` in `src/index.css` registers Tailwind utilities (`bg-off`, `text-text`, `shadow-premium`, section utilities).
- **Runtime CMS layer:** `ThemeSynchronizer` in `App.tsx` sets `--color-accent`, `--font-*`, `--radius-global`, `--shadow-dynamic` on `document.documentElement` from `appearance`.
- **Gap:** No dark semantic palette, many components use hardcoded `bg-white` / slate CVA tokens, glass utilities bake in light-only rgba values.

**Recommended model:** A **three-tier token stack** where CMS only overrides *brand knobs* (accent, fonts, radius, shadow intensity, optional color mode preference), while Tailwind v4 owns *semantic surfaces* (bg, text, border, glass) with `@variant dark` overrides. Shared UI primitives consume semantic classes only; sections and admin preview both flow through the same `applyAppearance()` path.

---

## Standard Architecture

### System Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         index.css (@theme + @variant dark)                  │
│  Semantic tokens: --color-bg, --color-text, --color-surface, --shadow-*     │
│  Tailwind utilities: bg-bg, text-text, dark:bg-bg, section-public, …        │
└────────────────────────────────────────────────────────────────────────────┘
                                      ▲
                                      │ CSS variables (build + runtime)
┌─────────────────────────────────────┴──────────────────────────────────────┐
│                    document.documentElement (:root)                           │
│  CMS runtime: --color-accent, --color-accent2, --font-serif, --radius-global │
│  Optional: data-theme="light|dark|system" on <html>                          │
└────────────────────────────────────────────────────────────────────────────┘
         ▲                                    ▲
         │                                    │
┌────────┴─────────┐              ┌──────────┴───────────┐
│ ThemeSynchronizer │              │ WebsiteDataProvider   │
│ (applyAppearance) │◄─────────────│ data = preview || db  │
└────────┬─────────┘              └──────────┬───────────┘
         │                                    │
         │         ┌──────────────────────────┘
         │         │
┌────────┴─────────┴──────────────────────────────────────────────────────────┐
│  Public surfaces                          │  Admin surfaces                    │
│  ui/* (Button, Card, AppDialog)           │  DesignSystemManager (setPreview) │
│  sections/*, pages/*                      │  LivePreview → LandingPage        │
│  @utility btn-cta-*, glass-*              │  Admin shell: light-only OK       │
└────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation in this repo |
|-----------|----------------|------------------------------|
| **`@theme` block** | Register design tokens as Tailwind theme keys; single source for spacing, type scale, shadows | `src/index.css` — extend with semantic `surface`, `elevated`, `glass-*` tokens |
| **`applyAppearance()`** | Map `SiteAppearance` → CSS custom properties; derive accent2; optional dark palette | Extract from `ThemeSynchronizer` → `src/theme/applyAppearance.ts` |
| **`ThemeSynchronizer`** | React effect: call `applyAppearance` when `data.appearance` changes | `App.tsx` — keep thin; no SEO, no business logic |
| **`WebsiteDataProvider`** | CMS payload; `data: previewData \|\| data` for live preview | Existing — preview already drives theme |
| **`src/components/ui/*`** | Premium primitives: variants via CVA, semantic colors only | Migrate `Button.tsx` off slate/zinc; align `AppDialog`, `Card` |
| **`@utility` section/glass** | Composed layout + material treatments | `index.css` — refactor glass to use `color-mix` / semantic vars |
| **`DesignSystemManager`** | Edit appearance; `setPreview({ appearance })` | Existing — add color-mode control when schema extends |
| **Admin shell** | Editing UX; may stay light-themed | `admin/*` — use `admin-*` tokens or fixed light palette |

### Current vs Target

| Layer | Current | Target (v1.2) |
|-------|---------|-----------------|
| Color tokens | Light-only in `@theme`; body `background: #ffffff` hardcoded | Semantic light + `@variant dark` overrides on `:root` |
| CMS colors | `primaryColor` → `--color-accent` only | Same + derived `--color-accent-light` / dark-surface tints |
| Dark mode | None | System-first (`prefers-color-scheme`); optional `data-theme` for forced preview |
| Components | Mix of `bg-off`, `bg-white`, `bg-slate-950` | Semantic: `bg-bg`, `bg-surface`, `dark:bg-surface` |
| Glass utilities | Hardcoded `rgba(255,255,255,…)` | Token-backed: `--glass-bg`, `--glass-border` per color scheme |
| Theme sync | Inline in `App.tsx` | `src/theme/` module + unit-testable color math |

---

## Recommended Project Structure

```
src/
├── theme/
│   ├── applyAppearance.ts      # CMS → :root CSS vars (single entry)
│   ├── colorUtils.ts           # darkenColor, contrast, dark palette derivation
│   ├── tokens.ts               # TypeScript mirror of semantic token names
│   └── ThemeProvider.tsx       # ThemeSynchronizer + optional color-mode listener
├── components/
│   ├── ui/
│   │   ├── Button.tsx          # CVA → semantic + appearance.theme.buttonStyle
│   │   ├── Card.tsx
│   │   ├── AppDialog.tsx
│   │   ├── Input.tsx           # NEW — studio-input token wrapper
│   │   └── index.ts            # barrel export for pages/sections
│   └── WebsiteDataProvider.tsx # unchanged contract; preview || data
├── styles/
│   └── tokens.css              # optional: @theme split from index.css for clarity
└── index.css                   # @import tokens; @custom-variant dark; @utility *
```

### Structure Rationale

- **`src/theme/`:** Isolates CMS→CSS mapping so `DesignSystemManager`, tests, and prerender can import the same logic without mounting `App`.
- **`src/components/ui/`:** One import surface for premium craft; pages stop ad-hoc button classes.
- **Keep `@theme` in CSS:** Tailwind v4 CSS-first config is already established; TypeScript only documents names, does not duplicate color values.

---

## Architectural Patterns

### Pattern 1: Three-Tier Token Stack

**What:** Separate *framework*, *semantic*, and *brand* tokens so dark mode and CMS theming do not fight.

| Tier | Owner | Examples | CMS override? |
|------|-------|----------|---------------|
| **Framework** | `@theme` static | `--space-*`, `--text-*`, motion keyframes | No |
| **Semantic** | `@theme` + `@variant dark` on `:root` | `--color-bg`, `--color-surface`, `--color-text`, `--color-border` | No (fixed light/dark pairs) |
| **Brand** | `applyAppearance()` on `:root` | `--color-accent`, `--font-serif`, `--radius-global` | Yes |

**When to use:** Every new color in UI must map to semantic tier first; only accent/brand hues come from CMS.

**Trade-offs:** Editors cannot pick arbitrary dark bg colors without new CMS fields — acceptable for Apple-minimal consistency; derive dark neutrals algorithmically.

**Example (`index.css`):**

```css
@import "tailwindcss";

/* System-first dark; extend later for manual toggle */
@custom-variant dark (@media (prefers-color-scheme: dark));

@theme {
  --color-bg: #F2F2F0;
  --color-surface: #ffffff;
  --color-text: #000000;
  --color-border: #D1D1CE;
  /* accent registered; runtime override on :root */
  --color-accent: #003E99;
}

:root {
  color-scheme: light;
  @variant dark {
    color-scheme: dark;
    --color-bg: #0a0a0b;
    --color-surface: #141416;
    --color-text: #f5f5f7;
    --color-border: #2c2c2e;
    --color-tag: #1c1c1e;
    /* glass tokens */
    --glass-bg: color-mix(in srgb, var(--color-surface) 70%, transparent);
  }
}
```

CMS still sets `--color-accent` at runtime; `dark:` utilities and semantic vars compose automatically.

---

### Pattern 2: Unified `applyAppearance()` Bridge

**What:** One function maps `SiteAppearance` → `document.documentElement` style properties. Used by public app and admin live preview (via `previewData || data`).

**When to use:** On every `appearance` change, including `DesignSystemManager` preview — already wired through context merge.

**Trade-offs:** Runtime theming means tokens are not in initial HTML until JS runs — mitigated with inline critical vars for accent only if FOUC is observed.

**Example:**

```typescript
// src/theme/applyAppearance.ts
import type { SiteAppearance } from '../lib/websiteData'

export function applyAppearance(appearance: SiteAppearance, root: HTMLElement = document.documentElement) {
  root.style.setProperty('--color-accent', appearance.primaryColor)
  root.style.setProperty('--color-accent2', darkenHex(appearance.primaryColor))
  // typography, radius, shadow mappings (existing App.tsx logic)
  // optional: root.dataset.theme = appearance.colorMode ?? 'system'
}
```

```typescript
// ThemeProvider.tsx — replaces inline ThemeSynchronizer body
export function ThemeProvider({ appearance }: { appearance: SiteAppearance }) {
  useEffect(() => { applyAppearance(appearance) }, [appearance])
  return null
}
```

**Extend `SiteAppearance` (schema + Prisma):**

```typescript
theme: {
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full'
  buttonStyle: 'flat' | 'outline' | 'glass'
  shadowIntensity: 'none' | 'soft' | 'heavy'
  colorMode?: 'system' | 'light' | 'dark'  // optional v1.2; default 'system'
}
```

For **admin forced dark preview**, set `data-theme="dark"` on the LivePreview iframe wrapper only — do not change global OS preference.

---

### Pattern 3: Semantic Primitives + CMS `buttonStyle`

**What:** Shared components use CVA variants bound to semantic Tailwind classes and CMS `appearance.theme.buttonStyle` where relevant.

**When to use:** Nav CTAs, modals, forms, cards — anywhere `btn-cta-*` or duplicate button markup exists today.

**Trade-offs:** shadcn-style `Button` currently uses slate/zinc — must migrate or wrap with site variants (`btn-flat`, `btn-outline`, `btn-glass` already in CSS).

**Example:**

```typescript
const buttonVariants = cva(
  'btn-dynamic min-h-11 inline-flex items-center justify-center gap-2',
  {
    variants: {
      style: {
        flat: 'btn-flat',
        outline: 'btn-outline',
        glass: 'btn-glass',
      },
      size: { default: 'px-8 py-3', sm: 'px-4 py-2 text-xs', lg: 'px-10 py-4' },
    },
    defaultVariants: { style: 'glass', size: 'default' },
  }
)

// Page usage
const { data } = useWebsiteData()
<Button style={data.appearance.theme.buttonStyle} />
```

`AppDialog` should use `bg-surface` not `bg-white`; overlays stay `bg-black/40` with `dark:bg-black/60`.

---

### Pattern 4: Section Utilities Stay; Surfaces Go Semantic

**What:** Keep `@utility section-public`, `section-inner`, `btn-cta-primary` as composition layer; replace hardcoded `bg-white` in sections with `bg-surface` / `bg-bg`.

**When to use:** All `src/components/sections/*` and page shells (`App.tsx` `min-h-screen bg-off` → `bg-bg`).

**Trade-offs:** Hero gradients (`hero-aura-bg`, BookShowcase `#091b36`) may remain bespoke art direction — wrap in `dark:` adjustments or `color-mix` with `--color-accent`, not full semantic migration.

---

### Pattern 5: Admin vs Public Theme Scope

**What:** Public site respects system dark mode + CMS brand tokens. Admin CMS shell can remain **light-only** (`bg-white` fixed) to reduce scope; **LivePreview** must render public theme including dark.

**When to use:** v1.2 — polish admin chrome lightly with shared inputs (`studio-input`); full admin dark mode is deferrable.

**Implementation:** `LivePreview` root gets `className="preview-root"` and inherits same `ThemeProvider` + optional `data-theme` toggle in Design panel.

---

## Data Flow

### Theme Application Flow

```
GET /api/v1/content
    ↓
WebsiteDataProvider.fetchContent → data.appearance
    ↓
Admin setPreview({ appearance: form })  →  previewData.appearance (merged)
    ↓
useWebsiteData().data.appearance
    ↓
ThemeProvider → applyAppearance(appearance)
    ↓
:root CSS variables + (optional) html[data-theme]
    ↓
Tailwind utilities (bg-bg, text-accent, dark:bg-surface, …)
    ↓
ui/* + sections/* + pages/*
```

### Component Consumption Flow

```
SiteAppearance.theme.buttonStyle
    ↓
Button / section CTAs (CVA variant)
    ↓
btn-dynamic + btn-flat|outline|glass (index.css)
    ↓
Uses --color-accent, --radius-global from applyAppearance
```

### Key Data Flows

1. **CMS save:** `DesignSystemManager` → `updateAppearance(form)` → API persist → `fetchContent` refresh → `applyAppearance` on new data.
2. **Live preview:** `setPreview({ appearance: form })` → context `data` swaps → `ThemeProvider` re-runs without save.
3. **Dark mode:** OS `prefers-color-scheme` → Tailwind `dark:` + `:root @variant dark` semantic overrides; CMS accent vars unchanged but readable on dark surfaces.

---

## Tailwind v4 Integration Rules

| Concern | Recommendation | Source |
|---------|----------------|--------|
| Default dark | Use built-in `dark:` with `prefers-color-scheme` (no config file) | [Tailwind dark mode docs](https://tailwindcss.com/docs/dark-mode) |
| Manual toggle later | `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))` + JS on `<html>` | Official docs |
| CMS + dark | CMS sets **brand** vars on `:root`; semantic vars switch in `@variant dark` | Verified pattern (Stack Overflow + v4 `@variant` syntax) |
| Dynamic accent in `@theme` | Keep `--color-accent` in `@theme` as default; runtime `setProperty` overrides utility resolution | Current `App.tsx` pattern works |
| `@utility` glass | Define `--glass-bg` / `--glass-border` in `:root` and `@variant dark`; utilities reference `var()` | Avoid duplicated rgba in each utility |
| `color-scheme` | Set `color-scheme: light` / `dark` on `:root` per variant for native inputs/scrollbars | Apple-grade polish |

**Do not** duplicate token values in JS except for CMS-driven brand fields. **Do not** use `@theme` inline overrides per component — use utilities.

---

## Scaling Considerations

| Scale | Architecture note |
|-------|-------------------|
| 8 public pages | Token + primitive migration is bounded; phase by surface (ui → sections → pages) |
| CWV | Prefer CSS variables over JS theme recalc; respect `prefers-reduced-motion` (already in `index.css`) |
| Prerender (v1.1 SEO) | Prerendered HTML uses default light tokens; dark users get correct theme after hydration — acceptable if semantic HTML and contrast defaults are sane |
| Many CMS editors | `applyAppearance` is O(1) DOM writes; no perf concern |

### First bottleneck

Hardcoded light colors in 40+ components — **migration churn**, not runtime. Mitigate with grep-driven phases and semantic primitives first.

---

## Anti-Patterns

### Anti-Pattern 1: Per-Component Dark Colors

**What people do:** Add `dark:bg-gray-900` with different grays in every file.  
**Why it's wrong:** Drift from CMS accent; unmaintainable across 8 pages.  
**Do this instead:** Semantic tokens + `dark:bg-surface` only; accent from `--color-accent`.

### Anti-Pattern 2: CMS Stores Full Dark Palette

**What people do:** 12 color pickers for light/dark in admin.  
**Why it's wrong:** Explodes `SiteAppearance`, preview complexity, contrast failures.  
**Do this instead:** CMS controls brand accent + typography + radius; system derives dark neutrals.

### Anti-Pattern 3: Duplicate Theme Logic in Admin

**What people do:** Separate preview CSS in `DesignSystemManager`.  
**Why it's wrong:** Preview diverges from production.  
**Do this instead:** Only `setPreview({ appearance })` + shared `applyAppearance`.

### Anti-Pattern 4: Split Button Systems

**What people do:** Keep `btn-cta-primary`, `Button.tsx` (slate), and `btn-dynamic` in parallel.  
**Why it's wrong:** Inconsistent craft pass.  
**Do this instead:** One `Button` primitive; section utilities call it or share CVA.

### Anti-Pattern 5: Light-Only Glass Utilities

**What people do:** `glass-premium` with fixed white rgba (current `index.css`).  
**Why it's wrong:** Broken glass on dark backgrounds.  
**Do this instead:** Token-backed glass vars with `@variant dark` overrides.

---

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `index.css` ↔ `applyAppearance` | CSS variables | `@theme` registers names; runtime overrides brand subset |
| `WebsiteDataProvider` ↔ `ThemeProvider` | `data.appearance` | Preview path already merged |
| `ui/*` ↔ `sections/*` | Import primitives | Sections should not define one-off button styles |
| `DesignSystemManager` ↔ `LivePreview` | `setPreview` | Add dark-preview toggle on preview container only |
| Prisma `appearance` JSON | API ↔ client types | Extend schema with `colorMode` when needed |

### External / Build

| Service | Pattern | Notes |
|---------|---------|-------|
| Leaflet map | Keep dedicated dark tile filter in `index.css` | Already dark-themed; isolate from semantic tokens |
| Framer Motion | `useReducedMotion` hook in shared motion wrapper | Respect existing `@media (prefers-reduced-motion)` |
| Custom CSS (`settings.customCss`) | Injected after tokens | Document that authors should use `var(--color-accent)` |

---

## Suggested Implementation Phases (Roadmap Hints)

1. **Token foundation** — Semantic palette + `@variant dark` in `index.css`; fix `body` to `bg-bg`; extract `applyAppearance`.
2. **Primitives** — `Button`, `Input`, `Card`, `AppDialog` on semantic tokens; wire `buttonStyle`.
3. **Section sweep** — Replace `bg-white` / `#fafafa` in sections and public pages.
4. **Glass & motion** — Token-backed glass; shared motion constants.
5. **Admin parity** — `studio-input` everywhere; LivePreview dark toggle; optional admin shell polish.

---

## Sources

- [Tailwind CSS v4 — Dark mode](https://tailwindcss.com/docs/dark-mode) (HIGH — official)
- Brownfield: `src/index.css`, `src/App.tsx` (`ThemeSynchronizer`), `src/lib/websiteData.ts` (`SiteAppearance`)
- `src/components/WebsiteDataProvider.tsx` (preview merge: `previewData || data`)
- `src/components/admin/DesignSystemManager.tsx`, `LivePreview.tsx`
- `.planning/PROJECT.md` (v1.2 milestone goals)
- [Tailwind v4 `@variant` + `@theme` dark overrides](https://stackoverflow.com/questions/79386725/how-variant-dark-can-be-combined-with-theme-in-a-css-first-configuration-to-ove) (MEDIUM — community, aligns with official variant model)

---
*Architecture research for: Apple-grade premium UI — dark mode, design tokens, CMS theming, Tailwind v4*  
*Researched: 2026-05-19*
