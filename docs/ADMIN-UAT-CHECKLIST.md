# Admin UAT Checklist (Exhaustive)

Use this checklist route-by-route. For every step, verify:
- UI state transitions (loading/empty/error)
- Save + reload persistence
- Toast/error correctness
- Role-based visibility (`viewer`, `editor`, `super_admin`) where applicable

---

## Global Shell/Auth

- [ ] Login success and redirect to `/admin/dashboard`
- [ ] Invalid login shows inline error and blocks entry
- [ ] Remember-me restore behavior
- [ ] Expired token clears session and returns to login
- [ ] Logout clears session and redirects to `/admin`
- [ ] Protected route redirect when role/page access is `none`
- [ ] Read-only banner and disabled writes when page access is `read`

## Mobile Nav and Section Routing

- [ ] Bottom tabs + More drawer render correctly
- [ ] Drawer links filtered by role permissions
- [ ] Route section dropdown appears for sectioned pages (`conference`, `registrations`, `users`, etc.)
- [ ] Selecting a section from mobile nav opens route and activates that section
- [ ] Sidebar collapse/expand maintains usable navigation

---

## `/admin/dashboard`

- [ ] Stats cards render valid values
- [ ] Quick action cards route correctly
- [ ] Recent activity loading + empty states
- [ ] Backup (super_admin only)
- [ ] Export JSON behavior and file integrity
- [ ] Import JSON confirm flow + status feedback

## `/admin/design`

### Palette (`colors`)
- [ ] Primary color preset selection
- [ ] Custom color input
- [ ] Save and refresh persistence

### Typography (`typography`)
- [ ] Heading font selection
- [ ] Body font selection
- [ ] Text size/token controls persist

### Theme (`tokens`)
- [ ] Corner radius controls persist
- [ ] Shadow depth controls persist
- [ ] Component token updates persist

### Brand (`branding`)
- [ ] Brand name field
- [ ] Navbar logo URL/upload
- [ ] Fallback mark field
- [ ] Save status transitions (unsaved -> saving -> saved)

## `/admin/settings`

### SEO (`seo`)
- [ ] `seo.title`
- [ ] `seo.description`
- [ ] OG image URL/upload
- [ ] `og:site_name`, `og:locale`, `twitter:site`
- [ ] Google verification token
- [ ] Book schema fields (title/tagline/abstract/author/isbn/publisher/cover)

### Navigation (`navigation`)
- [ ] Header CTA label + href
- [ ] Header links add/edit/remove/reorder
- [ ] Footer links add/edit/remove/reorder
- [ ] Social profile URLs

### Site pages (`pages`)
- [ ] Footer copy block
- [ ] Cookie banner toggle/text/buttons
- [ ] 404 title/lede/CTA label/href
- [ ] Newsletter enabled toggle
- [ ] Blog CTA title/lede/button

### Advanced (`advanced`)
- [ ] Custom CSS
- [ ] Header scripts
- [ ] Footer scripts
- [ ] Save and reload persistence

- [ ] Revision restore flow for settings

## `/admin/media`

- [ ] Initial load skeleton
- [ ] Empty library state
- [ ] Error state
- [ ] Upload valid images (jpg/png/webp)
- [ ] Reject invalid type
- [ ] Reject > 5MB file
- [ ] Drag/drop upload behavior
- [ ] Search filter accuracy
- [ ] Grid/list view toggle
- [ ] Item select + multi-select
- [ ] Bulk delete confirm flow
- [ ] Detail panel: URL copy, metadata, delete

## `/admin/blogs`

### Workspace sections
- [ ] `articles` tab list behavior
- [ ] `page` tab copy persistence
- [ ] `seo` tab route SEO persistence

### Article editor (`content`, `articleSeo`)
- [ ] Title
- [ ] Slug
- [ ] Category
- [ ] Reading time
- [ ] Excerpt
- [ ] Cover image
- [ ] Markdown body
- [ ] Publish toggle
- [ ] Published date
- [ ] Publish-at/unpublish-at scheduling
- [ ] Article SEO fields
- [ ] Save/reload persistence

### Lifecycle
- [ ] Create article
- [ ] Soft delete to trash
- [ ] Restore from trash
- [ ] Permanent delete (role guarded)
- [ ] Revision restore
- [ ] List loading/empty/error states

## `/admin/events`

### Workspace sections
- [ ] `events` tab list behavior
- [ ] `page` tab copy persistence
- [ ] `seo` tab route SEO persistence

### Event editor (`content`, `eventSeo`)
- [ ] Title
- [ ] Day/weekday/time/full_time/tag/price labels
- [ ] Start/end datetime-local
- [ ] Host/location/description
- [ ] Registration URL + registrationOpen toggle
- [ ] Cover image
- [ ] Publish toggle + schedule fields
- [ ] Event SEO fields
- [ ] Save/reload persistence

### Lifecycle
- [ ] Create event
- [ ] Soft delete to trash
- [ ] Restore from trash
- [ ] Permanent delete (role guarded)
- [ ] Revision restore
- [ ] List loading/empty/error states

## `/admin/conference`

### Hero
- [ ] Logo URL/alt
- [ ] Headline/accent/lede
- [ ] Video/poster URLs
- [ ] Date/location labels
- [ ] Register CTA label
- [ ] Countdown toggle + start/timezone
- [ ] Hero metrics repeaters

### Sections
- [ ] Section copy fields across all section blocks
- [ ] Video section: register CTA, caption, highlight metrics (max 3)
- [ ] Speakers / sponsors / agenda section CTA labels
- [ ] Ticket tiers add/edit/remove/reorder

### Lists
- [ ] Sponsors list (tier field drives featured sponsor row)
- [ ] Speakers list
- [ ] Speaker **Featured on summit homepage** checkbox + fallback helper copy
- [ ] Agenda days/sessions
- [ ] Agenda session: linked speaker dropdown, duration, room, description
- [ ] Partners list
- [ ] FAQ list
- [ ] Testimonials list

### Speakers page (`/speakers`)
- [ ] Catalog hero (eyebrow, title, accent, lede) persists on save/reload
- [ ] Route SEO (title, description, OG image) persists on save/reload
- [ ] Live preview shows `/speakers` when tab active
- [ ] Public `/speakers` reflects CMS hero + conference speaker list

### Embedded
- [ ] Embedded block copy and links

### Visibility
- [ ] Section visibility toggles

### SEO
- [ ] Route SEO fields for summit homepage

### Advanced
- [ ] Custom CSS/scripts for summit page

### Publish
- [ ] Homepage live toggle behavior

- [ ] Preview updates while editing
- [ ] Save/reload persistence across all tabs

## `/admin/registrations`

### Submissions
- [ ] Loading skeleton
- [ ] Empty state
- [ ] Error banner
- [ ] No-match state
- [ ] Status filters (`all`, `pending`, `confirmed`, `cancelled`)
- [ ] Search by name/email/phone/linkedin
- [ ] Row click opens side panel
- [ ] Active row highlight
- [ ] Table sortable columns
- [ ] CSV export

### Submission side panel/edit/create
- [ ] Full name
- [ ] Email
- [ ] Phone
- [ ] LinkedIn
- [ ] Designation select
- [ ] Status select
- [ ] Ticket price (cents)
- [ ] Approve action
- [ ] Reject action + confirm dialog
- [ ] Delete action + confirm dialog
- [ ] Save and list refresh

### Form copy (`form`)
#### Left panel
- [ ] Eyebrow
- [ ] Headline
- [ ] Headline accent
- [ ] Lede
- [ ] Stats (all entries: value + label)
- [ ] Quote
- [ ] Quote name
- [ ] Quote role
- [ ] Quote initials
- [ ] Trust eyebrow
- [ ] Trust title
- [ ] Trust logos

#### Registration form
- [ ] Kicker
- [ ] Page title
- [ ] Title accent
- [ ] Page lede
- [ ] Form subtitle
- [ ] Price label
- [ ] Price display
- [ ] Ticket price cents -> amount sync
- [ ] Price note
- [ ] Fields heading title
- [ ] Form fields table:
  - [ ] Name label + placeholder
  - [ ] Email label + placeholder
  - [ ] Phone label + placeholder
  - [ ] LinkedIn label + placeholder
  - [ ] Registration type label
- [ ] Ticket types table (all rows): label + description
- [ ] Submit button label
- [ ] Success title
- [ ] Success message

### Operations (`operations`)
- [ ] registrationOpen toggle
- [ ] registrationClosedMessage
- [ ] notifyEmail
- [ ] notifyOnSubmit toggle
- [ ] sendRegistrantEmails toggle

### SEO (`seo`)
- [ ] `/register` meta title
- [ ] `/register` meta description
- [ ] `/register` OG image

### Cross-tab
- [ ] Save action label switches by tab
- [ ] Save status transitions
- [ ] Open register page action opens `/register`
- [ ] Preview shows changes for form/operations/seo tabs

## `/admin/newsletter`

- [ ] Loading skeleton
- [ ] Empty state + CTA to settings
- [ ] Error state
- [ ] Refresh action
- [ ] Export action
- [ ] Partial export warning when capped
- [ ] Delete signup confirm flow

## `/admin/users`

### Team (`team`)
- [ ] Loading skeleton
- [ ] Empty state
- [ ] Error state
- [ ] Invite drawer open/close behavior
- [ ] Invite fields: username/password/email/role
- [ ] Invite submit and success refresh
- [ ] Role change select per user
- [ ] Guardrail: cannot demote/delete last privileged admin
- [ ] Delete user confirm flow (typed confirm when required)

### Permissions (`permissions`, super_admin only)
- [ ] Tab visible only for super_admin
- [ ] Role switch (editor/viewer)
- [ ] Page access select (`write/read/none`) per page
- [ ] Section chips toggle persistence
- [ ] Reset permissions flow
- [ ] Save permissions flow

---

## RBAC Regression Matrix

- [ ] `viewer` default access: no users page write, read-only elsewhere as configured
- [ ] `editor` default access: write where allowed, users blocked
- [ ] `super_admin` access: full write + permissions panel + privileged operations
- [ ] Page set to `none`: route hidden + direct URL blocked
- [ ] Page set to `read`: read-only UI and blocked destructive actions
- [ ] Section set disabled: hidden from section nav + inaccessible via pending section handoff

