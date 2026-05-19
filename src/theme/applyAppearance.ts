import type { SiteAppearance, SiteSettings } from '../lib/websiteData';

function darkenColor(hex: string): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * 10);
  const r = Math.max(0, (num >> 16) - amt);
  const b = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const g = Math.max(0, (num & 0x0000ff) - amt);
  return '#' + (0x1000000 + r * 0x10000 + b * 0x100 + g).toString(16).slice(1);
}

const fontMapping = {
  serif: "'Instrument Serif', serif",
  sans: "'Plus Jakarta Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const;

/**
 * Maps CMS appearance + settings onto `document.documentElement` CSS variables
 * and injects custom CSS. Call from a React effect when `appearance` / `settings` change.
 */
export function applyAppearance(
  appearance: SiteAppearance,
  settings: SiteSettings,
  root: HTMLElement = document.documentElement
): void {
  root.style.setProperty('--color-accent', appearance.primaryColor);
  root.style.setProperty('--color-accent2', darkenColor(appearance.primaryColor));

  if (appearance?.typography?.headingFont) {
    root.style.setProperty('--font-serif', fontMapping[appearance.typography.headingFont]);
  }
  if (appearance?.typography?.bodyFont) {
    root.style.setProperty('--font-sans', fontMapping[appearance.typography.bodyFont]);
  }

  if (appearance?.typography?.baseSize) {
    const sizeMapping = { small: '14px', medium: '15px', large: '17px' };
    root.style.setProperty('--base-font-size', sizeMapping[appearance.typography.baseSize]);
  }

  if (appearance?.theme?.borderRadius) {
    const radiusMapping = { none: '0px', sm: '8px', md: '16px', lg: '32px', full: '999px' };
    root.style.setProperty('--radius-global', radiusMapping[appearance.theme.borderRadius]);
  }

  if (appearance?.theme?.shadowIntensity) {
    const shadowMapping = {
      none: 'none',
      soft: '0 10px 30px -5px rgba(0,0,0,0.05)',
      heavy: '0 20px 50px -10px rgba(0,0,0,0.15)',
    };
    root.style.setProperty('--shadow-dynamic', shadowMapping[appearance.theme.shadowIntensity]);
  }

  let styleTag = document.getElementById('custom-css-runtime');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'custom-css-runtime';
    document.head.appendChild(styleTag);
  }
  styleTag.innerHTML = settings.customCss;
}
