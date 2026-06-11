import { API_BASE } from './api';
import type { CmsBootstrapPayload } from './cmsBootstrap';

declare global {
  interface Window {
    __CMS_PREFETCH__?: CmsBootstrapPayload | null;
  }
}

/** Fetch live bootstrap from API; prefer newer contentVersion over inline HTML snapshot. */
export async function prefetchLiveCmsBootstrap(
  inline: CmsBootstrapPayload | null,
): Promise<CmsBootstrapPayload | null> {
  try {
    const res = await fetch(`${API_BASE}/content/bootstrap`, { cache: 'no-store' });
    if (!res.ok) return inline;

    const live = (await res.json()) as CmsBootstrapPayload;
    if (!live || typeof live !== 'object') return inline;

    const inlineVersion = typeof inline?.contentVersion === 'number' ? inline.contentVersion : 0;
    const liveVersion = typeof live.contentVersion === 'number' ? live.contentVersion : 0;

    return liveVersion >= inlineVersion ? live : inline;
  } catch {
    return inline;
  }
}
