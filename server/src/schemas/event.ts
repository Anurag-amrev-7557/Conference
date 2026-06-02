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

export const eventCreateSchema = z
  .object({
    day: z.string().min(1),
    weekday: z.string().optional(),
    time: z.string().optional(),
    full_time: z.string().optional(),
    title: z.string().min(1),
    host: z.string().optional(),
    location: z.string().optional(),
    description: z.string().max(10000).optional(),
    tags: z.array(eventTagSchema).optional(),
    price: z.string().optional(),
    thumbnail: z.string().optional(),
    status: z.string().optional(),
    isPublished: z.boolean().optional(),
    publishAt: optionalEventDatetime,
    unpublishAt: optionalEventDatetime,
    registrationUrl: z.string().max(2048).optional(),
    registrationOpen: z.boolean().optional(),
    startDate: optionalEventDatetime,
    endDate: optionalEventDatetime,
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    ogImage: z.string().optional(),
    noindex: z.boolean().optional(),
  })
  .strict();

export const eventUpdateSchema = eventCreateSchema.partial().strict();
