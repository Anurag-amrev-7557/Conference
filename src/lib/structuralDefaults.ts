import type { WebsiteData } from './websiteData';

/**
 * Shape-only defaults — no marketing copy.
 * Used when CMS bootstrap and session cache are unavailable (API error).
 */
export const structuralDefaults: WebsiteData = {
  hero: {
    tagline: '',
    headline: '',
    headlineAccent: '',
    subtitle: '',
    videoUrl: '',
  },
  articles: [],
  events: [],
  stats: [],
  pillars: [],
  perks: [],
  settings: {
    seo: {
      title: '',
      description: '',
    },
    navigation: {
      links: [],
      socials: [],
      footerLinks: [],
      primaryCta: { label: '', href: '' },
    },
    visibility: {
      showcase: true,
      blog: true,
      events: true,
      finalCta: true,
      footer: true,
    },
    customCss: '',
    scripts: {
      header: '',
      footer: '',
    },
  },
  appearance: {
    primaryColor: '#0052cc',
    brandName: '',
    brandLogoText: '',
    typography: {
      headingFont: 'sans',
      bodyFont: 'sans',
      baseSize: 'medium',
    },
    theme: {
      borderRadius: 'md',
      buttonStyle: 'flat',
      shadowIntensity: 'soft',
    },
  },
};
