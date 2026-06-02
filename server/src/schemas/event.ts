import { z } from 'zod';

const eventTagSchema = z.object({
  name: z.string(),
  color: z.string(),
});

/** Accept ISO strings, datetime-local values, and empty strings from admin forms. */
const optionalEventDatetime = z.preprocess(
  (value) => {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    const d = new Date(String(value));
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  },
  z.string().datetime().nullable().optional(),
);

/** Admin/API may send null for empty optional text; Prisma string columns use "". */
function optionalEventString(maxLen?: number) {
  const base = maxLen ? z.string().max(maxLen) : z.string();
  return z.preprocess(
    (value) => {
      if (value === undefined) return undefined;
      if (value === null) return '';
      return String(value);
    },
    base.optional(),
  );
}

/** Nullable SEO columns in the database. */
function optionalEventNullableString(maxLen?: number) {
  const base = maxLen ? z.string().max(maxLen) : z.string();
  return z.preprocess(
    (value) => {
      if (value === undefined) return undefined;
      if (value === null || value === '') return null;
      return String(value);
    },
    base.nullable().optional(),
  );
}

export const eventCreateSchema = z
  .object({
    day: z.string().min(1),
    weekday: optionalEventString(),
    time: optionalEventString(),
    full_time: optionalEventString(),
    title: z.string().min(1),
    host: optionalEventString(),
    location: optionalEventString(),
    description: optionalEventString(10000),
    tags: z.array(eventTagSchema).optional(),
    price: optionalEventString(),
    thumbnail: optionalEventString(),
    status: optionalEventString(),
    isPublished: z.boolean().optional(),
    publishAt: optionalEventDatetime,
    unpublishAt: optionalEventDatetime,
    registrationUrl: optionalEventString(2048),
    registrationOpen: z.boolean().optional(),
    startDate: optionalEventDatetime,
    endDate: optionalEventDatetime,
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
    lat: z.number().nullable().optional(),
    lng: z.number().nullable().optional(),
    seoTitle: optionalEventNullableString(200),
    seoDescription: optionalEventNullableString(500),
    ogImage: optionalEventNullableString(2048),
    noindex: z.boolean().optional(),
  })
  .strict();

export const eventUpdateSchema = eventCreateSchema.partial().strict();
