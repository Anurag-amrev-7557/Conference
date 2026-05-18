import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import prisma from '../lib/prisma';
import { stripCommunityText } from '../lib/sanitize';

const router = Router();

const COMMUNITY_CATEGORIES = [
  'Architecture',
  'Prompt Engineering',
  'No-Code',
  'Strategy',
  'Venture',
  'General',
] as const;

const communityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

router.use(communityLimiter);

function mapPost(post: {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string | null;
  category: string;
  votes: number;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  comments: { id: string; authorName: string; authorAvatar: string; content: string; createdAt: Date }[];
}) {
  return {
    ...post,
    comments: post.comments.map((c) => ({
      ...c,
      author: { name: c.authorName, avatar: c.authorAvatar },
    })),
  };
}

// POST /api/v1/community/posts
router.post('/posts', async (req: Request, res: Response) => {
  const { title, content, category, authorName, authorAvatar, authorRole } = req.body;

  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }
  if (!authorName?.trim() || authorName.length > 64) {
    return res.status(400).json({ error: 'authorName is required (max 64 characters).' });
  }
  if (!COMMUNITY_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Invalid category.', allowed: COMMUNITY_CATEGORIES });
  }

  try {
    const post = await prisma.communityPost.create({
      data: {
        title: title.trim(),
        content: stripCommunityText(content.trim()),
        category,
        authorName: authorName.trim(),
        authorAvatar: authorAvatar || '',
        authorRole: authorRole || null,
      },
      include: { comments: true },
    });
    res.status(201).json(mapPost(post));
  } catch (error) {
    console.error('Create community post error:', error);
    res.status(500).json({ error: 'Failed to create post.' });
  }
});

// POST /api/v1/community/posts/:id/comments
router.post('/posts/:id/comments', async (req: Request, res: Response) => {
  const { content, authorName, authorAvatar } = req.body;
  const postId = req.params.id;

  if (!content?.trim()) {
    return res.status(400).json({ error: 'Comment content is required.' });
  }
  if (!authorName?.trim() || authorName.length > 64) {
    return res.status(400).json({ error: 'authorName is required (max 64 characters).' });
  }

  try {
    const post = await prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        content: stripCommunityText(content.trim()),
        authorName: authorName.trim(),
        authorAvatar: authorAvatar || '',
      },
    });

    res.status(201).json({
      ...comment,
      author: { name: comment.authorName, avatar: comment.authorAvatar },
    });
  } catch (error) {
    console.error('Add community comment error:', error);
    res.status(500).json({ error: 'Failed to add comment.' });
  }
});

// POST /api/v1/community/posts/:id/vote
router.post('/posts/:id/vote', async (req: Request, res: Response) => {
  const { visitorId } = req.body;
  const postId = req.params.id;

  if (!visitorId?.trim()) {
    return res.status(400).json({ error: 'visitorId is required.' });
  }

  try {
    const post = await prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const existing = await prisma.postVote.findUnique({
      where: { postId_visitorId: { postId, visitorId: visitorId.trim() } },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.postVote.delete({ where: { id: existing.id } }),
        prisma.communityPost.update({
          where: { id: postId },
          data: { votes: { decrement: 1 } },
        }),
      ]);
      const updated = await prisma.communityPost.findUnique({ where: { id: postId } });
      return res.json({ voted: false, votes: updated?.votes ?? 0 });
    }

    await prisma.$transaction([
      prisma.postVote.create({
        data: { postId, visitorId: visitorId.trim() },
      }),
      prisma.communityPost.update({
        where: { id: postId },
        data: { votes: { increment: 1 } },
      }),
    ]);

    const updated = await prisma.communityPost.findUnique({ where: { id: postId } });
    res.json({ voted: true, votes: updated?.votes ?? 0 });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Failed to process vote.' });
  }
});

export default router;
