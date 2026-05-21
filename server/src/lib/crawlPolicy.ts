import type { Article, Event } from '@prisma/client';
import prisma from './prisma';
import { absoluteUrl } from './siteUrl';

export interface SitemapEntry {
  /** Path only, e.g. /blog/my-post — hostname supplied by SitemapStream */
  path: string;
  lastmod: string;
}

export function isArticleIndexable(article: Pick<Article, 'isPublished' | 'noindex'>): boolean {
  return article.isPublished && !article.noindex;
}

export function isEventIndexable(
  event: Pick<Event, 'isPublished' | 'noindex'>,
): boolean {
  return event.isPublished && !event.noindex;
}

export function buildSitemapEntriesFromRows(input: {
  siteUpdatedAt: Date;
  articles: Pick<Article, 'slug' | 'updatedAt' | 'isPublished' | 'noindex'>[];
  events: Pick<Event, 'id' | 'updatedAt' | 'isPublished' | 'noindex'>[];
}): SitemapEntry[] {
  const indexableArticles = input.articles.filter(isArticleIndexable);
  const indexableEvents = input.events.filter(isEventIndexable);

  const maxDate = (dates: Date[], fallback: Date) => {
    if (dates.length === 0) return fallback;
    return dates.reduce((max, d) => (d > max ? d : max));
  };

  const blogLastmod = maxDate(
    indexableArticles.map((a) => a.updatedAt),
    input.siteUpdatedAt,
  );
  const eventsLastmod = maxDate(
    indexableEvents.map((e) => e.updatedAt),
    input.siteUpdatedAt,
  );

  const entries: SitemapEntry[] = [
    { path: '/', lastmod: input.siteUpdatedAt.toISOString() },
    { path: '/blog', lastmod: blogLastmod.toISOString() },
  ];

  for (const article of indexableArticles) {
    entries.push({
      path: `/blog/${article.slug}`,
      lastmod: article.updatedAt.toISOString(),
    });
  }

  entries.push({ path: '/events', lastmod: eventsLastmod.toISOString() });

  for (const event of indexableEvents) {
    entries.push({
      path: `/events/${event.id}`,
      lastmod: event.updatedAt.toISOString(),
    });
  }

  return entries;
}

export function listIndexablePathsFromEntries(entries: SitemapEntry[]): string[] {
  return entries.map((e) => e.path);
}

/** Absolute URLs for tests and verify scripts */
export function entriesToAbsoluteUrls(entries: SitemapEntry[]): string[] {
  return entries.map((e) => absoluteUrl(e.path));
}

export async function fetchSitemapEntries(): Promise<SitemapEntry[]> {
  const [site, articles, events] = await Promise.all([
    prisma.siteContent.findUnique({ where: { id: 'global' } }),
    prisma.article.findMany({
      select: { slug: true, updatedAt: true, isPublished: true, noindex: true },
    }),
    prisma.event.findMany({
      select: { id: true, updatedAt: true, isPublished: true, noindex: true },
    }),
  ]);

  const siteUpdatedAt = site?.updatedAt ?? new Date();
  return buildSitemapEntriesFromRows({
    siteUpdatedAt,
    articles,
    events,
  });
}

export async function listIndexablePaths(): Promise<string[]> {
  const entries = await fetchSitemapEntries();
  return listIndexablePathsFromEntries(entries);
}
