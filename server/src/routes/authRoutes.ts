import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { getJwtSecret } from '../lib/jwtSecret';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: 'Too many login attempts. Please try again later.' });
  },
});

// POST /api/v1/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  const { password } = req.body;

  try {
    const admin = await prisma.admin.findUnique({ where: { username: 'admin' } });

    if (!admin) {
      return res.status(401).json({ error: 'Administrative dashboard not initialized.' });
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect administrative password.' });
    }

    const token = jwt.sign({ role: 'admin' }, getJwtSecret(), { expiresIn: '24h' });
    res.json({ token, success: true });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed.' });
  }
});

export default router;
