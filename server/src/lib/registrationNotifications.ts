import type { ConferenceRegistrationRow } from './conferenceRegistrations';
import { getApiPublicUrl } from './apiPublicUrl';
import { sendEmail } from './emailService';
import { signRegistrationReviewToken } from './registrationReviewToken';
import { getConferenceRegistrationSettings } from './conferenceRegistrationSettings';

function reviewUrl(registrationId: string, action: 'confirm' | 'cancel'): string {
  const token = signRegistrationReviewToken(registrationId, action);
  return `${getApiPublicUrl()}/api/v1/registrations/review?token=${encodeURIComponent(token)}`;
}

function adminReviewLinks(registrationId: string) {
  const approve = reviewUrl(registrationId, 'confirm');
  const deny = reviewUrl(registrationId, 'cancel');
  return { approve, deny };
}

export async function notifyAdminOfRegistration(record: ConferenceRegistrationRow) {
  const settings = await getConferenceRegistrationSettings();
  if (settings.notifyOnSubmit === false) {
    return { skipped: true as const };
  }

  const notifyEmail =
    settings.notifyEmail?.trim() || process.env.REGISTRATION_NOTIFY_EMAIL?.trim();
  if (!notifyEmail) {
    return { skipped: true as const, reason: 'no notify email configured' };
  }

  const { approve, deny } = adminReviewLinks(record.id);
  const subject = `New summit registration — ${record.name}`;
  const text = [
    `New registration for Superhumanly Summit 2026`,
    ``,
    `Name: ${record.name}`,
    `Email: ${record.email}`,
    `Phone: ${record.phone}`,
    `LinkedIn: ${record.linkedIn}`,
    `Type: ${record.designation}`,
    `Status: ${record.status}`,
    ``,
    `Approve: ${approve}`,
    `Deny: ${deny}`,
    ``,
    `Or review in Admin CRM → Registrations.`,
  ].join('\n');

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;max-width:560px">
      <h2 style="margin:0 0 12px">New summit registration</h2>
      <p style="margin:0 0 16px"><strong>${record.name}</strong> submitted a registration request.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:4px 0;color:#666">Email</td><td>${record.email}</td></tr>
        <tr><td style="padding:4px 0;color:#666">Phone</td><td>${record.phone}</td></tr>
        <tr><td style="padding:4px 0;color:#666">LinkedIn</td><td>${record.linkedIn}</td></tr>
        <tr><td style="padding:4px 0;color:#666">Type</td><td>${record.designation}</td></tr>
      </table>
      <p style="margin:24px 0 12px">Quick decision:</p>
      <p style="margin:0 0 24px">
        <a href="${approve}" style="display:inline-block;background:#0a7a3e;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600;margin-right:8px">Approve</a>
        <a href="${deny}" style="display:inline-block;background:#b42318;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600">Deny</a>
      </p>
      <p style="font-size:12px;color:#666">Links expire in 7 days. You can also update status in Admin → Registrations.</p>
    </div>
  `;

  return sendEmail({ to: notifyEmail, subject, html, text });
}

export async function notifyRegistrantOfStatus(
  record: ConferenceRegistrationRow,
  previousStatus?: string,
) {
  if (previousStatus === record.status) {
    return { skipped: true as const };
  }

  const settings = await getConferenceRegistrationSettings();
  if (settings.sendRegistrantEmails === false) {
    return { skipped: true as const };
  }

  if (record.status === 'pending') {
    return { skipped: true as const };
  }

  const approved = record.status === 'confirmed';
  const subject = approved
    ? 'Your Superhumanly Summit registration is approved'
    : 'Update on your Superhumanly Summit registration';
  const text = approved
    ? `Hi ${record.name},\n\nGood news — your summit registration has been approved. We look forward to seeing you at Superhumanly Summit 2026.\n\n— Superhumanly Team`
    : `Hi ${record.name},\n\nThank you for your interest in Superhumanly Summit 2026. We’re unable to confirm your registration at this time.\n\nIf you have questions, reply to this email.\n\n— Superhumanly Team`;

  const html = approved
    ? `<p>Hi ${record.name},</p><p>Good news — your summit registration has been <strong>approved</strong>. We look forward to seeing you at Superhumanly Summit 2026.</p>`
    : `<p>Hi ${record.name},</p><p>Thank you for your interest in Superhumanly Summit 2026. We’re unable to confirm your registration at this time.</p><p>If you have questions, reply to this email.</p>`;

  return sendEmail({ to: record.email, subject, html, text });
}
