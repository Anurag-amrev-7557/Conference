import { Router } from 'express';

const router = Router();

function marketingBackendUrl(): string {
  return (process.env.MARKETING_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');
}

function marketingApiKey(): string | undefined {
  return process.env.MARKETING_API_KEY || process.env.VELLUX_API_KEY;
}

// POST /api/v1/marketing/webhook — server-side proxy to marketing-backend (SEC-04)
router.post('/webhook', async (req, res) => {
  const { id, type, actor } = req.body ?? {};

  if (typeof id !== 'string' || typeof type !== 'string' || !actor || typeof actor.email !== 'string') {
    return res.status(400).json({ error: 'Invalid payload: id, type, and actor.email are required' });
  }

  const apiKey = marketingApiKey();
  if (!apiKey) {
    return res.status(503).json({ error: 'Marketing proxy is not configured (MARKETING_API_KEY)' });
  }

  try {
    const upstream = await fetch(`${marketingBackendUrl()}/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify(req.body),
    });

    const text = await upstream.text();
    let body: unknown;
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = { message: text };
    }

    return res.status(upstream.status).json(body);
  } catch (error) {
    console.error('Marketing webhook proxy error:', error);
    return res.status(502).json({ error: 'Marketing backend unreachable' });
  }
});

export default router;
