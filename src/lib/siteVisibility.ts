import type { SiteSettings } from './websiteData'

export type SummitVisibilityKey = keyof Pick<
  SiteSettings['visibility'],
  'showcase' | 'blog' | 'events' | 'finalCta' | 'footer'
>

/** Embedded blocks on the summit homepage (/) */
export const SUMMIT_EMBEDDED_VISIBILITY_KEYS = [
  'showcase',
  'blog',
  'events',
  'finalCta',
  'footer',
] as const satisfies readonly SummitVisibilityKey[]

export const SUMMIT_VISIBILITY_META: Record<
  SummitVisibilityKey,
  { label: string; description: string }
> = {
  showcase: {
    label: 'Book showcase',
    description: '3D book section with title, abstract, and CTAs.',
  },
  blog: {
    label: 'Blog preview',
    description: 'Latest published articles with link to /blog.',
  },
  events: {
    label: 'Events preview',
    description: 'Upcoming events timeline with link to /events.',
  },
  finalCta: {
    label: 'Final CTA',
    description: 'Waitlist / register block before the footer.',
  },
  footer: {
    label: 'Footer',
    description: 'Site footer with links and social icons.',
  },
}

export const CONFERENCE_SECTION_VISIBILITY_META = {
  hero: { label: 'Hero', description: 'Summit hero with video and register CTA.' },
  countdown: { label: 'Countdown', description: 'Timer to event start (requires event date).' },
  speakers: { label: 'Speakers', description: 'Speaker grid.' },
  video: { label: 'Feature video', description: 'Secondary video section.' },
  agenda: { label: 'Agenda', description: 'Schedule / sessions.' },
  sponsors: { label: 'Sponsors', description: 'Sponsor logos.' },
  partners: { label: 'Partners', description: 'Partner logos.' },
  testimonials: { label: 'Testimonials', description: 'Attendee quotes.' },
  pastSpeakers: { label: 'Past speakers', description: 'Alumni speaker highlights from prior summits.' },
  venue: { label: 'Venue', description: 'Location and map.' },
  tickets: { label: 'Tickets', description: 'Pricing tiers.' },
  faq: { label: 'FAQ', description: 'Questions and answers.' },
} as const
