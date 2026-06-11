// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { CMS_BOOTSTRAP_SCRIPT_ID, CMS_SESSION_CACHE_KEY } from './cmsBootstrap';
import { resolveInitialWebsiteData } from './resolveInitialWebsiteData';
import { structuralDefaults } from './structuralDefaults';
import type { WebsiteData } from './websiteData';

const sampleData: WebsiteData = {
  ...structuralDefaults,
  settings: {
    ...structuralDefaults.settings,
    seo: { title: 'CMS Title', description: 'From bootstrap' },
  },
};

describe('resolveInitialWebsiteData', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    sessionStorage.clear();
  });

  it('prefers live prefetch over dom bootstrap', () => {
    window.__CMS_PREFETCH__ = {
      contentVersion: 10,
      settings: { seo: { title: 'Live', description: 'live' } },
    };
    document.body.innerHTML = `<script id="${CMS_BOOTSTRAP_SCRIPT_ID}" type="application/json">${JSON.stringify({
      contentVersion: 4,
      settings: { seo: { title: 'DOM', description: 'dom' } },
    })}</script>`;

    const result = resolveInitialWebsiteData();
    expect(result.source).toBe('live-bootstrap');
    expect(result.contentVersion).toBe(10);
    expect(result.data.settings.seo.title).toBe('Live');
  });

  it('prefers dom bootstrap over session cache', () => {
    delete window.__CMS_PREFETCH__;
    document.body.innerHTML = `<script id="${CMS_BOOTSTRAP_SCRIPT_ID}" type="application/json">${JSON.stringify({
      contentVersion: 4,
      settings: { seo: { title: 'DOM', description: 'dom' } },
    })}</script>`;

    sessionStorage.setItem(
      CMS_SESSION_CACHE_KEY,
      JSON.stringify({
        contentVersion: 9,
        savedAt: Date.now(),
        data: sampleData,
      }),
    );

    const result = resolveInitialWebsiteData();
    expect(result.source).toBe('dom-bootstrap');
    expect(result.contentVersion).toBe(4);
    expect(result.data.settings.seo.title).toBe('DOM');
  });

  it('falls back to session cache when dom bootstrap is missing', () => {
    sessionStorage.setItem(
      CMS_SESSION_CACHE_KEY,
      JSON.stringify({
        contentVersion: 7,
        savedAt: Date.now(),
        data: sampleData,
      }),
    );

    const result = resolveInitialWebsiteData();
    expect(result.source).toBe('session-cache');
    expect(result.contentVersion).toBe(7);
    expect(result.data.settings.seo.title).toBe('CMS Title');
  });

  it('uses structural defaults when no bootstrap sources exist', () => {
    delete window.__CMS_PREFETCH__;
    const result = resolveInitialWebsiteData();
    expect(result.source).toBe('structural');
    expect(result.data).toEqual(structuralDefaults);
  });
});
