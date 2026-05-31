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
    throw new Error(
      'API_PUBLIC_URL must be set in production (e.g. https://your-service.onrender.com)',
    );
  }

  const port = process.env.PORT || '3001';
  return `http://localhost:${port}`;
}

/** Turn a site-relative upload path into an absolute URL on this API host. */
export function publicAssetUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getApiPublicUrl()}${normalized}`;
}
