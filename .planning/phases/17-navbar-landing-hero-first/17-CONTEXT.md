# Phase 17: Navbar & Landing Hero (First) - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a Stripe-polished, Apple-restrained **global navbar** and **landing hero** on `/` that set the premium quality bar for the entire site. Scope is presentation, layout, responsiveness (320px–ultra-wide), accessibility, and LCP-safe behavior on existing light-theme tokens. **Not in this phase:** sitewide dark theme, shared primitive library refactor (Phase 19), or polish of blog/events/community routes.

</domain>

<decisions>
## Implementation Decisions

### Visual reference & brand tone
- **D-01:** Primary aesthetic benchmark is **stripe.com** — confident marketing polish, clear CTAs, refined nav — not apple.com minimal or linear.app product UI.
- **D-02:** Header density stays **similar to today** (floating pill) but with tighter, more premium proportions — not airier Apple-style nor heavier chrome.
- **D-03:** Hero headline uses **sans-only display** (Plus Jakarta Sans) for a colder, product-marketing feel; drop Instrument Serif in the hero headline (serif may remain elsewhere on the site until later phases).
- **D-04:** **Light theme only for v1.2** — user explicitly deprioritized dark mode; polish current light neutrals with accent used sparingly. Do not introduce `next-themes`, dark tokens, or theme toggle in Phase 17. (Roadmap Phases 18+ should be revised to defer/remove dark-theme work.)

### Header chrome & layout
- **D-05:** Keep **refined floating glass pill** (`glass-pill`, max-w-6xl centered) — improve blur, border, shadow, and spacing; do not switch to full-width edge bar.
- **D-06:** **No scroll-driven header morph** — pill size and padding stay static while scrolling (simplest, calm).
- **D-07:** **Brand lockup (Claude discretion):** Retain CMS circle monogram (`brandLogoText`) + wordmark (`brandName`) on `sm+`; refine sizing and alignment for premium feel. Defer uploaded logo image support unless trivial.
- **D-08:** Keep **social icons inline** in desktop nav (current pattern), styled consistently with refined pill.

### Mobile navigation
- **D-09:** Mobile menu stays **refined overlay sheet** below the pill (not fullscreen takeover or drawer).
- **D-10:** Mobile link typography switches to **Plus Jakarta sans** at modest UI scale (~18–20px), not large serif display links.
- **D-11:** Mobile menu bottom actions: **dual CTAs** — primary nav CTA (CMS) + remove separate "Support AI" entry (see D-18).
- **D-12:** Mobile menu **focus trap**, Escape to close, body scroll lock, visible focus rings — required.

### Hero layout & hierarchy
- **D-13:** Keep **refined split layout** — text/actions left, media right on `xl+`; stack on smaller breakpoints.
- **D-14:** Right column keeps **video/play blob** (`hero.videoUrl`); polish container, glow, and play affordance — no book-cover swap in this phase.
- **D-15:** Replace glass **action cards** with **Stripe-style primary + secondary buttons** below subtitle.
- **D-16:** Hero height (Claude discretion): **content-driven** — avoid forcing full viewport on small phones; use generous but not wasteful vertical rhythm; ~min-h-screen acceptable on `lg+` only.

### Hero motion & performance
- **D-17:** **Remove** cursor-following spotlight and mouse-tracking motion values in hero.
- **D-18:** **No hero entrance animation** — all hero text and primary UI visible at first paint; h1 must never start at opacity 0 (NAV/HERO LCP requirements).
- **D-19:** **Static CSS gradients only** for ambient background — remove animated floating orbs and framer loop animations in hero background.
- **D-20:** Navbar: **no Framer Motion** — CSS transitions only; honor `prefers-reduced-motion`.

### CTAs & CMS content
- **D-21:** Desktop header primary CTA becomes **CMS-driven** — add `settings.navigation.primaryCta: { label, href }` (or equivalent) with sensible defaults (`Join Now`, `/#final-cta`); remove hardcoded "Join Now" string in `Navbar.tsx`.
- **D-22:** Hero primary button (Claude discretion): **Book Demo** — opens existing `LeadCaptureModal` via `onBookDemo` (conversion-aligned with core value).
- **D-23:** Hero secondary button: **Join Founder Network** → `/community`.
- **D-24:** **Remove "Support AI"** from mobile nav menu (and any orphaned modal trigger wiring tied only to nav).

### Accessibility & responsiveness (from requirements — locked)
- **D-25:** Touch targets ≥44px on menu trigger and hero/nav CTAs.
- **D-26:** Keyboard navigable header with visible `focus-visible` rings; logical tab order including mobile menu.
- **D-27:** Sticky/fixed header must not permanently hide in-page anchors — use `scroll-padding-top` or equivalent offset.
- **D-28:** No horizontal scroll at 320px; test `sm` / `md` / `lg` / `xl` / `2xl`.

### Claude's Discretion
- Brand lockup sizing and whether monogram hides on the smallest breakpoint.
- Hero vertical rhythm breakpoints (exact min-heights per breakpoint).
- Exact Stripe-inspired button classes (may extend existing `btn-cta-*` utilities or interim styles until Phase 19 primitives).
- CMS schema field names for `primaryCta` and admin UI placement (Settings vs Navigation manager).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap & requirements
- `.planning/ROADMAP.md` — Phase 17 goal, success criteria, requirement IDs
- `.planning/REQUIREMENTS.md` — `NAV-01`–`NAV-06`, `HERO-01`–`HERO-06`
- `.planning/PROJECT.md` — v1.2 milestone scope and core value

### Primary implementation files
- `src/components/Navbar.tsx` — global header, mobile menu, hardcoded CTA to replace
- `src/components/sections/HeroSection.tsx` — hero layout, motion, action cards to replace
- `src/pages/LandingPage.tsx` — hero mount, modal wiring
- `src/lib/websiteData.ts` — `HeroContent`, `SiteSettings.navigation` types and defaults
- `src/index.css` — `glass-pill`, `hero-aura-bg`, `btn-cta-*`, design tokens from Phase 16
- `src/lib/motion.ts` — `usePrefersReducedMotion` hook

### Patterns & conventions
- `.planning/codebase/CONVENTIONS.md` — component naming, Tailwind + CVA patterns
- `.planning/codebase/STRUCTURE.md` — component folder layout

### External aesthetic reference (non-repo)
- **stripe.com** — marketing nav density, CTA confidence, gradient discipline (visual reference only)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Navbar.tsx` — CMS links/socials via `useWebsiteData()`, anchor scroll helper, `ContactSupportModal` (remove from nav per D-24), Framer `AnimatePresence` mobile sheet to simplify.
- `HeroSection.tsx` — CMS hero fields (`tagline`, `headline`, `headlineAccent`, `subtitle`, `videoUrl`); `onBookDemo` callback; video embed flow.
- `LeadCaptureModal` on `LandingPage` — wired to hero primary action.
- `src/components/ui/Button.tsx` — may inform button styling but full primitive unification is Phase 19.
- `usePrefersReducedMotion()` — keep for any remaining optional transitions.
- `index.css` utilities: `glass-pill`, `shadow-nav`, `hero-aura-bg`, `btn-cta-primary`, `btn-cta-secondary`.

### Established Patterns
- Tailwind utilities + `@utility` tokens from Phase 16; light-first color tokens (`text-text`, `bg-off`, `accent`).
- Framer Motion used heavily in nav/hero today — Phase 17 explicitly strips this for LCP/CWV.
- CMS data via `WebsiteDataProvider`; navigation lacks `primaryCta` field today — schema + seed + admin edit needed.
- Hardcoded hero action card copy — replace with button pair; keep marketing telemetry on CTA clicks where applicable.

### Integration Points
- `App.tsx` renders `Navbar` globally on public routes.
- Admin `LivePreview` passes `isInsidePreview` to `Navbar` — preserve preview behavior.
- Prerender/SEO: hero h1 and copy must be stable in static HTML (no opacity-zero LCP).

</code_context>

<specifics>
## Specific Ideas

- "Premium like Apple" in the milestone, but user chose **Stripe** as the concrete reference for nav/hero polish.
- User wants **sans hero headlines** — deliberate shift away from serif display in the hero only.
- User wants to **drop dark theme for now** — light polish only; revisit in a future milestone if needed.
- Start with navbar + hero before other pages — this phase is the visual quality bar.

</specifics>

<deferred>
## Deferred Ideas

- **Sitewide dark / system theme** — user explicitly deprioritized; original v1.2 Phase 18–23 dark-token work should be replanned or descoped.
- **Uploaded logo image in header** — optional future enhancement (D-07 discretion: monogram for now).
- **Book cover as hero media** — user chose video blob; cover hero deferred.
- **Support AI in navigation** — removed from mobile menu; may live in footer or support page later.
- **Shared Button primitive / CVA unification** — Phase 19 scope.
- **Blog, events, community, admin surface polish** — Phases 20–22.

</deferred>

---

*Phase: 17-Navbar & Landing Hero (First)*
*Context gathered: 2026-05-19*
