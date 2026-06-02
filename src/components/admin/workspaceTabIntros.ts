import type { EditorTabIntro } from './admin-editor-ui'

export const BLOG_TAB_INTROS: Record<
  'articles' | 'page' | 'seo' | 'content' | 'articleSeo',
  EditorTabIntro
> = {
  articles: {
    breadcrumb: 'Blog · Articles',
    title: 'Articles',
    description: 'Create, edit, and publish blog posts.',
  },
  page: {
    breadcrumb: 'Blog · Page hero',
    title: 'Page hero',
    description: 'Headline area at the top of /blog before the article grid.',
    status: 'published',
  },
  seo: {
    breadcrumb: 'Blog · SEO',
    title: 'Blog SEO',
    description: 'Meta title and description for the /blog listing page.',
    status: 'published',
  },
  content: {
    breadcrumb: 'Blog · Article content',
    title: 'Article content',
    description: 'Title, body, metadata, and publish state for this post.',
  },
  articleSeo: {
    breadcrumb: 'Blog · Article SEO',
    title: 'Article SEO',
    description: 'Search and social overrides for this article.',
  },
}

export const EVENTS_TAB_INTROS: Record<
  'events' | 'page' | 'seo' | 'content' | 'eventSeo',
  EditorTabIntro
> = {
  events: {
    breadcrumb: 'Events · Calendar',
    title: 'Events',
    description: 'Workshops and sessions shown on the events calendar.',
  },
  page: {
    breadcrumb: 'Events · Page hero',
    title: 'Page hero',
    description: 'Headline area at the top of /events before the calendar.',
    status: 'published',
  },
  seo: {
    breadcrumb: 'Events · SEO',
    title: 'Events SEO',
    description: 'Meta title and description for the /events listing page.',
    status: 'published',
  },
  content: {
    breadcrumb: 'Events · Event details',
    title: 'Event details',
    description: 'Schedule, location, pricing, and publish state.',
  },
  eventSeo: {
    breadcrumb: 'Events · Event SEO',
    title: 'Event SEO',
    description: 'Search and social overrides for this event.',
  },
}

export const CONFERENCE_TAB_INTROS: Record<
  'hero' | 'sections' | 'lists' | 'embedded' | 'visibility' | 'seo' | 'advanced' | 'publish',
  EditorTabIntro
> = {
  hero: {
    breadcrumb: 'Summit · Hero',
    title: 'Hero',
    description: 'Logo, headline, video background, venue, and countdown on /.',
    status: 'published',
  },
  sections: {
    breadcrumb: 'Summit · Section copy',
    title: 'Section copy',
    description: 'Headlines for speakers, agenda, sponsors, tickets, FAQ, and more.',
    status: 'published',
  },
  lists: {
    breadcrumb: 'Summit · Lists',
    title: 'Lists',
    description: 'Sponsors, speakers, agenda, partners, FAQ, and testimonials.',
    status: 'published',
  },
  embedded: {
    breadcrumb: 'Summit · Embedded blocks',
    title: 'Embedded blocks',
    description: 'Book showcase, blog/events previews, and final CTA copy.',
    status: 'published',
  },
  visibility: {
    breadcrumb: 'Summit · Visibility',
    title: 'Visibility',
    description: 'Show or hide every summit section and embedded block.',
    status: 'published',
  },
  seo: {
    breadcrumb: 'Summit · SEO',
    title: 'Summit SEO',
    description: 'Meta title and description for the summit homepage (/).',
    status: 'published',
  },
  advanced: {
    breadcrumb: 'Summit · Advanced',
    title: 'Advanced',
    description: 'Custom CSS and header/footer scripts for all public pages.',
    status: 'published',
  },
  publish: {
    breadcrumb: 'Summit · Publish',
    title: 'Publish',
    description: 'Go-live switch and deployment notes.',
    status: 'published',
  },
}

export const REGISTRATION_TAB_INTROS: Record<
  'submissions' | 'form' | 'operations' | 'seo',
  EditorTabIntro
> = {
  submissions: {
    breadcrumb: 'Registrations · Submissions',
    title: 'Submissions',
    description: 'Summit sign-ups from /register — approve, edit, or export.',
  },
  form: {
    breadcrumb: 'Registrations · Form copy',
    title: 'Form copy',
    description: 'Left panel and registration card copy on /register, in page order.',
    status: 'published',
  },
  operations: {
    breadcrumb: 'Registrations · Operations',
    title: 'Operations',
    description: 'Registration gate, closed message, and email notifications.',
    status: 'published',
  },
  seo: {
    breadcrumb: 'Registrations · SEO',
    title: 'Register SEO',
    description: 'Meta title, description, and social image for /register.',
    status: 'published',
  },
}

export const DESIGN_TAB_INTROS: Record<'colors' | 'typography' | 'tokens' | 'branding', EditorTabIntro> = {
  colors: {
    breadcrumb: 'Brand & theme · Palette',
    title: 'Palette',
    description: 'Primary brand color for buttons, links, accents, and focus states across the site.',
  },
  typography: {
    breadcrumb: 'Brand & theme · Typography',
    title: 'Typography',
    description: 'Heading and body font families applied to the public marketing site.',
  },
  tokens: {
    breadcrumb: 'Brand & theme · Theme',
    title: 'Theme',
    description: 'Global UI tokens — corner radius and shadow depth for cards and surfaces.',
  },
  branding: {
    breadcrumb: 'Brand & theme · Brand',
    title: 'Brand',
    description: 'Display name and navbar logo shown across the public site.',
  },
}

export const SETTINGS_TAB_INTROS: Record<'seo' | 'navigation' | 'pages' | 'advanced', EditorTabIntro> = {
  seo: {
    breadcrumb: 'Site settings · SEO',
    title: 'SEO',
    description:
      'Default title, description, and share metadata for the whole site. Individual pages can override these in their workspace.',
  },
  navigation: {
    breadcrumb: 'Site settings · Navigation',
    title: 'Navigation',
    description: 'Header call-to-action, primary menu links, footer links, and social profile URLs.',
  },
  pages: {
    breadcrumb: 'Site settings · Site pages',
    title: 'Site pages',
    description: 'Footer copy, cookie banner, 404 page, and shared blog CTA content.',
  },
  advanced: {
    breadcrumb: 'Site settings · Advanced',
    title: 'Advanced',
    description: 'Global CSS overrides and script tags injected into every public page.',
  },
}

export const MEDIA_TAB_INTROS: EditorTabIntro = {
  breadcrumb: 'Media · Library',
  title: 'Media library',
  description: 'Upload images for covers, thumbnails, OG images, and inline URLs.',
}

export const NEWSLETTER_TAB_INTROS: EditorTabIntro = {
  breadcrumb: 'Newsletter · Signups',
  title: 'Newsletter signups',
  description: 'Emails captured from waitlist forms across the site.',
}

export const USERS_TAB_INTROS: Record<'team' | 'permissions', EditorTabIntro> = {
  team: {
    breadcrumb: 'Team · Members',
    title: 'Team members',
    description: 'Invite editors and viewers; assign roles per member.',
  },
  permissions: {
    breadcrumb: 'Team · Permissions',
    title: 'Role permissions',
    description: 'Configure what each role can view and edit across the admin.',
  },
}
