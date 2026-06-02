# Admin Options Audit Report

## Scope
Exhaustive static audit of all admin routes and option surfaces in `book website-frontend`:

- `/admin/dashboard`
- `/admin/design`
- `/admin/settings`
- `/admin/media`
- `/admin/blogs`
- `/admin/events`
- `/admin/conference`
- `/admin/registrations`
- `/admin/newsletter`
- `/admin/users`

Primary route map: `src/pages/AdminPage.tsx`.

## Method
- Static code wiring review of all `*Manager.tsx` admin pages and shared admin infrastructure.
- Cross-consistency audit across:
  - `src/lib/adminPermissions.ts`
  - `src/components/admin/admin-mobile-nav-sections.ts`
  - `src/components/admin/workspaceTabIntros.ts`
- Feature-level verification coverage generated in `docs/ADMIN-UAT-CHECKLIST.md`.

## Inventory Summary (By Route)

- `dashboard`: operational cards/actions, backup/export/import, activity feed.
- `design`: tabs (`colors`, `typography`, `tokens`, `branding`) with save + autosave/undo integration.
- `settings`: tabs (`seo`, `navigation`, `pages`, `advanced`) + history panel + dangerous operations.
- `media`: library modes, upload/validation, search, selection, detail side panel, delete.
- `blogs`: workspace tabs (`articles`, `page`, `seo`) + editor tabs (`content`, `articleSeo`) + trash lifecycle.
- `events`: workspace tabs (`events`, `page`, `seo`) + editor tabs (`content`, `eventSeo`) + trash lifecycle.
- `conference`: tabs (`hero`, `sections`, `lists`, `embedded`, `visibility`, `seo`, `advanced`, `publish`).
- `registrations`: tabs (`submissions`, `form`, `operations`, `seo`) with CRM actions and route-level preview/save.
- `newsletter`: signups table, refresh/export/delete flows.
- `users`: tabs (`team`, `permissions`) with role guards and confirm flows.

## Findings and Fixes Applied

### Fixed: Registrations section ACL drift

Previously, registrations ACL sections only included `submissions` and `form`, while UI shipped `operations` + `seo` tabs.

**Updated:**
- `src/lib/adminPermissions.ts`
  - Added `registrations.operations`
  - Added `registrations.seo`

### Fixed: Users section ACL parity

`users` route has `team` and `permissions` tabs in UI, but no section map in ACL.

**Updated:**
- `src/lib/adminPermissions.ts`
  - Added `users.team`
  - Added `users.permissions`

### Fixed: Newsletter section ACL parity

Mobile section model includes newsletter `signups`; ACL map did not.

**Updated:**
- `src/lib/adminPermissions.ts`
  - Added `newsletter.signups`

### Fixed: Mobile section parity for Users

Added explicit mobile section grouping for users tabs.

**Updated:**
- `src/components/admin/admin-mobile-nav-sections.ts`
  - Added `/admin/users` with `team`, `permissions`
  - Added required `lucide-react` icons (`UserPlus`, `Shield`)

### Fixed: Pending-section handoff support for Users

`users` now consumes pending section routing on open.

**Updated:**
- `src/components/admin/AdminUsersManager.tsx`
  - Added `useApplyPendingAdminSection('/admin/users', ...)`

## Route PASS/FAIL Verdict

- `/admin/dashboard` — PASS
- `/admin/design` — PASS
- `/admin/settings` — PASS
- `/admin/media` — PASS
- `/admin/blogs` — PASS
- `/admin/events` — PASS
- `/admin/conference` — PASS
- `/admin/registrations` — PASS (after ACL parity fix)
- `/admin/newsletter` — PASS (after section ACL parity fix)
- `/admin/users` — PASS (after section ACL + mobile parity + pending-section hook)

## Verification

- Type-check: `npx tsc --noEmit` passed
- Lints on modified files passed

## Residual Risk / Notes

- This audit is static + behavior-model based; runbook-style execution steps are provided in `docs/ADMIN-UAT-CHECKLIST.md` for manual browser verification.
- Blog/events include nested editor tabs (`content`, `articleSeo`, `eventSeo`) that are intentionally not top-level workspace sections.

