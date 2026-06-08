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

describe('Admin CMS ↔ public content integration', () => {
  let token: string;
  let articleId: string;
  let eventId: string;
  const slug = `integration-blog-${Date.now()}`;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration-test-jwt-secret';
    token = await adminToken();
  });

  afterAll(async () => {
    if (articleId) {
      await prisma.article.delete({ where: { id: articleId } }).catch(() => {});
    }
    if (eventId) {
      await prisma.event.delete({ where: { id: eventId } }).catch(() => {});
    }
    await stopTestServer();
    await prisma.$disconnect();
  });

  it('POST /admin/blogs creates article visible on GET /content/articles', async () => {
    const create = await requestJson('/api/v1/admin/blogs', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        slug,
        title: 'Integration Article',
        category: 'Insights',
        time: '3 MIN',
        excerpt: 'Created by integration test.',
        content: '<p>Hello integration</p>',
        thumbnail: '',
        authorName: 'QA Bot',
        authorRole: 'Integration',
        authorAvatar: '',
        publishedAt: new Date().toISOString().slice(0, 10),
        isPublished: true,
      }),
    });
    expect(create.status).toBe(200);
    articleId = String(create.data.id);

    const list = await requestJson('/api/v1/content/articles');
    expect(list.status).toBe(200);
    const items = list.data.items as Array<{ slug: string; title: string }>;
    expect(items.some((a) => a.slug === slug && a.title === 'Integration Article')).toBe(true);
  });

  it('PUT /admin/blogs/:id updates article on public API', async () => {
    const updatedTitle = `Updated ${Date.now()}`;
    const put = await requestJson(`/api/v1/admin/blogs/${articleId}`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ title: updatedTitle }),
    });
    expect(put.status).toBe(200);

    const list = await requestJson('/api/v1/content/articles');
    const items = list.data.items as Array<{ id: string; title: string }>;
    const row = items.find((a) => a.id === articleId);
    expect(row?.title).toBe(updatedTitle);
  });

  it('DELETE /admin/blogs/:id removes article from public API', async () => {
    const del = await requestJson(`/api/v1/admin/blogs/${articleId}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    expect(del.status).toBe(200);

    const list = await requestJson('/api/v1/content/articles');
    const items = list.data.items as Array<{ id: string }>;
    expect(items.some((a) => a.id === articleId)).toBe(false);
    articleId = '';
  });

  it('POST /admin/events creates event visible on GET /content/events', async () => {
    const create = await requestJson('/api/v1/admin/events', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        day: '01',
        weekday: 'Monday',
        time: '10:00',
        full_time: '01 Apr, 10:00 GMT',
        title: 'Integration Workshop',
        host: 'Superhumanly',
        location: 'Virtual',
        tags: [],
        price: 'Free',
        thumbnail: '',
        status: 'Upcoming',
        isPublished: true,
      }),
    });
    expect(create.status).toBe(200);
    eventId = String(create.data.id);

    const list = await requestJson('/api/v1/content/events');
    expect(list.status).toBe(200);
    const items = list.data.items as Array<{ id: string; title: string }>;
    expect(items.some((e) => e.id === eventId && e.title === 'Integration Workshop')).toBe(true);
  });

  it('PUT /admin/events/:id updates event on public API', async () => {
    const updatedTitle = `Event Updated ${Date.now()}`;
    const put = await requestJson(`/api/v1/admin/events/${eventId}`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ title: updatedTitle }),
    });
    expect(put.status).toBe(200);

    const list = await requestJson('/api/v1/content/events');
    const items = list.data.items as Array<{ id: string; title: string }>;
    expect(items.find((e) => e.id === eventId)?.title).toBe(updatedTitle);
  });

  it('DELETE /admin/events/:id removes event from public API', async () => {
    const del = await requestJson(`/api/v1/admin/events/${eventId}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    expect(del.status).toBe(200);

    const list = await requestJson('/api/v1/content/events');
    const items = list.data.items as Array<{ id: string }>;
    expect(items.some((e) => e.id === eventId)).toBe(false);
    eventId = '';
  });

  it('PATCH /admin/content updates hero reflected on GET /content/site', async () => {
    const headline = `Hero headline ${Date.now()}`;
    const patch = await requestJson('/api/v1/admin/content', {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({
        hero: { headline },
      }),
    });
    expect(patch.status).toBe(200);

    const site = await requestJson('/api/v1/content/site');
    expect(site.status).toBe(200);
    expect((site.data.hero as { headline?: string })?.headline).toBe(headline);
  });

  it('PATCH /admin/content persists conference video metrics and speakers catalog', async () => {
    const catalogTitle = `Speakers hero ${Date.now()}`;
    const metricValue = `Metric ${Date.now()}`;

    const existing = await requestJson('/api/v1/content/site');
    expect(existing.status).toBe(200);
    const settings = (existing.data.settings ?? {}) as Record<string, unknown>;
    const conference = (settings.conference ?? {}) as Record<string, unknown>;
    const sections = (conference.sections ?? {}) as Record<string, unknown>;
    const video = (sections.video ?? {}) as Record<string, unknown>;

    const patch = await requestJson('/api/v1/admin/content', {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({
        settings: {
          catalogPages: {
            speakers: {
              eyebrow: 'Speakers',
              title: catalogTitle,
              titleAccent: 'on stage',
              lede: 'Integration catalog lede',
            },
          },
          conference: {
            ...conference,
            sections: {
              ...sections,
              video: {
                ...video,
                metrics: [{ id: 'integration-metric', value: metricValue, label: 'Labs' }],
              },
              sponsors: {
                ...(sections.sponsors as Record<string, unknown> | undefined),
                ctaLabel: 'Become a sponsor (integration)',
              },
            },
            speakers: [
              {
                id: 'integration-speaker',
                name: 'Integration Speaker',
                title: 'CTO',
                company: 'QA Corp',
                image: '',
                featured: true,
              },
            ],
          },
        },
      }),
    });
    expect(patch.status).toBe(200);

    const site = await requestJson('/api/v1/content/site');
    expect(site.status).toBe(200);
    const nextSettings = (site.data.settings ?? {}) as {
      catalogPages?: { speakers?: { title?: string } };
      conference?: {
        sections?: { video?: { metrics?: Array<{ value?: string }> }; sponsors?: { ctaLabel?: string } };
        speakers?: Array<{ featured?: boolean }>;
      };
    };

    expect(nextSettings.catalogPages?.speakers?.title).toBe(catalogTitle);
    expect(nextSettings.conference?.sections?.video?.metrics?.[0]?.value).toBe(metricValue);
    expect(nextSettings.conference?.sections?.sponsors?.ctaLabel).toBe(
      'Become a sponsor (integration)',
    );
    expect(nextSettings.conference?.speakers?.[0]?.featured).toBe(true);
  });
});
