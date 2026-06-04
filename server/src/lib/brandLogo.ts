/** Cloudinary public_id must not include a file extension (URLs become …/id.png.png). */
export function isBrokenBrandLogoUrl(url: string): boolean {
  return /\.(png|jpe?g|webp)\.(png|jpe?g|webp)(\?|#|$)/i.test(url);
}

export function sanitizeBrandLogoUrl(cmsUrl: unknown): string | undefined {
  if (typeof cmsUrl !== 'string') return undefined;
  const trimmed = cmsUrl.trim();
  if (!trimmed || isBrokenBrandLogoUrl(trimmed)) {
    return '/media/superhumanly-logo.png';
  }
  return trimmed;
}

export function sanitizeAppearanceRecord(appearance: Record<string, unknown>): Record<string, unknown> {
  if (!appearance || typeof appearance !== 'object') return appearance;
  const next = { ...appearance };
  if ('brandLogoUrl' in next) {
    const fixed = sanitizeBrandLogoUrl(next.brandLogoUrl);
    if (fixed) next.brandLogoUrl = fixed;
    else delete next.brandLogoUrl;
  }
  return next;
}
