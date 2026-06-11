import { z } from 'zod';

/** Admin forms may send null for cleared optional SEO fields; Prisma columns are nullable. */
function optionalArticleNullableString(maxLen?: number) {
  const base = maxLen ? z.string().max(maxLen) : z.string();
  return z.preprocess((value) => {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    return String(value);
  }, base.nullable().optional());
}

const optionalArticleOgImage = z.preprocess(
  (value) => {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    return String(value);
  },
  z
    .string()
    .max(2048)
    .nullable()
    .optional()
    .refine((v) => v == null || /^https:\/\//.test(v), {
      message: 'ogImage must be an https URL when provided',
    }),
);

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
    publishAt: z.string().datetime().nullable().optional(),
    unpublishAt: z.string().datetime().nullable().optional(),
    authorName: z.string().min(1),
    authorRole: z.string().optional(),
    authorAvatar: z.string().optional(),
    publishedAt: z.string().optional(),
    seoTitle: optionalArticleNullableString(200),
    seoDescription: optionalArticleNullableString(500),
    ogImage: optionalArticleOgImage,
    noindex: z.boolean().optional(),
  })
  .strict();

export const articleUpdateSchema = articleCreateSchema.partial().strict();
