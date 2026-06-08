import type { ConferenceLogo } from './websiteData'

const FEATURED_TIER_KEYS = new Set([
  'platinum',
  'diamond',
  'premier',
  'presenting',
  'title',
  'gold',
])

function isFeaturedTier(tier?: string): boolean {
  const normalized = tier?.trim().toLowerCase() ?? ''
  if (!normalized) return false
  if (FEATURED_TIER_KEYS.has(normalized)) return true
  return /platinum|diamond|premier|presenting|title|gold/i.test(normalized)
}

export type PartitionedSponsors = {
  featured: ConferenceLogo[]
  marquee: ConferenceLogo[]
}

/** Split sponsors into a static featured row and a supporting marquee strip. */
export function partitionSponsors(logos: ConferenceLogo[]): PartitionedSponsors {
  if (logos.length === 0) {
    return { featured: [], marquee: [] }
  }

  const featuredByTier = logos.filter((logo) => isFeaturedTier(logo.tier))
  if (featuredByTier.length > 0) {
    const featuredIds = new Set(featuredByTier.map((logo) => logo.id))
    return {
      featured: featuredByTier,
      marquee: logos.filter((logo) => !featuredIds.has(logo.id)),
    }
  }

  if (logos.length <= 4) {
    return { featured: logos, marquee: [] }
  }

  return {
    featured: logos.slice(0, 3),
    marquee: logos.slice(3),
  }
}

/** Repeat sponsors until the row is wide enough for ultra-wide viewports. */
export function repeatForMarquee(logos: ConferenceLogo[], minCount = 14): ConferenceLogo[] {
  if (logos.length === 0) return []
  const out: ConferenceLogo[] = []
  while (out.length < minCount) {
    out.push(...logos)
  }
  return out
}
