# Feature Research

**Domain:** Apple-minimal premium marketing site (author/book monograph) — UI/UX milestone v1.2
**Researched:** 2026-05-19
**Confidence:** HIGH (accessibility/motion/dark-mode patterns — MDN, web.dev, Apple Design Tips); MEDIUM (Apple.com motion heuristics — observational, not official spec); MEDIUM (author-site competitive patterns — industry blogs)

## Brownfield Baseline (v1.1 Phase 16 — Do Not Re-Litigate)

| Capability | Current state | v1.2 implication |
|------------|---------------|------------------|
| Design tokens | `--space-*`, `--text-*`, `--radius-*`, accent palette in `@theme` | **Extend** with semantic light/dark tokens; tighten neutral “Apple” palette |
| Typography fonts | Self-hosted Instrument Serif + Plus Jakarta Sans via CSS vars | **Polish** optical scale + tracking; avoid adding a third face |
| Section rhythm | `section-public`, `section-inner`, `section-heading`, CTA utilities | **Apply consistently** on all public pages + admin |
| Modals | Radix `AppDialog`, lead/community modals | **Unify** styling with public component craft pass |
| Reduced motion | Global CSS `@media (prefers-reduced-motion)` + `usePrefersReducedMotion` | **Table stakes met** — extend to any new motion, don’t regress |
| Motion (partial) | Framer on blog/admin; GSAP/Three on landing hero | **Cap** — differentiate via restraint, not more libraries |
| Dark mode | **Not implemented** (light-only `body` background) | **Primary v1.2 gap** |
| Component unity | Split: `btn-cta-*` / `btn-dynamic` vs shadcn `Button.tsx` (slate/indigo) | **Table stakes gap** — one token-driven system |
| Imagery | Rounded prose images, hero assets from CMS | **Gap:** dimensions, blur-up, dark-safe assets |

This document covers **v1.2 UI gaps and competitive bar** — not v1.1 SEO (see git history for prior SEO-focused FEATURES.md).

---

## Feature Landscape

### Table Stakes (Users Expect These)

Missing these makes a “premium” site feel template-grade or broken on modern devices — even if SEO and content are strong.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Two-role typography system** (display serif + UI sans) | Apple and top SaaS marketing sites use at most two families with clear roles; mixing three+ reads chaotic ([Apple HIG typography guidance](https://developer.apple.com/design/human-interface-guidelines)). | LOW (fonts exist) | Keep CMS-driven `--font-serif-dynamic` / `--font-sans-dynamic`; enforce roles in components, not per-section one-offs. |
| **Optical type scale + fluid headings** | Premium sites scale headlines smoothly (`clamp`) with tighter tracking on large type and looser on small caps ([modular scale practice](https://relogic.dev/blog/typography-in-web)). | MEDIUM | Extend beyond `section-heading`; map H1–H6 + body/caption to a single ratio (recommend **1.25 Major Third** for UI, **1.333 Perfect Fourth** for marketing heroes). |
| **Generous whitespace + max content width** | “Apple-minimal” is mostly rhythm: predictable section padding, ~65ch prose, clear vertical hierarchy ([Apple Design Tips — spacing & alignment](https://developer.apple.com/design/tips/)). | MEDIUM | `section-public` exists — audit landing/blog/events/community/404/admin for drift; align admin tables/forms to same spacing scale. |
| **System-aware dark mode** | OS dark mode is default for many users; premium sites respect `prefers-color-scheme` with readable contrast ([MDN `prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)). | HIGH | Add `<meta name="color-scheme" content="light dark">`, semantic CSS variables, dark variants of glass/shadows; **must not break** CMS `appearance` preview (`DesignSystemManager` + `ThemeSynchronizer`). |
| **No theme flash (FOUC)** | Toggle or system switch without white flash is expected on marketing sites ([dark mode CSS patterns](https://design.dev/guides/dark-mode-css/)). | MEDIUM | Inline head script: read `localStorage` + `prefers-color-scheme` before paint; default `theme: system`. |
| **WCAG contrast in both themes** | Low-contrast gray-on-gray fails “premium” on OLED and accessibility audits ([web.dev motion/a11y](https://web.dev/learn/accessibility/motion/)). | MEDIUM | Use stepped neutrals (#F5F5F7 light bg, ~#1C1C1E dark — not #000/#FFF); verify accent on dark. |
| **`prefers-reduced-motion` honored everywhere** | Vestibular/disorder users expect reduced parallax/zoom ([web.dev prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion)). | MEDIUM (partially done) | Gate Framer `initial`/`animate`, GSAP hero, scroll-linked effects; keep instant state change, not 0.01ms hacks only. |
| **GPU-safe micro-motion** | Hover/focus/enter should use `transform` + `opacity` only; avoid animating `width`, `margin`, `box-shadow` blur radius. | MEDIUM | Standardize on one easing (e.g. `cubic-bezier(0.16, 1, 0.3, 1)` already in `transition-studio`). |
| **Visible focus states** | Keyboard users are non-negotiable for forms/modals ([Apple 44pt targets](https://developer.apple.com/design/tips/)). | LOW | `focus-visible` rings on all interactives; 44×44px min touch targets on mobile CTAs. |
| **Unified component primitives** | Buttons, inputs, cards, modals, lists should look like one system — mixed shadcn slate + custom `btn-cta-*` reads unfinished. | HIGH | Single CVA/token layer for public + admin; deprecate orphan variants. |
| **Consistent elevation** | Apple marketing uses **subtle** separation (hairline borders, soft shadows), not heavy drop shadows. | MEDIUM | Replace stacked `shadow-premium` + `glass-*` combos with one elevation ladder (0–3). |
| **Responsive imagery without CLS** | Premium = no layout jump; Google CWV still applies ([web.dev CWV](https://web.dev/articles/vitals)). | MEDIUM | `width`/`height` or `aspect-ratio` on heroes, cards, blog thumbnails; `sizes` for srcset if CDN allows. |
| **Meaningful `alt` + aspect-stable cards** | Broken or stretched book covers undermine author credibility ([Apple — distortion & resolution](https://developer.apple.com/design/tips/)). | LOW | CMS fields or fallbacks; object-fit `cover` with fixed ratios for blog/event/community cards. |
| **Hero/LCP discipline** | Marketing table stakes: fast first paint; blur placeholders must not lazy-load LCP ([LQIP/LCP guidance](https://csswizardry.com/2023/09/the-ultimate-lqip-lcp-technique/)). | MEDIUM | Priority-load hero; blur-up only below fold or as non-LCP enhancement. |
| **Mobile nav + thumb-zone CTAs** | Majority of author traffic is mobile ([author site guides](https://blog.chapter.pub/author-website-design/)). | MEDIUM | Sticky nav, full-width primary CTA, no hover-only affordances. |
| **Admin visual parity** | Editors judge quality by CMS; mismatched admin erodes trust in “premium” brand. | HIGH | Reuse public tokens in `AdminLayout`, managers, forms — not a separate gray admin theme unless intentional. |

### Differentiators (Competitive Advantage)

Not required to function, but signal “Apple-grade” vs typical author templates (Wix/AuthorPages tier).

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Optional manual theme control (light / dark / system)** | Power users and brand demos expect override beyond OS — with persistence. | MEDIUM | Complements table-stakes `prefers-color-scheme`; icon in nav/footer, `localStorage`, no full-page color flash. |
| **CMS-driven theme tokens in both modes** | Editors tune accent/fonts once; site adapts light/dark — rare on author sites. | HIGH | Extend `appearance` schema with dark overrides or auto-generated tints; live preview in `DesignSystemManager`. |
| **Editorial reading mode (blog)** | Long-form monograph content: progress, comfortable measure, restrained motion — aligns with book brand. | MEDIUM | Partial (`prose` overrides exist); add ToC, read time, sticky progress — **without** Medium-style clutter. |
| **Scroll-triggered section reveals (restrained)** | Apple product pages use staggered fade/slide on scroll — premium when subtle and once-only. | MEDIUM | Intersection Observer + Framer; disable on `prefers-reduced-motion`; never on LCP hero text. |
| **Refined glass/nav blur** | Floating nav with backdrop blur reads “native” when contrast and border are tuned per theme. | MEDIUM | `glass-pill` exists — add dark variant, reduce saturation on scroll. |
| **Imagery art direction pipeline** | Consistent duotone/muted treatment on CMS uploads makes UGC (events/community) feel designed. | MEDIUM | CSS filters or upload presets in admin; optional, not blocking launch. |
| **Blur-up below-fold only** | Perceived performance polish without hurting LCP. | MEDIUM | Tiny base64/SVG LQIP for cards; skip on hero ([Mux LQIP caveats](https://mux.com/blog/blurry-image-placeholders-on-the-web)). |
| **Purposeful empty & skeleton states** | Premium apps never show raw “Loading…” text in layout-shifting blocks. | LOW | Skeleton cards for blog/community feeds; align with design tokens. |
| **Haptic-feel button press (scale)** | Subtle `active:scale-[0.98]` on primary CTAs — already on shadcn Button; extend consistently. | LOW | Apply to `btn-cta-primary` family only — avoid carnival on every chip. |
| **404 as brand moment** | Minimal, on-brand dead-end with one clear escape — shows craft on edge cases. | LOW | `NotFoundPage` polish pass with same type scale as landing. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Custom cursor / magnetic everything** | “Premium interactiveness” (`CustomCursor`, `MagneticButton` exist) | Hurts accessibility, mobile, and Apple-like restraint; distracts from content. | Strong hover/focus on real controls only; remove or gate behind `prefers-reduced-motion: no-preference` demo flag. |
| **Heavy 3D / WebGL hero on all routes** | Visual wow | Kills LCP/INP; not Apple-like on inner pages ([web.dev CWV](https://web.dev/articles/vitals)). | Landing-only, static poster + reduced motion fallback. |
| **Scrolljacking / full-page snap** | Mimics Apple keynotes | Breaks reading flow, SEO UX, accessibility. | Native scroll + in-section reveals. |
| **Parallax on mobile** | Depth | Jank + vestibular issues; Apple web uses parallax sparingly and often disables on small screens. | Desktop-only or replace with static layered art. |
| **Glassmorphism on every card** | Trendy premium look | Reduces contrast, clashes with dark mode, looks dated when overused. | Level 1 elevation on content cards; reserve glass for nav/modals only. |
| **Theme toggle with long cross-fade** | Smooth transition | Layout thrash, flashing text; violates reduced-motion spirit. | Instant token swap or ≤150ms opacity on `color` only. |
| **Third display font or neon gradients** | Stand out | Breaks minimal brand; fights CMS accent discipline. | Two fonts + neutral base + one accent. |
| **Auto-playing hero video with sound** | Engagement | Accessibility and mobile data backlash. | Muted, poster-first, pause control, respect `prefers-reduced-motion`. |
| **Animation on `box-shadow` / `blur`** | Soft feel | Main-thread expensive; stutters on low-end devices. | Pre-baked shadow tokens per theme. |
| **Separate “admin design system”** | Faster admin ship | Visible quality cliff; editors don’t trust preview. | Shared tokens + admin-specific density utilities only. |

---

## Feature Dependencies

```
[Semantic color tokens (light + dark)]
    └──requires──> [CMS appearance contract extended OR auto-derived dark palette]
    └──requires──> [Theme FOUC prevention script in index.html]

[Unified components (Button, Input, Card, Modal)]
    └──requires──> [Semantic color tokens]
    └──enhances──> [Admin visual parity]

[System dark mode via prefers-color-scheme]
    └──requires──> [Semantic color tokens]
    └──enhances──> [Glass/elevation dark variants]

[Manual theme toggle]
    └──requires──> [System dark mode tokens]
    └──conflicts──> [Heavy transition animations on theme change]

[Scroll section reveals]
    └──requires──> [usePrefersReducedMotion / CSS reduce gate]
    └──conflicts──> [GSAP hero timeline on same viewport — coordinate]

[Blur-up placeholders]
    └──enhances──> [Card/blog imagery]
    └──conflicts──> [Hero LCP if misapplied to above-fold hero]

[Optical type scale]
    └──enhances──> [Section utilities + prose]
    └──requires──> [No per-page arbitrary text-* classes]
```

### Dependency Notes

- **Dark mode blocks component pass:** Shipping new button styles in light-only hex values creates rework; define semantic tokens (`--surface`, `--text-primary`, `--border-subtle`) first.
- **CMS theming is on critical path:** `ThemeSynchronizer` injects accent/fonts today — dark mode must compose with preview, not fork a second hack.
- **Motion budget is shared with CWV:** v1.1 PERF requirements still apply; v1.2 motion is polish, not new heavy deps.
- **Imagery depends on CMS/asset pipeline:** OG upload exists; card thumbnails need stable dimensions for layout polish.

---

## MVP Definition

### Launch With (v1.2 — this milestone)

Minimum to credibly claim “Apple-minimal premium” across public + admin:

- [ ] **Semantic design tokens** — light + dark neutrals, accent-safe contrast, elevation ladder; CMS-compatible
- [ ] **System dark mode** — `prefers-color-scheme` + `color-scheme` meta + no FOUC
- [ ] **Optical type scale applied site-wide** — fluid headings, body 16px+, consistent section headings
- [ ] **Unified components** — buttons, inputs, cards, modals, lists on token system (public + admin)
- [ ] **Full public surface polish** — landing, blog (+ post), events, community, 404
- [ ] **Imagery baseline** — aspect ratios, dimensions, hero LCP-safe loading, alts
- [ ] **Motion pass** — hover/focus/enter only; reduced-motion gated; remove or tame gimmick cursor/parallax
- [ ] **Admin parity** — managers/forms match public quality bar

### Add After Validation (v1.2.x)

- [ ] **Manual theme toggle (light/dark/system)** — after system tokens stable
- [ ] **Scroll-triggered section reveals** — landing + key sections only
- [ ] **Blur-up on card grids** — blog/events/community, not hero
- [ ] **CMS dark palette overrides** — if auto-derived contrast insufficient
- [ ] **Imagery art-direction presets** — upload filters in admin

### Future Consideration (v3+)

- [ ] **Cinematic video hero** — only with performance budget proof
- [ ] **Per-section motion themes in CMS** — editor complexity vs value
- [ ] **PWA theming / install splash** — ties to deferred mobile milestone

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Semantic tokens + dark mode (system) | HIGH | HIGH | P1 |
| Optical type scale site-wide | HIGH | MEDIUM | P1 |
| Unified components (public + admin) | HIGH | HIGH | P1 |
| Public page polish (all routes) | HIGH | HIGH | P1 |
| Imagery CLS + aspect ratios | HIGH | MEDIUM | P1 |
| Motion/focus pass + reduced-motion | HIGH | MEDIUM | P1 |
| Admin visual parity | HIGH | HIGH | P1 |
| Manual theme toggle | MEDIUM | MEDIUM | P2 |
| Scroll reveals | MEDIUM | MEDIUM | P2 |
| Blur-up below fold | MEDIUM | MEDIUM | P2 |
| Remove custom cursor / tame 3D | MEDIUM | LOW | P2 |
| CMS dark overrides | MEDIUM | HIGH | P2 |
| Imagery art-direction presets | LOW | MEDIUM | P3 |

**Priority key:** P1 = v1.2 launch; P2 = soon after tokens stable; P3 = polish

---

## Competitor Feature Analysis

Observational patterns from Apple.com product pages, Stripe/Linear marketing (minimal SaaS bar), and premium author sites ([Chapter author design](https://blog.chapter.pub/author-website-design/), [AuthorPages](https://authorpages.net/)):

| Feature | Apple.com / top SaaS | Typical author template | Our approach (v1.2) |
|---------|---------------------|-------------------------|---------------------|
| Typography | 1–2 families, large hero, tight tracking | Many fonts, small body | Keep serif+sans; enforce scale + clamp |
| Whitespace | Very wide margins, few elements per viewport | Cluttered widgets | `section-*` utilities on every page |
| Dark mode | System-native product pages; marketing often light-first | Rare or broken invert | System-first + CMS-safe tokens |
| Motion | Subtle scroll fades; respects accessibility | Parallax/snow/confetti | Gate Framer/GSAP; no scrolljacking |
| Components | Consistent pills, minimal borders | Mixed Bootstrap widgets | Token-unify shadcn + custom CTAs |
| Imagery | Full-bleed product on neutral bg | Low-res covers stretched | aspect-ratio + LCP discipline |
| Admin | N/A (marketing only) | Theme picker only | Live preview + same tokens as public |

---

## Sources

- [Apple Design Tips](https://developer.apple.com/design/tips/) — contrast, spacing, touch targets, image fidelity (HIGH)
- [MDN — prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) (HIGH)
- [web.dev — prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion) (HIGH)
- [web.dev — Animation and motion (a11y)](https://web.dev/learn/accessibility/motion/) (HIGH)
- [design.dev — Dark mode CSS guide](https://design.dev/guides/dark-mode-css/) (MEDIUM)
- [CSS Wizardry — LQIP vs LCP](https://csswizardry.com/2023/09/the-ultimate-lqip-lcp-technique/) (MEDIUM)
- [Mux — Blurry image placeholders](https://mux.com/blog/blurry-image-placeholders-on-the-web) (MEDIUM)
- [Chapter — Author website design 2026](https://blog.chapter.pub/author-website-design/) (MEDIUM)
- Codebase: `src/index.css`, `src/lib/motion.ts`, `src/components/ui/Button.tsx`, `src/components/admin/DesignSystemManager.tsx`, `src/App.tsx` (`ThemeSynchronizer`) (HIGH)

---
*Feature research for: v1.2 Apple-Grade Premium Experience*
*Researched: 2026-05-19*
