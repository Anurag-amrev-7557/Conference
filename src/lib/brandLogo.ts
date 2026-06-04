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

/** Cloudinary uploads with extension in public_id produce broken …/id.png.png URLs. */
export function isBrokenBrandLogoUrl(url: string): boolean {
  return /\.(png|jpe?g|webp)\.(png|jpe?g|webp)(\?|#|$)/i.test(url)
}

/** CMS paths that should not be used as the navbar mark. */
export function resolveNavbarBrandLogoPath(cmsUrl?: string | null): string {
  const trimmed = cmsUrl?.trim()
  if (!trimmed || LEGACY_NAV_LOGO_PATHS.has(trimmed) || isBrokenBrandLogoUrl(trimmed)) {
    return CONFERENCE_HERO_LOGO_MEDIA
  }
  return trimmed
}

export function getNavbarLogoSrc(cmsUrl?: string | null): string {
  return resolveMediaUrl(resolveNavbarBrandLogoPath(cmsUrl), CONFERENCE_HERO_LOGO_PUBLIC)
}

export const BRAND_LOGO_FAVICON = CONFERENCE_HERO_LOGO_PUBLIC
