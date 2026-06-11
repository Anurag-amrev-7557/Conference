const ALLOWED_SCRIPT_HOSTS = new Set([
  'www.googletagmanager.com',
  'www.google-analytics.com',
  'region1.google-analytics.com',
  'plausible.io',
  'static.cloudflareinsights.com',
  'cdn.segment.com',
  'connect.facebook.net',
]);

function isAllowedScriptSrc(src: string): boolean {
  try {
    const url = new URL(src, 'https://example.com');
    if (url.protocol !== 'https:') return false;
    return ALLOWED_SCRIPT_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

/** Returns true when script markup is safe to inject on the public site. */
export function isAllowedInjectedScript(script: HTMLScriptElement): boolean {
  const src = script.getAttribute('src')?.trim();
  if (src) {
    return isAllowedScriptSrc(src);
  }
  const type = (script.getAttribute('type') || 'text/javascript').toLowerCase();
  if (type !== 'text/javascript' && type !== 'application/javascript' && type !== 'module') {
    return false;
  }
  const body = script.textContent ?? '';
  if (/javascript:/i.test(body)) return false;
  return body.length <= 12_000;
}
