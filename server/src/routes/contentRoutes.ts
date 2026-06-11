import { Router, Request } from 'express';
import prisma from '../lib/prisma';
import { validateBody } from '../middleware/validateBody';
import { registrationCreateSchema } from '../schemas/registration';
import {
  notifyAdminOfRegistration,
  notifyRegistrantOfSubmission,
} from '../lib/registrationNotifications';
import { registrationLimiter, newsletterLimiter } from '../middleware/rateLimiters';
import { getNewsletterSettings } from '../lib/newsletterSettings';
import { newsletterSignupSchema } from '../schemas/newsletter';
import { getConferenceRegistrationSettings } from '../lib/conferenceRegistrationSettings';
import {
  buildCmsBootstrapPayload,
  fetchPublicArticles,
  fetchPublicEvents,
  fetchSitePayload,
} from '../lib/publicSiteContent';

const router = Router();

const CONTENT_CACHE_CONTROL = 'no-store, no-cache, must-revalidate';

router.use((_req, res, next) => {
  res.setHeader('Cache-Control', CONTENT_CACHE_CONTROL);
  res.setHeader('Pragma', 'no-cache');
  next();
});

function parsePagination(req: Request) {
  const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? '50'), 10) || 50, 1), 100);
  const offset = Math.max(parseInt(String(req.query.offset ?? '0'), 10) || 0, 0);
  return { limit, offset };
}

// GET /api/v1/content/bootstrap — unified first-paint payload (live CMS source)
router.get('/bootstrap', async (_req, res) => {
  try {
    res.json(await buildCmsBootstrapPayload());
  } catch (error) {
    console.error('Content bootstrap fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch CMS bootstrap.' });
  }
});

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
    const { items, total } = await fetchPublicArticles(limit, offset);
    res.setHeader('X-Total-Count', String(total));
    res.json({ items, total });
  } catch (error) {
    console.error('Articles fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch articles.' });
  }
});

// GET /api/v1/content/events
router.get('/events', async (req, res) => {
  const { limit, offset } = parsePagination(req);
  try {
    const { items, total } = await fetchPublicEvents(limit, offset);
    res.setHeader('X-Total-Count', String(total));
    res.json({ items, total });
  } catch (error) {
    console.error('Events fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
});

// POST /api/v1/content/conference-registration
router.post(
  '/conference-registration',
  registrationLimiter,
  validateBody(registrationCreateSchema),
  async (req, res) => {
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
      void notifyRegistrantOfSubmission(record).catch((err) => {
        console.error('Registration notify registrant failed:', err);
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
  },
);

// POST /api/v1/content/newsletter — waitlist / playbook signup
router.post(
  '/newsletter',
  newsletterLimiter,
  validateBody(newsletterSignupSchema),
  async (req, res) => {
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
  },
);

// GET /api/v1/content — legacy monolithic (backward compat)
router.get('/', async (_req, res) => {
  try {
    res.json(await buildCmsBootstrapPayload());
  } catch (error) {
    console.error('Content fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch site content.' });
  }
});

export default router;
