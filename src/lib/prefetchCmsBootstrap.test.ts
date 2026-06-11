// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { prefetchLiveCmsBootstrap } from './prefetchCmsBootstrap';

describe('prefetchLiveCmsBootstrap', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns live payload when API version is newer', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ contentVersion: 12, settings: { seo: { title: 'Live' } } }),
      }),
    );

    const result = await prefetchLiveCmsBootstrap({ contentVersion: 5 });
    expect(result?.contentVersion).toBe(12);
  });

  it('keeps inline payload when API is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    const inline = { contentVersion: 5, articles: [] };
    const result = await prefetchLiveCmsBootstrap(inline);
    expect(result).toBe(inline);
  });
});
