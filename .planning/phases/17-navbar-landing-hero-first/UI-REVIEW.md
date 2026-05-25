# Phase 17 UI Review — Navbar & Hero (pass 3)

**Date:** 2026-05-19  
**Verdict:** Addressed empty-nav + hero hierarchy feedback; ready for visual QA

## User feedback (this pass)

- Navbar felt **empty on the right** (and weak on the left) after removing desktop CTA and wordmark
- Hero **text hierarchy, spacing, and layout** felt off — eyebrow→headline jump, text sitting high vs media, long subtitle block

## Changes applied

### Navbar — balanced three-column dock
| Zone | Content |
|------|---------|
| Left | Monogram + wordmark (`sm+`) |
| Center | Nav links (true center via `grid-cols-[1fr_auto_1fr]`) |
| Right | Compact CMS CTA (`btn-nav-cta` pill) |

### Hero — editorial rhythm
- **Eyebrow:** `hero-eyebrow` — tighter tracking, softer color
- **Headline:** `hero-display` — medium weight, two-line stack (accent on second line, muted)
- **Subtitle:** Smaller max-width (`max-w-md`), relaxed line-height
- **Layout:** `lg:grid-cols-2` + `items-center` for vertical alignment with media
- **Spacing:** Reduced top padding; content-driven min-height on `lg+`

## 6-pillar audit (post pass 3)

| Pillar | Score | Notes |
|--------|-------|-------|
| Hierarchy | 7/10 | Two-line headline + muted accent; nav L/C/R balanced |
| Typography | 7/10 | Sans display scale; eyebrow less shouty |
| Spacing | 7/10 | Grid alignment; subtitle width capped |
| Color | 7/10 | Neutral hero; nav CTA anchors right |
| Components | 7/10 | Nav CTA + hero primary/text secondary |
| Polish | 6/10 | Mesh placeholder OK; real video poster still lifts grade |

## Remaining (optional)

- CMS video thumbnail / book cover for media block
- Fine-tune wordmark truncation on `md` widths
- Phase 18 token pass for shared display scale sitewide
