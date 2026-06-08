import { z } from 'zod';

const routeSeoEntrySchema = z.object({
  title: z.string().max(120).optional(),
  description: z.string().max(200).optional(),
  ogImage: z.string().max(500).optional(),
});

const catalogPageSchema = z.object({
  eyebrow: z.string().max(64).optional(),
  title: z.string().max(120).optional(),
  titleAccent: z.string().max(64).optional(),
  lede: z.string().max(500).optional(),
  searchPlaceholder: z.string().max(120).optional(),
  pageSize: z.number().int().min(1).max(48).optional(),
  emptyStateTitle: z.string().max(120).optional(),
  emptyStateBody: z.string().max(400).optional(),
  emptyStateCtaLabel: z.string().max(48).optional(),
  emptyStateCtaHref: z.string().max(200).optional(),
});

/** Validates high-risk settings slices on PATCH without blocking legacy keys. */
export const settingsPatchSchema = z
  .object({
    routeSeo: z.record(routeSeoEntrySchema).optional(),
    catalogPages: z
      .object({
        blog: catalogPageSchema.optional(),
        events: catalogPageSchema.optional(),
        speakers: catalogPageSchema.optional(),
      })
      .passthrough()
      .optional(),
    routeVisibility: z
      .object({
        blog: z.boolean().optional(),
        events: z.boolean().optional(),
        speakers: z.boolean().optional(),
        register: z.boolean().optional(),
      })
      .optional(),
    navigation: z
      .object({
        navbarVisible: z.boolean().optional(),
        brandLogoAlt: z.string().max(120).optional(),
      })
      .passthrough()
      .optional(),
    footer: z
      .object({
        registryCtaHref: z.string().max(200).optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const contentPatchSchema = z
  .object({
    hero: z.record(z.unknown()).optional(),
    settings: settingsPatchSchema.optional(),
    appearance: z.record(z.unknown()).optional(),
    stats: z.array(z.unknown()).optional(),
    pillars: z.array(z.unknown()).optional(),
    perks: z.array(z.unknown()).optional(),
    version: z.number().int().positive().optional(),
  })
  .strict();

export type ContentPatchBody = z.infer<typeof contentPatchSchema>;
