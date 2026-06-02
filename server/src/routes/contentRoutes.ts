import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { sanitizeArticleHtml } from '../lib/sanitize';
import { getSiteUrl } from '../lib/siteUrl';
import { validateBody } from '../middleware/validateBody';
import { registrationCreateSchema } from '../schemas/registration';
import { getConferenceRegistrationSettings } from '../lib/conferenceRegistrationSettings';
import { notifyAdminOfRegistration } from '../lib/registrationNotifications';
import { registrationLimiter, newsletterLimiter } from '../middleware/rateLimiters';
import { scheduledArticleWhere, scheduledEventWhere } from '../lib/publishSchedule';
import { getNewsletterSettings } from '../lib/newsletterSettings';
import { newsletterSignupSchema } from '../schemas/newsletter';

const router = Router();

const safeParse = (str: string | null | undefined, fallback: unknown = {}) => {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
};

function asList<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? value : fallback;
}

function parsePagination(req: Request) {
  const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? '50'), 10) || 50, 1), 100);
  const offset = Math.max(parseInt(String(req.query.offset ?? '0'), 10) || 0, 0);
  return { limit, offset };
}

function mapEvent(e: {
  id: string;
  day: string;
  weekday: string;
  time: string;
  full_time: string;
  title: string;
  host: string;
  location: string;
  tags: string;
  price: string;
  thumbnail: string;
  status: string;
  isPublished: boolean;
  startDate: Date | null;
  endDate: Date | null;
  lat: number | null;
  lng: number | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...e,
    startDate: e.startDate?.toISOString() ?? null,
    endDate: e.endDate?.toISOString() ?? null,
    tags: safeParse(e.tags, []),
    coordinates: e.lat != null && e.lng != null ? { lat: e.lat, lng: e.lng } : undefined,
  };
}

function mapArticle<T extends { content: string }>(article: T): T {
  return { ...article, content: sanitizeArticleHtml(article.content) };
}

async function fetchSitePayload() {
  const content = await prisma.siteContent.findUnique({ where: { id: 'global' } });
  const hero = safeParse(content?.hero);
  const stats = asList(safeParse(content?.stats, []), []);
  const pillars = asList(safeParse(content?.pillars, []), []);
  const perks = asList(safeParse(content?.perks, []), []);
  const settings = (safeParse(content?.settings) ?? {}) as Record<string, unknown>;
  if (!settings.homepage) {
    settings.homepage = { hero, stats, pillars, perks };
  }
  settings.conferenceRegistration = await getConferenceRegistrationSettings();
  return {
    siteUrl: getSiteUrl(),
    hero,
    stats,
    pillars,
    perks,
    settings,
    appearance: safeParse(content?.appearance),
    contentVersion: content?.version ?? 1,
  };
}

// GET /api/v1/content/site
router.get('/site', async (_req, res) => {
  try {
    res.json(await fetchSitePayload());
  } catch (error) {
    console.error('Content site fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch site content.' });
  }
});

// GET /api/v1/content/articles
router.get('/articles', async (req, res) => {
  const { limit, offset } = parsePagination(req);
  try {
    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where: scheduledArticleWhere(),
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.article.count({ where: scheduledArticleWhere() }),
    ]);
    res.setHeader('X-Total-Count', String(total));
    res.json({ items: items.map(mapArticle), total });
  } catch (error) {
    console.error('Articles fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch articles.' });
  }
});

// GET /api/v1/content/events
router.get('/events', async (req, res) => {
  const { limit, offset } = parsePagination(req);
  try {
    const [rows, total] = await Promise.all([
      prisma.event.findMany({
        where: scheduledEventWhere(),
        orderBy: { day: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.event.count({ where: scheduledEventWhere() }),
    ]);
    const items = rows.map(mapEvent);
    res.setHeader('X-Total-Count', String(total));
    res.json({ items, total });
  } catch (error) {
    console.error('Events fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
});

// POST /api/v1/content/conference-registration
router.post('/conference-registration', registrationLimiter, validateBody(registrationCreateSchema), async (req, res) => {
  const { name, email, phone, linkedIn, designation } = req.body;
  try {
    const regSettings = await getConferenceRegistrationSettings();
    if (regSettings.registrationOpen === false) {
      return res.status(403).json({ error: 'Registration is currently closed.' });
    }
    const record = await prisma.conferenceRegistration.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        linkedIn: linkedIn ?? '',
        designation,
        ticketPriceCents: regSettings.ticketPriceCents,
        status: 'pending',
      },
    });
    void notifyAdminOfRegistration(record).catch((err) => {
      console.error('Registration notify admin failed:', err);
    });
    res.status(201).json({
      id: record.id,
      success: true,
      message: 'Registration received.',
    });
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') {
      return res.status(409).json({ error: 'This email is already registered for the summit.' });
    }
    console.error('Registration create error:', error);
    res.status(500).json({ error: 'Failed to submit registration.' });
  }
});

// POST /api/v1/content/newsletter — waitlist / playbook signup
router.post('/newsletter', newsletterLimiter, validateBody(newsletterSignupSchema), async (req, res) => {
  const { email, source } = req.body;
  try {
    const { enabled } = await getNewsletterSettings();
    if (!enabled) {
      return res.status(403).json({ error: 'Newsletter signup is currently disabled.' });
    }
    const normalized = email.toLowerCase().trim();
    await prisma.newsletterSignup.upsert({
      where: { email: normalized },
      create: { email: normalized, source: source?.trim() || 'waitlist' },
      update: {},
    });
    res.status(201).json({ success: true, message: 'Thanks for subscribing!' });
  } catch (error) {
    console.error('Newsletter signup error:', error);
    res.status(500).json({ error: 'Failed to save signup.' });
  }
});

// GET /api/v1/content — legacy monolithic (backward compat)
router.get('/', async (_req, res) => {
  try {
    const site = await fetchSitePayload();
    const [articlesRes, eventsRes] = await Promise.all([
      prisma.article.findMany({ where: { isPublished: true, deletedAt: null }, orderBy: { publishedAt: 'desc' } }),
      prisma.event.findMany({ where: { isPublished: true, deletedAt: null }, orderBy: { day: 'asc' } }),
    ]);

    res.json({
      ...site,
      articles: articlesRes.map(mapArticle),
      events: eventsRes.map(mapEvent),
    });
  } catch (error) {
    console.error('Content fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch site content.' });
  }
});

export default router;
