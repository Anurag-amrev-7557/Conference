const DEV_FALLBACK = 'http://localhost:5173';

let devWarningLogged = false;

function normalizeOrigin(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Resolves public site origin from SITE_URL with production fail-fast (CRAWL-01).
 */
export function getSiteUrl(): string {
  const raw = process.env.SITE_URL?.trim();
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    if (!raw) {
      throw new Error('SITE_URL must be set when NODE_ENV=production');
    }
    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      throw new Error('SITE_URL must be a valid absolute URL when NODE_ENV=production');
    }
    if (parsed.protocol !== 'https:') {
      throw new Error('SITE_URL must use https: in production');
    }
    return normalizeOrigin(parsed.origin);
  }

  if (!raw) {
    if (!devWarningLogged) {
      console.warn(
        '[siteUrl] SITE_URL is unset in development; using http://localhost:5173. Set SITE_URL before production deploy.',
      );
      devWarningLogged = true;
    }
    return DEV_FALLBACK;
  }

  try {
    return normalizeOrigin(new URL(raw).origin);
  } catch {
    return normalizeOrigin(raw);
  }
}

/**
 * Builds an absolute URL for a site path using SITE_URL.
 */
export function absoluteUrl(path: string): string {
  const origin = getSiteUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${normalizedPath}`;
}
