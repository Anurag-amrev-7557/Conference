# Pitfalls Research

**Domain:** Apple-grade premium UI + system dark mode on a React/Vite CMS-driven SPA with build-time Puppeteer prerender and Core Web Vitals budgets  
**Researched:** 2026-05-19  
**Confidence:** HIGH (codebase-specific); MEDIUM (ecosystem patterns — verified against web.dev, MDN-adjacent sources, community performance reports)

## Critical Pitfalls

### Pitfall 1: CMS theme applied only after JavaScript (FOUC + prerender drift)

**What goes wrong:**
Public colors, fonts, radius, and shadows are injected in `ThemeSynchronizer` via `document.documentElement.style.setProperty` inside a `useEffect` that runs **after** `WebsiteDataProvider` finishes `GET /api/v1/content`. First paint uses static defaults from `index.css` (`@theme`, `body { background: #ffffff }`). Prerender (`scripts/prerender.mjs`) waits for SEO meta (`og:title`, canonical) but **not** for CMS appearance tokens. Static HTML in `dist/` can bake one accent while live users see another after hydration; screenshots and social previews may not match the editor’s Design System preview.

**Why it happens:**
CMS-driven SPAs naturally centralize theme logic in React. Teams treat “theme” as app state instead of render-blocking CSS. Prerender success criteria were defined for **head tags**, not computed styles.

**How to avoid:**
- Emit CMS tokens as **build-time or inline critical CSS** on `<html>` before first paint (inline `<style>` in `index.html` generated at prerender, or a small blocking theme chunk from API at build).
- Extend prerender `waitForFunction` (or add `data-theme-ready`) to assert `--color-accent` matches seeded/API values before `page.content()`.
- Keep `ThemeSynchronizer` as a **sync** layer only for admin live preview, not the sole source of truth.

**Warning signs:**
- Hard refresh flashes default blue accent then switches to CMS primary
- View Source on prerendered `/` shows default tokens; DevTools computed styles differ after load
- Admin Live Preview matches CMS but production static HTML does not

**Phase to address:**
**v1.2 — Design system & token architecture** (before broad page polish)

---

### Pitfall 2: Dark mode toggled in React instead of CSS-first `color-scheme`

**What goes wrong:**
Users see a bright flash (FOUDT) on navigation or first load: white `body`, light glass cards, then dark theme applied when JS reads `prefers-color-scheme` or `localStorage`. Sticky nav, modals, and `color-scheme` on form controls stay wrong until hydration. Toggling `class="dark"` on `<html>` without matching `meta color-scheme` causes mismatched scrollbars and native inputs.

**Why it happens:**
Dark mode is implemented as a React context + `useEffect`, copied from tutorial patterns. Apple-style system respect needs **zero-JS** first paint via CSS media queries.

**How to avoid:**
- Define **semantic tokens** in CSS: `--surface`, `--text-primary`, `--separator`, etc., with `@media (prefers-color-scheme: dark)` overrides in static CSS (or Tailwind `@custom-variant dark` tied to media query, not only class).
- Set `color-scheme: light dark` on `:root` and `color-scheme: dark` inside the dark media block ([MDN `color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme)).
- If offering manual override, run a **blocking inline script** in `index.html` (before CSS) that sets `data-theme` from `localStorage` — pattern documented for FOUC prevention ([Ant Design antd-style FOUC guide](https://ant-design.github.io/antd-style/best-practice/fix-switch-theme-fouc/)).
- Optional user toggle updates `data-theme` + `localStorage`; system default stays `prefers-color-scheme` with no storage.

**Warning signs:**
- Slow 3G shows white page then inversion
- Lighthouse “Avoid enormous network payloads” unrelated but CLS spikes on theme switch
- iOS Safari address bar color does not match page background

**Phase to address:**
**v1.2 — Dark mode & `prefers-color-scheme`** (early; blocks component craft)

---

### Pitfall 3: Only swapping CMS accent while neutrals stay hardcoded light

**What goes wrong:**
`ThemeSynchronizer` updates `--color-accent` and `--color-accent2` (via a naive `darkenColor` on hex) but dozens of utilities hardcode light surfaces: `body { background: #ffffff }`, `glass-pill` / `glass-premium` with `rgba(255,255,255,…)`, `btn-cta-secondary` with `bg-white`, `hero-aura-bg` with `#ffffff`, prose/selection colors tuned for black-on-white. Dark mode leaves **white cards on dark body**, illegible glass, or glowing blue accents on near-black without adjusted contrast. CMS primary on dark gray may fail WCAG AA for small text.

**Why it happens:**
v1.1 Phase 16 added premium **light-mode** glass and shadows. Dark mode is bolted on by adding `.dark:` variants to components one-by-one instead of remapping semantic tokens. CMS editors expect “change primary color” to work everywhere; only accent-linked Tailwind classes update.

**How to avoid:**
- Map CMS `appearance.primaryColor` to **paired tokens**: `--accent`, `--accent-on-dark`, `--accent-muted` generated with accessible contrast (relative luminance), not RGB channel subtraction.
- Refactor shared utilities (`glass-*`, `section-*`, `btn-cta-*`) to use `var(--surface-elevated)` etc., never raw `#fff` / `rgba(255…)`.
- Add admin preview for **both** color schemes with the same CMS primary.
- Document that custom CSS from `settings.customCss` is editor-beware for dark mode.

**Warning signs:**
- Dark mode “works” on landing but blog prose and map chrome stay light
- Events map (`leaflet-container { background: #0a0a0b }`) clashes with light cards above it
- Contrast checker fails on accent CTA text after CMS color change

**Phase to address:**
**v1.2 — Design system tokens** + **CMS appearance schema** (optional dark overrides per token)

---

### Pitfall 4: Stacking `backdrop-filter` / glass on scroll surfaces (INP & jank)

**What goes wrong:**
Premium UI adds `glass-pill`, `glass-premium`, `glass-workstation`, and navbar blur (`backdrop-filter: blur(24–32px)` in `index.css`). Each scroll frame recomposites blurred regions; sticky full-width nav is especially costly (~30% frame rate drop reported on similar sites, [VitePress #1049](https://github.com/vuejs/vitepress/issues/1049)). INP regresses on mobile when combined with `framer-motion` listeners (`CustomCursor` global `mousemove`, magnetic buttons). web.dev explicitly warns: *“backdrop-filter may harm performance. Test before deploying.”* ([web.dev backdrop-filter](https://web.dev/articles/backdrop-filter))

**Why it happens:**
Apple’s frosted glass is a visual shorthand; teams copy blur onto every sticky header, modal scrim, and card without budgeting compositor cost.

**How to avoid:**
- Cap live blur to **one** above-the-fold layer (e.g. nav only); use opaque/semi-opaque `var(--surface)` elsewhere.
- Gate blur behind `@supports (backdrop-filter: blur(1px))` and a `prefers-reduced-transparency` fallback (solid surface).
- Remove or lazy-mount `CustomCursor` / heavy motion on mobile (`md:` breakpoint already hides cursor — extend to drop listeners).
- Profile with Performance panel + field `web-vitals` (already wired in `reportWebVitals.ts`) before/after polish.

**Warning signs:**
- Scroll stutter on Retina Mac / mid Android with nav visible
- INP > 200ms on `/` and `/blog` after glass pass
- GPU layer count explodes in DevTools Layers panel

**Phase to address:**
**v1.2 — Component craft & motion** (audit before shipping dark mode)

---

### Pitfall 5: Prerender captures SEO head but not theme-accurate body HTML

**What goes wrong:**
`prerender.mjs` uses `waitUntil: 'networkidle0'` and waits for title/OG/canonical — correct for v1.1 SEO. Body HTML still reflects **default** light theme and `initialData` appearance until client JS runs. If dark-mode class or CMS vars are applied post-hydration, crawlers that execute limited JS may still index light content, but the bigger product issue is **inconsistent static HTML** vs hydrated UI (support tickets: “View Source looks wrong”). Re-prerender after CMS color change is easy to forget in deploy docs.

**Why it happens:**
Prerender pipeline was scoped to CRAWL-04/05 (meta in HTML), not visual parity. Puppeteer headless defaults to light `prefers-color-scheme` unless emulated.

**How to avoid:**
- Prerender with **`prefers-color-scheme: light`** explicitly (document as canonical static snapshot) **or** emit two static variants — only if product requires dark static HTML (usually unnecessary for SEO).
- Bake CMS tokens into prerendered HTML via inline `:root { … }` from API at prerender time (same source as Pitfall 1).
- CI check: diff prerendered inline style block against API fixture.
- Keep deploy checklist: API up + seed current when running `npm run build`.

**Warning signs:**
- View Source body classes differ from hydrated DOM
- GSC rich results fine but brand team says static export “doesn’t match”
- Changing primary color in admin doesn’t appear until rebuild — expected, but undocumented

**Phase to address:**
**v1.2 — Dark mode** + **infra/docs** (extend Phase 14 verify script)

---

### Pitfall 6: LCP and CLS regressions from premium motion (opacity-zero heroes)

**What goes wrong:**
Apple-like entrance animations hide the LCP element (`opacity: 0`, `translateY`, `framer-motion` `initial`) until animation completes. v1.1 added `motionInitial()` / `usePrefersReducedMotion` in `src/lib/motion.ts`, but not all sections use it. Hero images without explicit `width`/`height` plus font swaps cause CLS when typography scale changes for “optical” Apple rhythm.

**Why it happens:**
Design polish prioritizes motion over Phase 16 PERF requirements (LCP visible on first paint).

**How to avoid:**
- Never animate opacity on LCP candidate; use transform-only or skip enter animation when `reduceMotion`.
- Keep self-hosted fonts with `size-adjust` / reserved metrics (already on Fontsource — don’t add second webfont families without subsetting).
- Run Lighthouse mobile on `/`, `/blog/:slug` after each major section refactor.

**Warning signs:**
- LCP element timing includes animation delay in field data
- CLS > 0.1 on blog post hero after typography pass

**Phase to address:**
**v1.2 — Motion & micro-interactions** (verify against PERF-01/03)

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Add `.dark:` classes per component | Ship dark mode page-by-page | Inconsistent surfaces; CMS accent breaks | Never as final architecture — OK for spike only |
| Keep `ThemeSynchronizer` as only theme path | No build pipeline change | FOUC, prerender drift, flash | Never for v1.2 exit criteria |
| More `backdrop-filter` on cards | “Apple glass” look | INP/scroll jank on mobile | Hero/nav only, with solid fallback |
| Inline `settings.customCss` for brand tweaks | Editor freedom | Breaks dark tokens; XSS surface | Document sandbox + token-safe hooks |
| Skip prerender rebuild after CMS color change | Faster editor iteration | Stale static HTML | Local dev only |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| CMS `appearance` API | Only persist `primaryColor` | Persist semantic token map or derive dark-safe palette server-side |
| Puppeteer prerender | Only wait for Helmet meta | Also wait for theme-ready signal + API-loaded appearance |
| Tailwind v4 `@theme` | Static light tokens only | CSS variables referenced by `@theme` + dark media overrides |
| Radix modals (`AppDialog`) | Light scrim hardcoded | Token-based overlay `bg-[var(--overlay)]` |
| Admin Live Preview | Preview applies theme; static dist does not | Same token injection path for preview and prerender |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Multiple `backdrop-filter` layers | Scroll jank, fan noise | One blurred sticky; solid cards | First mobile scroll on landing |
| Global `mousemove` (custom cursor) | Main-thread work, INP | Disable below `md` or entirely in v1.2 | All desktop pages |
| Large blur radii (32px+) on full-width nav | GPU composite cost | Reduce radius or use semi-opaque fill | Retina displays |
| Re-fetch content on every admin save + full re-render | Jank in admin | Debounce theme CSS writes | Heavy Design System tab use |
| Unoptimized hero media + blur-up | LCP delay | Dimensions + `fetchpriority="high"` on LCP img | 4G cold load |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| `settings.customCss` in global head without sanitization | XSS → token theft from `localStorage` admin JWT | Server sanitize; scope custom CSS to non-admin pages or strip `url()`/`expression` |
| Dark-mode “preview” query param injecting raw CSS | Reflected styling attacks | No dynamic CSS from query strings |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Dark mode ignores system preference until toggle found | OS dark users blinded on first visit | Default to `prefers-color-scheme`; optional override |
| Gray text on gray glass (dark) | Unreadable body copy | Separate `--text-secondary` per scheme with contrast check |
| Motion on every list item | Vestibular discomfort | `usePrefersReducedMotion` on all `framer-motion` entrances |
| Invisible focus rings styled away for “minimal” look | Keyboard users lost | Apple-like ≠ remove focus; use subtle `ring` tokens |
| Admin CMS stays light while public is dark | Editors can’t validate contrast | Admin theme parity or dual preview |

## "Looks Done But Isn't" Checklist

- [ ] **Dark mode:** `prefers-color-scheme` works with JS disabled (CSS-only path) — verify in DevTools emulated CSS media
- [ ] **CMS primary:** Changing color in Design System updates nav, CTAs, links, and focus rings in **both** schemes without rebuild (runtime) and in prerender output **after** rebuild
- [ ] **CWV:** Field `web_vital` events still green on `/` after glass/motion pass — check marketing-backend or RUM dashboard
- [ ] **Prerender:** View Source includes correct meta **and** inline/CMS `:root` tokens matching API
- [ ] **Reduced motion:** Hero LCP visible immediately with `prefers-reduced-motion: reduce` enabled
- [ ] **Community/map:** Leaflet dark tiles + light cards don’t create a “patchwork” page in dark mode
- [ ] **404 / modals:** Lead capture and support modals readable in dark mode (Radix portal inherits tokens)

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| FOUC / flash theme | MEDIUM | Inline critical tokens; blocking theme script; remove late `useEffect`-only path |
| Hardcoded light utilities | HIGH | Token refactor `index.css` utilities → semantic vars; codemod `bg-white` → `bg-surface` |
| INP regression from blur | MEDIUM | Remove redundant blur layers; ship solid nav variant behind flag |
| Prerender visual drift | LOW | Extend `prerender.mjs` wait + document rebuild-on-CMS-change |
| CMS accent contrast failures | LOW | Add server-side contrast validation on save; warn in Design System UI |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase (v1.2) | Verification |
|---------|-------------------------|--------------|
| Client-only CMS theme | Design system & token architecture | Hard refresh + View Source vs hydrated computed styles |
| JS-only dark mode | Dark mode / `prefers-color-scheme` | Disable JS; toggle OS appearance |
| Accent-only CMS mapping | Design system + CMS compatibility | Change primary to yellow `#FFD700`; audit all surfaces |
| Glass/backdrop overload | Component craft + motion | Lighthouse INP + Performance scroll recording |
| Prerender theme drift | Prerender/infra hardening | `verify-phase14` + token assertion in prerender HTML |
| LCP motion regression | Motion & micro-interactions | Lighthouse LCP + `prefers-reduced-motion` manual test |

## Sources

- Codebase: `src/App.tsx` (`ThemeSynchronizer`), `src/index.css`, `scripts/prerender.mjs`, `src/components/WebsiteDataProvider.tsx`, `src/lib/motion.ts`, `src/lib/reportWebVitals.ts`
- [web.dev — backdrop-filter](https://web.dev/articles/backdrop-filter) — performance caution (HIGH)
- [webcloud — Flash of Unstyled Dark Theme](https://webcloud.se/blog/2020-04-06-flash-of-unstyled-dark-theme/) — CSS-first dark (MEDIUM)
- [Ant Design antd-style — Fix theme FOUC](https://ant-design.github.io/antd-style/best-practice/fix-switch-theme-fouc/) — blocking script pattern (MEDIUM)
- [VitePress #1049 — navbar backdrop-filter scroll perf](https://github.com/vuejs/vitepress/issues/1049) — empirical jank (MEDIUM)
- Prior milestone research: v1.1 SEO/prerender pitfalls (`.planning/research/` archive in git history) — meta-only prerender scope

---
*Pitfalls research for: v1.2 Apple-Grade Premium Experience (UI, dark mode, CMS theming, CWV, prerender)*  
*Researched: 2026-05-19*
