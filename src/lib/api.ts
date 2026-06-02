export type MediaLibraryItem = {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
  ext: string;
};

/** In production (Vercel), set VITE_API_URL to your Render API, e.g. https://api.example.com/api/v1 */
const PROD_API_BASE = 'https://superhumanly-thoughts.onrender.com/api/v1';
const LEGACY_BROKEN_API_BASE = 'https://book-website-api.onrender.com/api/v1';
const envApiBase = import.meta.env.VITE_API_URL?.trim();

/** Dev default uses Vite proxy (`vite.config.ts` → localhost:3001) to avoid CORS blocks. */
export const API_BASE =
  import.meta.env.PROD
    ? (!envApiBase || envApiBase === LEGACY_BROKEN_API_BASE ? PROD_API_BASE : envApiBase)
    : (envApiBase || '/api/v1');

const ALLOWED_ARTICLE_KEYS = [
  'slug',
  'title',
  'category',
  'time',
  'excerpt',
  'content',
  'thumbnail',
  'isPublished',
  'publishAt',
  'unpublishAt',
  'authorName',
  'authorRole',
  'authorAvatar',
  'publishedAt',
  'seoTitle',
  'seoDescription',
  'ogImage',
  'noindex',
] as const;

type AllowedArticleKey = (typeof ALLOWED_ARTICLE_KEYS)[number];

function sanitizeArticlePayload(article: Record<string, unknown>) {
  const payload: Partial<Record<AllowedArticleKey, unknown>> = {};
  for (const key of ALLOWED_ARTICLE_KEYS) {
    if (key in article && article[key] !== undefined) {
      payload[key] = article[key];
    }
  }
  return payload;
}

const ALLOWED_EVENT_KEYS = [
  'day',
  'weekday',
  'time',
  'full_time',
  'title',
  'host',
  'location',
  'description',
  'tags',
  'price',
  'thumbnail',
  'status',
  'isPublished',
  'publishAt',
  'unpublishAt',
  'registrationUrl',
  'registrationOpen',
  'startDate',
  'endDate',
  'coordinates',
  'lat',
  'lng',
  'seoTitle',
  'seoDescription',
  'ogImage',
  'noindex',
] as const;

type AllowedEventKey = (typeof ALLOWED_EVENT_KEYS)[number];

function normalizeOptionalIsoDatetime(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function sanitizeEventPayload(event: Record<string, unknown>) {
  const payload: Partial<Record<AllowedEventKey, unknown>> = {};
  for (const key of ALLOWED_EVENT_KEYS) {
    if (key in event && event[key] !== undefined) {
      payload[key] = event[key];
    }
  }

  for (const dateKey of ['publishAt', 'unpublishAt', 'startDate', 'endDate'] as const) {
    if (dateKey in payload) {
      payload[dateKey] = normalizeOptionalIsoDatetime(payload[dateKey]);
    }
  }

  if ('lat' in payload || 'lng' in payload) {
    delete payload.coordinates;
  }

  const optionalStringKeys = [
    'weekday',
    'time',
    'full_time',
    'host',
    'location',
    'description',
    'price',
    'thumbnail',
    'status',
    'registrationUrl',
    'seoTitle',
    'seoDescription',
    'ogImage',
  ] as const;

  for (const key of optionalStringKeys) {
    if (payload[key] === '') {
      payload[key] = null;
    }
  }

  return payload;
}

function formatApiError(
  data: { error?: string; details?: Array<{ path?: string; message?: string }> },
  fallback: string,
): string {
  if (Array.isArray(data.details) && data.details.length > 0) {
    return data.details
      .map((d) => (d.path ? `${d.path}: ${d.message}` : d.message))
      .filter(Boolean)
      .join('; ');
  }
  return data.error || fallback;
}

export const api = {
  // Public content (split endpoints)
  async getContentSite() {
    const res = await fetch(`${API_BASE}/content/site`);
    if (!res.ok) throw new Error('Failed to fetch site content');
    return res.json();
  },

  async getArticles(limit = 50, offset = 0) {
    const res = await fetch(`${API_BASE}/content/articles?limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error('Failed to fetch articles');
    const data = await res.json();
    return data.items ?? data;
  },

  async getAdminArticles(token: string, options?: { trash?: boolean }) {
    const q = options?.trash ? '?trash=1' : '';
    const res = await fetch(`${API_BASE}/admin/blogs${q}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch admin articles');
    return data.items ?? data;
  },

  async getAdminEvents(token: string, options?: { trash?: boolean }) {
    const q = options?.trash ? '?trash=1' : '';
    const res = await fetch(`${API_BASE}/admin/events${q}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch admin events');
    return data.items ?? data;
  },

  async getAuditLog(token: string, limit = 50) {
    const res = await fetch(`${API_BASE}/admin/audit-log?limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch audit log');
    return data as { items: Array<{ id: string; username: string; action: string; entityType: string; entityId?: string; summary?: string; createdAt: string }> };
  },

  async restoreArticle(token: string, id: string) {
    const res = await fetch(`${API_BASE}/admin/blogs/${id}/restore`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to restore article');
    return data;
  },

  async restoreEvent(token: string, id: string) {
    const res = await fetch(`${API_BASE}/admin/events/${id}/restore`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to restore event');
    return data;
  },

  async importContent(token: string, payload: unknown) {
    const res = await fetch(`${API_BASE}/admin/import`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Import failed');
    return data as { success: boolean; summary: Record<string, number> };
  },

  async getEvents(limit = 50, offset = 0) {
    const res = await fetch(`${API_BASE}/content/events?limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error('Failed to fetch events');
    const data = await res.json();
    return data.items ?? data;
  },

  /** @deprecated Use split getContentSite + getArticles + getEvents */
  async getContent() {
    const res = await fetch(`${API_BASE}/content`);
    if (!res.ok) throw new Error('Failed to fetch content');
    return res.json();
  },

  // Auth
  async login(username: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data; // { token, success, role, username }
  },

  async uploadMediaImage(token: string, file: File): Promise<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE}/admin/media-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload image');
    return data as { url: string };
  },

  async listMedia(token: string): Promise<{ items: MediaLibraryItem[] }> {
    const res = await fetch(`${API_BASE}/admin/media`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load media library');
    return data as { items: MediaLibraryItem[] };
  },

  async deleteMedia(token: string, filename: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/media/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete image');
  },

  async uploadOgImage(token: string, file: File): Promise<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE}/admin/og-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload image');
    return data as { url: string };
  },

  async getAdminMe(token: string) {
    const res = await fetch(`${API_BASE}/admin/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || 'Session invalid') as Error & { status?: number };
      err.status = res.status;
      throw err;
    }
    return data as {
      ok: boolean;
      role: string;
      username: string;
      exp: number;
      permissions?: import('./adminPermissions').AdminPermissionsConfig;
    };
  },

  async getAdminPermissions(token: string) {
    const res = await fetch(`${API_BASE}/admin/permissions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load permissions');
    return data.permissions as import('./adminPermissions').AdminPermissionsConfig;
  },

  async updateAdminPermissions(
    token: string,
    permissions: import('./adminPermissions').AdminPermissionsConfig,
  ) {
    const res = await fetch(`${API_BASE}/admin/permissions`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ permissions }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save permissions');
    return data.permissions as import('./adminPermissions').AdminPermissionsConfig;
  },

  async getRevisions(token: string, entityType: string, entityId: string) {
    const res = await fetch(`${API_BASE}/admin/revisions/${entityType}/${entityId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch revisions');
    return data.items as Array<{
      id: string;
      entityType: string;
      entityId: string;
      changedBy: string;
      createdAt: string;
    }>;
  },

  async getRevisionDetail(token: string, id: string) {
    const res = await fetch(`${API_BASE}/admin/revisions/detail/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch revision');
    return data as {
      id: string;
      entityType: string;
      entityId: string;
      changedBy: string;
      createdAt: string;
      snapshot: Record<string, unknown>;
    };
  },

  async restoreRevision(token: string, id: string) {
    const res = await fetch(`${API_BASE}/admin/revisions/${id}/restore`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to restore revision');
    return data;
  },

  async permanentDeleteArticle(token: string, id: string) {
    const res = await fetch(`${API_BASE}/admin/blogs/${id}/permanent`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to permanently delete article');
    return data;
  },

  async permanentDeleteEvent(token: string, id: string) {
    const res = await fetch(`${API_BASE}/admin/events/${id}/permanent`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to permanently delete event');
    return data;
  },

  async listAdminUsers(token: string) {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to list users');
    return {
      items: data.items as Array<{
        id: string;
        username: string;
        email: string | null;
        role: string;
        createdAt: string;
      }>,
      meta: (data.meta ?? {
        privilegedAdminCount: 0,
        minPrivilegedAdmins: 1,
      }) as {
        privilegedAdminCount: number;
        minPrivilegedAdmins: number;
      },
    };
  },

  async createAdminUser(
    token: string,
    payload: { username: string; password: string; email?: string; role: string },
  ) {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create user');
    return data;
  },

  async updateAdminUser(
    token: string,
    id: string,
    payload: { email?: string; role?: string; password?: string },
  ) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update user');
    return data;
  },

  async deleteAdminUser(token: string, id: string) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete user');
    return data;
  },

  // Admin (requires token)
  async updateGlobalContent(token: string, data: any, options?: { version?: number }) {
    const body = options?.version != null ? { ...data, version: options.version } : data;
    const res = await fetch(`${API_BASE}/admin/content`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const payload = await res.json();
    if (res.status === 409) {
      const err = new Error(payload.error || 'Content conflict') as Error & {
        status?: number;
        currentVersion?: number;
      };
      err.status = 409;
      err.currentVersion = payload.currentVersion;
      throw err;
    }
    if (!res.ok) throw new Error(payload.error || 'Failed to update content');
    return payload as { success: boolean; version?: number };
  },

  async createArticle(token: string, article: any) {
    const res = await fetch(`${API_BASE}/admin/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(article)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create article');
    return data;
  },

  async updateArticle(token: string, id: string, article: any) {
    const sanitizedArticle = sanitizeArticlePayload(article as Record<string, unknown>);
    const res = await fetch(`${API_BASE}/admin/blogs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(sanitizedArticle)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(formatApiError(data, 'Failed to update article'));
    return data;
  },

  async deleteArticle(token: string, id: string) {
    const res = await fetch(`${API_BASE}/admin/blogs/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete article');
    return res.json();
  },

  async createEvent(token: string, event: any) {
    const sanitizedEvent = sanitizeEventPayload(event as Record<string, unknown>);
    const res = await fetch(`${API_BASE}/admin/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(sanitizedEvent)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(formatApiError(data, 'Failed to create event'));
    return data;
  },

  async updateEvent(token: string, id: string, event: any) {
    const sanitizedEvent = sanitizeEventPayload(event as Record<string, unknown>);
    const res = await fetch(`${API_BASE}/admin/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(sanitizedEvent)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(formatApiError(data, 'Failed to update event'));
    return data;
  },

  async deleteEvent(token: string, id: string) {
    const res = await fetch(`${API_BASE}/admin/events/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete event');
    return res.json();
  },

  async submitConferenceRegistration(payload: {
    name: string;
    email: string;
    phone: string;
    linkedIn?: string;
    designation: string;
  }) {
    const res = await fetch(`${API_BASE}/content/conference-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit registration');
    return data as { id: string; success: boolean; message: string };
  },

  async createRegistration(
    token: string,
    payload: {
      name: string;
      email: string;
      phone: string;
      linkedIn?: string;
      designation: string;
      status?: string;
      ticketPriceCents?: number;
    },
  ) {
    const res = await fetch(`${API_BASE}/admin/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create registration');
    return data as import('./registrationTypes').ConferenceRegistrationRecord;
  },

  async listRegistrations(token: string) {
    const res = await fetch(`${API_BASE}/admin/registrations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load registrations');
    return data as { items: import('./registrationTypes').ConferenceRegistrationRecord[]; total: number };
  },

  async updateRegistration(
    token: string,
    id: string,
    payload: Partial<import('./registrationTypes').ConferenceRegistrationRecord>,
  ) {
    const res = await fetch(`${API_BASE}/admin/registrations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update registration');
    return data;
  },

  async deleteRegistration(token: string, id: string) {
    const res = await fetch(`${API_BASE}/admin/registrations/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    let data: { error?: string; success?: boolean } = {};
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text) as { error?: string; success?: boolean };
      } catch {
        if (!res.ok) throw new Error('Failed to delete registration');
      }
    }
    if (!res.ok) throw new Error(data.error || 'Failed to delete registration');
    return data;
  },

  async triggerBackup(token: string) {
    const res = await fetch(`${API_BASE}/admin/backup`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Backup failed');
    return data as { success: boolean; backupPath: string; pruned: number };
  },

  async exportContent(token: string) {
    const res = await fetch(`${API_BASE}/admin/export`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Export failed');
    return data;
  },

  async submitNewsletter(payload: { email: string; source?: string }) {
    const res = await fetch(`${API_BASE}/content/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to subscribe');
    return data as { success: boolean; message: string };
  },

  async getNewsletterSignups(token: string, limit = 100) {
    const res = await fetch(`${API_BASE}/admin/newsletter-signups?limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch newsletter signups');
    return data as {
      items: Array<{ id: string; email: string; source: string; createdAt: string }>;
      total: number;
    };
  },

  async deleteNewsletterSignup(token: string, id: string) {
    const res = await fetch(`${API_BASE}/admin/newsletter-signups/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete signup');
    return data;
  },
};
