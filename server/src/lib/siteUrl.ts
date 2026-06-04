const DEV_FALLBACK = 'http://localhost:5173';
const PROD_FALLBACK = 'https://superhumanly-thoughts.com';

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
      console.warn(`[siteUrl] SITE_URL missing in production. Using fallback ${PROD_FALLBACK}`);
      return PROD_FALLBACK;
    }
    try {
      const parsed = new URL(raw);
      if (parsed.protocol !== 'https:') {
        console.warn(`[siteUrl] SITE_URL is non-https in production. Using fallback ${PROD_FALLBACK}`);
        return PROD_FALLBACK;
      }
      return normalizeOrigin(parsed.origin);
    } catch {
      console.warn(`[siteUrl] SITE_URL is invalid in production. Using fallback ${PROD_FALLBACK}`);
      return PROD_FALLBACK;
    }
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
