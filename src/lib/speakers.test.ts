import { describe, expect, it } from 'vitest'
import { getFeaturedSpeakers } from './speakers'
import type { ConferenceSpeaker } from './websiteData'

function speaker(id: string, featured?: boolean): ConferenceSpeaker {
  return {
    id,
    name: `Speaker ${id}`,
    title: 'CTO',
    company: 'Acme',
    image: '',
    featured,
  }
}

describe('getFeaturedSpeakers', () => {
  it('returns only explicitly featured speakers', () => {
    const roster = [
      speaker('s1', true),
      speaker('s2', false),
      speaker('s3', true),
      speaker('s4'),
      speaker('s5', true),
    ]

    expect(getFeaturedSpeakers(roster).map((s) => s.id)).toEqual(['s1', 's3', 's5'])
  })

  it('does not fall back to the first four when none are featured', () => {
    const roster = [speaker('s1'), speaker('s2'), speaker('s3'), speaker('s4'), speaker('s5')]

    expect(getFeaturedSpeakers(roster)).toEqual([])
  })

  it('caps at four featured speakers while preserving CMS order', () => {
    const roster = [
      speaker('s1', true),
      speaker('s2', true),
      speaker('s3', true),
      speaker('s4', true),
      speaker('s5', true),
      speaker('s6', true),
    ]

    expect(getFeaturedSpeakers(roster).map((s) => s.id)).toEqual(['s1', 's2', 's3', 's4'])
  })
})
