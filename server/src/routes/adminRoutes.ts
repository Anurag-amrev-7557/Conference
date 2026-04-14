import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Auth Middleware
const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

router.use(authenticateAdmin);

// --- Content Management ---

// PATCH /api/v1/admin/content
// Update global sections (hero, settings, etc.)
router.patch('/content', async (req, res) => {
  const { hero, settings, appearance, stats, pillars, perks } = req.body;
  try {
    const updated = await prisma.siteContent.update({
      where: { id: 'global' },
      data: {
        hero: hero ? JSON.stringify(hero) : undefined,
        settings: settings ? JSON.stringify(settings) : undefined,
        appearance: appearance ? JSON.stringify(appearance) : undefined,
        stats: stats ? JSON.stringify(stats) : undefined,
        pillars: pillars ? JSON.stringify(pillars) : undefined,
        perks: perks ? JSON.stringify(perks) : undefined
      }
    });
    res.json({ success: true, updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update content.' });
  }
});

// --- Blog Management ---

router.post('/blogs', async (req, res) => {
  try {
    const article = await prisma.article.create({ data: req.body });
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create article.' });
  }
});

router.put('/blogs/:id', async (req, res) => {
  try {
    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update article.' });
  }
});

router.delete('/blogs/:id', async (req, res) => {
  try {
    await prisma.article.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete article.' });
  }
});

// --- Event Management ---

router.post('/events', async (req, res) => {
  const { tags, coordinates, ...rest } = req.body;
  try {
    const event = await prisma.event.create({
      data: {
        ...rest,
        tags: JSON.stringify(tags),
        lat: coordinates?.lat,
        lng: coordinates?.lng
      }
    });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event.' });
  }
});

router.put('/events/:id', async (req, res) => {
  const { tags, coordinates, ...rest } = req.body;
  try {
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        tags: JSON.stringify(tags),
        lat: coordinates?.lat,
        lng: coordinates?.lng
      }
    });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event.' });
  }
});

router.delete('/events/:id', async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event.' });
  }
});

export default router;
