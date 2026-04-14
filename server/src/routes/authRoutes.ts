import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
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

    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, success: true });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed.' });
  }
});

export default router;
