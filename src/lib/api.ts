export const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://api.superhumanly-thoughts.com/book/api/v1'
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

  async getCommunityPosts(limit = 50, offset = 0) {
    const res = await fetch(`${API_BASE}/content/community?limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error('Failed to fetch community posts');
    const data = await res.json();
    return data.items ?? data;
  },

  /** @deprecated Use split getContentSite + getArticles + getEvents + getCommunityPosts */
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

  // Public community
  async createCommunityPost(post: {
    title: string;
    content: string;
    category: string;
    authorName: string;
    authorAvatar: string;
    authorRole?: string;
  }) {
    const res = await fetch(`${API_BASE}/community/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create post');
    return data;
  },

  async addCommunityComment(
    postId: string,
    comment: { content: string; authorName: string; authorAvatar: string }
  ) {
    const res = await fetch(`${API_BASE}/community/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add comment');
    return data;
  },

  async voteCommunityPost(postId: string, visitorId: string) {
    const res = await fetch(`${API_BASE}/community/posts/${postId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to vote');
    return data as { voted: boolean; votes: number };
  },

  // Admin community
  async createAdminCommunityPost(token: string, post: Record<string, unknown>) {
    const res = await fetch(`${API_BASE}/admin/community/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(post),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create post');
    return data;
  },

  async deleteAdminCommunityPost(token: string, id: string) {
    const res = await fetch(`${API_BASE}/admin/community/posts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete post');
    return res.json();
  },

  async pinAdminCommunityPost(token: string, id: string, pinned: boolean) {
    const res = await fetch(`${API_BASE}/admin/community/posts/${id}/pin`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ pinned }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to pin post');
    return data;
  },
};
