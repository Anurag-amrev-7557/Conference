// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { injectCmsBootstrapIntoHtml } from '../../scripts/lib/cms-bootstrap-html.mjs';
import { CMS_BOOTSTRAP_SCRIPT_ID, readDomCmsBootstrap } from './cmsBootstrap';

describe('cms bootstrap html', () => {
  it('injects escaped JSON before </head>', () => {
    const html = '<!doctype html><html><head><title>x</title></head><body></body></html>';
    const payload = { contentVersion: 2, hero: { headline: '</script>alert(1)' } };
    const out = injectCmsBootstrapIntoHtml(html, payload);

    expect(out).toContain(`id="${CMS_BOOTSTRAP_SCRIPT_ID}"`);
    expect(out).not.toContain('</script>alert');
    expect(out.indexOf('</head>')).toBeGreaterThan(out.indexOf(CMS_BOOTSTRAP_SCRIPT_ID));
  });

  it('replaces an existing bootstrap script tag', () => {
    const html = injectCmsBootstrapIntoHtml(
      '<html><head></head><body></body></html>',
      { contentVersion: 1 },
    );
    const updated = injectCmsBootstrapIntoHtml(html, { contentVersion: 9 });
    expect(updated.match(/cms-bootstrap/g)?.length).toBe(1);
    expect(updated).toContain('"contentVersion":9');
  });
});

describe('readDomCmsBootstrap', () => {
  it('parses bootstrap payload from the document', () => {
    document.body.innerHTML = `<script id="${CMS_BOOTSTRAP_SCRIPT_ID}" type="application/json">{"contentVersion":3,"articles":[]}</script>`;
    expect(readDomCmsBootstrap()).toEqual({ contentVersion: 3, articles: [] });
  });
});
