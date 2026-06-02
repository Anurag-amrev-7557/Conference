import { z } from 'zod';

export const newsletterSignupSchema = z
  .object({
    email: z.string().email().max(320),
    source: z.string().max(64).optional(),
  })
  .strict();
