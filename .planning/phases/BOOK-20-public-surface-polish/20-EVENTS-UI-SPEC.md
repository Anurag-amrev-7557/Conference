---
phase: 20
slug: BOOK-20-public-surface-polish
status: approved
shadcn_initialized: false
preset: none
created: 2026-05-19
scope: /events index only
---

# Phase 20 — UI Design Contract: Events (`/events`)

> Linked discovery layout: program list + calendar + map. White canvas, blog/Stripe quality bar.

**Requirements:** PAGE-03, TYPE-03, TYPE-04, IMG-02, IMG-03, UX-04, UX-06, PERF-01

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Font | Plus Jakarta Sans (UI); Instrument Serif optional for drawer title only |
| Icons | lucide-react |

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| md | 16px | Card padding, grid gap |
| lg | 24px | Header → controls |
| xl | 32px | List section gaps |
| 2xl | 48px | Section breaks |

Shell padding: same as blog (`px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-16`), `max-w-[1600px]`.

---

## Typography

| Role | Size | Weight | Font |
|------|------|--------|------|
| Body | 16px | 400 | Sans |
| Label | 11px | 600 | Sans (tabs, map label) |
| Page title | clamp(1.625rem, 3.5vw, 2.125rem) | 600 | Sans |
| Card title | 1.125rem (18px) | 600 | Sans |
| Drawer title | 1.5rem | 400 | Serif optional |

---

## Color

| Role | Value |
|------|-------|
| Dominant | `#ffffff` page |
| Cards | `#ffffff` + `rgba(0,0,0,0.08)` border |
| Accent | `#003E99` — selected tab, selected card ring, map marker, calendar selected day |
| Muted text | `var(--color-muted)` |

---

## Page Structure

```
.events-page (bg white, min-h-screen, scroll natural)
├─ Navbar
├─ main.events-page__main
│  ├─ header.events-page__header (left)
│  │  ├─ h1.events-page__title
│  │  ├─ p.events-page__lede
│  │  └─ .events-tabs (Upcoming | Past)
│  └─ .events-layout (grid lg:12)
│     ├─ .events-list (col 7) — scrollable list, no inner h-screen
│     │  └─ .events-card × N
│     └─ .events-rail (col 5, sticky)
│        ├─ .events-calendar-panel → EventsCalendar
│        └─ .events-map-panel → EventsMap
├─ EventDetailsDrawer
└─ Footer
```

---

## Selection Contract

| Action | selectedEventId | Drawer | Map | Calendar |
|--------|-----------------|--------|-----|----------|
| Card row click | set | closed | flyTo + highlight marker | highlight day |
| View details btn | set | open | same | same |
| Calendar day (has events) | set first event | closed | flyTo | selected day ring |
| Map marker click | set | closed | — | highlight day |
| Drawer close | keep selection | close | — | — |
| Tab change | clear selection | close | refit bounds | — |

---

## Component Classes (new in index.css)

| Block | Classes |
|-------|---------|
| Page | `.events-page`, `.events-page__main`, `.events-page__header`, `.events-page__title`, `.events-page__lede` |
| Tabs | `.events-tabs`, `.events-tab`, `.events-tab--active` |
| Layout | `.events-layout`, `.events-list`, `.events-rail` |
| Card | `.events-card`, `.events-card--selected`, `.events-card__media`, `.events-card__body` |
| Panels | `.events-panel` (calendar/map wrapper) |
| Empty | `.events-empty` |

---

## Copywriting

| Element | Copy |
|---------|------|
| Page title | Masterclasses & Networking |
| Lede | Live sessions, founder meetups, and venture workshops. |
| Tabs | Upcoming · Past |
| Empty | No events in this view |
| Calendar legend | Dot = event scheduled |
| Map label | Event locations |
| Details CTA | View details |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-05-19

## UI-SPEC COMPLETE
