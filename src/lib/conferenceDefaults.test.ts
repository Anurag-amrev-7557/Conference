import { describe, expect, it } from 'vitest'
import { mergeConferenceContent } from './conferenceDefaults'

describe('mergeConferenceContent', () => {
  it('preserves video section metrics from patch', () => {
    const merged = mergeConferenceContent({
      sections: {
        video: {
          metrics: [
            { id: 'vm1', value: '99+', label: 'Labs' },
            { id: 'vm2', value: '12', label: 'Tracks' },
          ],
        },
      },
    })

    expect(merged.sections.video?.metrics).toEqual([
      { id: 'vm1', value: '99+', label: 'Labs' },
      { id: 'vm2', value: '12', label: 'Tracks' },
    ])
  })

  it('preserves featured speakers from patch', () => {
    const merged = mergeConferenceContent({
      speakers: [
        {
          id: 'sp-1',
          name: 'Alex Rivera',
          title: 'CTO',
          company: 'Acme',
          image: '',
          featured: true,
        },
      ],
    })

    expect(merged.speakers[0]?.featured).toBe(true)
  })

  it('keeps default video metrics when patch metrics are empty', () => {
    const merged = mergeConferenceContent({
      sections: {
        video: {
          metrics: [],
        },
      },
    })

    expect((merged.sections.video?.metrics?.length ?? 0)).toBeGreaterThan(0)
  })
})
