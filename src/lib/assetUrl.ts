/**
 * Resolve CMS image URLs for split deploy (Vercel frontend + Render API).
 * New uploads return absolute API URLs; legacy rows may still use /media/ or /og/.
 */

function getApiOrigin(): string | undefined {
  const explicit = import.meta.env.VITE_API_ORIGIN?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, '');
  }
  const apiUrl = import.meta.env.VITE_API_URL?.trim();
  if (!apiUrl) {
    return undefined;
  }
  return apiUrl.replace(/\/api\/v1\/?$/i, '').replace(/\/+$/, '');
}

function toSameOriginMediaPath(absoluteUrl: string): string | null {
  try {
    const u = new URL(absoluteUrl);
    if (!u.pathname.startsWith('/media/') && !u.pathname.startsWith('/og/')) {
      return null;
    }
    const apiOrigin = getApiOrigin();
    if (apiOrigin && absoluteUrl.startsWith(apiOrigin)) {
      return `${u.pathname}${u.search}`;
    }
    if (import.meta.env.DEV && u.hostname === 'localhost' && (u.port === '3001' || u.port === '')) {
      return `${u.pathname}${u.search}`;
    }
  } catch {
    return null;
  }
  return null;
}

export function resolveAssetUrl(url: string | undefined | null): string {
  if (!url?.trim()) {
    return '';
  }
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    // Dev: use Vite proxy (/media → :3001) to avoid cross-origin embed issues
    if (import.meta.env.DEV) {
      const proxied = toSameOriginMediaPath(trimmed);
      if (proxied) return proxied;
    }
    return trimmed;
  }
  if (trimmed.startsWith('/media/') || trimmed.startsWith('/og/')) {
    const origin = getApiOrigin();
    if (origin && !import.meta.env.DEV) {
      return `${origin}${trimmed}`;
    }
  }
  return trimmed;
}

/** Resolve hero/feature video URLs (API media, env override, or static public fallback). */
export function resolveMediaUrl(url: string | undefined | null, publicFallback?: string): string {
  const resolved = resolveAssetUrl(url);
  if (resolved) {
    return resolved;
  }
  return publicFallback?.trim() || '';
}
