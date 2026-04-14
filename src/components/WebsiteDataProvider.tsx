import React, { createContext, useContext, useState, useEffect } from 'react';
import type { WebsiteData } from '../lib/websiteData';
import { initialData } from '../lib/websiteData';
import { api } from '../lib/api';

interface WebsiteDataContextType {
  data: WebsiteData;
  loading: boolean;
  updateHero: (hero: WebsiteData['hero']) => Promise<void>;
  updateArticles: (articles: WebsiteData['articles']) => Promise<void>;
  createArticle: (article: any) => Promise<void>;
  updateArticle: (id: string, article: any) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  createEvent: (event: any) => Promise<void>;
  updateEvent: (id: string, event: any) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  updateEvents: (events: WebsiteData['events']) => Promise<void>;
  createPost: (post: any) => Promise<void>;
  addComment: (postId: string, comment: any) => Promise<void>;
  updateCommunityPosts: (posts: WebsiteData['communityPosts']) => Promise<void>;
  updateStats: (stats: WebsiteData['stats']) => Promise<void>;
  updatePillars: (pillars: WebsiteData['pillars']) => Promise<void>;
  updatePerks: (perks: WebsiteData['perks']) => Promise<void>;
  updateSettings: (settings: WebsiteData['settings']) => Promise<void>;
  updateAppearance: (appearance: WebsiteData['appearance']) => Promise<void>;
  resetData: () => void;
  refresh: () => Promise<void>;
}

const WebsiteDataContext = createContext<WebsiteDataContextType | undefined>(undefined);

export const WebsiteDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<WebsiteData>(initialData);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const remoteData = await api.getContent();
      setData(remoteData);
    } catch (error) {
      console.error('Failed to fetch from backend, using fallback data:', error);
      // Fallback to initialData if API fails
      setData(initialData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const getAdminToken = () => localStorage.getItem('adminToken') || '';

  const updateGlobal = async (updates: Partial<WebsiteData>) => {
    const token = getAdminToken();
    if (!token) {
      // In non-admin mode, just update local state (for preview)
      setData(prev => ({ ...prev, ...updates }));
      return;
    }

    try {
      await api.updateGlobalContent(token, updates);
      await fetchContent(); // Refresh from server
    } catch (error) {
      console.error('Persistence error:', error);
      throw error;
    }
  };

  const updateHero = async (hero: WebsiteData['hero']) => updateGlobal({ hero });
  
  const createArticle = async (article: any) => {
    const token = getAdminToken();
    if (!token) return;
    try {
      await api.createArticle(token, article);
      await fetchContent();
    } catch (err) {
      console.error('Failed to create article:', err);
      throw err;
    }
  };

  const updateArticle = async (id: string, article: any) => {
    const token = getAdminToken();
    if (!token) return;
    try {
      await api.updateArticle(token, id, article);
      await fetchContent();
    } catch (err) {
      console.error('Failed to update article:', err);
      throw err;
    }
  };

  const deleteArticle = async (id: string) => {
    const token = getAdminToken();
    if (!token) return;
    try {
      await api.deleteArticle(token, id);
      await fetchContent();
    } catch (err) {
      console.error('Failed to delete article:', err);
      throw err;
    }
  };

  const createEvent = async (event: any) => {
    const token = getAdminToken();
    if (!token) return;
    try {
      await api.createEvent(token, event);
      await fetchContent();
    } catch (err) {
      console.error('Failed to create event:', err);
      throw err;
    }
  };

  const updateEvent = async (id: string, event: any) => {
    const token = getAdminToken();
    if (!token) return;
    try {
      await api.updateEvent(token, id, event);
      await fetchContent();
    } catch (err) {
      console.error('Failed to update event:', err);
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    const token = getAdminToken();
    if (!token) return;
    try {
      await api.deleteEvent(token, id);
      await fetchContent();
    } catch (err) {
      console.error('Failed to delete event:', err);
      throw err;
    }
  };

  const createPost = async (post: any) => {
    const token = getAdminToken();
    if (!token) return;
    try {
      await api.createPost(token, post);
      await fetchContent();
    } catch (err) {
      console.error('Failed to create post:', err);
      throw err;
    }
  };

  const addComment = async (postId: string, comment: any) => {
    const token = getAdminToken();
    if (!token) return;
    try {
      await api.addComment(token, postId, comment);
      await fetchContent();
    } catch (err) {
      console.error('Failed to add comment:', err);
      throw err;
    }
  };

  const updateArticles = async (articles: WebsiteData['articles']) => {
    // Legacy support for array-wide updates
    setData(prev => ({ ...prev, articles }));
  };

  const updateEvents = async (events: WebsiteData['events']) => {
     setData(prev => ({ ...prev, events }));
  };
  
  const updateCommunityPosts = async (communityPosts: WebsiteData['communityPosts']) => {
    setData(prev => ({ ...prev, communityPosts }));
  };
  
  const updateStats = async (stats: WebsiteData['stats']) => updateGlobal({ stats });
  const updatePillars = async (pillars: WebsiteData['pillars']) => updateGlobal({ pillars });
  const updatePerks = async (perks: WebsiteData['perks']) => updateGlobal({ perks });
  const updateSettings = async (settings: WebsiteData['settings']) => updateGlobal({ settings });
  const updateAppearance = async (appearance: WebsiteData['appearance']) => updateGlobal({ appearance });

  const resetData = () => {
    setData(initialData);
    localStorage.removeItem('adminToken');
  };

  return (
    <WebsiteDataContext.Provider value={{
      data,
      loading,
      updateHero,
      updateArticles,
      createArticle,
      updateArticle,
      deleteArticle,
      createEvent,
      updateEvent,
      deleteEvent,
      updateEvents,
      createPost,
      addComment,
      updateCommunityPosts,
      updateStats,
      updatePillars,
      updatePerks,
      updateSettings,
      updateAppearance,
      resetData,
      refresh: fetchContent
    }}>
      {children}
    </WebsiteDataContext.Provider>
  );
};

export const useWebsiteData = () => {
  const context = useContext(WebsiteDataContext);
  if (context === undefined) {
    throw new Error('useWebsiteData must be used within a WebsiteDataProvider');
  }
  return context;
};
