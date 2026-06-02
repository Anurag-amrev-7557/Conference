import { describe, expect, it } from 'vitest';
import { eventUpdateSchema } from './event';

describe('eventUpdateSchema', () => {
  it('accepts null on optional text fields from admin payloads', () => {
    const result = eventUpdateSchema.safeParse({
      description: null,
      registrationUrl: null,
      seoTitle: null,
      seoDescription: null,
      ogImage: null,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe('');
      expect(result.data.registrationUrl).toBe('');
      expect(result.data.seoTitle).toBeNull();
    }
  });
});
