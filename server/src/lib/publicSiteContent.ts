import prisma from './prisma';
import { sanitizeArticleHtml } from './sanitize';
import { getSiteUrl } from './siteUrl';
import { getConferenceRegistrationSettings } from './conferenceRegistrationSettings';
import { scheduledArticleWhere, scheduledEventWhere } from './publishSchedule';
import { sanitizeAppearanceRecord } from './brandLogo';

export const CMS_BOOTSTRAP_LIST_LIMIT = 50;

const safeParse = (str: string | null | undefined, fallback: unknown = {}) => {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
};

function asList<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? value : fallback;
}

export function mapPublicEvent(e: {
  id: string;
  day: string;
  weekday: string;
  time: string;
  full_time: string;
  title: string;
  host: string;
  location: string;
  tags: string;
  price: string;
  thumbnail: string;
  status: string;
  isPublished: boolean;
  startDate: Date | null;
  endDate: Date | null;
  lat: number | null;
  lng: number | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...e,
    startDate: e.startDate?.toISOString() ?? null,
    endDate: e.endDate?.toISOString() ?? null,
    tags: safeParse(e.tags, []),
    coordinates: e.lat != null && e.lng != null ? { lat: e.lat, lng: e.lng } : undefined,
  };
}

export function mapPublicArticle<T extends { content: string }>(article: T): T {
  return { ...article, content: sanitizeArticleHtml(article.content) };
}

export async function fetchSitePayload() {
  const content = await prisma.siteContent.findUnique({ where: { id: 'global' } });
  const hero = safeParse(content?.hero);
  const stats = asList(safeParse(content?.stats, []), []);
  const pillars = asList(safeParse(content?.pillars, []), []);
  const perks = asList(safeParse(content?.perks, []), []);
  const settings = (safeParse(content?.settings) ?? {}) as Record<string, unknown>;
  if (!settings.homepage) {
    settings.homepage = { hero, stats, pillars, perks };
  }
  settings.conferenceRegistration = await getConferenceRegistrationSettings();
  return {
    siteUrl: getSiteUrl(),
    hero,
    stats,
    pillars,
    perks,
    settings,
    appearance: sanitizeAppearanceRecord(
      (safeParse(content?.appearance) ?? {}) as Record<string, unknown>,
    ),
    contentVersion: content?.version ?? 1,
  };
}

export async function fetchPublicArticles(limit = CMS_BOOTSTRAP_LIST_LIMIT, offset = 0) {
  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where: scheduledArticleWhere(),
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.article.count({ where: scheduledArticleWhere() }),
  ]);
  return { items: items.map(mapPublicArticle), total };
}

export async function fetchPublicEvents(limit = CMS_BOOTSTRAP_LIST_LIMIT, offset = 0) {
  const [rows, total] = await Promise.all([
    prisma.event.findMany({
      where: scheduledEventWhere(),
      orderBy: { day: 'asc' },
      take: limit,
      skip: offset,
    }),
    prisma.event.count({ where: scheduledEventWhere() }),
  ]);
  return { items: rows.map(mapPublicEvent), total };
}

/** Unified CMS bootstrap payload — build script, API route, and publish pipeline. */
export async function buildCmsBootstrapPayload() {
  const [site, articles, events] = await Promise.all([
    fetchSitePayload(),
    fetchPublicArticles(),
    fetchPublicEvents(),
  ]);

  return {
    ...site,
    articles: articles.items,
    events: events.items,
  };
}
