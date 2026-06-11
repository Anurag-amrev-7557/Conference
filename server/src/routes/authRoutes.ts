import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { getJwtSecret } from '../lib/jwtSecret';
import { clearAdminAuthCookie, setAdminAuthCookie } from '../lib/adminAuthCookie';

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
  const { password, username: loginUsername } = req.body;
  const username =
    typeof loginUsername === 'string' && loginUsername.trim() ? loginUsername.trim() : 'admin';

  try {
    const admin = await prisma.admin.findUnique({ where: { username } });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { role: admin.role || 'super_admin', adminId: admin.id, username: admin.username },
      getJwtSecret(),
      { expiresIn: '24h' },
    );
    setAdminAuthCookie(res, token);
    res.json({ success: true, token, role: admin.role, username: admin.username });
  } catch {
    res.status(500).json({ error: 'Authentication failed.' });
  }
});

// POST /api/v1/auth/logout
router.post('/logout', (_req, res) => {
  clearAdminAuthCookie(res);
  res.json({ success: true });
});

export default router;
