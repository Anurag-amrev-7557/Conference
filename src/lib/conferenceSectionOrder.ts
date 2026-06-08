import type { ConferenceSectionId, EmbeddedBlockId } from './websiteData'

export const DEFAULT_CONFERENCE_SECTION_ORDER: ConferenceSectionId[] = [
  'countdown',
  'speakers',
  'video',
  'agenda',
  'sponsors',
  'partners',
  'testimonials',
  'venue',
  'tickets',
  'faq',
]

export const DEFAULT_EMBEDDED_BLOCK_ORDER: EmbeddedBlockId[] = [
  'showcase',
  'blog',
  'events',
  'finalCta',
]

export function resolveSectionOrder(order: ConferenceSectionId[] | undefined): ConferenceSectionId[] {
  const base = order?.length ? [...order] : [...DEFAULT_CONFERENCE_SECTION_ORDER]
  for (const id of DEFAULT_CONFERENCE_SECTION_ORDER) {
    if (!base.includes(id)) base.push(id)
  }
  return base
}

export function resolveEmbeddedBlockOrder(order: EmbeddedBlockId[] | undefined): EmbeddedBlockId[] {
  const base = order?.length ? [...order] : [...DEFAULT_EMBEDDED_BLOCK_ORDER]
  for (const id of DEFAULT_EMBEDDED_BLOCK_ORDER) {
    if (!base.includes(id)) base.push(id)
  }
  return base
}
