# Plan 17-03 Summary

**Status:** Complete  
**Completed:** 2026-05-19

## What shipped

- Hero stripped of cursor spotlight, animated orbs, and Framer Motion
- Sans bold headline (Plus Jakarta); visible at first paint
- Stripe-style button pair: Book Demo (modal) + Join Founder Network (`/community`)
- Video blob retained with aspect-ratio box for CLS stability
- Content-driven height on mobile; `lg:min-h-screen` on desktop

## Files changed

- `src/components/sections/HeroSection.tsx`

## Verification

- No framer-motion / useMotionValue in HeroSection
- `btn-cta-primary` and `btn-cta-secondary` present
