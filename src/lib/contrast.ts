/** WCAG contrast helpers for CMS-driven accent colors. */

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');
  const h =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;
  const n = Number.parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const srgb = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

export function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(hexToRgb(foreground));
  const l2 = relativeLuminance(hexToRgb(background));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
}

/** Darken hex color by mixing toward black (amount 0–1). */
function darkenHex(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const factor = 1 - amount;
  return rgbToHex(r * factor, g * factor, b * factor);
}

/**
 * Ensures white (#ffffff) text on the accent meets WCAG AA (4.5:1).
 * Progressively darkens light accents until contrast passes.
 */
export function ensureAccentContrast(hex: string, minRatio = 4.5): string {
  if (!/^#?[0-9a-fA-F]{3,6}$/.test(hex.trim())) return hex;
  const normalized = hex.startsWith('#') ? hex : `#${hex}`;
  let candidate = normalized;
  for (let step = 0; step < 12; step += 1) {
    if (contrastRatio('#ffffff', candidate) >= minRatio) return candidate;
    candidate = darkenHex(candidate, 0.12);
  }
  return candidate;
}
