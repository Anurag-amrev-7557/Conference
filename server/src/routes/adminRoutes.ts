import { Router, Request, Response, NextFunction } from 'express';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import sharp from 'sharp';
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

/** Repo-root public/og — served by Vite/static host at /og/{file} */
const OG_UPLOAD_DIR = join(__dirname, '../../../public/og');
const MEDIA_UPLOAD_DIR = join(__dirname, '../../../public/media');

const ALLOWED_OG_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const ogUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export function isAllowedOgMime(mimetype: string): boolean {
  return ALLOWED_OG_MIMES.has(mimetype);
}

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

// POST /api/v1/admin/og-image — resize to 1200×630 JPEG under public/og/
router.post('/og-image', (req, res, next) => {
  ogUpload.single('file')(req, res, (err: unknown) => {
    if (err) {
      const code = (err as { code?: string }).code;
      if (code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'Image must be 5MB or smaller.' });
      }
      return res.status(400).json({ error: 'Invalid upload.' });
    }
    next();
  });
}, async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded. Use field name "file".' });
  }
  if (!isAllowedOgMime(file.mimetype)) {
    return res.status(400).json({ error: 'Only JPEG, PNG, and WebP images are allowed.' });
  }

  try {
    await mkdir(OG_UPLOAD_DIR, { recursive: true });
    const filename = `${randomUUID()}.jpg`;
    const outPath = join(OG_UPLOAD_DIR, filename);
    const buffer = await sharp(file.buffer)
      .resize(1200, 630, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 85 })
      .toBuffer();
    await writeFile(outPath, buffer);
    res.json({ url: `/og/${filename}` });
  } catch {
    res.status(500).json({ error: 'Failed to process image.' });
  }
});

// POST /api/v1/admin/media-image — general images under public/media/
router.post('/media-image', (req, res, next) => {
  ogUpload.single('file')(req, res, (err: unknown) => {
    if (err) {
      const code = (err as { code?: string }).code;
      if (code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'Image must be 5MB or smaller.' });
      }
      return res.status(400).json({ error: 'Invalid upload.' });
    }
    next();
  });
}, async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded. Use field name "file".' });
  }
  if (!isAllowedOgMime(file.mimetype)) {
    return res.status(400).json({ error: 'Only JPEG, PNG, and WebP images are allowed.' });
  }

  try {
    await mkdir(MEDIA_UPLOAD_DIR, { recursive: true });
    const ext = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
    const filename = `${randomUUID()}.${ext}`;
    const outPath = join(MEDIA_UPLOAD_DIR, filename);
    let pipeline = sharp(file.buffer).resize(1920, 1920, { fit: 'inside', withoutEnlargement: true });
    if (ext === 'png') pipeline = pipeline.png();
    else if (ext === 'webp') pipeline = pipeline.webp({ quality: 85 });
    else pipeline = pipeline.jpeg({ quality: 85 });
    await writeFile(outPath, await pipeline.toBuffer());
    res.json({ url: `/media/${filename}` });
  } catch {
    res.status(500).json({ error: 'Failed to process image.' });
  }
});

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
  const { tags, coordinates, startDate, endDate, ...rest } = req.body;
  try {
    const event = await prisma.event.create({
      data: {
        ...rest,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
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
  const { tags, coordinates, startDate, endDate, ...rest } = req.body;
  try {
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(startDate !== undefined
          ? { startDate: startDate ? new Date(startDate) : null }
          : {}),
        ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
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
