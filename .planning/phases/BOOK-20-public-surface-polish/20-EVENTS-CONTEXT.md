# Phase 20: Events `/events` — Context

**Gathered:** 2026-05-19  
**Status:** Ready for UI-SPEC + implementation

<domain>
## Phase Boundary

Redesign `/events` into a **modern, premium, professional** discovery experience: upcoming/past program list, **calendar**, and **map** that stay **linked** to the same selected event. Align with Phase 17 navbar bar and blog index (white canvas, sans headline, restrained motion, light theme only).

**In scope:** `EventsPage.tsx`, `EventsCalendar.tsx`, `EventsMap.tsx`, `EventDetailsDrawer.tsx`, new `events-*` CSS in `index.css`, shared selection state.

**Out of scope:** Admin EventManager refactor, dark theme, Phase 19 primitive library, event detail standalone URL page.

</domain>

<decisions>
## Implementation Decisions

### Visual reference
- **E-01:** Match **blog index + Stripe** editorial product UI — white `#ffffff` page, left-aligned sans header, tab filters, bordered cards — not warm `bg-off`, not glassmorphism laboratory sidebar.
- **E-02:** **Remove** cursor-following aura, `h-screen overflow-hidden` page prison, and Framer on above-fold header (PERF-01).
- **E-03:** **Remove** unwired sidebar newsletter block; optional compact `WaitlistForm` below map only if wired — else omit.

### Layout
- **E-04:** Shell `max-w-[1600px]` centered, `pt-28 sm:pt-32`, horizontal padding matches blog (`px-5` → `2xl:px-16`).
- **E-05:** **Desktop (`lg+`):** 12-column grid — **list `lg:col-span-7`**, **discovery rail `lg:col-span-5`** (calendar + map stacked). Rail is **`position: sticky; top: 7rem`** within page scroll (not nested scroll panes).
- **E-06:** **Mobile:** single column — header → tabs → compact calendar → map → event list (calendar/map before list so geo context first on small screens).

### Linked selection (core UX)
- **E-07:** Single source of truth: `selectedEventId: string | null` in `EventsPage`, passed to list, calendar, map, drawer.
- **E-08:** **List click** → set `selectedEventId`, highlight card (`events-card--selected`), map flies to marker, calendar jumps to event month and highlights day.
- **E-09:** **Calendar day click** (day with events) → select first event that day in current tab; if multiple, select first; list scrolls selected card into view (`scrollIntoView`).
- **E-10:** **Map marker click** → same as list click.
- **E-11:** **View details** control (button/link on card) → open `EventDetailsDrawer`; row click alone selects without forcing drawer (Stripe-like preview-then-detail).
- **E-12:** Parse dates via `startDate` ISO when present; fallback to legacy `day` + month string for seed data.

### Presentation
- **E-13:** Replace timeline + oversized cards with **compact event rows**: date column + white card (thumb, title, host, location, tags, price).
- **E-14:** Tabs: **Upcoming | Past** — Stripe segment control (same pattern as blog filter pills / blog tabs).
- **E-15:** Calendar: minimal white card, accent dot on days with events, solid ring on selected day, no “Select an active node” jargon — use “Days with events” legend.
- **E-16:** Map: light chrome card (not black full-bleed), accent marker for selected event, `scrollWheelZoom: false` retained.

### Motion & a11y
- **E-17:** CSS transitions only above fold; list stagger optional below fold with `prefers-reduced-motion` off.
- **E-18:** Touch targets ≥44px on tabs, calendar nav, card actions; `focus-visible` rings; drawer keeps focus trap.

</decisions>

<canonical_refs>
- `.planning/phases/BOOK-20-public-surface-polish/20-UI-SPEC.md` (blog patterns)
- `src/pages/BlogPage.tsx`, `src/index.css` (`blog-*`)
- `src/pages/EventsPage.tsx`, `src/components/events/*`
- `src/lib/websiteData.ts` (`AppEvent`, `startDate`)
</canonical_refs>
