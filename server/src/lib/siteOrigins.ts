import { getSiteUrl } from './siteUrl';

const PRODUCTION_SITE_ORIGINS = [
  'https://superhumanly-thoughts.com',
  'https://www.superhumanly-thoughts.com',
  'https://superhumanly-thoughts.web.app',
  'https://superhumanly-thoughts.firebaseapp.com',
] as const;

function parseOrigin(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const withScheme = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withScheme);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

/** Adds apex ↔ www pair for a canonical https origin. */
function withWwwPair(origin: string): string[] {
  try {
    const url = new URL(origin);
    if (url.hostname.startsWith('www.')) {
      const apexHost = url.hostname.slice(4);
      return [origin, `${url.protocol}//${apexHost}`];
    }
    return [origin, `${url.protocol}//www.${url.hostname}`];
  } catch {
    return [origin];
  }
}

function parseOriginsList(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value.split(',').map((o) => parseOrigin(o)).filter((o): o is string => Boolean(o));
}

/**
 * Production browser origins allowed for CORS (SITE_URL + www pair + env extras + known Firebase hosts).
 */
export function getProductionSiteOrigins(): string[] {
  const set = new Set<string>();

  for (const origin of PRODUCTION_SITE_ORIGINS) {
    set.add(origin);
  }

  for (const origin of parseOriginsList(process.env.ALLOWED_ORIGINS)) {
    for (const paired of withWwwPair(origin)) {
      set.add(paired);
    }
  }

  try {
    const site = getSiteUrl();
    for (const paired of withWwwPair(site)) {
      set.add(paired);
    }
  } catch {
    // getSiteUrl() falls back in production; still apply static list above
  }

  return [...set];
}
