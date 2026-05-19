# Phase 17: Navbar & Landing Hero (First) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `17-CONTEXT.md`.

**Date:** 2026-05-19
**Phase:** 17-navbar-landing-hero-first
**Areas discussed:** Visual reference, Header chrome, Mobile nav, Hero layout, Hero motion, CTAs & CMS

---

## Visual reference direction

| Option | Description | Selected |
|--------|-------------|----------|
| apple.com | Ultra-minimal, huge type, calm whitespace | |
| linear.app | Crisp product UI, subtle glass | |
| stripe.com | Confident marketing, polished nav, clear CTAs | ✓ |
| Mix | Custom blend | |

**Density:** Similar to current floating pill (refined, not airier or heavier)
**Hero typography:** Sans-only hero headline (Plus Jakarta)
**Color:** Polish current light theme; user asked to drop dark theme for now

---

## Header chrome & layout

| Option | Description | Selected |
|--------|-------------|----------|
| Refined floating pill | Keep glass-pill, tighten polish | ✓ |
| Floating pill solid | Less transparency | |
| Full-width bar | Edge-to-edge | |

**Scroll:** Static pill — no shrink/compress on scroll ✓
**Logo:** You decide → keep monogram + wordmark, refined sizing
**Socials:** Keep inline on desktop ✓

---

## Mobile navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Refined overlay sheet | Below pill (current pattern) | ✓ |
| Fullscreen takeover | | |
| Right drawer | | |

**Typography:** Sans UI links ~18–20px ✓
**Bottom actions:** Dual CTAs (CMS primary + secondary) ✓
**A11y:** Focus trap + Escape + scroll lock ✓

---

## Hero layout & hierarchy

| Option | Description | Selected |
|--------|-------------|----------|
| Refined split | Text left, media right on xl+ | ✓ |
| Centered stack | | |
| Typography-first | | |

**Media:** Keep video/play blob ✓
**Actions:** Primary + secondary buttons (Stripe-style) ✓
**Height:** You decide → content-driven; full viewport on lg+ only

---

## Hero motion & effects

| Option | Description | Selected |
|--------|-------------|----------|
| Remove cursor spotlight | Static gradients | ✓ |
| Desktop-only pointer FX | | |
| Keep current | | |

**Entrance:** None — first-paint visible ✓
**Ambient:** Static CSS gradients only ✓
**Navbar motion:** CSS only, no Framer ✓

---

## CTAs & CMS content

| Option | Description | Selected |
|--------|-------------|----------|
| CMS nav primary CTA | Add navigation.primaryCta fields | ✓ |
| Keep hardcoded Join Now | | |
| Match hero Book Demo | | |

**Hero primary:** You decide → Book Demo modal
**Hero secondary:** Join Founder Network → /community ✓
**Support AI in mobile menu:** Remove ✓

---

## Claude's Discretion

- Brand lockup sizing / smallest-breakpoint monogram visibility
- Hero min-height per breakpoint
- Interim button styling until Phase 19 primitives
- CMS schema naming and admin UI placement for primary CTA

## Deferred Ideas

- Dark / system theme (user deprioritized v1.2 dark work)
- Logo image upload in header
- Book cover hero media
- Support AI nav entry
- Sitewide primitive unification (Phase 19+)
