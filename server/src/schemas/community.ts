import { z } from 'zod';

const COMMUNITY_CATEGORIES = [
  'Architecture',
  'Prompt Engineering',
  'No-Code',
  'Strategy',
  'Venture',
  'General',
] as const;

export const communityAdminCreateSchema = z
  .object({
    title: z.string().min(1),
    content: z.string().min(1),
    category: z.enum(COMMUNITY_CATEGORIES),
    authorName: z.string().min(1).max(64),
    authorAvatar: z.string().optional(),
    authorRole: z.string().optional(),
    isPinned: z.boolean().optional(),
  })
  .strict();

export const communityAdminUpdateSchema = communityAdminCreateSchema.partial().strict();

export const communityPinSchema = z
  .object({
    pinned: z.boolean(),
  })
  .strict();
