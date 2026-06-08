import { describe, expect, it } from 'vitest'
import { resolveSpeakerForSession } from './agenda'
import type { ConferenceAgendaSession, ConferenceSpeaker } from './websiteData'

const speakers: ConferenceSpeaker[] = [
  {
    id: 's1',
    name: 'Dr. Sarah Chen',
    title: 'Chief AI Scientist',
    company: 'GlobalTech',
    image: '',
    featured: true,
  },
  {
    id: 's4',
    name: 'David Kim',
    title: 'Founder & CEO',
    company: 'NeuralNet',
    image: '',
  },
]

describe('resolveSpeakerForSession', () => {
  it('resolves by speakerId when set', () => {
    const session: ConferenceAgendaSession = {
      id: 'sess-1',
      time: '09:00 AM',
      title: 'Keynote',
      speaker: 'David Kim, NeuralNet',
      track: 'Main Stage',
      speakerId: 's4',
    }

    expect(resolveSpeakerForSession(session, speakers)?.id).toBe('s4')
  })

  it('falls back to speaker label when speakerId is missing', () => {
    const session: ConferenceAgendaSession = {
      id: 'sess-2',
      time: '10:30 AM',
      title: 'Workshop',
      speaker: 'Dr. Sarah Chen, GlobalTech',
      track: 'Enterprise',
    }

    expect(resolveSpeakerForSession(session, speakers)?.id).toBe('s1')
  })

  it('returns null when no match exists', () => {
    const session: ConferenceAgendaSession = {
      id: 'sess-3',
      time: '11:00 AM',
      title: 'Panel',
      speaker: 'Guest Panel',
      track: 'Main Stage',
      speakerId: 'missing',
    }

    expect(resolveSpeakerForSession(session, speakers)).toBeNull()
  })
})
