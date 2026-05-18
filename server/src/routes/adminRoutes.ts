import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { validateBody } from '../middleware/validateBody';
import { contentPatchSchema } from '../schemas/content';
import { articleCreateSchema, articleUpdateSchema } from '../schemas/article';
import { eventCreateSchema, eventUpdateSchema } from '../schemas/event';
import {
  communityAdminCreateSchema,
  communityAdminUpdateSchema,
  communityPinSchema,
} from '../schemas/community';
import { getJwtSecret } from '../lib/jwtSecret';
import { sanitizeArticleHtml, validateCustomCss } from '../lib/sanitize';

const router = Router();

interface AdminJwtPayload {
  role: string;
  exp?: number;
}

export const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AdminJwtPayload;
    (req as Request & { admin?: AdminJwtPayload }).admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

router.use(authenticateAdmin);

// GET /api/v1/admin/me
router.get('/me', (req: Request, res: Response) => {
  const admin = (req as Request & { admin?: AdminJwtPayload }).admin;
  if (!admin) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
  res.json({
    ok: true,
    role: admin.role,
    username: 'admin',
    exp: admin.exp,
  });
});

// PATCH /api/v1/admin/content
router.patch('/content', validateBody(contentPatchSchema), async (req, res) => {
  const { hero, settings, appearance, stats, pillars, perks } = req.body;

  if (settings && typeof settings === 'object' && settings !== null && 'customCss' in settings) {
    const cssCheck = validateCustomCss((settings as Record<string, unknown>).customCss);
    if (!cssCheck.ok) {
      return res.status(400).json({
        errors: [{ path: cssCheck.field, message: cssCheck.message }],
      });
    }
  }

  try {
    const updated = await prisma.siteContent.update({
      where: { id: 'global' },
      data: {
        hero: hero ? JSON.stringify(hero) : undefined,
        settings: settings ? JSON.stringify(settings) : undefined,
        appearance: appearance ? JSON.stringify(appearance) : undefined,
        stats: stats ? JSON.stringify(stats) : undefined,
        pillars: pillars ? JSON.stringify(pillars) : undefined,
        perks: perks ? JSON.stringify(perks) : undefined,
      },
    });
    res.json({ success: true, updated });
  } catch {
    res.status(500).json({ error: 'Failed to update content.' });
  }
});

// --- Blog Management ---

router.post('/blogs', validateBody(articleCreateSchema), async (req, res) => {
  try {
    const data = { ...req.body };
    if (typeof data.content === 'string') {
      data.content = sanitizeArticleHtml(data.content);
    }
    const article = await prisma.article.create({ data });
    res.json(article);
  } catch {
    res.status(500).json({ error: 'Failed to create article.' });
  }
});

router.put('/blogs/:id', validateBody(articleUpdateSchema), async (req, res) => {
  try {
    const data = { ...req.body };
    if (typeof data.content === 'string') {
      data.content = sanitizeArticleHtml(data.content);
    }
    const article = await prisma.article.update({
      where: { id: req.params.id },
      data,
    });
    res.json(article);
  } catch {
    res.status(500).json({ error: 'Failed to update article.' });
  }
});

router.delete('/blogs/:id', async (req, res) => {
  try {
    await prisma.article.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete article.' });
  }
});

// --- Event Management ---

router.post('/events', validateBody(eventCreateSchema), async (req, res) => {
  const { tags, coordinates, ...rest } = req.body;
  try {
    const event = await prisma.event.create({
      data: {
        ...rest,
        tags: JSON.stringify(tags ?? []),
        lat: coordinates?.lat,
        lng: coordinates?.lng,
      },
    });
    res.json(event);
  } catch {
    res.status(500).json({ error: 'Failed to create event.' });
  }
});

router.put('/events/:id', validateBody(eventUpdateSchema), async (req, res) => {
  const { tags, coordinates, ...rest } = req.body;
  try {
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(tags !== undefined ? { tags: JSON.stringify(tags) } : {}),
        ...(coordinates !== undefined
          ? { lat: coordinates?.lat, lng: coordinates?.lng }
          : {}),
      },
    });
    res.json(event);
  } catch {
    res.status(500).json({ error: 'Failed to update event.' });
  }
});

router.delete('/events/:id', async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete event.' });
  }
});

// --- Community Management ---

router.post('/community/posts', validateBody(communityAdminCreateSchema), async (req, res) => {
  try {
    const post = await prisma.communityPost.create({
      data: req.body,
      include: { comments: true },
    });
    res.json(post);
  } catch {
    res.status(500).json({ error: 'Failed to create community post.' });
  }
});

router.put(
  '/community/posts/:id',
  validateBody(communityAdminUpdateSchema),
  async (req, res) => {
    try {
      const post = await prisma.communityPost.update({
        where: { id: req.params.id },
        data: req.body,
        include: { comments: true },
      });
      res.json(post);
    } catch {
      res.status(500).json({ error: 'Failed to update community post.' });
    }
  }
);

router.delete('/community/posts/:id', async (req, res) => {
  try {
    await prisma.communityPost.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete community post.' });
  }
});

router.patch(
  '/community/posts/:id/pin',
  validateBody(communityPinSchema),
  async (req, res) => {
    try {
      const post = await prisma.communityPost.update({
        where: { id: req.params.id },
        data: { isPinned: req.body.pinned },
      });
      res.json(post);
    } catch {
      res.status(500).json({ error: 'Failed to pin community post.' });
    }
  }
);

router.delete('/community/comments/:id', async (req, res) => {
  try {
    await prisma.comment.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
});

export default router;
