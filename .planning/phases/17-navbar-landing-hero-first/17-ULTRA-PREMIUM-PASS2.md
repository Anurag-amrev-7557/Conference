# Phase 17 — Ultra-premium pass 2

**Date:** 2026-05-19  
**Trigger:** User screenshot review — still template-like vs Stripe-neutral premium.

## Changes

### Navbar
- Hairline `nav-dock` (replaces heavy floating pill + desktop ghost CTA)
- Monogram-only logo (no wordmark crowding)
- Centered nav links on desktop (Stripe pattern)
- Desktop nav CTA removed; mobile menu keeps text-link CTA
- Refined link hover (subtle wash, 14px medium)

### Hero
- Larger display headline (`clamp` up to 4rem, tighter tracking)
- Primary CTA: black pill (`btn-cta-primary`)
- Secondary: text link + arrow (`btn-cta-secondary`), not twin pills
- Video area: `hero-media-surface` + light `hero-media-mesh` placeholder (no dark slate block)
- More vertical rhythm (pt/pb, gap scale)

### Global
- Landing `main` background → white (matches hero)
- `nav-dock` fallback for no backdrop-filter

## Verify
- `npm run verify:phase17` — pass
- `npm run build:no-prerender` — pass
