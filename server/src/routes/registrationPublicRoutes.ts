import { Router } from 'express';
import { conferenceRegistrations } from '../lib/conferenceRegistrations';
import { verifyRegistrationReviewToken } from '../lib/registrationReviewToken';
import { notifyRegistrantOfStatus } from '../lib/registrationNotifications';

const router = Router();

function reviewHtml(title: string, message: string, tone: 'success' | 'error' | 'info') {
  const color = tone === 'success' ? '#0a7a3e' : tone === 'error' ? '#b42318' : '#0052cc';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="font-family:system-ui,sans-serif;background:#f6f7fb;margin:0;padding:40px 16px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;box-shadow:0 8px 30px rgba(0,0,0,.08)">
    <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${color}">${title}</p>
    <p style="margin:0;font-size:16px;line-height:1.6;color:#222">${message}</p>
  </div>
</body>
</html>`;
}

/** Public one-click approve/deny from email links (signed token, no admin login). */
router.get('/review', async (req, res) => {
  const token = typeof req.query.token === 'string' ? req.query.token : '';
  if (!token) {
    return res.status(400).send(reviewHtml('Invalid link', 'This review link is missing a token.', 'error'));
  }

  try {
    const { sub: id, action } = verifyRegistrationReviewToken(token);
    const existing = await conferenceRegistrations.findUnique(id);
    if (!existing) {
      return res.status(404).send(reviewHtml('Not found', 'This registration no longer exists.', 'error'));
    }

    if (existing.status !== 'pending') {
      const label = existing.status === 'confirmed' ? 'approved' : 'denied';
      return res.send(
        reviewHtml(
          'Already reviewed',
          `${existing.name} was already ${label}. No changes were made.`,
          'info',
        ),
      );
    }

    const nextStatus = action === 'confirm' ? 'confirmed' : 'cancelled';
    const updated = await conferenceRegistrations.update(id, { status: nextStatus });
    void notifyRegistrantOfStatus(updated, existing.status);

    if (nextStatus === 'confirmed') {
      return res.send(
        reviewHtml(
          'Approved',
          `${updated.name} is now approved. The CRM status is confirmed and the attendee has been notified by email if email is configured.`,
          'success',
        ),
      );
    }

    return res.send(
      reviewHtml(
        'Denied',
        `${updated.name} was denied. The CRM status is cancelled and the attendee has been notified by email if email is configured.`,
        'success',
      ),
    );
  } catch {
    return res.status(400).send(reviewHtml('Invalid or expired link', 'This review link is invalid or has expired.', 'error'));
  }
});

export default router;
