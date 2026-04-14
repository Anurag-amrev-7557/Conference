const API_BASE = 'http://localhost:3001/api/v1';

export const api = {
  // Public
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

  async createPost(token: string, post: any) {
    const res = await fetch(`${API_BASE}/admin/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(post)
    });
    if (!res.ok) throw new Error('Failed to create post');
    return res.json();
  },

  async addComment(token: string, postId: string, comment: any) {
    const res = await fetch(`${API_BASE}/admin/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(comment)
    });
    if (!res.ok) throw new Error('Failed to add comment');
    return res.json();
  }
};
