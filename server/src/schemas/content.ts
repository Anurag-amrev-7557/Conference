import { z } from 'zod';

export const contentPatchSchema = z
  .object({
    hero: z.record(z.unknown()).optional(),
    settings: z.record(z.unknown()).optional(),
    appearance: z.record(z.unknown()).optional(),
    stats: z.array(z.unknown()).optional(),
    pillars: z.array(z.unknown()).optional(),
    perks: z.array(z.unknown()).optional(),
  })
  .strict();
