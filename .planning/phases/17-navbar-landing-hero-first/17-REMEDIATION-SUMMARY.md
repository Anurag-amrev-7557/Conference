# Phase 17 Remediation Summary

**Date:** 2026-05-19  
**Trigger:** Visual review — layout/perf OK, Stripe premium bar not met

## Changes

### Navbar
- Removed desktop inline social icons (footer only)
- Wordmark visible only at `xl+`; monogram-only below
- Narrower pill (`max-w-5xl`)
- Nav CTA → ghost text link (`btn-nav-ghost`), not competing blue pill
- Mobile menu: solid white card; socials deferred to footer

### Hero
- Replaced blue sky `hero-aura-bg` with neutral `hero-premium-bg` (subtle radial tint)
- Reduced noise overlay opacity
- Eyebrow neutral (`text-text2`); headline accent no longer blue
- Sentence-case marketing buttons; shared `btn-cta-*` (blue primary only in hero)
- Smaller type scale; tighter content column (~48%)
- Video frame: `hero-media-frame`, optional book cover poster, lighter play control

### Tokens
- `btn-cta-primary` / `btn-cta-secondary` — 15px semibold, no uppercase shout
- `btn-nav-ghost` for header secondary action
- `glass-pill` — lighter shadow, less blur

## Verify

`npm run verify:phase17` && `npm run build:no-prerender`
