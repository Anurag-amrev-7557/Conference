import { Router } from 'express';
import { marketingLimiter } from '../middleware/rateLimiters';

const router = Router();

router.use(marketingLimiter);

function marketingBackendUrl(): string {
  return (process.env.MARKETING_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');
}

function marketingApiKey(): string | undefined {
  return process.env.MARKETING_API_KEY || process.env.VELLUX_API_KEY;
}

// POST /api/v1/marketing/events — proxy for engagement events (INT-01)
router.post('/events', async (req, res) => {
  const { action, metadata, visitor_id, email } = req.body ?? {};

  if (typeof action !== 'string') {
    return res.status(400).json({ error: 'Invalid payload: action (string) is required' });
  }

  const apiKey = marketingApiKey();
  if (!apiKey) {
    return res.status(503).json({ error: 'Marketing proxy is not configured (MARKETING_API_KEY)' });
  }

  try {
    const upstream = await fetch(`${marketingBackendUrl()}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        action,
        metadata: metadata && typeof metadata === 'object' ? metadata : {},
        ...(typeof visitor_id === 'string' ? { visitor_id } : {}),
        ...(typeof email === 'string' ? { email } : {}),
      }),
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
    console.error('Marketing events proxy error:', error);
    return res.status(502).json({ error: 'Marketing backend unreachable' });
  }
});

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
        'X-API-Key': apiKey,
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

// POST /api/v1/marketing/email-agent/process — server-side proxy for support/email-agent (MKT-01, D-07, D-08)
router.post('/email-agent/process', async (req, res) => {
  const { recipient, sender, subject, body } = req.body ?? {};

  if (typeof recipient !== 'string' || typeof sender !== 'string' || typeof subject !== 'string' || typeof body !== 'string') {
    return res.status(400).json({ 
      error: 'Invalid payload: recipient, sender, subject, and body (strings) are required' 
    });
  }

  const apiKey = marketingApiKey();
  if (!apiKey) {
    return res.status(503).json({ error: 'Email agent proxy is not configured (MARKETING_API_KEY)' });
  }

  try {
    const upstream = await fetch(`${marketingBackendUrl()}/email-agent/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({ recipient, sender, subject, body }),
    });

    const text = await upstream.text();
    let responseBody: unknown;
    try {
      responseBody = text ? JSON.parse(text) : {};
    } catch {
      responseBody = { message: text };
    }

    return res.status(upstream.status).json(responseBody);
  } catch (error) {
    console.error('Email agent proxy error:', error);
    return res.status(502).json({ error: 'Email agent service unreachable' });
  }
});

export default router;
