---
phase: 10-seo-data-model-site-url-contract
slug: seo-data-model-site-url-contract
status: verified
threats_open: 0
asvs_level: 1
created: 2026-05-19
---

# Phase 10 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Public site ↔ API | Visitors fetch `GET /api/v1/content/site` for `siteUrl` and settings | Public origin string, non-secret SEO metadata |
| Admin ↔ API | Authenticated admin mutates articles and `settings.seo` JSON | SEO title/description, OG URLs, GSC verification token |
| Server env ↔ runtime | `SITE_URL` configures canonical/absolute URL origin | Deployment secret (origin only, not credentials) |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-10-01 | Spoofing | `server/src/lib/siteUrl.ts` | mitigate | Production requires valid `https:` URL; trailing slash stripped; boot fail-fast in `index.ts` | closed |
| T-10-02 | Information disclosure | Client origin config | mitigate | No `VITE_SITE_URL`; `siteUrl` exposed only via API; `WebsiteDataProvider` calls `setSiteOrigin` | closed |
| T-10-03 | Tampering (XSS) | Article SEO fields → `SeoHead` | mitigate | Zod max lengths on `seoTitle`/`seoDescription`; React text bindings in `SeoHead.tsx` (no `dangerouslySetInnerHTML` on SEO output) | closed |
| T-10-04 | Tampering | `ogImage` URLs | mitigate | Article `ogImage`: Zod refine requires `https://` when set; `resolveImageUrl` only passes through `http(s)://` or site-relative paths | closed |
| T-10-05 | Tampering | `googleSiteVerification` | mitigate | Rendered as `<meta content={token}>` via React (escaped); admin-only write path | closed |

*Disposition: mitigate · Status: closed*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-10-01 | T-10-05 (residual) | Plan noted Zod `max(256)` on GSC token; `contentPatchSchema` still uses `settings: z.record(z.unknown())`. Meta `content` attribute + React escaping limits injection impact; length cap deferred to hardening pass. | security audit | 2026-05-19 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-05-19 | 5 | 5 | 0 | gsd-secure-phase (inline verification) |

### Evidence Summary

- **T-10-01:** `getSiteUrl()` enforces `https:` in production and normalizes origin (`server/src/lib/siteUrl.ts:16-29`).
- **T-10-02:** `server/.env.example` documents `SITE_URL`; no `VITE_SITE_URL` in root `.env.example`; hydration in `WebsiteDataProvider.tsx`.
- **T-10-03:** `articleCreateSchema` caps string lengths; `SeoHead` uses JSX text props for title/description.
- **T-10-04:** `article.ts` ogImage `https://` refine; `resolveImageUrl` rejects non-http(s) absolute schemes.
- **T-10-05:** GSC token in `SeoHead` meta `content` only; not interpreted as HTML.

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-19
