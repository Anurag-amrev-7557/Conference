# Phase 17 Research: Navbar & Landing Hero

**Researched:** 2026-05-19  
**Context:** `17-CONTEXT.md` (Stripe reference, light-only, LCP-first)

## Summary

Refactor `Navbar.tsx` and `HeroSection.tsx` toward Stripe-like marketing polish while stripping Framer Motion and mouse-tracking from the critical path. Add `settings.navigation.primaryCta` to CMS types and Settings admin. Use CSS-only transitions, focus-trapped mobile menu (Radix Dialog or `@radix-ui/react-dialog` already in project from Phase 16), and `scroll-padding-top` on `html` for anchor offset.

## Technical recommendations

### Navbar
- Remove `framer-motion` from navbar; use `transition-colors` / `opacity` in CSS.
- Refine `glass-pill` in `index.css`: tighter padding, clearer border, backdrop-blur with solid fallback `@supports not (backdrop-filter)`.
- Mobile menu: prefer **Radix Dialog** (already used elsewhere) for focus trap + Escape + scroll lock vs hand-rolled overlay.
- CMS `primaryCta: { label: string; href: string }` with defaults `{ label: 'Join Now', href: '/#final-cta' }`.
- Remove `ContactSupportModal` import/state from Navbar; remove Support AI mobile button per D-24.
- Ensure menu button `min-h-11 min-w-11` (44px); desktop CTA `min-h-11`.

### Hero
- Remove all `useMotionValue`, `useSpring`, mouse listeners, animated orbs, stagger variants.
- H1: `font-sans` (Plus Jakarta), no `font-serif`; keep CMS fields; no initial opacity 0.
- Replace action cards with two buttons using `btn-cta-primary` / `btn-cta-secondary` (or extend utilities for Stripe-like pair).
- Primary → `onBookDemo()`; secondary → `/community`.
- Video container: keep fixed aspect ratio box to prevent CLS; `width`/`height` or `aspect-video` on wrapper.
- Background: static `hero-aura-bg` gradient only; simplify `hero-noise` if needed.

### Global CSS
- Add `html { scroll-padding-top: var(--header-offset, 5rem); }` and set `--header-offset` to match fixed pill height.
- Optional: `prefers-reduced-motion: reduce` disables any remaining CSS transitions on nav menu.

### Admin
- Extend SettingsManager navigation tab with Primary CTA label + href fields.
- Persist via existing settings save API (JSON blob — no Prisma migration if settings stored as JSON).

## Risks

| Risk | Mitigation |
|------|------------|
| Hardcoded "Join Now" in Navbar | Wire to `settings.navigation.primaryCta` |
| LCP regression from hero video column | Ensure h1/text column paints first; lazy iframe until play click (already) |
| LivePreview navbar break | Keep `isInsidePreview` fixed vs absolute behavior |
| Removing Support AI from nav | Confirm no other entry points required this phase |

## Recommended plan split

1. **17-01** — CMS `primaryCta` schema + SettingsManager UI + defaults  
2. **17-02** — Navbar premium refactor (CSS, CMS CTA, mobile a11y)  
3. **17-03** — Hero LCP-safe refactor (sans, buttons, static bg)  
4. **17-04** — CSS tokens, scroll-padding, lint/build verify

## Out of scope (this phase)

- Dark theme / `next-themes` (user deferred)
- Shared Button primitive unification (Phase 19)
- Other page polish
