# Plan 17-02 Summary

**Status:** Complete  
**Completed:** 2026-05-19

## What shipped

- Rebuilt `Navbar.tsx` without Framer Motion or Support AI modal
- CMS-driven primary CTA from `settings.navigation.primaryCta`
- Radix Dialog mobile sheet with focus trap, Escape dismiss, 44px targets
- Sans mobile link typography; inline desktop socials preserved
- Refined `glass-pill` utility; `scroll-padding-top: 5.5rem` on `html`

## Files changed

- `src/components/Navbar.tsx`
- `src/index.css`

## Verification

- No `framer-motion` or `ContactSupportModal` in Navbar
- `npm run build:no-prerender` passes
