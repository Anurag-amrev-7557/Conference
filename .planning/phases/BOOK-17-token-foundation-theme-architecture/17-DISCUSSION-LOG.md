# Phase 17: Token Foundation & Theme Architecture - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.  
> Decisions are captured in `17-CONTEXT.md`.

**Date:** 2026-05-19  
**Phase:** 17-Token Foundation & Theme Architecture  
**Areas discussed:** Apple-minimal neutrals, Theme precedence, CMS dark strategy, First paint / FOUC, Glass & shadows in dark, Phase 17 boundary

---

## Apple-minimal neutrals

| Option | Description | Selected |
|--------|-------------|----------|
| Cool Apple-style | ~`#F5F5F7` canvas | ✓ |
| Warm | Keep `#F2F2F0` / off | |
| White | `#FAFAFA` / `#FFFFFF` | |

| Option | Description | Selected |
|--------|-------------|----------|
| Apple stepped | ~`#1C1C1E` ladder | ✓ |
| True black | `#000000` | |
| Soft dark | `#121212` | |

| Option | Description | Selected |
|--------|-------------|----------|
| Soft black | ~`#1D1D1F` primary text on light | ✓ |
| Pure black | `#000` / `#0A0A0A` | |

| Option | Description | Selected |
|--------|-------------|----------|
| Hairline | Hairline borders, minimal shadow | ✓ |
| Soft shadow | Stronger borders + soft ladder | |

**Notes:** User advanced after neutrals block — no extra follow-ups.

---

## Theme precedence

| Option | Description | Selected |
|--------|-------------|----------|
| CMS always wins | No visitor override | |
| Visitor wins | Toggle overrides CMS | |
| Hybrid | CMS light/dark locks; system allows visitor override (Phase 21) | ✓ (via "you decide" → Claude locked hybrid) |

| Option | Description | Selected |
|--------|-------------|----------|
| Yes force dark | CMS `dark` forces dark even if OS light | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| Preview isolated | Preview ignores visitor storage | ✓ (via "You decide" → Claude) |
| Preview mirrors | Same rules as production | |

| Option | Description | Selected |
|--------|-------------|----------|
| system | Default `colorScheme` | ✓ |
| light | Default light | |

**User's choice:** Hybrid precedence + force dark + isolated preview + default system.

---

## CMS dark strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed neutrals | CSS ladder; CMS does not tint neutrals | ✓ |
| Derive | Tint neutrals from primary | |

| Option | Description | Selected |
|--------|-------------|----------|
| keep_algo | Keep `darkenColor` → `--color-accent2` | ✓ |
| token_pair | New on-dark accent token | |

| Option | Description | Selected |
|--------|-------------|----------|
| as_is | customCss both themes as-is | ✓ |
| light_only | Document light-first only | |

| Option | Description | Selected |
|--------|-------------|----------|
| defer | No admin dark palette pickers v1.2 | ✓ |

---

## First paint / FOUC

| Option | Description | Selected |
|--------|-------------|----------|
| Phase 17 only | Client boot; prerender Phase 22 | ✓ |
| Both | Also prerender in Phase 17 | |

| Option | Description | Selected |
|--------|-------------|----------|
| match_tokens | Static bg matches cool canvas | ✓ |
| keep_white | White until JS | |

| Option | Description | Selected |
|--------|-------------|----------|
| meta | Add `color-scheme` meta | ✓ |
| defer_meta | Defer | |

| Option | Description | Selected |
|--------|-------------|----------|
| class | `class` on `<html>` | ✓ |
| data_attr | `data-theme` only | |

---

## Glass & shadows in dark

| Option | Description | Selected |
|--------|-------------|----------|
| blur_border | Nav: blur + stronger hairline + lower blur radius | ✓ |
| solid_nav | Mostly solid nav | |

| Option | Description | Selected |
|--------|-------------|----------|
| glass_card | Frosted glass on content cards | ✓ |
| elevated | Solid elevated cards | |

| Option | Description | Selected |
|--------|-------------|----------|
| dim | Dim scrim + surface panel | ✓ |
| heavy | Heavy blur scrim | |

| Option | Description | Selected |
|--------|-------------|----------|
| cap_one | One above-fold `backdrop-filter` max | ✓ |
| cap_two | Allow two | |

---

## Phase 17 boundary

| Option | Description | Selected |
|--------|-------------|----------|
| yes_shell | App shell + body → semantic tokens in Phase 17 | ✓ |
| defer_shell | Defer to Phase 19 | |

| Option | Description | Selected |
|--------|-------------|----------|
| utilities_only | Global tokens/utilities; pages Phase 19 | ✓ |
| sweep_hotspots | Also migrate navbar/modals if quick | |

| Option | Description | Selected |
|--------|-------------|----------|
| yes_dsm | DesignSystemManager colorScheme in Phase 17 | ✓ |
| defer_dsm | Defer admin UI | |

| Option | Description | Selected |
|--------|-------------|----------|
| yes_api | Prisma/API persist in Phase 17 | ✓ |
| client_only | Client default only | |

---

## Claude's Discretion

- **D-17-05:** User picked "you decide" for CMS vs visitor — locked **hybrid** (see CONTEXT).
- **D-17-07:** User picked "You decide" for LivePreview — locked **isolated from visitor storage**.

## Deferred Ideas

(none outside phase — prerender parity and page polish explicitly deferred per user + roadmap)
