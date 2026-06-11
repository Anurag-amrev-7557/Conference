import { describe, expect, it } from 'vitest';
import { contrastRatio, ensureAccentContrast } from './contrast';

describe('contrast', () => {
  it('ensures white text meets AA on light accent colors', () => {
    const adjusted = ensureAccentContrast('#ffcc00');
    expect(contrastRatio('#ffffff', adjusted)).toBeGreaterThanOrEqual(4.5);
  });

  it('preserves already-accessible accent colors', () => {
    expect(ensureAccentContrast('#003E99')).toBe('#003E99');
  });
});
