import type { ConferenceSpeaker } from './websiteData'

export const SPEAKERS_CATALOG_PAGE_SIZE = 12

export type SpeakerCatalogFilter = 'all' | 'featured'
export type SpeakerSort = 'featured-first' | 'name-asc' | 'name-desc' | 'company-asc'
export type SpeakerViewMode = 'grid' | 'list'

export function isPublishableSpeaker(speaker: ConferenceSpeaker): boolean {
  return Boolean(speaker.name?.trim())
}

export function getPublishableSpeakers(speakers: ConferenceSpeaker[]): ConferenceSpeaker[] {
  return speakers.filter(isPublishableSpeaker)
}

/**
 * Speakers shown on the summit homepage carousel.
 * Only explicitly featured speakers appear — no fallback to the full roster.
 */
export function getFeaturedSpeakers(speakers: ConferenceSpeaker[]): ConferenceSpeaker[] {
  return getPublishableSpeakers(speakers).filter((speaker) => speaker.featured === true)
}

/** Homepage carousel — curated IDs, featured flag, optional max cap. */
export function getHomepageSpeakers(
  speakers: ConferenceSpeaker[],
  options?: { homepageSpeakerIds?: string[]; maxFeatured?: number },
): ConferenceSpeaker[] {
  const publishable = getPublishableSpeakers(speakers)
  const ids = options?.homepageSpeakerIds?.filter(Boolean) ?? []

  let list: ConferenceSpeaker[]
  if (ids.length > 0) {
    const byId = new Map(publishable.map((speaker) => [speaker.id, speaker]))
    list = ids.map((id) => byId.get(id)).filter((speaker): speaker is ConferenceSpeaker => Boolean(speaker))
  } else {
    list = getFeaturedSpeakers(speakers)
  }

  const max = options?.maxFeatured
  if (typeof max === 'number' && max > 0) {
    return list.slice(0, max)
  }
  return list
}

export function getCatalogPageSize(settingsPageSize: number | undefined, fallback: number): number {
  const size = settingsPageSize ?? fallback
  return size > 0 ? size : fallback
}

export function countFeaturedSpeakers(speakers: ConferenceSpeaker[]): number {
  return getPublishableSpeakers(speakers).filter((speaker) => speaker.featured).length
}

export function getSpeakerCompanies(speakers: ConferenceSpeaker[]): string[] {
  const companies = new Set<string>()
  for (const speaker of getPublishableSpeakers(speakers)) {
    const company = speaker.company?.trim()
    if (company) companies.add(company)
  }
  return [...companies].sort((a, b) => a.localeCompare(b))
}

export function sortSpeakers(
  speakers: ConferenceSpeaker[],
  sort: SpeakerSort,
): ConferenceSpeaker[] {
  const list = [...getPublishableSpeakers(speakers)]

  switch (sort) {
    case 'name-asc':
      return list.sort((a, b) => a.name.localeCompare(b.name))
    case 'name-desc':
      return list.sort((a, b) => b.name.localeCompare(a.name))
    case 'company-asc':
      return list.sort((a, b) => {
        const companyCompare = (a.company || '').localeCompare(b.company || '')
        return companyCompare !== 0 ? companyCompare : a.name.localeCompare(b.name)
      })
    case 'featured-first':
    default:
      return list.sort((a, b) => {
        const featuredDelta = Number(b.featured) - Number(a.featured)
        return featuredDelta !== 0 ? featuredDelta : a.name.localeCompare(b.name)
      })
  }
}

export function filterSpeakers(
  speakers: ConferenceSpeaker[],
  options: {
    query: string
    filter: SpeakerCatalogFilter
    company?: string
  },
): ConferenceSpeaker[] {
  const q = options.query.trim().toLowerCase()
  let list = getPublishableSpeakers(speakers)

  if (options.filter === 'featured') {
    list = list.filter((speaker) => speaker.featured)
  }

  const company = options.company?.trim()
  if (company && company !== 'all') {
    list = list.filter((speaker) => speaker.company?.trim() === company)
  }

  if (!q) return list

  return list.filter((speaker) => {
    const haystack = [
      speaker.name,
      speaker.title,
      speaker.company,
      speaker.talkTitle,
      speaker.bio,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(q)
  })
}
