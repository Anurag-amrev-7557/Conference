import React, { createContext, useContext, useState, useEffect } from 'react';
import type { WebsiteData } from '../lib/websiteData';
import { initialData, pillarIcons, perkIcons } from '../lib/websiteData';
import { api } from '../lib/api';
import { MarketingService } from '../lib/marketing';
import { setSiteOrigin } from '../seo/siteUrl';

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
  votePost: (postId: string) => Promise<{ voted: boolean; votes: number }>;
  updateCommunityPosts: (posts: WebsiteData['communityPosts']) => Promise<void>;
  updateStats: (stats: WebsiteData['stats']) => Promise<void>;
  updatePillars: (pillars: WebsiteData['pillars']) => Promise<void>;
  updatePerks: (perks: WebsiteData['perks']) => Promise<void>;
  updateSettings: (settings: WebsiteData['settings']) => Promise<void>;
  updateAppearance: (appearance: WebsiteData['appearance']) => Promise<void>;
  setPreview: (preview: Partial<WebsiteData> | null) => void;
  isPreviewVisible: boolean;
  togglePreview: () => void;
  resetData: () => void;
  refresh: () => Promise<void>;
}

const WebsiteDataContext = createContext<WebsiteDataContextType | undefined>(undefined);

export const WebsiteDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<WebsiteData>(initialData);
  const [previewData, setPreviewData] = useState<WebsiteData | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(() => {
    const saved = localStorage.getItem('admin_preview_visible');
    return saved !== 'false'; // Default to true
  });
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const [site, articles, events, communityPosts] = await Promise.all([
        api.getContentSite().catch((e) => {
          console.error('Failed to fetch site slice:', e);
          return {};
        }),
        api.getArticles().catch((e) => {
          console.error('Failed to fetch articles slice:', e);
          return [];
        }),
        api.getEvents().catch((e) => {
          console.error('Failed to fetch events slice:', e);
          return [];
        }),
        api.getCommunityPosts().catch((e) => {
          console.error('Failed to fetch community slice:', e);
          return [];
        }),
      ]);
      const remoteData = { ...site, articles, events, communityPosts };

      if (typeof (site as { siteUrl?: string }).siteUrl === 'string') {
        setSiteOrigin((site as { siteUrl: string }).siteUrl);
      }

      // Deep merge remoteData with initialData to ensure new fields (typography, theme, etc.) 
      // exist even if the backend record is older.
      setData(() => {
        const merged = { ...initialData, ...remoteData };
        // Ensure nested objects are also merged if they exist in remoteData
        if (remoteData.appearance) {
          merged.appearance = {
            ...initialData.appearance,
            ...remoteData.appearance,
            colorScheme: remoteData.appearance.colorScheme ?? 'system',
          };
          if (remoteData.appearance.typography) {
            merged.appearance.typography = { ...initialData.appearance.typography, ...remoteData.appearance.typography };
          }
          if (remoteData.appearance.theme) {
            merged.appearance.theme = { ...initialData.appearance.theme, ...remoteData.appearance.theme };
          }
        }
        if (remoteData.settings) {
          merged.settings = { ...initialData.settings, ...remoteData.settings };
          if (remoteData.settings.seo) {
            merged.settings.seo = { ...initialData.settings.seo, ...remoteData.settings.seo };
          }
          if (remoteData.settings.visibility) {
            merged.settings.visibility = { ...initialData.settings.visibility, ...remoteData.settings.visibility };
          }
          if (remoteData.settings.navigation) {
            merged.settings.navigation = { ...initialData.settings.navigation, ...remoteData.settings.navigation };
          }
        }
        if (remoteData.hero) {
          merged.hero = { ...initialData.hero, ...remoteData.hero };
        }
        return merged;
      });
    } catch (error) {
      console.error('Failed to fetch from backend, using fallback data:', error);
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
    try {
      if (token) {
        await api.createAdminCommunityPost(token, post);
      } else {
        await api.createCommunityPost(post);
      }
      await fetchContent();
    } catch (err) {
      console.error('Failed to create post:', err);
      throw err;
    }
  };

  const addComment = async (postId: string, comment: any) => {
    try {
      await api.addCommunityComment(postId, comment);
      await fetchContent();
    } catch (err) {
      console.error('Failed to add comment:', err);
      throw err;
    }
  };

  const votePost = async (postId: string) => {
    const visitorId = MarketingService.getVisitorId();
    const result = await api.voteCommunityPost(postId, visitorId);
    setData((prev) => ({
      ...prev,
      communityPosts: prev.communityPosts.map((p) =>
        p.id === postId ? { ...p, votes: result.votes } : p
      ),
    }));
    return result;
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

  const setPreview = (preview: Partial<WebsiteData> | null) => {
    if (!preview) {
      setPreviewData(null);
      return;
    }
    setPreviewData(prev => ({ ...(prev || data), ...preview }));
  };

  const togglePreview = () => {
    setIsPreviewVisible(prev => {
      const next = !prev;
      localStorage.setItem('admin_preview_visible', next.toString());
      return next;
    });
  };

  const resetData = () => {
    setData(initialData);
    setPreviewData(null);
    localStorage.removeItem('adminToken');
  };

  return (
    <WebsiteDataContext.Provider value={{
      data: previewData || data,
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
      votePost,
      updateCommunityPosts,
      updateStats,
      updatePillars,
      updatePerks,
      updateSettings,
      updateAppearance,
      setPreview,
      isPreviewVisible,
      togglePreview,
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

export { pillarIcons, perkIcons };
