# Admin CMS — User Guide

This guide is for **editors, viewers, and administrators** who manage the Superhumanly book and conference website through the admin panel. No engineering background is required.

**Admin URL:** open your site and go to `/admin` (for example `https://monograph.superhumanly.ai/admin`).

---

## What you can do here

The admin CMS (Content Management System) lets you:

- Update the **summit homepage**, blog, events, and registration page
- Review and approve **summit registrations** (built-in CRM)
- Manage **newsletter signups**
- Upload images to the **media library**
- Adjust **brand colors**, navigation, and site-wide SEO
- Invite teammates and control **who can edit what**

Changes you save are stored on the server and appear on the public site after publish/save (depending on the module).

---

## Sign in

1. Go to **`/admin`**.
2. Enter your **username** and **password** (provided by a super admin).
3. Optional: use **Remember username** so you do not retype it next time.
4. If you see *“Your session has expired”*, sign in again — sessions end after a period of inactivity.

**Sign out:** use **Log out** in the sidebar or top bar.

---

## Your role — what you can change

| Role | Typical use | Can edit content? | Team & permissions? | Backup / import? |
|------|-------------|-------------------|---------------------|----------------|
| **Super admin** | Site owner, IT | Yes — everything | Yes | Yes |
| **Editor** | Marketing, content | Yes — per permissions | No | Export only |
| **Viewer** | Stakeholders, review | Read-only (preview) | No | No |

Super admins can fine-tune **editor** and **viewer** access per page and per tab under **Team & access → Role permissions**.

If a sidebar item is missing, your role does not have access to that area — ask a super admin.

---

## Finding your way around

### Sidebar groups

| Group | Pages |
|-------|--------|
| **Overview** | Dashboard, Newsletter |
| **Site** | Brand & theme, Site settings, Media |
| **Pages** | Summit homepage, Blog, Events, Registrations |
| **Access** | Team & access *(super admin)* |

### Dashboard (`/admin/dashboard`)

Your home screen shows:

- **At a glance** — published articles, events, active homepage modules, draft count
- **Quick actions** — shortcuts to every major workspace
- **Recent activity** — who changed what (audit log)
- **Data management** — backup, export, import *(restricted by role)*

### Tips that apply everywhere

- **Save** — Most content tabs have a **Save** button in the header. Unsaved changes are often marked as dirty; save before leaving.
- **Preview** — Many workspaces can preview the public page before you save (live preview panel where available).
- **Open public page** — Look for links like **Open /register** or **Open /conference** to see the live visitor URL.
- **Command palette** — Press **⌘K** (Mac) or **Ctrl+K** (Windows) to jump quickly between admin pages.
- **Mobile** — On small screens, use the bottom tab bar and section menu to reach the same tabs as the desktop sidebar.
- **Read-only banner** — If you are a viewer (or have read-only access to a page), controls are disabled; you can still browse and preview.

---

## Summit homepage (`/admin/conference`)

Controls the main conference landing page at **`/`**.

| Tab | What it controls |
|-----|------------------|
| **Hero** | Logo, headline, video background, venue, countdown |
| **Section copy** | Headlines for speakers, agenda, sponsors, tickets, FAQ, etc. |
| **Lists** | Speakers, agenda days, sponsors/partners, FAQ items, testimonials |
| **Speakers page** | Hero copy and SEO for the `/speakers` catalog (speaker profiles are edited under **Lists**) |
| **Embedded blocks** | Book showcase, blog/events previews, final call-to-action |
| **Visibility** | Show or hide each section on the public homepage |
| **SEO** | Title and description for search and social sharing on `/` |
| **Advanced** | Custom CSS and scripts *(use with care)* |
| **Publish** | Go-live switch and deployment notes |

**New summit fields (2026)**

- **Video section** (Section copy → Video): register CTA label, video caption, and up to three highlight metrics below the player.
- **Speakers** (Lists): check **Featured on summit homepage** for every speaker that should appear on the homepage carousel (scroll arrows appear when they do not all fit on screen). Unchecked speakers only appear on `/speakers`.
- **Agenda sessions** (Lists → Agenda): link a session to a speaker profile, plus duration, room, and description. Use the **Linked speaker** dropdown instead of typing IDs manually.
- **Section CTAs** (Section copy): speakers, sponsors, and agenda blocks each have a **CTA label** (e.g. “Meet all speakers”, “Become a sponsor”, “Download full agenda”).
- **Speakers catalog** (`/speakers`): edit listing hero and route SEO under **Speakers page**. Add a `/speakers` link under **Site settings → Navigation** if visitors should see it in the header.

**Suggested workflow:** edit copy and lists → configure **Speakers page** if using `/speakers` → check **Visibility** → review **SEO** → use **Publish** when ready for production.

---

## Registrations & CRM (`/admin/registrations`)

This is the **registration CRM** for summit sign-ups from **`/register`**.

### Submissions (CRM)

Manage everyone who registered:

1. Open **Registrations → Submissions**.
2. Use **search** and status filters: **All**, **Pending**, **Approved**, **Rejected**.
3. Click a row to open the **detail panel** on the right.

**Status meanings**

| Status in admin | “Allowed” badge | Meaning for the attendee |
|-----------------|-----------------|---------------------------|
| **Pending** | Pending | Submitted; awaiting your decision |
| **Confirmed** | Yes | Approved for the summit |
| **Cancelled** | No | Rejected / not attending |

**Quick actions in the detail panel**

- **Approve** — sets status to confirmed
- **Reject** — sets status to cancelled (you may be asked to confirm)
- **Save** — saves edits to name, email, phone, LinkedIn, designation, ticket price

**Other actions**

- **Add registration** — manually create a record (walk-ins, VIPs)
- **Export CSV** — download all visible rows for spreadsheets or mail merge
- **Delete** — permanently remove a submission *(confirm dialog)*

### Form copy

Edits the **left storytelling column** and **right registration card** on `/register` — headlines, stats, field labels, ticket types, submit button, and success message. Changes apply after you **Save** this workspace.

### Operations

| Setting | What it does |
|---------|----------------|
| **Registration open** | When off, `/register` shows your closed message and blocks new sign-ups |
| **Closed message** | Text visitors see when registration is closed |
| **Admin notification email** | Where new-submission alerts are sent |
| **Email admin with review links** | Sends approve/deny links on each new submission *(requires email service on the server)* |
| **Email registrant when approved or denied** | Notifies the attendee when you approve or reject |

### Register SEO

Meta title, description, and social image for **`/register`** only.

---

## Blog (`/admin/blogs`)

| Tab | Purpose |
|-----|---------|
| **Articles** | Create, edit, publish, or trash blog posts |
| **Page hero** | Headline area at the top of `/blog` |
| **SEO** | Listing page meta for `/blog` |

When editing an article, you also get **Content** (title, body, schedule, publish) and **Article SEO** (per-post search/social overrides).

**Trash:** deleted articles can be restored from trash before permanent removal.

---

## Events (`/admin/events`)

| Tab | Purpose |
|-----|---------|
| **Events** | Workshops and sessions on the events calendar |
| **Page hero** | Top of `/events` |
| **SEO** | Listing page meta for `/events` |

Each event has **Event details** (schedule, location, pricing) and **Event SEO**.

---

## Newsletter (`/admin/newsletter`)

View emails captured from waitlist and playbook forms across the site.

- **Refresh** — reload the list from the server
- **Export** — download signups
- **Delete** — remove a signup *(confirm)*

---

## Media library (`/admin/media`)

Upload and manage images for covers, thumbnails, Open Graph images, and inline content.

- **Upload** — drag files or use the upload control; invalid types are rejected
- **Search** — find assets by name
- **Select** — copy URL into blog, events, or conference fields
- **Delete** — remove unused files *(confirm)*

Prefer media library URLs over pasting random external links so images stay reliable.

---

## Brand & theme (`/admin/design`)

| Tab | Purpose |
|-----|---------|
| **Palette** | Primary brand color (buttons, links, focus) |
| **Typography** | Heading and body fonts on the public site |
| **Theme** | Corner radius and shadow depth for cards |
| **Brand** | Site display name and navbar logo |

---

## Site settings (`/admin/settings`)

| Tab | Purpose |
|-----|---------|
| **SEO** | Default title, description, and share image for the whole site |
| **Navigation** | Header CTA, menu links, footer links, social URLs |
| **Site pages** | Footer copy, cookie banner, 404 page, shared blog CTA |
| **Advanced** | Global CSS and script tags on every public page |

Individual pages (blog, events, summit, register) can override global SEO in their own workspaces.

**Revision history** — Some settings tabs support viewing past versions where the history panel is shown.

---

## Team & access (`/admin/users`) — super admin only

### Team members

- **Invite** — create username, password, email, and role
- **Change role** — super admin, editor, or viewer
- **Remove user** — cannot delete the last super admin

### Role permissions

Configure per role:

- **Page access** — none, read, or write for each admin area
- **Section access** — hide specific tabs (for example hide **Operations** under Registrations)

After saving permissions, editors and viewers see the updated menu on their next session refresh.

---

## Data management (dashboard)

| Action | Who can use it | Purpose |
|--------|----------------|---------|
| **Create backup** | Super admin | Server-side snapshot of all CMS data |
| **Export JSON** | Editors (not viewers) | Download a local copy of content |
| **Import JSON** | Super admin | Merge content from a backup file — **cannot be undone** |

Only use **Import** when you are certain the file is correct. Super admins should coordinate imports to avoid overwriting live content unexpectedly.

---

## Common tasks — step by step

### Approve a summit registration

1. Go to **Registrations → Submissions**.
2. Filter **Pending** if needed.
3. Open the registrant → click **Approve** → confirm if prompted.
4. Optionally enable **Email registrant when approved** under **Operations** so they receive confirmation.

### Close registration before the event

1. Go to **Registrations → Operations**.
2. Turn off **Registration open**.
3. Set **Closed message** (for example “Registration is now closed. Join the waitlist.”).
4. **Save**.

### Publish a new blog post

1. Go to **Blog → Articles** → **New article**.
2. Fill **Content** — title, body, thumbnail, excerpt.
3. Set **Published** on (or schedule a publish time if available).
4. Optional: tune **Article SEO**.
5. **Save**.

### Hide a homepage section temporarily

1. Go to **Summit homepage → Visibility**.
2. Turn off the section you want hidden.
3. **Save** → open **`/`** to verify.

### Add a teammate who can only edit blog and events

1. **Team & access → Team members** → invite as **Editor**.
2. Go to **Role permissions** → **Editor**.
3. Set **Blog** and **Events** to **Write**; set other pages to **Read** or **None** as needed.
4. **Save** permissions.

---

## Troubleshooting

| Problem | What to try |
|---------|-------------|
| Cannot sign in | Confirm username/password with super admin; check caps lock |
| Session expired | Sign in again at `/admin` |
| Save fails / error toast | Check internet; retry; if it persists, contact super admin (API may be down) |
| Page missing from sidebar | Your role lacks access — ask for permission changes |
| Changes not on public site | Confirm you clicked **Save**; hard-refresh the public page (⌘⇧R / Ctrl+Shift+R) |
| Registration emails not sending | **Operations** emails need server email configuration — ask technical contact |
| Import broke the site | Super admin may restore from **Create backup** or a previous **Export JSON** |

---

## Glossary

| Term | Meaning |
|------|---------|
| **CMS** | Content Management System — this admin panel |
| **CRM** | In **Registrations**, the submissions list where you track and approve attendees |
| **SEO** | Settings that control how pages appear in Google and social link previews |
| **OG image** | Image shown when a link is shared on Slack, LinkedIn, X, etc. |
| **Preview** | See changes before or alongside save, without replacing live content until saved |
| **Super admin** | Full control including users, backup, and import |

---

## Related technical docs

These are aimed at developers and QA, not day-to-day editors:

- `docs/ADMIN-OPTIONS-AUDIT.md` — route and permission inventory
- `docs/ADMIN-UAT-CHECKLIST.md` — manual test checklist
- `docs/PRD.md` / `docs/TRD.md` — product and technical requirements

---

## Getting help

1. Note **which page** you were on (for example Registrations → Submissions).
2. Note **what you clicked** and the **exact error message** (screenshot helps).
3. Contact your **super admin** or technical owner with your username and time of the issue.

*Last updated for the v1.5 conference admin workspace (summit homepage, registrations CRM, role permissions, and newsletter).*
