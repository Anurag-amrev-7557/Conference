/**
 * Public base URL for this API (Render Web Service).
 * Used for absolute /media and /og URLs when the frontend is on another origin (Vercel).
 */
export function getApiPublicUrl(): string {
  const raw = process.env.API_PUBLIC_URL?.trim();
  if (raw) {
    return raw.replace(/\/+$/, '');
  }

  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    const fallback = 'https://book-website-api.onrender.com';
    console.warn(
      `[apiPublicUrl] API_PUBLIC_URL missing in production. Using fallback ${fallback}`,
    );
    return fallback;
  }

  const port = process.env.PORT || '3001';
  return `http://localhost:${port}`;
}

/** Turn a site-relative upload path into an absolute URL on this API host. */
export function publicAssetUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getApiPublicUrl()}${normalized}`;
}
