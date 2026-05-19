# Phase 20: Public Surface Polish — Blog `/blog` Focus

**Gathered:** 2026-05-19  
**Status:** Blog slice ready for UI-SPEC (landing patterns from Phase 17 are the quality bar)

<domain>
## Phase Boundary (blog slice)

Elevate `/blog` to match the **editorial premium** bar set on `/` (Phase 17 navbar, hero, playbook section, Final CTA, footer). Scope: blog index layout, featured hero treatment, filters/search, article grid, newsletter CTA, empty states, responsive 320px–ultra-wide, accessibility, LCP-safe behavior on **light theme only**.

**Not in this slice:** `/blog/:slug` prose refactor (separate plan item), events/community/404, dark theme (deferred), shared primitive library (Phase 19).

</domain>

<decisions>
## Implementation Decisions

### Visual reference & tone
- **B-01:** Match **landing editorial system** — reuse `editorial-*`, `playbook-*`, `section-eyebrow`, frosted cards, `max-w-[1600px]` horizontal rhythm — not a separate blog aesthetic.
- **B-02:** Keep **serif + sans pairing** for blog marketing headline (Instrument Serif display + Plus Jakarta UI) consistent with playbook section on landing; align with screenshots user provided (DISPATCH eyebrow, “Agentic AI” accent, featured dark card).
- **B-03:** **Light theme only** — same as Phase 17 D-04; no theme toggle on blog.

### Layout & hierarchy
- **B-04:** **Featured article** remains hero-scale but sits in a **rounded dark container** (or full-bleed within page shell) with gradient overlay, FEATURED badge, read time, author row — polish spacing and typography; avoid flat white card floating on gray if landing uses immersive dark featured treatment.
- **B-05:** **Filters + search** row: pill chips (ALL active = accent), white search field with icon — tighten to landing chip styles; **wire search** to filter title/excerpt (client-side) or document as non-functional with clear empty state if deferred.
- **B-06:** **Article grid** must be visible without excessive scroll — newsletter CTA moves **below grid** (not dominating viewport). Grid uses playbook-card patterns where possible (3-col desktop, 2 tablet, 1 mobile).
- **B-07:** **Newsletter block** — editorial dark card (“Stay Ahead”, serif headline, email + Subscribe) matching Final CTA quality; reuse waitlist patterns if applicable.

### Motion & performance
- **B-08:** **No opacity-zero LCP** on h1 or featured image — hero copy and featured media visible at first paint (PERF-01).
- **B-09:** Prefer **CSS transitions** over Framer on above-fold blog hero; below-fold grid may use light stagger only with `prefers-reduced-motion` respect.
- **B-10:** Images: explicit dimensions / aspect-ratio, `loading="eager"` + `fetchPriority="high"` only on featured; lazy below fold.

### Accessibility
- **B-11:** One `h1` on page; featured title is `h2`. Filter buttons are keyboard-focusable with `focus-visible`. Search input has associated label (visually hidden).
- **B-12:** Touch targets ≥44px on filter pills and subscribe CTA.

### Empty & edge states
- **B-13:** Zero articles: editorial empty state with link to home or community — not blank page below CTA.
- **B-14:** Filter yields no results: inline message + reset filter affordance.

</decisions>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md` — Phase 20, PAGE-02 success criteria
- `.planning/phases/17-navbar-landing-hero-first/17-CONTEXT.md` — Stripe/editorial tone, light-only, LCP rules
- `src/pages/BlogPage.tsx` — current implementation
- `src/components/sections/BlogSection.tsx` + `src/index.css` (`.playbook-*`, `.editorial-*`) — landing patterns to reuse
- Screenshots: `/Users/anuragverma/.cursor/projects/Users-anuragverma-Downloads-superhumanlyai/assets/Screenshot_2026-05-19_at_7.29.49_PM-*.png` (and 7.30.04, 7.30.14)
</canonical_refs>
