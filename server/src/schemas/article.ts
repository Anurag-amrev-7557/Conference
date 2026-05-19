import { z } from 'zod';

export const articleCreateSchema = z
  .object({
    slug: z.string().min(1),
    title: z.string().min(1),
    category: z.string().min(1),
    time: z.string().optional(),
    excerpt: z.string().optional(),
    content: z.string().optional(),
    thumbnail: z.string().optional(),
    isPublished: z.boolean().optional(),
    authorName: z.string().min(1),
    authorRole: z.string().optional(),
    authorAvatar: z.string().optional(),
    publishedAt: z.string().optional(),
    seoTitle: z.string().max(200).optional(),
    seoDescription: z.string().max(500).optional(),
    ogImage: z
      .string()
      .max(2048)
      .optional()
      .refine((v) => !v || v === '' || /^https:\/\//.test(v), {
        message: 'ogImage must be an https URL when provided',
      }),
    noindex: z.boolean().optional(),
  })
  .strict();

export const articleUpdateSchema = articleCreateSchema.partial().strict();
