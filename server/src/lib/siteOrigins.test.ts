import { afterEach, describe, expect, it } from 'vitest';
import { getProductionSiteOrigins } from './siteOrigins';

describe('getProductionSiteOrigins', () => {
  const env = process.env;

  afterEach(() => {
    process.env = { ...env };
  });

  it('includes custom domain, www, and Firebase default hosts', () => {
    process.env.NODE_ENV = 'production';
    process.env.SITE_URL = 'https://superhumanly-thoughts.com';
    const origins = getProductionSiteOrigins();
    expect(origins).toContain('https://superhumanly-thoughts.com');
    expect(origins).toContain('https://www.superhumanly-thoughts.com');
    expect(origins).toContain('https://superhumanly-thoughts.web.app');
    expect(origins).toContain('https://superhumanly-thoughts.firebaseapp.com');
  });
});
