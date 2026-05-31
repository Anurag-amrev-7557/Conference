import { describe, expect, it } from 'vitest';
import { deepMergeObjects } from './mergePatch';

describe('deepMergeObjects', () => {
  it('merges nested settings without replacing sibling keys', () => {
    const base = {
      seo: { title: 'Site' },
      conferenceRegistration: { formTitle: 'Old', fields: { name: { label: 'Name' } } },
    };
    const patch = {
      conferenceRegistration: { formTitle: 'New', fields: { phone: { label: 'Mobile' } } },
    };
    const merged = deepMergeObjects(base, patch);
    expect(merged.seo).toEqual({ title: 'Site' });
    expect(merged.conferenceRegistration).toEqual({
      formTitle: 'New',
      fields: { name: { label: 'Name' }, phone: { label: 'Mobile' } },
    });
  });
});
