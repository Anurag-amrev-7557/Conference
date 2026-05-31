export type MediaLibraryItem = {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
  ext: string;
};

/** In production (Vercel), set VITE_API_URL to your Render API, e.g. https://api.example.com/api/v1 */
export const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? '/api/v1'
    : 'http://localhost:3001/api/v1');

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
  async login(password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data; // { token, success }
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
    return data as { ok: boolean; role: string; username: string; exp: number };
  },

  // Admin (requires token)
  async updateGlobalContent(token: string, data: any) {
    const res = await fetch(`${API_BASE}/admin/content`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update content');
    return res.json();
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
    if (!res.ok) throw new Error('Failed to create article');
    return res.json();
  },

  async updateArticle(token: string, id: string, article: any) {
    const res = await fetch(`${API_BASE}/admin/blogs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(article)
    });
    if (!res.ok) throw new Error('Failed to update article');
    return res.json();
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
    const res = await fetch(`${API_BASE}/admin/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(event)
    });
    if (!res.ok) throw new Error('Failed to create event');
    return res.json();
  },

  async updateEvent(token: string, id: string, event: any) {
    const res = await fetch(`${API_BASE}/admin/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(event)
    });
    if (!res.ok) throw new Error('Failed to update event');
    return res.json();
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
};
