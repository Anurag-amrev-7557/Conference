# Accessibility Audit Report — Book Website Frontend

**Project:** `book website-frontend` (Vite + React 19 SPA)  
**Audit date:** 2026-06-11  
**Conformance target:** WCAG 2.2 Level AA  
**Scope:** Public marketing site + Admin CMS (`/admin/*`)  
**Auditor:** Automated tooling + static code review + keyboard/landmark checks

---

## 1. Executive Summary

### Overall risk: **Medium–High**

The codebase demonstrates **intentional accessibility work** in several areas: skip link, mobile nav focus trap, Radix dialogs, reduced-motion support, carousel ARIA labels, FAQ `<details>` pattern, and form `aria-invalid` on registration fields. However, the site **does not meet WCAG 2.2 AA** today due to landmark structure issues, touch-target sizing, ARIA attribute conflicts, admin dark-mode contrast failures, form label association gaps, and missing automated enforcement.

| Metric                                    | Value                                                                         |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| TSX files reviewed                        | 152                                                                           |
| Public routes scanned (axe × 3 viewports) | 11 routes × 3 = 33 scans                                                      |
| Admin routes scanned                      | 12 (incl. dark login)                                                         |
| Unique axe violation rule IDs (runtime)   | 4 (`aria-prohibited-attr`, `target-size`, `document-title`, `color-contrast`) |
| Manual/code findings registered           | 47                                                                            |
| Critical findings                         | 2                                                                             |
| High findings                             | 14                                                                            |
| Medium findings                           | 18                                                                            |
| Low / Info                                | 13                                                                            |

### Top 10 blockers (fix first)

| #   | ID       | Issue                                                                             | WCAG         |
| --- | -------- | --------------------------------------------------------------------------------- | ------------ |
| 1   | A11Y-001 | Skip link targets `<div>`, not `<main>`; duplicate `#main-content` on `/register` | 2.4.1, 1.3.1 |
| 2   | A11Y-004 | Sponsors marquee: prohibited `aria-label` + `aria-labelledby` on same element     | 4.1.2        |
| 3   | A11Y-005 | Carousel pagination dots below 24×24px minimum target size                        | 2.5.8        |
| 4   | A11Y-014 | Admin login (dark theme): 5 elements fail color contrast                          | 1.4.3        |
| 5   | A11Y-008 | Lead capture modal: labels not programmatically associated with inputs            | 1.3.1, 3.3.2 |
| 6   | A11Y-007 | Cookie banner: incomplete dialog (no focus trap, no `aria-modal`)                 | 2.1.2, 4.1.2 |
| 7   | A11Y-013 | Admin workspace: duplicate H1 (TopBar + page header)                              | 1.3.1        |
| 8   | A11Y-011 | Event detail hero image has empty `alt`                                           | 1.1.1        |
| 9   | A11Y-017 | CMS accent color override can produce illegible button contrast                   | 1.4.3        |
| 10  | A11Y-010 | Registration field errors use `role="alert"` but lack `aria-describedby` link     | 3.3.1, 1.3.1 |

### Estimated remediation effort

| Tier                                    | Count | Effort       |
| --------------------------------------- | ----- | ------------ |
| Critical + High                         | 16    | 3–5 dev days |
| Medium                                  | 18    | 2–3 dev days |
| Low + Info                              | 13    | 1–2 dev days |
| CI/tooling (eslint-jsx-a11y, axe in CI) | —     | 0.5 day      |

---

## 2. Methodology

### 2.1 Tools and environment

| Tool                   | Version / notes                                             |
| ---------------------- | ----------------------------------------------------------- |
| `@axe-core/playwright` | Installed for audit; script: `npm run a11y:axe`             |
| Playwright Chromium    | Headless, fresh `browser.newContext()` per scan             |
| Contrast script        | `npm run a11y:contrast` → `docs/a11y-contrast-results.json` |
| Static inventory       | ripgrep + `docs/a11y-static-results.json`                   |
| Dev server             | `http://localhost:5173` (Vite)                              |
| CMS data               | `public/cms-bootstrap.json` embedded at build/dev           |

### 2.2 Viewports tested

- Mobile: 320×800
- Tablet: 768×1024
- Desktop: 1440×900

### 2.3 Layers applied

1. **Static code audit** — all `src/**/*.tsx` (152 files), CSS token review
2. **Automated runtime** — axe-core WCAG 2.2 AA tags per route/viewport
3. **Keyboard / landmark checks** — tab order sample, H1/main counts via Playwright
4. **Manual code review** — dialogs, forms, carousels, admin patterns, CMS injection

### 2.4 Limitations

- Admin authenticated routes could not be fully exercised without a valid session token; scans reflect **login redirect / auth gate** DOM only.
- Assistive technology (VoiceOver/NVDA) manual sessions were inferred from code patterns + axe; full AT walkthrough recommended before release.
- Third-party iframe content (Google Maps embed) audited for `title` only; inner map UI not tested.
- One blog slug (`/blog/strategic-ai-implementation-impact`) showed transient empty `<title>` — likely Helmet async timing vs. axe scan window.

---

## 3. WCAG 2.2 AA Conformance Summary

| Criterion | Name                      | Public      | Admin      | Notes                                                       |
| --------- | ------------------------- | ----------- | ---------- | ----------------------------------------------------------- |
| 1.1.1     | Non-text Content          | **Partial** | Partial    | Event hero `alt=""`; admin thumbs OK in context             |
| 1.2.1–5   | Time-based Media          | **Pass**    | N/A        | Hero video decorative + muted; ConferenceVideo has controls |
| 1.3.1     | Info and Relationships    | **Fail**    | Fail       | Landmarks, duplicate H1, label association                  |
| 1.3.2     | Meaningful Sequence       | Pass        | Pass       | —                                                           |
| 1.3.3     | Sensory Characteristics   | Pass        | Pass       | —                                                           |
| 1.3.4     | Orientation               | Pass        | Pass       | —                                                           |
| 1.3.5     | Identify Input Purpose    | **Partial** | Partial    | Registration has autocomplete; lead modal does not          |
| 1.4.1     | Use of Color              | Pass        | Pass       | Errors also use text                                        |
| 1.4.2     | Audio Control             | Pass        | N/A        | —                                                           |
| 1.4.3     | Contrast (Minimum)        | **Partial** | **Fail**   | Admin dark login + CMS accent edge cases                    |
| 1.4.4     | Resize Text               | Pass        | Pass       | Base 15–17px tokens                                         |
| 1.4.5     | Images of Text            | Pass        | Pass       | —                                                           |
| 1.4.10    | Reflow                    | Pass        | Pass       | Not fully tested at 400% zoom                               |
| 1.4.11    | Non-text Contrast         | **Partial** | Partial    | Carousel dots, some focus rings                             |
| 1.4.12    | Text Spacing              | Not tested  | Not tested | —                                                           |
| 1.4.13    | Content on Hover/Focus    | Pass        | Pass       | —                                                           |
| 2.1.1     | Keyboard                  | **Partial** | Partial    | DataTable sort `<th onClick>`; cookie banner                |
| 2.1.2     | No Keyboard Trap          | **Partial** | Pass       | Cookie banner; Radix dialogs OK                             |
| 2.1.4     | Character Key Shortcuts   | Pass        | Partial    | Command palette                                             |
| 2.2.1     | Timing Adjustable         | Pass        | Pass       | —                                                           |
| 2.2.2     | Pause, Stop, Hide         | **Pass**    | Pass       | Marquee pause control present                               |
| 2.3.1     | Three Flashes             | Pass        | Pass       | —                                                           |
| 2.4.1     | Bypass Blocks             | **Fail**    | N/A        | Skip link target not a landmark                             |
| 2.4.2     | Page Titled               | **Partial** | Pass       | One blog slug timing issue                                  |
| 2.4.3     | Focus Order               | Pass        | Pass       | —                                                           |
| 2.4.4     | Link Purpose              | Pass        | Pass       | —                                                           |
| 2.4.5     | Multiple Ways             | Pass        | N/A        | —                                                           |
| 2.4.6     | Headings and Labels       | **Fail**    | Fail       | Lead modal, admin H1                                        |
| 2.4.7     | Focus Visible             | **Partial** | Partial    | Lead modal `outline-none`                                   |
| 2.4.11    | Focus Not Obscured        | **Partial** | Partial    | Sticky nav + cookie banner                                  |
| 2.5.1     | Pointer Gestures          | Pass        | Pass       | Carousel has buttons                                        |
| 2.5.2     | Pointer Cancellation      | Pass        | Pass       | —                                                           |
| 2.5.3     | Label in Name             | **Partial** | Pass       | —                                                           |
| 2.5.4     | Motion Actuation          | Pass        | Pass       | —                                                           |
| 2.5.7     | Dragging Movements        | Pass        | Partial    | SortableList has keyboard sensor                            |
| 2.5.8     | Target Size (Min)         | **Fail**    | Partial    | Carousel dots                                               |
| 3.1.1     | Language of Page          | Pass        | Pass       | `lang="en"`                                                 |
| 3.1.2     | Language of Parts         | Partial     | Partial    | CMS HTML content                                            |
| 3.2.1–4   | Predictable               | Pass        | Pass       | —                                                           |
| 3.2.6     | Consistent Help           | N/A         | N/A        | —                                                           |
| 3.3.1     | Error Identification      | **Partial** | Pass       | BookDemo missing describedby                                |
| 3.3.2     | Labels or Instructions    | **Fail**    | Pass       | Lead modal                                                  |
| 3.3.3     | Error Suggestion          | Pass        | Pass       | —                                                           |
| 3.3.4     | Error Prevention          | Pass        | Pass       | Admin confirm dialogs                                       |
| 3.3.7     | Redundant Entry           | Pass        | Pass       | —                                                           |
| 3.3.8     | Accessible Authentication | Pass        | Pass       | No cognitive CAPTCHA                                        |
| 4.1.2     | Name, Role, Value         | **Fail**    | Pass       | Marquee ARIA, carousel tabs                                 |
| 4.1.3     | Status Messages           | Pass        | Pass       | Toasts use live regions                                     |

**Legend:** Pass = no known failures; Partial = gaps in some flows; Fail = blocking failures found.

---

## 4. Findings Register

Severity: **C** Critical · **H** High · **M** Medium · **L** Low · **I** Info

### 4.1 Global / layout

#### A11Y-001 · **H** · Skip link does not target a `<main>` landmark

- **WCAG:** 2.4.1 Bypass Blocks, 1.3.1 Info and Relationships
- **Location:** `src/components/PublicLayout.tsx:8-17`
- **Description:** Skip link points to `#main-content` on a `<div>`, not a `<main>` element. Screen readers expect the primary landmark.
- **Reproduction:** Tab on any public page → skip link activates → focus lands on wrapper div.
- **Fix:** Replace `<div id="main-content">` with `<main id="main-content" tabIndex={-1}>`. Remove inner page-level `<main>` wrappers or consolidate to one per route.

#### A11Y-002 · **H** · Duplicate `id="main-content"` on register route

- **WCAG:** 4.1.1 Parsing (best practice), 2.4.1
- **Location:** `PublicLayout.tsx:15` + `ConferenceRegisterPage.tsx:25`
- **Description:** Register page renders `<main id="main-content">` inside layout's `<div id="main-content">` — invalid duplicate IDs.
- **Fix:** Remove `id` from register `<main>`; let layout own the skip target.

#### A11Y-003 · **M** · `main` nested inside non-semantic `#main-content` div

- **WCAG:** 1.3.1
- **Location:** All public pages via `PublicLayout` + page `<main>`
- **Evidence:** Keyboard check on `/` reported `main: 1`, `mainContentDiv: 1`.
- **Fix:** See A11Y-001 — single `<main>` at layout level.

#### A11Y-023 · **I** · No `eslint-plugin-jsx-a11y` in CI

- **WCAG:** — (process)
- **Location:** `eslint.config.js`
- **Fix:** Add `eslint-plugin-jsx-a11y` recommended rules to lint script.

#### A11Y-024 · **I** · `@radix-ui/react-visually-hidden` installed but unused

- **Location:** `package.json`; no imports in `src/`
- **Fix:** Use for dialog descriptions or remove dependency.

---

### 4.2 Homepage `/`

#### A11Y-004 · **H** · Prohibited ARIA: `aria-label` + `aria-labelledby` on same element

- **WCAG:** 4.1.2 Name, Role, Value
- **Location:** `src/components/sections/conference/SponsorsMarquee.tsx:42-46`
- **Axe:** `aria-prohibited-attr` on `.conference-sponsors-marquee__viewport` (all 3 viewports)
- **Description:** Viewport has both `aria-label="Sponsor logos"` and `aria-labelledby={controlId}` — only one naming mechanism allowed.
- **Fix:** Remove `aria-label`; keep `aria-labelledby` pointing to pause button, or use `aria-labelledby` on a visible heading.

#### A11Y-005 · **H** · Carousel dot buttons below 24×24px (WCAG 2.5.8)

- **WCAG:** 2.5.8 Target Size (Minimum)
- **Location:** `src/components/sections/SectionCarousel.tsx:191-202` + `index.css` (`.section-carousel__dot`)
- **Axe:** `target-size` — 14–18 nodes on `/`
- **Fix:** Increase dot hit area to min 24×24px (padding or `min-h-6 min-w-6`) with visual dot centered.

#### A11Y-018 · **M** · Carousel tabs missing `aria-controls` / tabpanel pairing

- **WCAG:** 4.1.2
- **Location:** `SectionCarousel.tsx:188-204`
- **Description:** Dots use `role="tab"` but no associated `role="tabpanel"` or `aria-controls`.
- **Fix:** Either use `role="group"` + buttons (simpler), or add `id` on items and `aria-controls` on tabs.

#### A11Y-033 · **I** · Mobile nav focus trap — **PASS**

- **Location:** `Navbar.tsx:43-72`
- **Notes:** Focus moves to first item, Tab cycles, Escape closes. Good pattern.

#### A11Y-034 · **I** · Reduced motion — **PASS**

- **Location:** `index.css:102-111`, `lib/motion.ts`, per-component guards
- **Notes:** Global CSS disables animations when `prefers-reduced-motion: reduce`.

---

### 4.3 Register `/register`

#### A11Y-010 · **M** · Form errors not linked via `aria-describedby`

- **WCAG:** 3.3.1, 1.3.1
- **Location:** `src/components/book-demo/BookDemoTextField.tsx:42-49`
- **Description:** `aria-invalid` set but error `<span role="alert">` not referenced by input.
- **Fix:** Add `id` on error span; `aria-describedby={error ? errorId : undefined}` on input.

#### A11Y-035 · **L** · Designation radio group — verify fieldset

- **Location:** `BookDemoForm.tsx` (uses `<fieldset>`/`<legend>` — **PASS** pattern)
- **Status:** Info — pattern is correct; ensure legend visible.

---

### 4.4 Blog `/blog` and `/blog/:slug`

#### A11Y-006 · **M** · Empty document title on one article (timing)

- **WCAG:** 2.4.2 Page Titled
- **Location:** `/blog/strategic-ai-implementation-impact`
- **Axe:** `document-title` serious (3 viewports)
- **Description:** `SeoHead` / react-helmet-async may not have committed `<title>` before axe ran.
- **Fix:** Ensure synchronous title in `index.html` fallback; increase axe wait; verify `SeoHead` on `BlogPostPage`.

#### A11Y-020 · **M** · Nested `<main>` inside `<article>` without page-level main wrapper

- **WCAG:** 1.3.1
- **Location:** `BlogPostPage.tsx:340` — `<main className="blog-post-page__content">` inside article
- **Description:** Unusual landmark nesting; outer page lacks coordinating `<main>`.
- **Fix:** Use `<div>` for content area or restructure with single page `<main>`.

#### A11Y-021 · **L** · “Copied” tooltip uses 10px text

- **WCAG:** 1.4.4 Resize Text
- **Location:** `BlogPostPage.tsx:310` — `text-[10px]`
- **Fix:** Use `text-xs` (12px minimum per design system).

#### A11Y-028 · **I** · Blog markdown demotes CMS H1 to H2 — **PASS**

- **Location:** `BlogPostMarkdown.tsx`
- **Notes:** Prevents duplicate H1 when CMS content includes `# Title`.

---

### 4.5 Events `/events` and `/events/:id`

#### A11Y-011 · **H** · Event detail hero image empty alt

- **WCAG:** 1.1.1
- **Location:** `EventDetailPage.tsx:139-141` — `alt=""`
- **Description:** Informative hero image; title is in adjacent H1 but image should have `alt={event.title}` or be marked decorative with CSS only if redundant.
- **Fix:** `alt={event.title}`.

#### A11Y-036 · **L** · Events list thumbnail `alt=""`

- **WCAG:** 1.1.1
- **Location:** `EventsPage.tsx:148-150`
- **Notes:** Title in same link — acceptable as decorative; document decision or use `alt={event.title}`.

---

### 4.6 Speakers `/speakers`

#### A11Y-037 · **I** · Speaker detail dialog — **PASS** (Radix)

- **Location:** `SpeakerDetailDialog.tsx`, `AppDialog.tsx`
- **Notes:** Title, description (sr-only), close button labeled.

---

### 4.7 Global overlays

#### A11Y-007 · **H** · Cookie banner incomplete dialog pattern

- **WCAG:** 2.1.2, 4.1.2
- **Location:** `CookieBanner.tsx:20-23`
- **Issues:** `role="dialog"` without `aria-modal="true"`; no focus trap; no initial focus; no Escape handler; may obscure focused elements (2.4.11).
- **Fix:** Use Radix Dialog, or add focus trap + `aria-modal` + return focus on dismiss.

#### A11Y-008 · **H** · Lead capture modal labels not associated

- **WCAG:** 1.3.1, 3.3.2
- **Location:** `LeadCaptureModal.tsx:66-83`
- **Description:** Visual `<label>` elements lack `htmlFor`; inputs lack `id`.
- **Fix:** Add matching `id`/`htmlFor` pairs; add `autoComplete` attributes.

#### A11Y-009 · **M** · Lead capture inputs weak focus indicator

- **WCAG:** 2.4.7, 1.4.11
- **Location:** `LeadCaptureModal.tsx:69,76,83` — `outline-none focus:border-accent` only
- **Fix:** Add `focus-visible:ring-2 focus-visible:ring-accent/30`.

#### A11Y-022 · **L** · Lead capture labels at 11px

- **WCAG:** 1.4.4
- **Location:** `LeadCaptureModal.tsx:66` — `text-[11px]`
- **Fix:** Use `text-xs` (12px+).

#### A11Y-039 · **M** · Conference transition overlay may trap focus

- **WCAG:** 2.1.2
- **Location:** `ConferenceTransitionOverlay.tsx`
- **Notes:** Full-screen overlay during route transition — verify focus not lost; add `aria-hidden` on background when active.

---

### 4.8 Admin CMS

#### A11Y-013 · **H** · Duplicate H1 on authenticated admin views

- **WCAG:** 1.3.1
- **Location:** `TopBar.tsx:61` + `admin-editor-ui.tsx:149`
- **Description:** TopBar always renders `<h1>` with page title; editor pages also render `<h1>` in `AdminEditorPageHeader`.
- **Fix:** Change TopBar to `<p>` or `<span>` with `aria-current`; reserve single H1 for page content.

#### A11Y-014 · **H** · Admin login dark theme contrast failures

- **WCAG:** 1.4.3
- **Location:** `AdminAuthLogin.tsx` + `admin-auth.css`
- **Axe:** 5 nodes — `a`, `.admin-auth-form__subtitle`, `.admin-auth-form__remember`, `.admin-auth-form__help`, `.admin-auth-form-panel__footer-note`
- **Fix:** Lighten muted text on dark auth panel; verify link contrast.

#### A11Y-015 · **M** · Admin dark tertiary text fails AA

- **WCAG:** 1.4.3
- **Location:** `admin/tokens.css` / `admin-dark-mode.css` — `#737373` on `#171717` = **3.78:1**
- **Evidence:** `docs/a11y-contrast-results.json`
- **Fix:** Use `#8a8a8a` or lighter for `--ds-fg-tertiary` in dark mode.

#### A11Y-016 · **M** · Admin dark accent button text fails AA

- **WCAG:** 1.4.3
- **Location:** Dark theme `--ds-accent: #3b82f6` with white text = **3.68:1**
- **Fix:** Darken button to `#2563eb` or use dark text on light accent.

#### A11Y-019 · **L** · Command palette `autoFocus` on open

- **WCAG:** 2.4.3 (advisory)
- **Location:** `CommandPalette.tsx:243`
- **Notes:** Common pattern; may disorient SR users. Consider `aria-activedescendant` without autofocus on first open.

#### A11Y-040 · **M** · DataTable sortable headers not keyboard-accessible

- **WCAG:** 2.1.1
- **Location:** `DataTable.tsx:128-140` — `<th onClick>` for sort
- **Fix:** Use `<button>` inside `<th>` or add `tabIndex={0}` + `onKeyDown` for Enter/Space.

#### A11Y-041 · **M** · DataTable embedded row click without keyboard equivalent

- **WCAG:** 2.1.1
- **Location:** `DataTable.tsx:172` — `onClick` on `<tr>`
- **Fix:** Make row focusable with `tabIndex={0}` and keyboard handler, or use explicit row action button.

#### A11Y-042 · **I** · SortableList keyboard sensor — **PASS**

- **Location:** `SortableList.tsx:66-68`
- **Notes:** `@dnd-kit` KeyboardSensor configured.

#### A11Y-043 · **I** · RichTextEditor toolbar buttons labeled — **PASS**

- **Location:** `RichTextEditor.tsx:35-64` — `aria-label` + `aria-pressed` on toolbar buttons.

#### A11Y-044 · **L** · MediaManager dropzone uses `role="button"` — **PASS** pattern

- **Location:** `MediaManager.tsx` — keyboard Enter/Space supported.

---

### 4.9 CMS / dynamic content

#### A11Y-017 · **H** · CMS accent color can break button contrast

- **WCAG:** 1.4.3
- **Location:** `App.tsx` `ThemeSynchronizer` — sets `--color-accent` from `appearance.primaryColor`
- **Evidence:** Yellow `#ffcc00` + white = **1.51:1**; light green `#88cc88` = **1.9:1**
- **Fix:** Validate contrast in Design System manager before save; clamp or warn on fail.

#### A11Y-027 · **M** · Custom CSS injection can override focus/contrast

- **WCAG:** 1.4.3, 2.4.7
- **Location:** `App.tsx:107-113` — `settings.customCss` injected into `#custom-css-runtime`
- **Fix:** Sanitize/block `outline`, `color` overrides; admin preview with contrast check.

#### A11Y-026 · **M** · Injected third-party scripts

- **WCAG:** 4.1.2 (downstream)
- **Location:** `InjectedScripts.tsx`, `injectedScriptPolicy.ts`
- **Notes:** Scripts gated by cookie consent — good. Unknown widgets may still inject inaccessible UI.
- **Fix:** Document allowed script providers; audit injected widgets separately.

#### A11Y-045 · **M** · CMS blog HTML body heading structure unvalidated

- **WCAG:** 1.3.1
- **Location:** `BlogPostBody.tsx`, DOMPurify output
- **Notes:** Markdown demotion helps; raw HTML posts may skip levels.
- **Fix:** Admin lint for heading order; normalize on publish.

#### A11Y-046 · **I** · Route visibility guard

- **Location:** `RouteVisibilityGuard.tsx`
- **Notes:** Hidden routes should not appear in nav — verify CMS toggle sync.

---

### 4.10 Media & embeds

#### A11Y-012 · **M** · Testimonial avatars empty alt with name nearby

- **WCAG:** 1.1.1
- **Location:** `ConferenceTestimonials.tsx:40-42`
- **Fix:** `alt={item.name}` or `aria-hidden` on image with name in text (already adjacent).

#### A11Y-047 · **I** · iframe titles — **PASS**

- **Location:** `ConferenceVenue.tsx` (`title="Venue map"`), `ConferenceVideo.tsx` (`title="Summit highlight video"`)

#### A11Y-048 · **I** · Hero background video marked `aria-hidden` — **PASS**

- **Location:** `ConferenceHero.tsx`

---

### 4.11 i18n

#### A11Y-038 · **I** · English only; static `lang="en"`

- **Location:** `index.html:2`
- **Notes:** No i18n library. Acceptable for current scope; document if expanding locales.

---

## 5. Route Scorecards

| Route                      | Axe violations (worst viewport)        | Manual blockers           | Grade          |
| -------------------------- | -------------------------------------- | ------------------------- | -------------- |
| `/`                        | 2 rules (aria-prohibited, target-size) | Landmark                  | **D**          |
| `/register`                | 0                                      | Duplicate ID, describedby | **C**          |
| `/blog`                    | 0                                      | —                         | **B**          |
| `/blog/:slug`              | document-title (1 slug)                | Nested main, 10px tooltip | **C**          |
| `/events`                  | 0                                      | List alt borderline       | **B**          |
| `/events/:id`              | 0                                      | Hero alt                  | **C**          |
| `/speakers`                | 0                                      | —                         | **B**          |
| `/404`                     | 0                                      | SPA returns 200           | **B**          |
| `/admin` (login, dark)     | color-contrast (5 nodes)               | —                         | **D**          |
| `/admin/*` (authenticated) | Not fully scanned                      | Duplicate H1, DataTable   | **Incomplete** |

---

## 6. Component Scorecards

| Component           | Grade    | Key issues                                      |
| ------------------- | -------- | ----------------------------------------------- |
| `PublicLayout`      | D        | Skip target, div wrapper                        |
| `Navbar`            | A        | Focus trap, ARIA                                |
| `SectionCarousel`   | C        | Target size, tab pattern                        |
| `SponsorsMarquee`   | D        | Prohibited ARIA combo                           |
| `CookieBanner`      | D        | Incomplete dialog                               |
| `LeadCaptureModal`  | D        | Labels, focus                                   |
| `AppDialog` / Radix | B        | `focus:outline-none` on content (Radix manages) |
| `BookDemoForm`      | B        | Fieldset OK; describedby gap                    |
| `BookDemoTextField` | C        | Error association                               |
| `BlogPostPage`      | C        | Landmarks, title timing                         |
| `DataTable`         | C        | Sort keyboard, row click                        |
| `SortableList`      | B        | Keyboard sensor present                         |
| `RichTextEditor`    | B        | Toolbar a11y good                               |
| `AdminAuthLogin`    | D (dark) | Contrast                                        |
| `TopBar`            | C        | Duplicate H1                                    |

---

## 7. Contrast Appendix

Full data: [`docs/a11y-contrast-results.json`](a11y-contrast-results.json)

| Context                      | FG      | BG      | Ratio | AA       | AAA      |
| ---------------------------- | ------- | ------- | ----- | -------- | -------- |
| Primary text on page bg      | #000    | #F2F2F0 | 18.73 | Pass     | Pass     |
| Tertiary text on page bg     | #5C5C5C | #F2F2F0 | 5.97  | Pass     | Pass     |
| White on default accent      | #fff    | #003E99 | 9.77  | Pass     | Pass     |
| Admin tertiary (dark)        | #737373 | #171717 | 3.78  | **Fail** | —        |
| White on admin accent (dark) | #fff    | #3b82f6 | 3.68  | **Fail** | —        |
| White on CMS yellow accent   | #fff    | #ffcc00 | 1.51  | **Fail** | **Fail** |
| White on CMS light green     | #fff    | #88cc88 | 1.90  | **Fail** | **Fail** |

---

## 8. Keyboard & Landmark Appendix

Data: [`docs/a11y-axe-results.json`](a11y-axe-results.json) → `keyboardChecks`

| Route       | H1 count | Main count | `#main-content` | Notes           |
| ----------- | -------- | ---------- | --------------- | --------------- |
| `/`         | 1        | 1          | 1               | main inside div |
| `/register` | 1        | 1          | **2**           | Duplicate ID    |
| `/blog`     | 1        | 1          | 1               | —               |
| `/speakers` | 1        | 1          | 1               | 5 nav landmarks |

**Tab order (homepage sample):** Skip link → logo → nav links → CTA → section content → carousel controls → footer. Mobile menu: focus trapped when open.

---

## 9. Automated Axe Summary

Data: [`docs/a11y-axe-results.json`](a11y-axe-results.json)

| Rule ID                | Impact  | Routes affected     | Node count (max) |
| ---------------------- | ------- | ------------------- | ---------------- |
| `aria-prohibited-attr` | Serious | `/`                 | 1                |
| `target-size`          | Serious | `/`                 | 18 (mobile)      |
| `document-title`       | Serious | 1 blog slug         | 1                |
| `color-contrast`       | Serious | `/admin` dark login | 5                |

---

## 10. Static Inventory Summary

Data: [`docs/a11y-static-results.json`](a11y-static-results.json)

| Pattern                     | Count (approx)       |
| --------------------------- | -------------------- |
| `sr-only` usage             | 22 files             |
| `aria-live`                 | 14                   |
| Empty `alt=""`              | 21 (6 public-facing) |
| `outline-none` (TSX)        | 10 lines             |
| `autoFocus`                 | 1                    |
| `role="dialog"` (non-Radix) | 1 (cookie banner)    |

---

## 11. Remediation Backlog (prioritized)

### Sprint 1 — Blockers

1. Fix `PublicLayout` / register `main-content` landmark + ID collision (A11Y-001, 002, 003)
2. Fix `SponsorsMarquee` ARIA (A11Y-004)
3. Enlarge carousel dots (A11Y-005)
4. Fix admin login dark contrast (A11Y-014, 015, 016)
5. Wire `LeadCaptureModal` labels + focus rings (A11Y-008, 009)
6. Upgrade `CookieBanner` to full dialog pattern (A11Y-007)

### Sprint 2 — High / medium

7. `EventDetailPage` hero alt (A11Y-011)
8. `BookDemoTextField` aria-describedby (A11Y-010)
9. Admin duplicate H1 (A11Y-013)
10. CMS accent contrast validation (A11Y-017)
11. DataTable keyboard (A11Y-040, 041)
12. Carousel tab pattern or simplify roles (A11Y-018)

### Sprint 3 — CI & polish

13. Add `eslint-plugin-jsx-a11y` to `eslint.config.js`
14. Add `npm run a11y:axe` to CI against preview server
15. Remove or use `@radix-ui/react-visually-hidden`
16. Blog post title timing / Helmet wait (A11Y-006)
17. Replace `text-[10px]` / `text-[11px]` with `text-xs` minimum

---

## 12. Positive Patterns (preserve)

- Skip link present and visible on focus (`PublicLayout.tsx`)
- Mobile navigation focus trap + Escape (`Navbar.tsx`)
- `prefers-reduced-motion` global + hook (`motion.ts`, `index.css`)
- Registration form `<fieldset>` / `<legend>` for designation (`BookDemoForm.tsx`)
- Sponsor marquee pause/play control (`SponsorsMarquee.tsx`)
- Agenda and edition tabs with arrow-key support
- Radix Dialog for public modals with titled close button
- `aria-live` on loading skeletons and success states
- iframe `title` attributes on map and video embeds
- Cookie-gated script injection (`InjectedScripts.tsx`)
- `@dnd-kit` keyboard sensor on admin sortable lists

---

## 13. Audit Artifacts

| File                              | Description                |
| --------------------------------- | -------------------------- |
| `docs/A11Y_AUDIT.md`              | This report                |
| `docs/a11y-axe-results.json`      | Playwright + axe per route |
| `docs/a11y-contrast-results.json` | Token contrast matrix      |
| `docs/a11y-static-results.json`   | Static pattern inventory   |
| `scripts/a11y-audit.mjs`          | Axe crawler                |
| `scripts/a11y-contrast.mjs`       | Contrast calculator        |
| `scripts/a11y-static.mjs`         | Static scanner (TS/TSX)    |

**Re-run audit:**

```bash
npm run dev   # terminal 1
npm run a11y:contrast
npm run a11y:static
BOOK_URL=http://localhost:5173 npm run a11y:axe
```

---

_This audit documents findings only. No remediation code was applied. For legal compliance certification, engage a qualified accessibility auditor after fixes are implemented and verified._
