import { Router, Request, Response, NextFunction } from 'express';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
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
  registrationAdminCreateSchema,
  registrationUpdateSchema,
} from '../schemas/registration';
import { getConferenceRegistrationSettings } from '../lib/conferenceRegistrationSettings';
import {
  conferenceRegistrations,
  type ConferenceRegistrationRow,
} from '../lib/conferenceRegistrations';
import { getJwtSecret } from '../lib/jwtSecret';
import { sanitizeArticleHtml, validateCustomCss } from '../lib/sanitize';
import { embedHomepageInSettingsPatch, expandHomepageFromSettings } from '../lib/homepageContent';
import { publicAssetUrl } from '../lib/apiPublicUrl';
import { getMediaUploadDir, getOgUploadDir } from '../lib/uploadPaths';
import { isSafeMediaFilename, listMediaFiles } from '../lib/listMediaFiles';
import { deepMergeObjects, safeParseJsonRecord } from '../lib/mergePatch';
import { backupDatabase } from '../lib/backupDatabase';

const router = Router();

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
    const ogDir = getOgUploadDir();
    await mkdir(ogDir, { recursive: true });
    const filename = `${randomUUID()}.jpg`;
    const outPath = join(ogDir, filename);
    const buffer = await sharp(file.buffer)
      .resize(1200, 630, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 85 })
      .toBuffer();
    await writeFile(outPath, buffer);
    res.json({ url: publicAssetUrl(`/og/${filename}`) });
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
    const mediaDir = getMediaUploadDir();
    await mkdir(mediaDir, { recursive: true });
    const ext = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
    const filename = `${randomUUID()}.${ext}`;
    const outPath = join(mediaDir, filename);
    let pipeline = sharp(file.buffer).resize(1920, 1920, { fit: 'inside', withoutEnlargement: true });
    if (ext === 'png') pipeline = pipeline.png();
    else if (ext === 'webp') pipeline = pipeline.webp({ quality: 85 });
    else pipeline = pipeline.jpeg({ quality: 85 });
    await writeFile(outPath, await pipeline.toBuffer());
    res.json({ url: publicAssetUrl(`/media/${filename}`) });
  } catch {
    res.status(500).json({ error: 'Failed to process image.' });
  }
});

// GET /api/v1/admin/media — list uploaded library images
router.get('/media', async (_req, res) => {
  try {
    const items = await listMediaFiles();
    res.json({ items });
  } catch {
    res.status(500).json({ error: 'Failed to list media.' });
  }
});

// DELETE /api/v1/admin/media/:filename
router.delete('/media/:filename', async (req, res) => {
  const { filename } = req.params;
  if (!isSafeMediaFilename(filename)) {
    return res.status(400).json({ error: 'Invalid filename.' });
  }

  const filePath = join(getMediaUploadDir(), filename);
  try {
    await unlink(filePath);
    res.json({ success: true });
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      return res.status(404).json({ error: 'File not found.' });
    }
    res.status(500).json({ error: 'Failed to delete file.' });
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

// POST /api/v1/admin/backup — snapshot SQLite CMS database to UPLOAD_ROOT/backups/
router.post('/backup', async (_req, res) => {
  try {
    const result = await backupDatabase();
    if (!result) {
      return res.status(400).json({ error: 'Backup is only available for SQLite file databases.' });
    }
    res.json({ success: true, backupPath: result.backupPath, pruned: result.pruned });
  } catch {
    res.status(500).json({ error: 'Backup failed.' });
  }
});

// PATCH /api/v1/admin/content
router.patch('/content', validateBody(contentPatchSchema), async (req, res) => {
  const expanded = embedHomepageInSettingsPatch(expandHomepageFromSettings(req.body));
  const { hero, settings, appearance, stats, pillars, perks } = expanded;

  if (settings && typeof settings === 'object' && settings !== null && 'customCss' in settings) {
    const cssCheck = validateCustomCss((settings as Record<string, unknown>).customCss);
    if (!cssCheck.ok) {
      return res.status(400).json({
        errors: [{ path: cssCheck.field, message: cssCheck.message }],
      });
    }
  }

  try {
    const existing = await prisma.siteContent.findUnique({ where: { id: 'global' } });
    const mergedSettings =
      settings && typeof settings === 'object'
        ? deepMergeObjects(safeParseJsonRecord(existing?.settings), settings as Record<string, unknown>)
        : undefined;

    const updated = await prisma.siteContent.upsert({
      where: { id: 'global' },
      create: {
        id: 'global',
        hero: JSON.stringify(hero ?? {}),
        settings: JSON.stringify(mergedSettings ?? settings ?? {}),
        appearance: JSON.stringify(appearance ?? {}),
        stats: JSON.stringify(stats ?? []),
        pillars: JSON.stringify(pillars ?? []),
        perks: JSON.stringify(perks ?? []),
      },
      update: {
        hero: hero ? JSON.stringify(hero) : undefined,
        settings: mergedSettings ? JSON.stringify(mergedSettings) : undefined,
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

// --- Summit registrations (CRM) ---

function mapRegistration(r: ConferenceRegistrationRow) {
  return {
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

router.post('/registrations', validateBody(registrationAdminCreateSchema), async (req, res) => {
  try {
    const regSettings = await getConferenceRegistrationSettings();
    const { name, email, phone, linkedIn, designation, status, ticketPriceCents } = req.body;
    const record = await conferenceRegistrations.create({
      name,
      email: email.toLowerCase(),
      phone,
      linkedIn: linkedIn ?? '',
      designation,
      ticketPriceCents: ticketPriceCents ?? regSettings.ticketPriceCents,
      status: status ?? 'pending',
    });
    res.status(201).json(mapRegistration(record));
  } catch {
    res.status(500).json({ error: 'Failed to create registration.' });
  }
});

router.get('/registrations', async (_req, res) => {
  try {
    const items = await conferenceRegistrations.findMany();
    res.json({ items: items.map(mapRegistration), total: items.length });
  } catch {
    res.status(500).json({ error: 'Failed to fetch registrations.' });
  }
});

router.get('/registrations/:id', async (req, res) => {
  try {
    const record = await conferenceRegistrations.findUnique(req.params.id);
    if (!record) return res.status(404).json({ error: 'Registration not found.' });
    res.json(mapRegistration(record));
  } catch {
    res.status(500).json({ error: 'Failed to fetch registration.' });
  }
});

router.put('/registrations/:id', validateBody(registrationUpdateSchema), async (req, res) => {
  try {
    const data = { ...req.body };
    if (typeof data.email === 'string') {
      data.email = data.email.toLowerCase();
    }
    const record = await conferenceRegistrations.update(req.params.id, data);
    res.json(mapRegistration(record));
  } catch {
    res.status(500).json({ error: 'Failed to update registration.' });
  }
});

router.delete('/registrations/:id', async (req, res) => {
  try {
    await conferenceRegistrations.delete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete registration.' });
  }
});

export default router;
