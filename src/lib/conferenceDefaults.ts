import type {
  ConferenceContent,
  ConferenceHeroContent,
  ConferenceSectionCopy,
  ConferenceSectionVisibility,
  ConferenceTicketsContent,
  ConferenceVideoContent,
} from './websiteData'
import { normalizeSpeakers } from './speakers'

export const DEFAULT_CONFERENCE_SECTION_VISIBILITY: Required<ConferenceSectionVisibility> = {
  hero: true,
  countdown: true,
  speakers: true,
  video: true,
  agenda: true,
  sponsors: true,
  partners: true,
  testimonials: true,
  pastSpeakers: true,
  venue: true,
  tickets: true,
  faq: true,
}

export type ConferenceSectionVisibilityKey = keyof ConferenceSectionVisibility

export function conferenceSectionVisible(
  visibility: ConferenceSectionVisibility | undefined,
  key: ConferenceSectionVisibilityKey,
): boolean {
  return visibility?.[key] !== false
}

/** Persistent media paths (served from API /media after bootstrap). */
export const CONFERENCE_HERO_VIDEO_MEDIA = '/media/conference-hero.mp4'
export const CONFERENCE_HERO_LOGO_MEDIA = '/media/superhumanly-logo.png'

/** Static fallbacks shipped with the frontend (dev / first load before API bootstrap). */
export const CONFERENCE_HERO_VIDEO_PUBLIC = encodeURI('/Conference Video 1920x1080.mp4')
export const CONFERENCE_HERO_LOGO_PUBLIC = encodeURI('/Superhumanly AI Logo.png')

export const CONFERENCE_HERO_VIDEO = CONFERENCE_HERO_VIDEO_MEDIA
export const CONFERENCE_HERO_LOGO = CONFERENCE_HERO_LOGO_MEDIA

export const DEFAULT_CONFERENCE_VIDEO = CONFERENCE_HERO_VIDEO_MEDIA

export const DEFAULT_CONFERENCE_POSTER =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1920&q=80'

export const defaultConferenceTickets: ConferenceTicketsContent = {
  eyebrow: 'Passes',
  title: 'Secure Your Spot',
  lede: 'Choose the pass that best fits your goals.',
  tiers: [
    {
      id: 'tier-ga',
      name: 'General Admission',
      price: '$995',
      description: 'Full access to all keynote sessions and exhibition floor.',
      features: [
        'Access to all 2 days of content',
        'Entry to the exhibition hall',
        'Standard networking events',
        'On-demand video recordings (30 days)',
      ],
      recommended: false,
      ctaLabel: 'Get Tickets',
    },
    {
      id: 'tier-vip',
      name: 'VIP Experience',
      price: '$1,895',
      description: 'The ultimate conference experience with exclusive perks.',
      features: [
        'Everything in General Admission',
        'Priority seating at keynotes',
        'Exclusive VIP lounge access',
        'Private speaker meet & greet',
        'Lifetime access to recordings',
      ],
      recommended: true,
      ctaLabel: 'Get Tickets',
    },
  ],
}

export const CONFERENCE_HERO_LEDE =
  'Global AI summit for Tech Leaders, innovators, policymakers, small & big businesses unite to shape the future of Artificial Intelligence, workforce empowerment, and responsible innovation.'

export const defaultConferenceContent: ConferenceContent = {
  published: true,
  eventStartAt: '2026-10-14T09:00:00-07:00',
  eventTimezone: 'America/Los_Angeles',
  countdownEnabled: true,
  sectionVisibility: { ...DEFAULT_CONFERENCE_SECTION_VISIBILITY },
  venue: {
    eyebrow: 'Venue',
    title: 'Marymoor Park',
    lede: 'Redmond, Washington — an open-air setting built for keynotes, workshops, and high-signal networking.',
    address: '6046 West Lake Sammamish Pkwy NE, Redmond, WA 98052',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2689.0!2d-122.116!3d47.663!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54906c8c8c8c8c8d%3A0x0!2sMarymoor%20Park!5e0!3m2!1sen!2sus!4v1',
  },
  hero: {
    badge: 'Superhumanly AI',
    badgeLogoUrl: CONFERENCE_HERO_LOGO,
    title: 'Superhumanly AI',
    titleAccent: 'Summit 2026',
    lede: CONFERENCE_HERO_LEDE,
    dateLabel: 'October 14-15, 2026',
    locationLabel: 'Marymoor Park, Redmond',
    primaryCtaLabel: 'Register now',
    secondaryCtaLabel: 'See full agenda',
    videoUrl: DEFAULT_CONFERENCE_VIDEO,
    posterUrl: DEFAULT_CONFERENCE_POSTER,
    metrics: [
      { id: 'm1', value: '3,500+', label: 'Attendees' },
      { id: 'm2', value: '150+', label: 'Speakers' },
      { id: 'm3', value: '50+', label: 'Sessions' },
      { id: 'm4', value: '2', label: 'Days of Innovation' },
    ],
  },
  video: {
    eyebrow: 'Experience',
    title: 'The summit',
    titleAccent: 'in motion',
    lede:
      'Step inside the energy of Superhumanly Summit — keynotes, workshops, and the conversations that shape what ships next.',
    videoUrl: DEFAULT_CONFERENCE_VIDEO,
    posterUrl: DEFAULT_CONFERENCE_POSTER,
  },
  sections: {
    sponsors: {
      eyebrow: 'Sponsors',
      title: 'Our',
      titleAccent: 'sponsors',
      lede: 'Proudly supported by teams building the infrastructure and workflows behind modern AI.',
      ctaLabel: 'Become a sponsor',
    },
    video: {
      eyebrow: 'Experience',
      title: 'The summit',
      titleAccent: 'in motion',
      lede:
        'Step inside the energy of Superhumanly Summit — keynotes, workshops, and the conversations that shape what ships next.',
      ctaLabel: 'Register for the summit',
      caption:
        'Official summit highlight — keynotes, workshops, and the conversations that shape what ships next.',
      metrics: [
        { id: 'vm1', value: '3,500+', label: 'Attendees' },
        { id: 'vm2', value: '150+', label: 'Speakers' },
        { id: 'vm3', value: '50+', label: 'Sessions' },
      ],
    },
    speakers: {
      eyebrow: 'Summit Lineup',
      title: 'Featured',
      titleAccent: 'Speakers',
      lede: 'Innovators and leaders shaping the future of AI — on stage and in the room with you.',
      ctaLabel: 'Meet all speakers',
    },
    agenda: {
      eyebrow: 'Program',
      title: 'Agenda',
      lede: 'Two days. Zero fluff. Just the sessions worth your calendar.',
      ctaLabel: 'Download full agenda',
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Everything you need to know',
    },
    tickets: {
      eyebrow: 'Passes',
      title: 'Secure Your Spot',
      lede: 'Choose the pass that best fits your goals.',
    },
    partners: {
      eyebrow: 'Partners',
      title: 'Community',
      titleAccent: 'partners',
      lede: 'Organizations collaborating to make the summit possible.',
    },
    testimonials: {
      eyebrow: 'Voices',
      title: 'What attendees',
      titleAccent: 'are saying',
      lede: 'Leaders who have joined past summits share why the experience matters.',
    },
    pastSpeakers: {
      eyebrow: 'Summit lineage',
      title: 'Past',
      titleAccent: 'Speakers',
      lede: 'Leaders who have taken the Superhumanly stage — across editions.',
      ctaLabel: 'Explore the full archive',
      ctaHref: '/speakers?roster=past',
    },
  },
  tickets: defaultConferenceTickets,
  logos: [
    { id: 'l1', name: 'Acme Corp', tier: 'Platinum' },
    { id: 'l2', name: 'GlobalTech', tier: 'Platinum' },
    { id: 'l3', name: 'Innovate AI', tier: 'Gold' },
    { id: 'l4', name: 'Nexus Systems' },
    { id: 'l5', name: 'Quantum Data' },
    { id: 'l6', name: 'CloudScale' },
    { id: 'l7', name: 'FutureWorks' },
    { id: 'l8', name: 'LogicFlow' },
    { id: 'l9', name: 'NeuralNet' },
    { id: 'l10', name: 'Synergy' },
  ],
  partners: [],
  speakers: [
    {
      id: 's1',
      name: 'Dr. Sarah Chen',
      title: 'Chief AI Scientist',
      company: 'GlobalTech',
      featured: true,
      image:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 's2',
      name: 'Michael Rivera',
      title: 'VP of Engineering',
      company: 'Innovate AI',
      featured: true,
      image:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 's3',
      name: 'Elena Rostova',
      title: 'Director of Research',
      company: 'Quantum Data',
      featured: true,
      image:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 's4',
      name: 'David Kim',
      title: 'Founder & CEO',
      company: 'NeuralNet',
      featured: true,
      image:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'ps1',
      name: 'Dr. Amara Okafor',
      title: 'Head of AI Research',
      company: 'Helix Labs',
      roster: 'past',
      edition: '2025',
      image:
        'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=800',
      bio: 'Pioneered responsible AI governance frameworks adopted by Fortune 500 teams.',
      talkTitle: 'Building Trust in Agentic Systems',
    },
    {
      id: 'ps2',
      name: 'James Whitfield',
      title: 'CTO',
      company: 'VectorPath',
      roster: 'past',
      edition: '2025',
      image:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800',
      bio: 'Scaled production LLM deployments across regulated industries.',
    },
    {
      id: 'ps3',
      name: 'Priya Natarajan',
      title: 'VP Product',
      company: 'Cortex AI',
      roster: 'past',
      edition: '2024',
      image:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=800',
      bio: 'Led product strategy for enterprise copilots serving 2M+ users.',
      talkTitle: 'From Copilots to Autonomous Workflows',
    },
  ],
  agenda: [
    {
      id: 'day1',
      label: 'Day 1 (Oct 14)',
      sessions: [
        {
          id: 'd1s1',
          time: '09:00 AM',
          title: 'Opening Keynote: The AI Imperative',
          speaker: 'David Kim, NeuralNet',
          speakerId: 's4',
          track: 'Main Stage',
          duration: '90 min',
          room: 'Main Hall',
          description:
            'A forward-looking keynote on why enterprise AI adoption is no longer optional — and what leaders must prioritize in the next 18 months.',
        },
        {
          id: 'd1s2',
          time: '10:30 AM',
          title: 'Generative AI in the Enterprise',
          speaker: 'Elena Rostova, Quantum Data',
          speakerId: 's3',
          track: 'Enterprise',
          duration: '60 min',
          room: 'Room B',
          description:
            'Practical patterns for deploying generative AI in production workflows without sacrificing governance or velocity.',
        },
        {
          id: 'd1s3',
          time: '11:45 AM',
          title: 'Ethics and Governance Workshop',
          speaker: 'Dr. Sarah Chen, GlobalTech',
          speakerId: 's1',
          track: 'Ethics',
          duration: '75 min',
          room: 'Workshop Studio',
          description:
            'Hands-on frameworks for responsible AI — bias review, policy design, and cross-functional accountability.',
        },
        {
          id: 'd1s4',
          time: '01:00 PM',
          title: 'Networking Lunch',
          speaker: '',
          track: 'Networking',
          duration: '90 min',
          room: 'Garden Terrace',
          description: 'Hosted lunch with curated table topics and sponsor demo stations.',
        },
        {
          id: 'd1s5',
          time: '02:30 PM',
          title: 'Building Scalable AI Infrastructure',
          speaker: 'Michael Rivera, Innovate AI',
          speakerId: 's2',
          track: 'Technical',
          duration: '60 min',
          room: 'Room C',
          description:
            'Architecture deep-dive on inference pipelines, observability, and cost controls at scale.',
        },
      ],
    },
    {
      id: 'day2',
      label: 'Day 2 (Oct 15)',
      sessions: [
        {
          id: 'd2s1',
          time: '09:30 AM',
          title: 'Day 2 Kickoff: State of Open Source',
          speaker: 'Guest Panel',
          track: 'Main Stage',
          duration: '60 min',
          room: 'Main Hall',
          description:
            'Panel on the open-source AI ecosystem — tooling, licensing, and what teams should bet on next.',
        },
        {
          id: 'd2s2',
          time: '11:00 AM',
          title: 'AI-Driven Customer Experiences',
          speaker: 'Marketing Leaders',
          track: 'Enterprise',
          duration: '45 min',
          room: 'Room B',
          description:
            'How GTM and product teams are using AI to personalize journeys without eroding trust.',
        },
        {
          id: 'd2s3',
          time: '01:00 PM',
          title: 'AI Awards & Closing Remarks',
          speaker: 'David Kim',
          speakerId: 's4',
          track: 'Main Stage',
          duration: '45 min',
          room: 'Main Hall',
          description: 'Celebrating standout summit projects and closing notes from the NeuralNet team.',
        },
      ],
    },
  ],
  faq: [
    {
      id: 'f1',
      question: 'Who should attend the summit?',
      answer:
        'Founders, product leaders, operators, and technical teams building or scaling AI-led workflows in real businesses.',
    },
    {
      id: 'f2',
      question: 'Will session recordings be available?',
      answer:
        'Yes. All attendees get post-event access to session recordings. Access duration depends on your ticket tier.',
    },
    {
      id: 'f3',
      question: 'Can teams register together?',
      answer:
        'Absolutely. Team registrations are supported and include group onboarding support before the event.',
    },
    {
      id: 'f4',
      question: 'Do you offer partner or sponsor packages?',
      answer:
        'Yes. We offer a limited number of sponsor partnerships aligned to high-signal AI infrastructure and workflow tooling.',
    },
  ],
  testimonials: [
    {
      id: 't1',
      quote:
        'The most practical AI summit I have attended — every session connected to something we could ship the following week.',
      name: 'Jordan Lee',
      role: 'VP Product',
      company: 'Northstar Systems',
    },
    {
      id: 't2',
      quote:
        'High signal from start to finish. The networking alone justified the trip — I left with three partnerships in motion.',
      name: 'Priya Sharma',
      role: 'Head of AI',
      company: 'Meridian Health',
    },
    {
      id: 't3',
      quote:
        'Finally a conference that treats responsible AI as a product discipline, not a footnote.',
      name: 'Marcus Webb',
      role: 'CTO',
      company: 'Atlas Robotics',
    },
  ],
}

function mergeSection(
  base: ConferenceSectionCopy | undefined,
  patch: ConferenceSectionCopy | undefined,
): ConferenceSectionCopy | undefined {
  if (!base && !patch) return undefined
  return {
    ...base,
    ...patch,
    metrics: patch?.metrics?.length ? patch.metrics : base?.metrics,
  }
}

/** CMS may still store the old dual-CTA hero label — always show Register now on the public site. */
export function normalizeRegisterCtaLabel(label?: string): string {
  const trimmed = label?.trim()
  if (!trimmed) return 'Register now'
  if (/^get\s+ticket(s)?$/i.test(trimmed)) return 'Register now'
  return trimmed
}

function pickString(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : fallback
}

function mergeHero(base: ConferenceHeroContent, patch?: Partial<ConferenceHeroContent>): ConferenceHeroContent {
  const merged = !patch
    ? base
    : {
        ...base,
        ...patch,
        metrics: patch.metrics?.length ? patch.metrics : base.metrics,
      }

  return {
    ...merged,
    badge: pickString(merged.badge, base.badge),
    badgeLogoUrl: pickString(merged.badgeLogoUrl, base.badgeLogoUrl ?? ''),
    title: pickString(merged.title, base.title),
    titleAccent: pickString(merged.titleAccent, base.titleAccent),
    lede: pickString(merged.lede, base.lede),
    dateLabel: pickString(merged.dateLabel, base.dateLabel),
    locationLabel: pickString(merged.locationLabel, base.locationLabel),
    secondaryCtaLabel: pickString(merged.secondaryCtaLabel, base.secondaryCtaLabel),
    videoUrl: pickString(merged.videoUrl, base.videoUrl ?? DEFAULT_CONFERENCE_VIDEO),
    posterUrl: pickString(merged.posterUrl, base.posterUrl ?? DEFAULT_CONFERENCE_POSTER),
    primaryCtaLabel: normalizeRegisterCtaLabel(merged.primaryCtaLabel || base.primaryCtaLabel),
  }
}

function mergeVideo(
  base: ConferenceVideoContent | undefined,
  patch?: Partial<ConferenceVideoContent>,
): ConferenceVideoContent | undefined {
  if (!base && !patch) return undefined
  return { ...base, ...patch }
}

export function mergeConferenceContent(patch?: Partial<ConferenceContent>): ConferenceContent {
  const base = defaultConferenceContent
  if (!patch) return base

  const sponsorsCopy = mergeSection(
    base.sections.sponsors ?? base.sections.socialProof,
    patch.sections?.sponsors ?? patch.sections?.socialProof,
  )

  return {
    published: patch.published ?? base.published ?? true,
    eventStartAt: patch.eventStartAt ?? base.eventStartAt,
    eventTimezone: patch.eventTimezone ?? base.eventTimezone,
    countdownEnabled: patch.countdownEnabled ?? base.countdownEnabled ?? false,
    sectionVisibility: {
      ...DEFAULT_CONFERENCE_SECTION_VISIBILITY,
      ...base.sectionVisibility,
      ...patch.sectionVisibility,
    },
    venue: patch.venue ? { ...base.venue, ...patch.venue } : base.venue,
    hero: mergeHero(base.hero, patch.hero),
    video: mergeVideo(base.video ?? defaultConferenceContent.video, patch.video),
    sections: {
      sponsors: sponsorsCopy,
      socialProof: sponsorsCopy,
      video: mergeSection(base.sections.video, patch.sections?.video),
      speakers: mergeSection(base.sections.speakers, patch.sections?.speakers),
      agenda: mergeSection(base.sections.agenda, patch.sections?.agenda),
      faq: mergeSection(base.sections.faq, patch.sections?.faq),
      tickets: mergeSection(base.sections.tickets, patch.sections?.tickets),
      partners: mergeSection(base.sections.partners, patch.sections?.partners),
      testimonials: mergeSection(base.sections.testimonials, patch.sections?.testimonials),
      pastSpeakers: mergeSection(base.sections.pastSpeakers, patch.sections?.pastSpeakers),
    },
    tickets: patch.tickets?.tiers?.length
      ? {
          ...defaultConferenceTickets,
          ...base.tickets,
          ...patch.tickets,
          tiers: patch.tickets.tiers,
        }
      : base.tickets ?? defaultConferenceTickets,
    logos: patch.logos?.length ? patch.logos : base.logos,
    partners: patch.partners?.length ? patch.partners : base.partners ?? [],
    homepagePastSpeakerIds: patch.homepagePastSpeakerIds ?? base.homepagePastSpeakerIds,
    maxPastSpeakers: patch.maxPastSpeakers ?? base.maxPastSpeakers,
    sectionOrder: patch.sectionOrder ?? base.sectionOrder,
    embeddedBlockOrder: patch.embeddedBlockOrder ?? base.embeddedBlockOrder,
    speakers: patch.speakers?.length
      ? normalizeSpeakers(patch.speakers)
      : normalizeSpeakers(base.speakers),
    agenda: patch.agenda?.length ? patch.agenda : base.agenda,
    faq: patch.faq?.length ? patch.faq : base.faq,
    testimonials: patch.testimonials?.length ? patch.testimonials : base.testimonials ?? [],
  }
}

export function resolveConferenceHeroMedia(hero: ConferenceHeroContent) {
  return {
    videoSrc:
      hero.videoUrl?.trim() ||
      import.meta.env.VITE_CONFERENCE_HERO_VIDEO_URL ||
      DEFAULT_CONFERENCE_VIDEO,
    posterSrc:
      hero.posterUrl?.trim() ||
      import.meta.env.VITE_CONFERENCE_HERO_POSTER_URL ||
      DEFAULT_CONFERENCE_POSTER,
  }
}

export function resolveConferenceVideoMedia(video?: ConferenceVideoContent) {
  const block = video ?? defaultConferenceContent.video
  return {
    videoSrc:
      block?.videoUrl?.trim() ||
      import.meta.env.VITE_CONFERENCE_FEATURE_VIDEO_URL ||
      DEFAULT_CONFERENCE_VIDEO,
    posterSrc:
      block?.posterUrl?.trim() ||
      import.meta.env.VITE_CONFERENCE_FEATURE_POSTER_URL ||
      DEFAULT_CONFERENCE_POSTER,
  }
}
