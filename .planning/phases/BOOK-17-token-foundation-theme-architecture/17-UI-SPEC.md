# Phase 17 — UI Design Contract

**Phase:** Token Foundation & Theme Architecture  
**Source:** Chain auto-fill from `17-CONTEXT.md` (discuss-phase decisions)

## Visual direction

- **Light canvas:** Cool neutral ~`#F5F5F7` (not warm greige).
- **Dark canvas:** Stepped Apple-like ~`#1C1C1E` for body; elevated surfaces slightly lighter.
- **Typography color (light):** Primary text ~`#1D1D1F` (not pure black).
- **Elevation:** Hairline borders, minimal shadow ladder (Apple-minimal).

## Dark mode

- **Mechanism:** `class="dark"` on `<html>` via `next-themes`; `<meta name="color-scheme" content="light dark">`.
- **CMS:** `colorScheme`: `light` \| `dark` \| `system` (default `system`).
- **Precedence:** CMS `light`/`dark` forces theme (`forcedTheme`). CMS `system` allows visitor storage + OS when Phase 21 toggle ships; until then, OS + storage only.
- **Glass:** Nav — lower blur + stronger hairline in dark; cards — subtle frosted dark; modals — dim scrim (~60% black) over surface token. At most **one** `backdrop-filter` above the fold.

## Components (this phase)

- **In scope:** Global shell (`App` root), `body`, shared `@utility` glass tokens, Design System control for `colorScheme`.
- **Out of scope:** Per-section marketing polish (Phase 19), prerender HTML parity (Phase 22).

## Accessibility

- Focus rings unchanged or improved; no reliance on color alone for primary actions.
- `prefers-reduced-motion` unchanged from Phase 16 baseline.

## References

- `.planning/phases/BOOK-17-token-foundation-theme-architecture/17-CONTEXT.md` — authoritative decisions (D-17-\*).
