# Phase 20 — Pattern Map (Blog Index)

**Mapped:** 2026-05-19  
**Scope:** `/blog` index only

## Files to modify

| File | Role | Closest analog |
|------|------|----------------|
| `src/pages/BlogPage.tsx` | Page orchestration | `src/components/sections/BlogSection.tsx` (playbook markup + IO) |
| `src/index.css` | `blog-*` block | `.playbook-*`, `.editorial-*`, `.final-cta-section` |
| `src/components/landing/WaitlistForm.tsx` | Newsletter submit | Used by `FinalCTA.tsx` |
| `scripts/verify-phase20-blog-index.mjs` | Static gate | `scripts/verify-phase17-nav-hero.mjs` |
| `package.json` | `verify:phase20` script | `verify:phase17` entry |

## Excerpt: playbook card (reuse verbatim)

From `BlogSection.tsx` — grid list item structure:

```tsx
<li className="playbook-article-card group" style={{ "--article-i": idx } as CSSProperties}>
  <Link to={`/blog/${article.slug}`} className="playbook-article-card__link">
    <motion.div className="playbook-article-card__media">...</motion.div>
  </Link>
</li>
```

(BlogPage must use plain `motionless` elements — no Framer.)

## Excerpt: IntersectionObserver (below-fold only)

```tsx
useEffect(() => {
  const el = libraryRef.current
  if (!el) return
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add("playbook-section--visible")
        observer.disconnect()
      }
    },
    { rootMargin: "-60px 0px", threshold: 0.06 },
  )
  observer.observe(el)
  return () => observer.disconnect()
}, [])
```

Apply to `section.blog-library.playbook-section` only — not header/featured.

## Excerpt: verify script pattern

From `verify-phase17-nav-hero.mjs` — read file, regex assert, `process.exit(1)` on fail.

## PATTERN MAPPING COMPLETE
