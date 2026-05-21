import { z } from 'zod';

const eventTagSchema = z.object({
  name: z.string(),
  color: z.string(),
});

export const eventCreateSchema = z
  .object({
    day: z.string().min(1),
    weekday: z.string().optional(),
    time: z.string().optional(),
    full_time: z.string().optional(),
    title: z.string().min(1),
    host: z.string().optional(),
    location: z.string().optional(),
    tags: z.array(eventTagSchema).optional(),
    price: z.string().optional(),
    thumbnail: z.string().optional(),
    status: z.string().optional(),
    isPublished: z.boolean().optional(),
    startDate: z.string().datetime().optional().nullable(),
    endDate: z.string().datetime().optional().nullable(),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    ogImage: z.string().optional(),
    noindex: z.boolean().optional(),
  })
  .strict();

export const eventUpdateSchema = eventCreateSchema.partial().strict();
