export const PUBLIC_ROUTE_PATHS = ['/', '/home', '/blog', '/events', '/register'] as const

export type PublicRoutePath = (typeof PUBLIC_ROUTE_PATHS)[number]

export interface RouteDefaultSeo {
  title?: string
  description?: string
  ogImage?: string
}

export const routeDefaults: Record<PublicRoutePath, RouteDefaultSeo> = {
  '/': {
    title: 'Superhumanly Summit 2026 | The Premier AI Conference',
    description:
      'Join industry leaders for a two-day immersion into the future of artificial intelligence and enterprise transformation.',
  },
  '/home': {
    title: 'Superhumanly Monograph — Agentic AI Playbook',
    description:
      'Discover the definitive playbook for building AI agents and automating business workflows.',
  },
  '/blog': {
    title: 'Insights & Playbook — Superhumanly Blog',
    description:
      'Articles on agentic orchestration, automation patterns, and scaling with AI agents.',
  },
  '/events': {
    title: 'Live Training & Events — Superhumanly',
    description:
      'Join workshops and live sessions on agentic AI, workflow automation, and founder strategy.',
  },
  '/register': {
    title: 'Register — Superhumanly Summit 2026',
    description: 'Reserve your summit pass for $20. Name, email, and attendee type — done in one form.',
  },
}

export function isAdminPath(pathname: string): boolean {
  return pathname === '/dashboard' || pathname.startsWith('/admin')
}

export function isPublicMarketingPath(pathname: string): boolean {
  if (pathname === '/register') return true
  if ((PUBLIC_ROUTE_PATHS as readonly string[]).includes(pathname)) {
    return true
  }
  if (/^\/blog\/[^/]+\/?$/.test(pathname)) return true
  return /^\/events\/[^/]+\/?$/.test(pathname)
}

export function parseEventId(pathname: string): string | null {
  const match = pathname.match(/^\/events\/([^/]+)\/?$/)
  return match ? match[1] : null
}

export function parseBlogSlug(pathname: string): string | null {
  const match = pathname.match(/^\/blog\/([^/]+)\/?$/)
  return match ? match[1] : null
}
