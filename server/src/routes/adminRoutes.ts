import { Router, Request, Response, NextFunction } from 'express';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
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
import { sanitizeArticleHtml, validateCustomCss, validateInjectedScripts } from '../lib/sanitize';
import { embedHomepageInSettingsPatch, expandHomepageFromSettings } from '../lib/homepageContent';
import { publicAssetUrl } from '../lib/apiPublicUrl';
import { getMediaUploadDir, getOgUploadDir } from '../lib/uploadPaths';
import { isSafeMediaFilename, listMediaFiles } from '../lib/listMediaFiles';
import { loadAdminPermissions, mergeAdminPermissions, resolvePermissionsForRole } from '../lib/adminPermissions';
import { deepMergeObjects, safeParseJsonRecord } from '../lib/mergePatch';
import { backupDatabase } from '../lib/backupDatabase';
import { notifyRegistrantOfStatus } from '../lib/registrationNotifications';
import { writeAuditLog, saveContentRevision, getAdminFromRequest } from '../lib/auditLog';
import { blockViewerMutations, requireMinRole } from '../middleware/requireRole';
import {
  assertCanChangePrivilegedRole,
  assertCanDeleteAdminUser,
  countPrivilegedAdmins,
  MIN_PRIVILEGED_ADMINS,
} from '../lib/adminUserGuard';

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
  username?: string;
  adminId?: string;
  exp?: number;
}

function parseOptionalDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeArticleInput(body: Record<string, unknown>) {
  const data = {
    time: '',
    excerpt: '',
    content: '',
    thumbnail: '',
    authorRole: '',
    authorAvatar: '',
    publishedAt: new Date().toISOString().slice(0, 10),
    isPublished: false,
    noindex: false,
    ...body,
  };
  if (typeof data.content === 'string') {
    data.content = sanitizeArticleHtml(data.content);
  }
  if ('publishAt' in data) data.publishAt = parseOptionalDate(data.publishAt);
  if ('unpublishAt' in data) data.unpublishAt = parseOptionalDate(data.unpublishAt);
  return data;
}

function normalizeEventInput(body: Record<string, unknown>) {
  const { tags, coordinates, lat, lng, startDate, endDate, publishAt, unpublishAt, ...rest } = body;
  const resolvedLat = (lat as number | undefined) ?? (coordinates as { lat?: number } | undefined)?.lat;
  const resolvedLng = (lng as number | undefined) ?? (coordinates as { lng?: number } | undefined)?.lng;
  return {
    weekday: '',
    time: '',
    full_time: '',
    host: '',
    location: '',
    description: '',
    price: '',
    thumbnail: '',
    status: 'Upcoming',
    isPublished: true,
    registrationUrl: '',
    registrationOpen: true,
    noindex: false,
    ...rest,
    tags: JSON.stringify(Array.isArray(tags) ? tags : []),
    lat: resolvedLat,
    lng: resolvedLng,
    startDate: startDate ? new Date(String(startDate)) : null,
    endDate: endDate ? new Date(String(endDate)) : null,
    publishAt: parseOptionalDate(publishAt) ?? null,
    unpublishAt: parseOptionalDate(unpublishAt) ?? null,
  };
}

function serializeArticle<T extends { content: string; publishAt?: Date | null; unpublishAt?: Date | null }>(
  article: T,
) {
  return {
    ...article,
    content: sanitizeArticleHtml(article.content),
    publishAt: article.publishAt?.toISOString() ?? null,
    unpublishAt: article.unpublishAt?.toISOString() ?? null,
  };
}

function serializeEventRow<
  T extends {
    tags: string;
    startDate?: Date | null;
    endDate?: Date | null;
    publishAt?: Date | null;
    unpublishAt?: Date | null;
  },
>(e: T) {
  return {
    ...e,
    startDate: e.startDate?.toISOString() ?? null,
    endDate: e.endDate?.toISOString() ?? null,
    publishAt: e.publishAt?.toISOString() ?? null,
    unpublishAt: e.unpublishAt?.toISOString() ?? null,
    tags: (() => {
      try {
        return e.tags ? JSON.parse(e.tags) : [];
      } catch {
        return [];
      }
    })(),
  };
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
router.use(blockViewerMutations);

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
router.get('/me', async (req: Request, res: Response) => {
  const adminJwt = (req as Request & { admin?: AdminJwtPayload }).admin;
  if (!adminJwt) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
  let role = adminJwt.role ?? 'super_admin';
  let username = adminJwt.username ?? 'admin';
  if (adminJwt.adminId) {
    const row = await prisma.admin.findUnique({ where: { id: adminJwt.adminId } });
    if (row) {
      role = row.role;
      username = row.username;
    }
  }
  res.json({
    ok: true,
    role,
    username,
    exp: adminJwt.exp,
    permissions: await loadAdminPermissions(),
  });
});

// GET /api/v1/admin/permissions — role access matrix (super_admin)
router.get('/permissions', requireMinRole('super_admin'), async (_req, res) => {
  try {
    const permissions = await loadAdminPermissions();
    res.json({ permissions });
  } catch {
    res.status(500).json({ error: 'Failed to load permissions.' });
  }
});

// PUT /api/v1/admin/permissions — update role access matrix (super_admin)
router.put('/permissions', requireMinRole('super_admin'), async (req, res) => {
  const { permissions: raw } = req.body as { permissions?: unknown };
  if (!raw || typeof raw !== 'object') {
    return res.status(400).json({ error: 'permissions object is required.' });
  }
  try {
    const permissions = mergeAdminPermissions(raw);
    const existing = await prisma.siteContent.findUnique({ where: { id: 'global' } });
    const settings = existing?.settings ? JSON.parse(existing.settings) : {};
    settings.adminPermissions = permissions;
    await prisma.siteContent.upsert({
      where: { id: 'global' },
      create: {
        id: 'global',
        hero: '{}',
        settings: JSON.stringify(settings),
        appearance: '{}',
        stats: '[]',
        pillars: '[]',
        perks: '[]',
      },
      update: { settings: JSON.stringify(settings) },
    });
    await writeAuditLog(req, {
      action: 'update',
      entityType: 'admin_permissions',
      summary: 'Updated role access matrix',
    });
    res.json({ success: true, permissions });
  } catch (err) {
    console.error('Permissions update error:', err);
    res.status(500).json({ error: 'Failed to save permissions.' });
  }
});

// POST /api/v1/admin/backup — snapshot SQLite CMS database to UPLOAD_ROOT/backups/
router.post('/backup', requireMinRole('super_admin'), async (req, res) => {
  try {
    const result = await backupDatabase();
    if (!result) {
      return res.status(400).json({ error: 'Backup is only available for SQLite file databases.' });
    }
    await writeAuditLog(req, { action: 'backup', entityType: 'database', summary: result.backupPath });
    res.json({ success: true, backupPath: result.backupPath, pruned: result.pruned });
  } catch {
    res.status(500).json({ error: 'Backup failed.' });
  }
});

// GET /api/v1/admin/audit-log
router.get('/audit-log', async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? '50'), 10) || 50, 1), 200);
    const items = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    res.json({
      items: items.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
      })),
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch audit log.' });
  }
});

// GET /api/v1/admin/revisions/:entityType/:entityId
router.get('/revisions/:entityType/:entityId', async (req, res) => {
  try {
    const items = await prisma.contentRevision.findMany({
      where: {
        entityType: req.params.entityType,
        entityId: req.params.entityId,
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: {
        id: true,
        entityType: true,
        entityId: true,
        changedBy: true,
        createdAt: true,
      },
    });
    res.json({
      items: items.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch revisions.' });
  }
});

// GET /api/v1/admin/revisions/detail/:id — full snapshot for preview
router.get('/revisions/detail/:id', async (req, res) => {
  try {
    const revision = await prisma.contentRevision.findUnique({ where: { id: req.params.id } });
    if (!revision) return res.status(404).json({ error: 'Revision not found.' });
    let snapshot: unknown;
    try {
      snapshot = JSON.parse(revision.snapshot);
    } catch {
      snapshot = null;
    }
    res.json({
      id: revision.id,
      entityType: revision.entityType,
      entityId: revision.entityId,
      changedBy: revision.changedBy,
      createdAt: revision.createdAt.toISOString(),
      snapshot,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch revision.' });
  }
});

// POST /api/v1/admin/revisions/:id/restore
router.post('/revisions/:id/restore', requireMinRole('editor'), async (req, res) => {
  try {
    const revision = await prisma.contentRevision.findUnique({ where: { id: req.params.id } });
    if (!revision) return res.status(404).json({ error: 'Revision not found.' });

    const snapshot = JSON.parse(revision.snapshot) as Record<string, unknown>;
    const admin = getAdminFromRequest(req);

    if (revision.entityType === 'site_content') {
      await saveContentRevision('site_content', 'global', {
        hero: snapshot.hero,
        settings: snapshot.settings,
        appearance: snapshot.appearance,
        stats: snapshot.stats,
        pillars: snapshot.pillars,
        perks: snapshot.perks,
      }, admin.username ?? 'admin');
      await prisma.siteContent.update({
        where: { id: 'global' },
        data: {
          hero: JSON.stringify(snapshot.hero ?? {}),
          settings: JSON.stringify(snapshot.settings ?? {}),
          appearance: JSON.stringify(snapshot.appearance ?? {}),
          stats: JSON.stringify(snapshot.stats ?? []),
          pillars: JSON.stringify(snapshot.pillars ?? []),
          perks: JSON.stringify(snapshot.perks ?? []),
        },
      });
    } else if (revision.entityType === 'article') {
      const { id: _id, createdAt: _c, updatedAt: _u, deletedAt: _d, ...data } = snapshot as Record<string, unknown>;
      await prisma.article.update({ where: { id: revision.entityId }, data: data as never });
    } else if (revision.entityType === 'event') {
      const { id: _id, createdAt: _c, updatedAt: _u, deletedAt: _d, ...data } = snapshot as Record<string, unknown>;
      await prisma.event.update({ where: { id: revision.entityId }, data: data as never });
    } else {
      return res.status(400).json({ error: 'Unsupported entity type for restore.' });
    }

    await writeAuditLog(req, {
      action: 'restore',
      entityType: revision.entityType,
      entityId: revision.entityId,
      summary: `Restored from revision ${revision.id}`,
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to restore revision.' });
  }
});

// GET /api/v1/admin/blogs — includes unpublished; ?trash=1 for soft-deleted
router.get('/blogs', async (req, res) => {
  const trash = req.query.trash === '1';
  try {
    const items = await prisma.article.findMany({
      where: trash ? { deletedAt: { not: null } } : { deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ items: items.map((a) => serializeArticle(a)) });
  } catch {
    res.status(500).json({ error: 'Failed to list articles.' });
  }
});

// GET /api/v1/admin/events
router.get('/events', async (req, res) => {
  const trash = req.query.trash === '1';
  try {
    const rows = await prisma.event.findMany({
      where: trash ? { deletedAt: { not: null } } : { deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({
      items: rows.map((e) => serializeEventRow(e)),
    });
  } catch {
    res.status(500).json({ error: 'Failed to list events.' });
  }
});

// GET /api/v1/admin/export — full CMS snapshot as JSON
router.get('/export', requireMinRole('editor'), async (_req, res) => {
  try {
    const [content, articles, events, registrations] = await Promise.all([
      prisma.siteContent.findUnique({ where: { id: 'global' } }),
      prisma.article.findMany({ orderBy: { updatedAt: 'desc' } }),
      prisma.event.findMany({ orderBy: { updatedAt: 'desc' } }),
      prisma.conferenceRegistration.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);

    const parse = (raw: string | null | undefined, fallback: unknown = {}) => {
      try {
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    };

    res.json({
      exportedAt: new Date().toISOString(),
      siteContent: content
        ? {
            hero: parse(content.hero),
            settings: parse(content.settings),
            appearance: parse(content.appearance),
            stats: parse(content.stats, []),
            pillars: parse(content.pillars, []),
            perks: parse(content.perks, []),
            updatedAt: content.updatedAt.toISOString(),
          }
        : null,
      articles,
      events: events.map((e) => ({
        ...e,
        tags: parse(e.tags, []),
        startDate: e.startDate?.toISOString() ?? null,
        endDate: e.endDate?.toISOString() ?? null,
      })),
      registrations: registrations.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    });
  } catch {
    res.status(500).json({ error: 'Export failed.' });
  }
});

// POST /api/v1/admin/import — restore from export JSON (super_admin)
router.post('/import', requireMinRole('super_admin'), async (req, res) => {
  const body = req.body as {
    siteContent?: {
      hero?: unknown;
      settings?: unknown;
      appearance?: unknown;
      stats?: unknown;
      pillars?: unknown;
      perks?: unknown;
    };
    articles?: Array<Record<string, unknown>>;
    events?: Array<Record<string, unknown>>;
  };

  if (!body?.siteContent && !body?.articles?.length && !body?.events?.length) {
    return res.status(400).json({ error: 'Import payload must include siteContent, articles, or events.' });
  }

  const summary = { siteContent: 0, articlesCreated: 0, articlesUpdated: 0, eventsCreated: 0, eventsUpdated: 0 };

  try {
    if (body.siteContent) {
      const existing = await prisma.siteContent.findUnique({ where: { id: 'global' } });
      if (existing) {
        await saveContentRevision(
          'site_content',
          'global',
          {
            hero: JSON.parse(existing.hero),
            settings: JSON.parse(existing.settings),
            appearance: JSON.parse(existing.appearance),
            stats: JSON.parse(existing.stats),
            pillars: JSON.parse(existing.pillars),
            perks: JSON.parse(existing.perks),
          },
          getAdminFromRequest(req).username ?? 'admin',
        );
      }
      const sc = body.siteContent;
      await prisma.siteContent.upsert({
        where: { id: 'global' },
        create: {
          id: 'global',
          hero: JSON.stringify(sc.hero ?? {}),
          settings: JSON.stringify(sc.settings ?? {}),
          appearance: JSON.stringify(sc.appearance ?? {}),
          stats: JSON.stringify(sc.stats ?? []),
          pillars: JSON.stringify(sc.pillars ?? []),
          perks: JSON.stringify(sc.perks ?? []),
        },
        update: {
          ...(sc.hero !== undefined ? { hero: JSON.stringify(sc.hero) } : {}),
          ...(sc.settings !== undefined ? { settings: JSON.stringify(sc.settings) } : {}),
          ...(sc.appearance !== undefined ? { appearance: JSON.stringify(sc.appearance) } : {}),
          ...(sc.stats !== undefined ? { stats: JSON.stringify(sc.stats) } : {}),
          ...(sc.pillars !== undefined ? { pillars: JSON.stringify(sc.pillars) } : {}),
          ...(sc.perks !== undefined ? { perks: JSON.stringify(sc.perks) } : {}),
        },
      });
      summary.siteContent = 1;
    }

    for (const raw of body.articles ?? []) {
      const {
        id,
        createdAt: _c,
        updatedAt: _u,
        deletedAt: _d,
        ...fields
      } = raw;
      if (typeof fields.content === 'string') {
        fields.content = sanitizeArticleHtml(fields.content);
      }
      if (typeof id === 'string') {
        const found = await prisma.article.findUnique({ where: { id } });
        if (found) {
          await prisma.article.update({ where: { id }, data: fields as never });
          summary.articlesUpdated += 1;
          continue;
        }
      }
      await prisma.article.create({ data: fields as never });
      summary.articlesCreated += 1;
    }

    for (const raw of body.events ?? []) {
      const {
        id,
        createdAt: _c,
        updatedAt: _u,
        deletedAt: _d,
        tags,
        startDate,
        endDate,
        ...rest
      } = raw;
      const data = {
        ...rest,
        tags: JSON.stringify(Array.isArray(tags) ? tags : []),
        startDate: startDate ? new Date(String(startDate)) : null,
        endDate: endDate ? new Date(String(endDate)) : null,
        deletedAt: null,
      };
      if (typeof id === 'string') {
        const found = await prisma.event.findUnique({ where: { id } });
        if (found) {
          await prisma.event.update({ where: { id }, data: data as never });
          summary.eventsUpdated += 1;
          continue;
        }
      }
      await prisma.event.create({ data: data as never });
      summary.eventsCreated += 1;
    }

    await writeAuditLog(req, {
      action: 'import',
      entityType: 'cms',
      summary: JSON.stringify(summary),
    });

    res.json({ success: true, summary });
  } catch (err) {
    console.error('Import failed:', err);
    res.status(500).json({ error: 'Import failed.' });
  }
});

// GET /api/v1/admin/content — global CMS payload + optimistic-lock version
router.get('/content', async (_req, res) => {
  try {
    const content = await prisma.siteContent.findUnique({ where: { id: 'global' } });
    if (!content) {
      return res.status(404).json({ error: 'No site content found.' });
    }
    const parse = (raw: string | null | undefined, fallback: unknown = {}) => {
      try {
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    };
    const asList = <T,>(value: unknown, fallback: T[]): T[] =>
      Array.isArray(value) ? value : fallback;
    res.json({
      hero: parse(content.hero),
      settings: parse(content.settings),
      appearance: parse(content.appearance),
      stats: asList(parse(content.stats, []), []),
      pillars: asList(parse(content.pillars, []), []),
      perks: asList(parse(content.perks, []), []),
      version: content.version,
      updatedAt: content.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error('Admin content fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch site content.' });
  }
});

// PATCH /api/v1/admin/content
router.patch('/content', validateBody(contentPatchSchema), async (req, res) => {
  const clientVersion = req.body.version;
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

  if (settings && typeof settings === 'object' && settings !== null && 'scripts' in settings) {
    const scripts = (settings as Record<string, unknown>).scripts as Record<string, unknown> | undefined;
    if (scripts) {
      for (const [key, value] of Object.entries(scripts)) {
        const check = validateInjectedScripts(value, `settings.scripts.${key}`);
        if (!check.ok) {
          return res.status(400).json({ errors: [{ path: check.field, message: check.message }] });
        }
      }
    }
  }

  try {
    const existing = await prisma.siteContent.findUnique({ where: { id: 'global' } });
    if (
      existing &&
      typeof clientVersion === 'number' &&
      clientVersion !== existing.version
    ) {
      return res.status(409).json({
        error: 'Content was updated elsewhere. Refresh and try again.',
        currentVersion: existing.version,
      });
    }
    if (existing) {
      await saveContentRevision(
        'site_content',
        'global',
        {
          hero: safeParseJsonRecord(existing.hero),
          settings: safeParseJsonRecord(existing.settings),
          appearance: safeParseJsonRecord(existing.appearance),
          stats: safeParseJsonRecord(existing.stats),
          pillars: safeParseJsonRecord(existing.pillars),
          perks: safeParseJsonRecord(existing.perks),
        },
        getAdminFromRequest(req).username ?? 'admin',
      );
    }
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
        version: 1,
      },
      update: {
        hero: hero ? JSON.stringify(hero) : undefined,
        settings: mergedSettings ? JSON.stringify(mergedSettings) : undefined,
        appearance: appearance ? JSON.stringify(appearance) : undefined,
        stats: stats ? JSON.stringify(stats) : undefined,
        pillars: pillars ? JSON.stringify(pillars) : undefined,
        perks: perks ? JSON.stringify(perks) : undefined,
        version: { increment: 1 },
      },
    });
    await writeAuditLog(req, {
      action: 'update',
      entityType: 'site_content',
      entityId: 'global',
      summary: 'Patched global CMS content',
    });
    res.json({ success: true, version: updated.version, updated });
  } catch {
    res.status(500).json({ error: 'Failed to update content.' });
  }
});

// --- Blog Management ---

router.post('/blogs', requireMinRole('editor'), validateBody(articleCreateSchema), async (req, res) => {
  try {
    const data = normalizeArticleInput(req.body);
    const article = await prisma.article.create({ data: data as never });
    await writeAuditLog(req, {
      action: 'create',
      entityType: 'article',
      entityId: article.id,
      summary: article.title,
    });
    res.json(serializeArticle(article));
  } catch (err) {
    console.error('Article create error:', err);
    res.status(500).json({ error: 'Failed to create article.' });
  }
});

router.put('/blogs/:id', requireMinRole('editor'), validateBody(articleUpdateSchema), async (req, res) => {
  try {
    const existing = await prisma.article.findUnique({ where: { id: req.params.id } });
    if (existing) {
      await saveContentRevision('article', existing.id, existing, getAdminFromRequest(req).username ?? 'admin');
    }
    const data = normalizeArticleInput(req.body);
    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: data as never,
    });
    await writeAuditLog(req, {
      action: 'update',
      entityType: 'article',
      entityId: article.id,
      summary: article.title,
    });
    res.json(serializeArticle(article));
  } catch {
    res.status(500).json({ error: 'Failed to update article.' });
  }
});

router.delete('/blogs/:id', requireMinRole('editor'), async (req, res) => {
  try {
    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    await writeAuditLog(req, {
      action: 'soft_delete',
      entityType: 'article',
      entityId: article.id,
      summary: article.title,
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete article.' });
  }
});

router.post('/blogs/:id/restore', requireMinRole('editor'), async (req, res) => {
  try {
    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: { deletedAt: null },
    });
    await writeAuditLog(req, {
      action: 'restore',
      entityType: 'article',
      entityId: article.id,
      summary: article.title,
    });
    res.json(article);
  } catch {
    res.status(500).json({ error: 'Failed to restore article.' });
  }
});

router.delete('/blogs/:id/permanent', requireMinRole('super_admin'), async (req, res) => {
  try {
    const article = await prisma.article.findUnique({ where: { id: req.params.id } });
    if (!article) return res.status(404).json({ error: 'Article not found.' });
    if (!article.deletedAt) {
      return res.status(400).json({ error: 'Move article to trash before permanent delete.' });
    }
    await prisma.article.delete({ where: { id: req.params.id } });
    await writeAuditLog(req, {
      action: 'permanent_delete',
      entityType: 'article',
      entityId: article.id,
      summary: article.title,
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to permanently delete article.' });
  }
});

// --- Event Management ---

router.post('/events', requireMinRole('editor'), validateBody(eventCreateSchema), async (req, res) => {
  try {
    const event = await prisma.event.create({
      data: normalizeEventInput(req.body) as never,
    });
    await writeAuditLog(req, {
      action: 'create',
      entityType: 'event',
      entityId: event.id,
      summary: event.title,
    });
    res.json(event);
  } catch (err) {
    console.error('Event create error:', err);
    res.status(500).json({ error: 'Failed to create event.' });
  }
});

router.put('/events/:id', requireMinRole('editor'), validateBody(eventUpdateSchema), async (req, res) => {
  const { tags, coordinates, lat, lng, startDate, endDate, publishAt, unpublishAt, ...rest } = req.body;
  try {
    const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (existing) {
      await saveContentRevision('event', existing.id, existing, getAdminFromRequest(req).username ?? 'admin');
    }
    const resolvedLat = lat ?? coordinates?.lat;
    const resolvedLng = lng ?? coordinates?.lng;
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(startDate !== undefined
          ? { startDate: startDate ? new Date(startDate) : null }
          : {}),
        ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
        ...(publishAt !== undefined ? { publishAt: parseOptionalDate(publishAt) ?? null } : {}),
        ...(unpublishAt !== undefined ? { unpublishAt: parseOptionalDate(unpublishAt) ?? null } : {}),
        ...(tags !== undefined ? { tags: JSON.stringify(tags) } : {}),
        ...(coordinates !== undefined || lat !== undefined
          ? { lat: resolvedLat, lng: resolvedLng }
          : {}),
      },
    });
    await writeAuditLog(req, {
      action: 'update',
      entityType: 'event',
      entityId: event.id,
      summary: event.title,
    });
    res.json(event);
  } catch {
    res.status(500).json({ error: 'Failed to update event.' });
  }
});

router.delete('/events/:id', requireMinRole('editor'), async (req, res) => {
  try {
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    await writeAuditLog(req, {
      action: 'soft_delete',
      entityType: 'event',
      entityId: event.id,
      summary: event.title,
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete event.' });
  }
});

router.post('/events/:id/restore', requireMinRole('editor'), async (req, res) => {
  try {
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: { deletedAt: null },
    });
    await writeAuditLog(req, {
      action: 'restore',
      entityType: 'event',
      entityId: event.id,
      summary: event.title,
    });
    res.json(event);
  } catch {
    res.status(500).json({ error: 'Failed to restore event.' });
  }
});

router.delete('/events/:id/permanent', requireMinRole('super_admin'), async (req, res) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    if (!event.deletedAt) {
      return res.status(400).json({ error: 'Move event to trash before permanent delete.' });
    }
    await prisma.event.delete({ where: { id: req.params.id } });
    await writeAuditLog(req, {
      action: 'permanent_delete',
      entityType: 'event',
      entityId: event.id,
      summary: event.title,
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to permanently delete event.' });
  }
});

// --- Admin users (super_admin only) ---

router.get('/users', requireMinRole('super_admin'), async (_req, res) => {
  try {
    const users = await prisma.admin.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, username: true, email: true, role: true, createdAt: true },
    });
    const privilegedAdminCount = await countPrivilegedAdmins();
    res.json({
      items: users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() })),
      meta: {
        privilegedAdminCount,
        minPrivilegedAdmins: MIN_PRIVILEGED_ADMINS,
      },
    });
  } catch {
    res.status(500).json({ error: 'Failed to list admin users.' });
  }
});

router.post('/users', requireMinRole('super_admin'), async (req, res) => {
  const { username, password, email, role } = req.body as {
    username?: string;
    password?: string;
    email?: string;
    role?: string;
  };
  if (!username?.trim() || !password || password.length < 8) {
    return res.status(400).json({ error: 'Username and password (min 8 chars) are required.' });
  }
  const allowedRoles = new Set(['super_admin', 'editor', 'viewer']);
  const userRole = allowedRoles.has(role ?? '') ? role! : 'editor';
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.admin.create({
      data: {
        username: username.trim(),
        password: hash,
        email: email?.trim() || null,
        role: userRole,
      },
      select: { id: true, username: true, email: true, role: true, createdAt: true },
    });
    await writeAuditLog(req, {
      action: 'create',
      entityType: 'admin_user',
      entityId: user.id,
      summary: user.username,
    });
    res.status(201).json({ ...user, createdAt: user.createdAt.toISOString() });
  } catch {
    res.status(500).json({ error: 'Failed to create user. Username may already exist.' });
  }
});

router.put('/users/:id', requireMinRole('super_admin'), async (req, res) => {
  const { email, role, password } = req.body as {
    email?: string;
    role?: string;
    password?: string;
  };
  const allowedRoles = new Set(['super_admin', 'editor', 'viewer']);
  try {
    const data: { email?: string | null; role?: string; password?: string } = {};
    if (email !== undefined) data.email = email?.trim() || null;
    if (role !== undefined && allowedRoles.has(role)) data.role = role;
    if (password && password.length >= 8) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.$transaction(async (tx) => {
      const row = await tx.admin.findUnique({ where: { id: req.params.id } });
      if (!row) {
        throw Object.assign(new Error('User not found.'), { status: 404 });
      }

      if (role !== undefined) {
        const guard = await assertCanChangePrivilegedRole(row.role, role, tx);
        if (!guard.ok) {
          throw Object.assign(new Error(guard.error), { status: 400 });
        }
      }

      return tx.admin.update({
        where: { id: req.params.id },
        data,
        select: { id: true, username: true, email: true, role: true, createdAt: true },
      });
    });

    await writeAuditLog(req, {
      action: 'update',
      entityType: 'admin_user',
      entityId: user.id,
      summary: user.username,
    });
    res.json({ ...user, createdAt: user.createdAt.toISOString() });
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    const message = err instanceof Error ? err.message : 'Failed to update user.';
    if (status === 404) return res.status(404).json({ error: message });
    if (status === 400) return res.status(400).json({ error: message });
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

router.delete('/users/:id', requireMinRole('super_admin'), async (req, res) => {
  try {
    const admin = getAdminFromRequest(req);

    const removed = await prisma.$transaction(async (tx) => {
      const existing = await tx.admin.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        throw Object.assign(new Error('User not found.'), { status: 404 });
      }

      if (admin.adminId === existing.id) {
        throw Object.assign(new Error('You cannot delete your own account.'), { status: 400 });
      }

      const guard = await assertCanDeleteAdminUser(existing.role, tx);
      if (!guard.ok) {
        throw Object.assign(new Error(guard.error), { status: 400 });
      }

      await tx.admin.delete({ where: { id: req.params.id } });
      return existing;
    });

    await writeAuditLog(req, {
      action: 'delete',
      entityType: 'admin_user',
      entityId: removed.id,
      summary: removed.username,
    });
    res.json({ success: true });
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    const message = err instanceof Error ? err.message : 'Failed to delete user.';
    if (status === 404) return res.status(404).json({ error: message });
    if (status === 400) return res.status(400).json({ error: message });
    res.status(500).json({ error: 'Failed to delete user.' });
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
    const existing = await conferenceRegistrations.findUnique(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Registration not found.' });

    const data = { ...req.body };
    if (typeof data.email === 'string') {
      data.email = data.email.toLowerCase();
    }
    const record = await conferenceRegistrations.update(req.params.id, data);
    void notifyRegistrantOfStatus(record, existing.status).catch((err) => {
      console.error('Registration notify registrant failed:', err);
    });
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

// --- Newsletter signups ---

router.get('/newsletter-signups', requireMinRole('editor'), async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? '100'), 10) || 100, 1), 500);
    const items = await prisma.newsletterSignup.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    res.json({
      items: items.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
      total: await prisma.newsletterSignup.count(),
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch newsletter signups.' });
  }
});

router.delete('/newsletter-signups/:id', requireMinRole('editor'), async (req, res) => {
  try {
    await prisma.newsletterSignup.delete({ where: { id: req.params.id } });
    await writeAuditLog(req, {
      action: 'delete',
      entityType: 'newsletter_signup',
      entityId: req.params.id,
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete signup.' });
  }
});

export default router;
