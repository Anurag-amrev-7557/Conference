import type { WebsiteData } from './websiteData';

export const CMS_BOOTSTRAP_SCRIPT_ID = 'cms-bootstrap';
export const CMS_SESSION_CACHE_KEY = 'book-site-cms-cache';

export type CmsBootstrapPayload = Record<string, unknown> & {
  contentVersion?: number;
};

type SessionCacheEntry = {
  contentVersion: number;
  savedAt: number;
  data: WebsiteData;
};

const SESSION_CACHE_TTL_MS = 30 * 60 * 1000;

/** Parse CMS payload embedded in index.html at build/dev time. */
export function readDomCmsBootstrap(): CmsBootstrapPayload | null {
  if (typeof document === 'undefined') return null;

  const el = document.getElementById(CMS_BOOTSTRAP_SCRIPT_ID);
  const raw = el?.textContent?.trim();
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CmsBootstrapPayload;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function readSessionCmsCache(): SessionCacheEntry | null {
  if (typeof sessionStorage === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(CMS_SESSION_CACHE_KEY);
    if (!raw) return null;

    const entry = JSON.parse(raw) as SessionCacheEntry;
    if (!entry?.data || typeof entry.contentVersion !== 'number') return null;
    if (Date.now() - entry.savedAt > SESSION_CACHE_TTL_MS) return null;

    return entry;
  } catch {
    return null;
  }
}

export function writeSessionCmsCache(data: WebsiteData, contentVersion: number): void {
  if (typeof sessionStorage === 'undefined') return;

  try {
    const entry: SessionCacheEntry = {
      contentVersion,
      savedAt: Date.now(),
      data,
    };
    sessionStorage.setItem(CMS_SESSION_CACHE_KEY, JSON.stringify(entry));
  } catch {
    /* quota / private mode */
  }
}

export function resolveBootstrapContentVersion(
  bootstrap: CmsBootstrapPayload | null,
  cache: SessionCacheEntry | null,
): number {
  if (typeof bootstrap?.contentVersion === 'number') return bootstrap.contentVersion;
  if (cache) return cache.contentVersion;
  return 1;
}
