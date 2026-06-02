# Admin Live Audit Run

Run timestamp (UTC): 2026-06-02T06:46:19.288Z
Environment:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Login used: `admin`

## Executed Checks
Automated live-browser verification (Playwright) for:
- Route accessibility for all `/admin/*` pages
- Section/tab discoverability and click navigation on each page
- Key route-specific spot checks:
  - Registrations: submissions search input visible
  - Users: invite button visible on team tab

## Route and Tab Results

- `/admin/dashboard` -> PASS
- `/admin/design` -> PASS (`Palette`, `Typography`, `Theme`, `Brand`)
- `/admin/settings` -> PASS (`SEO`, `Navigation`, `Site pages`, `Advanced`)
- `/admin/media` -> PASS
- `/admin/blogs` -> PASS (`Articles`, `Page hero`, `SEO`)
- `/admin/events` -> PASS (`Events`, `Page hero`, `SEO`)
- `/admin/conference` -> PASS (`Hero`, `Section copy`, `Lists`, `Embedded blocks`, `Visibility`, `SEO`, `Advanced`, `Publish`)
- `/admin/registrations` -> PASS (`Submissions`, `Form copy`, `Operations`, `SEO`) + search input PASS
- `/admin/newsletter` -> PASS
- `/admin/users` -> PASS (`Team members`, `Role permissions`) + invite button PASS

## Runtime Issues Observed

1) `429 Too Many Requests` on `GET /api/v1/marketing/events`
- Endpoint: `http://localhost:3001/api/v1/marketing/events`
- Impact: noisy console errors and potential temporary data sync degradation in marketing/event surfaces.
- Recommendation:
  - review server-side limiter configuration for this endpoint,
  - reduce client retry aggressiveness / deduplicate parallel requests,
  - consider cache/debounce in polling path.

## Notes
- This run verifies route/tab availability and critical UI hooks in a real browser session.
- Use `docs/ADMIN-UAT-CHECKLIST.md` for field-by-field manual execution and persistence checks.
