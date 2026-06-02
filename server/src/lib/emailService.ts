type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; error: string };

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getEmailFromAddress(): string {
  return process.env.EMAIL_FROM?.trim() || 'Superhumanly Summit <onboarding@resend.dev>';
}

/** Sends via Resend HTTPS API (works on Render; no SMTP required). */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, skipped: true, reason: 'RESEND_API_KEY not configured' };
  }

  const to = input.to.trim();
  if (!to) {
    return { ok: false, skipped: true, reason: 'missing recipient' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getEmailFromAddress(),
        to: [to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    const body = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!response.ok) {
      return { ok: false, error: body.message || `Resend HTTP ${response.status}` };
    }

    return { ok: true, id: body.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Email send failed' };
  }
}
