# Requirements: Book Website

**Defined:** 2026-05-19  
**Milestone:** v1.2 Apple-Grade Premium Experience  
**Core Value:** Visitors can discover the book, engage with content and community, and convert to leads — while editors operate a secure, reliable CMS backed by production infrastructure and marketing intelligence.

## v1.2 Requirements

### Design System & Theme

- [ ] **DSM-01**: Semantic color tokens exist for light and dark (bg, surface, text, border, accent) using Tailwind v4 `@theme` and `light-dark()` / `@variant dark`
- [ ] **DSM-02**: System dark mode works via `prefers-color-scheme` with `color-scheme` on `html` and no flash of light theme on first paint
- [ ] **DSM-03**: Blocking inline theme boot script in `index.html` applies stored preference before React hydrates
- [ ] **DSM-04**: `next-themes` (or equivalent) provides light/dark/system persistence without conflicting with CMS appearance
- [ ] **DSM-05**: CMS `appearance` supports `colorScheme` (light | dark | system) editable in Design System admin and applied via `applyAppearance()`
- [ ] **DSM-06**: Apple-minimal neutral palette (subtle grays, restrained shadows) replaces heavy decorative elevation on public surfaces
- [ ] **DSM-07**: Glass, CTA, and section `@utility` styles use semantic tokens (not hardcoded `bg-white` / light-only rgba)

### Typography & Layout

- [ ] **TYPE-01**: Single optical type scale (fluid `clamp` for display, fixed steps for UI) applied site-wide including admin
- [ ] **TYPE-02**: Two-font discipline enforced (Instrument Serif display + Plus Jakarta UI) with no third display face
- [ ] **TYPE-03**: Section rhythm utilities (`section-public`, `section-inner`, headings, eyebrows) applied consistently on all public routes
- [ ] **TYPE-04**: Prose/blog content uses comfortable measure (~65ch), logical heading hierarchy, and premium caption/meta styles
- [ ] **TYPE-05**: Admin forms, tables, and managers align to the same spacing and type scale as public surfaces

### Shared Components

- [ ] **COMP-01**: One token-driven `Button` primitive (CVA) replaces split `btn-cta-*` / slate shadcn variants for public and admin
- [ ] **COMP-02**: Inputs, selects, and textareas share `Input` styling with visible `focus-visible` rings and 44px min touch height on mobile
- [ ] **COMP-03**: Cards, lists, chips, and badges use semantic surfaces and a 3-level elevation ladder
- [ ] **COMP-04**: Modals (`AppDialog`) and overlays use theme-aware surfaces, `tw-animate-css` enter/exit, and reduced-motion instant close
- [ ] **COMP-05**: Navigation (desktop + mobile) meets premium bar: glass/blur tuned per theme, thumb-zone CTAs, no hover-only affordances
- [ ] **COMP-06**: Optional manual theme toggle in public nav/footer (light / dark / system) after system tokens are stable

### Public Pages

- [ ] **PAGE-01**: Landing page sections use unified tokens, typography, imagery, and restrained motion (hero LCP never opacity-zero)
- [ ] **PAGE-02**: Blog index and post pages match premium reading experience (cards, hero, prose, related/CTA blocks)
- [ ] **PAGE-03**: Events page (map, cards, detail) matches premium visual and dark-mode standards
- [ ] **PAGE-04**: Community page (feed, posts, modals, create flow) matches premium visual and dark-mode standards
- [ ] **PAGE-05**: 404 page is an on-brand minimal moment with clear escape CTA using shared primitives

### Admin CMS

- [ ] **ADM-01**: Admin layout, sidebar, and chrome use public semantic tokens (density utilities allowed, not a separate gray theme)
- [ ] **ADM-02**: Content managers (blog, events, pages, community) use shared `Input`/`Button`/card primitives
- [ ] **ADM-03**: Design System manager previews light and dark (and system) accurately via `previewData || data` + `applyAppearance()`
- [ ] **ADM-04**: LivePreview iframe reflects theme changes without duplicate theme logic

### Motion & Interaction

- [ ] **MOT-01**: New motion uses transform/opacity only; respects `prefers-reduced-motion` via existing hook + global CSS
- [ ] **MOT-02**: Scroll-triggered section reveals (if used) are once-only, below-fold, and disabled when reduced motion is preferred
- [ ] **MOT-03**: Backdrop-filter limited to nav and one above-the-fold layer; solid fallbacks on low-end / reduced-motion
- [ ] **MOT-04**: Custom cursor / magnetic effects removed or gated (not default on mobile or reduced-motion)

### Imagery & Media

- [ ] **IMG-01**: Above-fold heroes and key cards specify dimensions or aspect-ratio to prevent CLS in both themes
- [ ] **IMG-02**: LCP hero image is priority-loaded and not lazy-loaded; below-fold cards may use lazy loading
- [ ] **IMG-03**: CMS images use `object-fit: cover` with consistent aspect ratios on blog/event/community cards
- [ ] **IMG-04**: Dark mode does not clip or wash out book cover / OG imagery (tested on landing and blog)

### Performance & Quality

- [ ] **PERF-01**: Lighthouse performance and accessibility scores do not regress vs v1.1 Phase 16 baseline on landing and blog
- [ ] **PERF-02**: `web-vitals` RUM continues reporting LCP, INP, CLS in production after UI changes
- [ ] **PERF-03**: Playwright (or equivalent) snapshots cover light and dark for landing, blog, and admin preview

### Prerender & Static HTML

- [ ] **INFRA-01**: Prerender pipeline waits for theme-ready state or inlines critical `:root` tokens so View Source matches hydrated theme
- [ ] **INFRA-02**: CI or verify script fails when semantic token classes are missing from prerendered public HTML

## v2 Requirements

Deferred beyond v1.2.

### Theme & CMS

- **DSM-ADV-01**: Full CMS dark palette pickers (per-neutral overrides)
- **DSM-ADV-02**: Admin shell full dark mode (beyond LivePreview parity)

### Motion & Media

- **MOT-ADV-01**: Blur-up LQIP on below-fold card grids
- **MOT-ADV-02**: Cinematic hero video with accessible controls

### v1.0 / v1.1 Deferred

- Marketing integration (MKT-*), production infra, RBAC, chat, payments, mobile PWA — see MILESTONES.md and git history

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full UI framework migration (MUI, Chakra, shadcn CLI install) | Research: extend existing Tailwind + selective Radix only |
| Logo / brand color rebrand | User constraint: polish only; CMS accent remains editor-controlled |
| Heavy 3D / WebGL on inner routes | CWV and Apple-minimal restraint |
| Scrolljacking / full-page snap | Accessibility and reading flow |
| Glass on every card | Contrast and dark-mode failures |
| `/dashboard` CRM placeholder polish | User scoped public + admin CMS only |
| hreflang / i18n | No bilingual content |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DSM-01 | Phase 17 | Pending |
| DSM-02 | Phase 17 | Pending |
| DSM-03 | Phase 17 | Pending |
| DSM-04 | Phase 17 | Pending |
| DSM-05 | Phase 17 | Pending |
| DSM-06 | Phase 17 | Pending |
| DSM-07 | Phase 17 | Pending |
| TYPE-01 | Phase 18 | Pending |
| TYPE-02 | Phase 18 | Pending |
| TYPE-03 | Phase 19 | Pending |
| TYPE-04 | Phase 19 | Pending |
| TYPE-05 | Phase 21 | Pending |
| COMP-01 | Phase 18 | Pending |
| COMP-02 | Phase 18 | Pending |
| COMP-03 | Phase 18 | Pending |
| COMP-04 | Phase 18 | Pending |
| COMP-05 | Phase 18 | Pending |
| COMP-06 | Phase 21 | Pending |
| PAGE-01 | Phase 19 | Pending |
| PAGE-02 | Phase 19 | Pending |
| PAGE-03 | Phase 19 | Pending |
| PAGE-04 | Phase 19 | Pending |
| PAGE-05 | Phase 19 | Pending |
| ADM-01 | Phase 21 | Pending |
| ADM-02 | Phase 21 | Pending |
| ADM-03 | Phase 21 | Pending |
| ADM-04 | Phase 21 | Pending |
| MOT-01 | Phase 20 | Pending |
| MOT-02 | Phase 20 | Pending |
| MOT-03 | Phase 20 | Pending |
| MOT-04 | Phase 20 | Pending |
| IMG-01 | Phase 19 | Pending |
| IMG-02 | Phase 19 | Pending |
| IMG-03 | Phase 19 | Pending |
| IMG-04 | Phase 19 | Pending |
| PERF-01 | Phase 20 | Pending |
| PERF-02 | Phase 20 | Pending |
| PERF-03 | Phase 20 | Pending |
| INFRA-01 | Phase 22 | Pending |
| INFRA-02 | Phase 22 | Pending |

**Coverage:**
- v1.2 requirements: 38 total
- Mapped to phases: 38/38 ✓
- Unmapped: 0

---
*Requirements defined: 2026-05-19 — milestone v1.2*
