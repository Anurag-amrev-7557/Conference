export const HOMEPAGE_TAB_INTROS: Record<
  'hero' | 'stats' | 'showcase' | 'perks' | 'sections' | 'visibility' | 'seo',
  { title: string; description: string }
> = {
  hero: {
    title: 'Hero',
    description: 'Above-the-fold headline, CTAs, and optional video on the homepage.',
  },
  stats: {
    title: 'Stats',
    description: 'Metric row displayed below the hero.',
  },
  showcase: {
    title: 'Showcase',
    description: 'Book showcase pillars — icons, titles, and terminal prompts.',
  },
  perks: {
    title: 'Perks',
    description: 'Feature cards in the perks section.',
  },
  sections: {
    title: 'Sections',
    description: 'Copy for Who we are and final CTA blocks.',
  },
  visibility: {
    title: 'Visibility',
    description: 'Show or hide homepage sections on the public site.',
  },
  seo: {
    title: 'SEO',
    description: 'Meta title and description for the homepage (/).',
  },
}

export const BLOG_TAB_INTROS: Record<
  'articles' | 'page' | 'seo' | 'content' | 'articleSeo',
  { title: string; description: string }
> = {
  articles: {
    title: 'Articles',
    description: 'Create, edit, and publish blog posts.',
  },
  page: {
    title: 'Page hero',
    description: 'Headline area at the top of /blog before the article grid.',
  },
  seo: {
    title: 'Blog SEO',
    description: 'Meta title and description for the /blog listing page.',
  },
  content: {
    title: 'Article content',
    description: 'Title, body, metadata, and publish state for this post.',
  },
  articleSeo: {
    title: 'Article SEO',
    description: 'Search and social overrides for this article.',
  },
}

export const EVENTS_TAB_INTROS: Record<
  'events' | 'page' | 'seo' | 'content',
  { title: string; description: string }
> = {
  events: {
    title: 'Events',
    description: 'Workshops and sessions shown on the events calendar.',
  },
  page: {
    title: 'Page hero',
    description: 'Headline area at the top of /events before the calendar.',
  },
  seo: {
    title: 'Events SEO',
    description: 'Meta title and description for the /events listing page.',
  },
  content: {
    title: 'Event details',
    description: 'Schedule, location, pricing, and publish state.',
  },
}
