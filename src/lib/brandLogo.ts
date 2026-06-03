import {
  CONFERENCE_HERO_LOGO_MEDIA,
  CONFERENCE_HERO_LOGO_PUBLIC,
} from './conferenceDefaults'
import { resolveMediaUrl } from './assetUrl'

const LEGACY_NAV_LOGO_PATHS = new Set([
  '/favicon.svg',
  '/icons.svg',
  '/assets/book-cover.png',
  '/og-image.jpg',
])

/** CMS paths that should not be used as the navbar mark. */
export function resolveNavbarBrandLogoPath(cmsUrl?: string | null): string {
  const trimmed = cmsUrl?.trim()
  if (!trimmed || LEGACY_NAV_LOGO_PATHS.has(trimmed)) {
    return CONFERENCE_HERO_LOGO_MEDIA
  }
  return trimmed
}

export function getNavbarLogoSrc(cmsUrl?: string | null): string {
  return resolveMediaUrl(resolveNavbarBrandLogoPath(cmsUrl), CONFERENCE_HERO_LOGO_PUBLIC)
}

export const BRAND_LOGO_FAVICON = CONFERENCE_HERO_LOGO_PUBLIC
