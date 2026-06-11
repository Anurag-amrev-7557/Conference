import { readDomCmsBootstrap } from './cmsBootstrap';
import type { CmsBootstrapPayload } from './cmsBootstrap';
import { BOOTSTRAP_URL } from './apiBase';

declare global {
  interface Window {
    __CMS_PREFETCH__?: CmsBootstrapPayload | null;
    __CMS_BOOTSTRAP_PROMISE__?: Promise<CmsBootstrapPayload | null>;
  }
}

function pickNewerBootstrap(
  inline: CmsBootstrapPayload | null,
  live: CmsBootstrapPayload | null,
): CmsBootstrapPayload | null {
  if (!live) return inline;
  if (!inline) return live;

  const inlineVersion = typeof inline.contentVersion === 'number' ? inline.contentVersion : 0;
  const liveVersion = typeof live.contentVersion === 'number' ? live.contentVersion : 0;

  return liveVersion >= inlineVersion ? live : inline;
}

/** Fetch live bootstrap from API; prefer newer contentVersion over inline HTML snapshot. */
export async function prefetchLiveCmsBootstrap(
  inline: CmsBootstrapPayload | null,
): Promise<CmsBootstrapPayload | null> {
  try {
    const res = await fetch(BOOTSTRAP_URL, { cache: 'no-store' });
    if (!res.ok) return inline;

    const live = (await res.json()) as CmsBootstrapPayload;
    return pickNewerBootstrap(inline, live && typeof live === 'object' ? live : null);
  } catch {
    return inline;
  }
}

/**
 * Start API bootstrap fetch immediately — does not block React mount.
 * Reuses the promise started from index.html when present.
 */
export function startLiveBootstrapPrefetch(): void {
  if (typeof window === 'undefined') return;

  const inline = readDomCmsBootstrap();
  const pending = window.__CMS_BOOTSTRAP_PROMISE__;

  window.__CMS_BOOTSTRAP_PROMISE__ = (async () => {
    let live: CmsBootstrapPayload | null = null;

    try {
      if (pending) {
        live = (await pending) as CmsBootstrapPayload | null;
      } else {
        const res = await fetch(BOOTSTRAP_URL, { cache: 'no-store' });
        live = res.ok ? ((await res.json()) as CmsBootstrapPayload) : null;
      }
    } catch {
      live = null;
    }

    const chosen = pickNewerBootstrap(inline, live);
    if (chosen) {
      window.__CMS_PREFETCH__ = chosen;
    }
    return chosen;
  })();
}
