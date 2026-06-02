import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { getJwtSecret } from '../lib/jwtSecret';
import { requestJson, stopTestServer } from '../test/http';

const ADMIN_PASSWORD = 'Welcome@1234';

async function adminToken(): Promise<string> {
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: { password: hashed },
    create: { username: 'admin', password: hashed },
  });
  return jwt.sign({ role: 'admin' }, getJwtSecret(), { expiresIn: '1h' });
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

describe('Registration admin ↔ website integration', () => {
  let token: string;
  let createdId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration-test-jwt-secret';
    token = await adminToken();
  });

  afterAll(async () => {
    if (createdId) {
      await prisma.conferenceRegistration.deleteMany({ where: { id: createdId } }).catch(() => {});
    }
    await stopTestServer();
    await prisma.$disconnect();
  });

  it('GET /content/site exposes conferenceRegistration settings', async () => {
    const { status, data } = await requestJson('/api/v1/content/site');
    expect(status).toBe(200);
    const settings = data.settings as Record<string, unknown>;
    const reg = settings?.conferenceRegistration as Record<string, unknown>;
    expect(reg).toBeTruthy();
    expect(reg.formTitle).toBeTruthy();
    const fields = reg.fields as Record<string, Record<string, string>>;
    expect(fields.phone?.label).toBeTruthy();
    expect(fields.linkedIn?.label).toBeTruthy();
  });

  it('PATCH /admin/content merges partial registration without wiping other settings', async () => {
    const marker = `seo-preserve-${Date.now()}`;
    const seed = await requestJson('/api/v1/admin/content', {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({
        settings: { seo: { title: marker } },
      }),
    });
    expect(seed.status).toBe(200);

    const patch = await requestJson('/api/v1/admin/content', {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({
        settings: {
          conferenceRegistration: { formTitle: `Merged ${Date.now()}` },
        },
      }),
    });
    expect(patch.status).toBe(200);

    const site = await requestJson('/api/v1/content/site');
    const settings = site.data.settings as Record<string, unknown>;
    expect((settings.seo as { title?: string })?.title).toBe(marker);
  });

  it('PATCH /admin/content persists panel stats and panel quote', async () => {
    const stats = [{ value: '99+', label: 'Test stat' }];
    const quote = {
      quote: 'Integration quote line.',
      name: 'Test User',
      role: 'QA Lead',
      initials: 'TU',
    };
    const patch = await requestJson('/api/v1/admin/content', {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({
        settings: {
          conferenceRegistration: { panelStats: stats, panelQuote: quote },
        },
      }),
    });
    expect(patch.status).toBe(200);

    const site = await requestJson('/api/v1/content/site');
    const reg = (site.data.settings as Record<string, unknown>)
      .conferenceRegistration as Record<string, unknown>;
    expect(reg.panelStats).toEqual(stats);
    expect(reg.panelQuote).toMatchObject(quote);
  });

  it('PATCH /admin/content persists route SEO for /register', async () => {
    const title = `Register SEO ${Date.now()}`;
    const patch = await requestJson('/api/v1/admin/content', {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({
        settings: {
          routeSeo: {
            '/register': { title, description: 'Custom register meta description.' },
          },
        },
      }),
    });
    expect(patch.status).toBe(200);

    const site = await requestJson('/api/v1/content/site');
    const routeSeo = (site.data.settings as Record<string, unknown>).routeSeo as Record<
      string,
      { title?: string }
    >;
    expect(routeSeo['/register']?.title).toBe(title);
  });

  it('PATCH /admin/content persists registration form copy', async () => {
    const uniqueTitle = `Integration Test Title ${Date.now()}`;
    const patch = await requestJson('/api/v1/admin/content', {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({
        settings: {
          conferenceRegistration: {
            formTitle: uniqueTitle,
            fields: {
              phone: { label: 'Mobile', placeholder: '+1 555 0100', required: true },
              linkedIn: { label: 'LinkedIn URL', placeholder: 'linkedin.com/in/test', required: false },
            },
          },
        },
      }),
    });
    expect(patch.status).toBe(200);

    const site = await requestJson('/api/v1/content/site');
    const reg = (site.data.settings as Record<string, unknown>)
      .conferenceRegistration as Record<string, unknown>;
    expect(reg.formTitle).toBe(uniqueTitle);
    expect((reg.fields as Record<string, Record<string, string>>).phone?.label).toBe('Mobile');
  });

  it('POST /content/conference-registration uses CMS ticket price', async () => {
    const cents = 3500;
    const patch = await requestJson('/api/v1/admin/content', {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({
        settings: {
          conferenceRegistration: { ticketPriceCents: cents, priceAmount: '$35' },
        },
      }),
    });
    expect(patch.status).toBe(200);

    const email = `price-${Date.now()}@example.com`;
    const { status, data } = await requestJson('/api/v1/content/conference-registration', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Price Test',
        email,
        phone: '+1 555 0200',
        linkedIn: 'linkedin.com/in/price-test',
        designation: 'individual',
      }),
    });
    expect(status).toBe(201);
    const row = await prisma.conferenceRegistration.findUnique({ where: { id: String(data.id) } });
    expect(row?.ticketPriceCents).toBe(cents);
    await prisma.conferenceRegistration.delete({ where: { id: String(data.id) } }).catch(() => {});
  });

  it('POST /admin/registrations creates submission from CRM', async () => {
    const email = `admin-create-${Date.now()}@example.com`;
    const { status, data } = await requestJson('/api/v1/admin/registrations', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        name: 'Admin Created',
        email,
        phone: '+1 555 0300',
        linkedIn: 'linkedin.com/in/admin-created',
        designation: 'enterprise',
        status: 'confirmed',
        ticketPriceCents: 1999,
      }),
    });
    expect(status).toBe(201);
    expect(data.email).toBe(email.toLowerCase());
    expect(data.ticketPriceCents).toBe(1999);
    expect(data.status).toBe('confirmed');
    await prisma.conferenceRegistration.delete({ where: { id: String(data.id) } }).catch(() => {});
  });

  it('POST /content/conference-registration creates row with phone and linkedIn', async () => {
    const siteBefore = await requestJson('/api/v1/content/site');
    const expectedCents = (
      (siteBefore.data.settings as Record<string, unknown>).conferenceRegistration as {
        ticketPriceCents: number;
      }
    ).ticketPriceCents;

    const email = `integration-${Date.now()}@example.com`;
    const { status, data } = await requestJson('/api/v1/content/conference-registration', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Integration Tester',
        email,
        phone: '+1 555 0199',
        linkedIn: 'linkedin.com/in/integration-test',
        designation: 'individual',
      }),
    });
    expect(status).toBe(201);
    expect(data.id).toBeTruthy();
    createdId = String(data.id);

    const row = await prisma.conferenceRegistration.findUnique({ where: { id: createdId } });
    expect(row?.email).toBe(email.toLowerCase());
    expect(row?.phone).toBe('+1 555 0199');
    expect(row?.linkedIn).toBe('linkedin.com/in/integration-test');
    expect(row?.ticketPriceCents).toBe(expectedCents);
    expect(row?.status).toBe('pending');
  });

  it('rejects registration without phone', async () => {
    const { status } = await requestJson('/api/v1/content/conference-registration', {
      method: 'POST',
      body: JSON.stringify({
        name: 'No Phone',
        email: `no-phone-${Date.now()}@example.com`,
        phone: '123',
        linkedIn: 'linkedin.com/in/test',
        designation: 'student',
      }),
    });
    expect(status).toBe(400);
  });

  it('rejects registration without linkedIn', async () => {
    const { status } = await requestJson('/api/v1/content/conference-registration', {
      method: 'POST',
      body: JSON.stringify({
        name: 'No LinkedIn',
        email: `no-li-${Date.now()}@example.com`,
        phone: '+1 555 0100',
        linkedIn: '',
        designation: 'individual',
      }),
    });
    expect(status).toBe(400);
  });

  it('GET /admin/registrations/:id returns a single submission', async () => {
    const { status, data } = await requestJson(`/api/v1/admin/registrations/${createdId}`, {
      headers: authHeaders(token),
    });
    expect(status).toBe(200);
    expect(data.id).toBe(createdId);
    expect(data.phone).toBe('+1 555 0199');
  });

  it('GET /admin/registrations lists submissions with phone and linkedIn', async () => {
    const { status, data } = await requestJson('/api/v1/admin/registrations', {
      headers: authHeaders(token),
    });
    expect(status).toBe(200);
    const items = data.items as Array<Record<string, unknown>>;
    expect(items.length).toBeGreaterThan(0);
    const row = items.find((r) => r.id === createdId);
    expect(row?.phone).toBe('+1 555 0199');
    expect(row?.linkedIn).toBe('linkedin.com/in/integration-test');
  });

  it('PUT /admin/registrations/:id updates CRM fields', async () => {
    const { status, data } = await requestJson(`/api/v1/admin/registrations/${createdId}`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({
        name: 'Updated Name',
        phone: '+44 20 7946 0958',
        linkedIn: 'linkedin.com/in/updated',
        status: 'confirmed',
        ticketPriceCents: 2500,
      }),
    });
    expect(status).toBe(200);
    expect(data.name).toBe('Updated Name');
    expect(data.phone).toBe('+44 20 7946 0958');
    expect(data.linkedIn).toBe('linkedin.com/in/updated');
    expect(data.status).toBe('confirmed');
    expect(data.ticketPriceCents).toBe(2500);
  });

  it('DELETE /admin/registrations/:id removes submission', async () => {
    const { status } = await requestJson(`/api/v1/admin/registrations/${createdId}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    expect(status).toBe(200);
    const gone = await prisma.conferenceRegistration.findUnique({ where: { id: createdId } });
    expect(gone).toBeNull();
    createdId = '';
  });

  it('rejects admin registrations without token', async () => {
    const { status } = await requestJson('/api/v1/admin/registrations');
    expect(status).toBe(401);
  });
});
