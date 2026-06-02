import rateLimit from 'express-rate-limit';

export const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: 'Too many registration attempts. Please try again later.' });
  },
});

export const marketingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(
      `[rate-limit] marketing ${req.method} ${req.originalUrl} ip=${req.ip} ua=${req.get('user-agent') ?? 'unknown'}`,
    );
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
  },
});

export const newsletterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: 'Too many signup attempts. Please try again later.' });
  },
});
