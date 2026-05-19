let siteOrigin = '';

export function setSiteOrigin(url: string): void {
  siteOrigin = url.replace(/\/+$/, '');
}

export function getSiteOrigin(): string {
  return siteOrigin;
}

export function absoluteUrl(path: string): string {
  if (!siteOrigin) {
    return path;
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${siteOrigin}${normalizedPath}`;
}
