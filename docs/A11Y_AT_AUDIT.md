# Assistive Technology & Authenticated Admin Audit

**Generated:** 2026-06-11T13:59:10.119Z  
**Base URL:** http://localhost:5173  
**Admin auth:** success

## Automated summary

| Check                                      | Result |
| ------------------------------------------ | ------ |
| Public axe violation groups                | 0      |
| Admin axe violation groups (authenticated) | 0      |
| Keyboard check failures                    | 2      |

## Keyboard checks

- **skip-link-first-tab**: PASS {"check":"skip-link-first-tab","pass":true,"detail":{"tag":"a","role":null,"name":"Skip to main content","href":"#main-c
- **mobile-nav-escape**: INFO (skipped) {"check":"mobile-nav-escape","skipped":true}
- **cookie-banner**: INFO (skipped) {"check":"cookie-banner","skipped":true,"reason":"banner disabled"}
- **register-tab-order**: FAIL {"check":"register-tab-order","pass":false,"trail":[{"tag":"input","role":null,"name":"Full name","href":null},{"tag":"i
- **admin-single-h1**: PASS {"check":"admin-single-h1","pass":true,"h1count":1,"route":"/admin/dashboard"}
- **command-palette-open**: FAIL {"check":"command-palette-open","pass":false}

## Landmarks (sample)

- `/` — main:1 nav:4 h1:1 title:"Superhumanly Summit 2026 | The Premier AI Conference"
- `/register` — main:1 nav:4 h1:1 title:"Register — Superhumanly Summit 2026"
- `/blog` — main:1 nav:4 h1:1 title:"Insights & Playbook — Superhumanly Blog"
- `/speakers` — main:1 nav:5 h1:1 title:"Summit Speakers — Superhumanly"
- `/admin/dashboard` — main:0 nav:0 h1:1 title:"Dashboard | CMS — Superhumanly Playbook — Master Agentic AI Automation"
- `/admin/design` — main:0 nav:0 h1:1 title:"Brand & theme | CMS — Superhumanly Playbook — Master Agentic AI Automation"
- `/admin/media` — main:0 nav:0 h1:1 title:"Media library | CMS — Superhumanly Playbook — Master Agentic AI Automation"
- `/admin/blogs` — main:0 nav:0 h1:1 title:"Blog workspace | CMS — Superhumanly Playbook — Master Agentic AI Automation"
- `/admin/events` — main:0 nav:0 h1:1 title:"Events workspace | CMS — Superhumanly Playbook — Master Agentic AI Automation"
- `/admin/settings` — main:0 nav:0 h1:1 title:"Site settings | CMS — Superhumanly Playbook — Master Agentic AI Automation"
- `/admin/conference` — main:0 nav:0 h1:1 title:"Summit homepage | CMS — Superhumanly Playbook — Master Agentic AI Automation"
- `/admin/newsletter` — main:0 nav:0 h1:1 title:"Dashboard | CMS — Superhumanly Playbook — Master Agentic AI Automation"
- `/admin/users` — main:0 nav:0 h1:1 title:"Dashboard | CMS — Superhumanly Playbook — Master Agentic AI Automation"
- `/admin/registrations` — main:0 nav:0 h1:1 title:"Dashboard | CMS — Superhumanly Playbook — Master Agentic AI Automation"
- `/admin/dashboard` — main:0 nav:0 h1:1 title:"Dashboard | CMS — Superhumanly Playbook — Master Agentic AI Automation"

## Admin axe (authenticated)

_No axe violations on authenticated admin routes._

## Manual VoiceOver / NVDA checklist

### Homepage

- **VoiceOver:** Rotor > Landmarks: one Main, nav regions named. Hero H1 announced once.
- **NVDA:** D landmarks: single main. H quick nav: one H1.

### Mobile nav

- **VoiceOver:** Open menu: VO reads expanded state. Tab cycles inside; VO+Esc closes.
- **NVDA:** Open menu: expanded announced. Tab trapped; Escape closes.

### Register form

- **VoiceOver:** Each field label read with control. Error alerts announced on submit.
- **NVDA:** Tab through fields: label association verified. role=alert on errors.

### Carousels

- **VoiceOver:** Prev/next buttons labeled. Pagination group announced.
- **NVDA:** Carousel controls reachable; slide change does not move focus unexpectedly.

### Cookie banner

- **VoiceOver:** Dialog role + modal on open. Focus on Accept.
- **NVDA:** Browse mode: dialog intercepts focus until Accept.

### Admin (authenticated)

- **VoiceOver:** Single H1 per view. Data tables: column headers read with cells.
- **NVDA:** Table navigation: headers associated. Sort buttons announced.

### Admin dark mode

- **VoiceOver:** Contrast sufficient on login + dashboard (visual check).
- **NVDA:** Muted text readable at 100% zoom.

## Raw data

- [`docs/a11y-at-results.json`](a11y-at-results.json)
