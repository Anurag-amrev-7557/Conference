import {
  readDomCmsBootstrap,
  readSessionCmsCache,
  resolveBootstrapContentVersion,
  type CmsBootstrapPayload,
} from './cmsBootstrap';
import { mergeRemoteWebsiteData } from './mergeRemoteWebsiteData';
import { structuralDefaults } from './structuralDefaults';
import type { WebsiteData } from './websiteData';

export type InitialWebsiteData = {
  data: WebsiteData;
  contentVersion: number;
  source: 'live-bootstrap' | 'dom-bootstrap' | 'session-cache' | 'structural';
};

function mergeBootstrapPayload(remote: CmsBootstrapPayload): WebsiteData {
  return mergeRemoteWebsiteData(remote, structuralDefaults);
}

function readPrefetchedBootstrap(): CmsBootstrapPayload | null {
  if (typeof window === 'undefined') return null;
  const prefetched = window.__CMS_PREFETCH__;
  return prefetched && typeof prefetched === 'object' ? prefetched : null;
}

/** Synchronous first-paint data — live prefetch, DOM bootstrap, session cache, then structural shell. */
export function resolveInitialWebsiteData(): InitialWebsiteData {
  const prefetchedBootstrap = readPrefetchedBootstrap();
  const domBootstrap = readDomCmsBootstrap();
  const sessionCache = readSessionCmsCache();
  const bootstrap = prefetchedBootstrap ?? domBootstrap;

  if (bootstrap) {
    return {
      data: mergeBootstrapPayload(bootstrap),
      contentVersion: resolveBootstrapContentVersion(bootstrap, sessionCache),
      source: prefetchedBootstrap ? 'live-bootstrap' : 'dom-bootstrap',
    };
  }

  if (sessionCache) {
    return {
      data: sessionCache.data,
      contentVersion: sessionCache.contentVersion,
      source: 'session-cache',
    };
  }

  return {
    data: structuralDefaults,
    contentVersion: 1,
    source: 'structural',
  };
}
