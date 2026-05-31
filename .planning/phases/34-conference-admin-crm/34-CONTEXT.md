# Phase 34 Context — Conference Admin (lean)

## Intent

Let admins edit conference page copy and lists from the CRM **without a large new subsystem**.

## MVP scope

- Store content in **`settings.conference`** (no Prisma migration).
- One admin screen: **3 tabs** — Hero | Sections | Lists.
- Public page reads CMS data; fallbacks from current hardcoded defaults.
- `/conference` SEO via existing **Settings → Route SEO** only.

## Deferred (follow-up if needed)

- Tickets editor, per-section visibility toggles, dedicated live-preview iframe, new DB column.

## Acceptance

1. Admin changes hero title/date → save → `/conference` updates.
2. Admin edits speakers or FAQ → public page updates.
3. Route SEO for `/conference` works in Settings.
