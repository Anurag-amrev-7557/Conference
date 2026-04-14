import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/v1/content
// Unified site data fetch
router.get('/', async (req, res) => {
  try {
    const [content, articles, events, communityPosts] = await Promise.all([
      prisma.siteContent.findUnique({ where: { id: 'global' } }),
      prisma.article.findMany({ orderBy: { publishedAt: 'desc' } }),
      prisma.event.findMany({ orderBy: { day: 'asc' } }),
      prisma.communityPost.findMany({ 
        include: { 
          comments: { take: 5, orderBy: { createdAt: 'desc' } } 
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }]
      })
    ]);

    // Safe JSON Parsing Utility
    const safeParse = (str: string | null | undefined, fallback: any = {}) => {
      try {
        return str ? JSON.parse(str) : fallback;
      } catch (e) {
        return fallback;
      }
    };

    res.json({
      hero: safeParse(content?.hero),
      articles,
      events: events.map(e => ({
        ...e,
        tags: safeParse(e.tags, []),
        coordinates: e.lat && e.lng ? { lat: e.lat, lng: e.lng } : undefined
      })),
      communityPosts: communityPosts.map(p => ({
        ...p,
        comments: p.comments.map(c => ({
          ...c,
          author: { name: c.authorName, avatar: c.authorAvatar }
        }))
      })),
      stats: safeParse(content?.stats, []),
      pillars: safeParse(content?.pillars, []),
      perks: safeParse(content?.perks, []),
      settings: safeParse(content?.settings),
      appearance: safeParse(content?.appearance)
    });
  } catch (error) {
    console.error('Content fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch site content.' });
  }
});

export default router;
