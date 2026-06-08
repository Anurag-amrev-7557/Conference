import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { WebsiteData } from '../lib/websiteData';
import { initialData, pillarIcons, perkIcons } from '../lib/websiteData';
import { mergeConferenceContent } from '../lib/conferenceDefaults';
import { mergeRemoteWebsiteData } from '../lib/mergeRemoteWebsiteData';
import { mergeRemoteSettings } from '../lib/mergeRemoteSettings';
import { hydrateHomepage } from '../lib/homepageContent';
import { api } from '../lib/api';
import { setSiteOrigin } from '../seo/siteUrl';

const PREVIEW_STORAGE_KEY = 'adminPreviewVisible';

interface WebsiteDataContextType {
  /** Merged view used by the live preview (includes preview overrides). */
  data: WebsiteData;
  /** Persisted CMS data without preview overrides — use for editor form sync. */
  sourceData: WebsiteData;
  /** True only during the first CMS load — blocks the public shell. */
  loading: boolean;
  /** True during background refetch (save, tab focus) — does not unmount the app. */
  refreshing: boolean;
  updateArticles: (articles: WebsiteData['articles']) => Promise<void>;
  createArticle: (article: any) => Promise<void>;
  updateArticle: (id: string, article: any) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  createEvent: (event: any) => Promise<void>;
  updateEvent: (id: string, event: any) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  updateEvents: (events: WebsiteData['events']) => Promise<void>;
  updateSettings: (settings: WebsiteData['settings']) => Promise<void>;
  updateAppearance: (appearance: WebsiteData['appearance']) => Promise<void>;
  setPreview: (preview: Partial<WebsiteData> | null) => void;
  isPreviewVisible: boolean;
  togglePreviewVisible: () => void;
  resetData: () => void;
  refresh: () => Promise<void>;
  contentVersion: number;
}

const WebsiteDataContext = createContext<WebsiteDataContextType | undefined>(undefined);

type FetchOptions = {
  /** When true, skip the full-page loading gate (default: true after first load). */
  silent?: boolean;
};

export const WebsiteDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<WebsiteData>(initialData);
  const [previewData, setPreviewData] = useState<WebsiteData | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem(PREVIEW_STORAGE_KEY) === 'true',
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contentVersion, setContentVersion] = useState(1);
  const dataRef = useRef(data);
  const hasLoadedRef = useRef(false);
  const fetchInFlightRef = useRef<Promise<void> | null>(null);
  dataRef.current = data;

  const fetchContent = useCallback(async (options?: FetchOptions) => {
    const silent = options?.silent ?? hasLoadedRef.current;

    if (fetchInFlightRef.current) {
      return fetchInFlightRef.current;
    }

    const run = async () => {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const token = localStorage.getItem('adminToken') || '';
        const [site, articles, events] = await Promise.all([
          api.getContentSite().catch((e) => {
            console.error('Failed to fetch site slice:', e);
            return {};
          }),
          (token ? api.getAdminArticles(token) : api.getArticles()).catch((e) => {
            console.error('Failed to fetch articles slice:', e);
            return [];
          }),
          (token ? api.getAdminEvents(token) : api.getEvents()).catch((e) => {
            console.error('Failed to fetch events slice:', e);
            return [];
          }),
        ]);

        if (typeof (site as { siteUrl?: string }).siteUrl === 'string') {
          setSiteOrigin((site as { siteUrl: string }).siteUrl);
        }
        if (typeof (site as { contentVersion?: number }).contentVersion === 'number') {
          setContentVersion((site as { contentVersion: number }).contentVersion);
        }

        const remoteData = { ...site, articles, events };
        setData(mergeRemoteWebsiteData(remoteData as Record<string, unknown>));
        hasLoadedRef.current = true;
      } catch (error) {
        console.error('Failed to fetch from backend, using fallback data:', error);
        if (!hasLoadedRef.current) {
          setData(initialData);
        }
      } finally {
        if (!silent) {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
        fetchInFlightRef.current = null;
      }
    };

    fetchInFlightRef.current = run();
    return fetchInFlightRef.current;
  }, []);

  useEffect(() => {
    void fetchContent({ silent: false });
  }, [fetchContent]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && hasLoadedRef.current) {
        void fetchContent({ silent: true });
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchContent]);

  const getAdminToken = () => localStorage.getItem('adminToken') || '';

  const updateGlobal = async (updates: Partial<WebsiteData>) => {
    const token = getAdminToken();
    if (!token) {
      setData((prev) => hydrateHomepage({ ...prev, ...updates }));
      return;
    }

    try {
      const result = await api.updateGlobalContent(token, updates, { version: contentVersion });
      if (typeof result.version === 'number') {
        setContentVersion(result.version);
      }
      await fetchContent({ silent: true });
    } catch (error) {
      const err = error as Error & { status?: number };
      if (err.status === 409) {
        await fetchContent({ silent: true });
        window.alert('Someone else saved changes first. Content was refreshed — review and save again.');
      }
      console.error('Persistence error:', error);
      throw error;
    }
  };

  const mutateList = async (mutation: () => Promise<void>) => {
    await mutation();
    await fetchContent({ silent: true });
  };

  const createArticle = async (article: any) => {
    const token = getAdminToken();
    if (!token) return;
    try {
      await mutateList(() => api.createArticle(token, article));
    } catch (err) {
      console.error('Failed to create article:', err);
      throw err;
    }
  };

  const updateArticle = async (id: string, article: any) => {
    const token = getAdminToken();
    if (!token) return;
    try {
      await mutateList(() => api.updateArticle(token, id, article));
    } catch (err) {
      console.error('Failed to update article:', err);
      throw err;
    }
  };

  const deleteArticle = async (id: string) => {
    const token = getAdminToken();
    if (!token) return;
    try {
      await mutateList(() => api.deleteArticle(token, id));
    } catch (err) {
      console.error('Failed to delete article:', err);
      throw err;
    }
  };

  const createEvent = async (event: any) => {
    const token = getAdminToken();
    if (!token) return;
    try {
      await mutateList(() => api.createEvent(token, event));
    } catch (err) {
      console.error('Failed to create event:', err);
      throw err;
    }
  };

  const updateEvent = async (id: string, event: any) => {
    const token = getAdminToken();
    if (!token) return;
    try {
      await mutateList(() => api.updateEvent(token, id, event));
    } catch (err) {
      console.error('Failed to update event:', err);
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    const token = getAdminToken();
    if (!token) return;
    try {
      await mutateList(() => api.deleteEvent(token, id));
    } catch (err) {
      console.error('Failed to delete event:', err);
      throw err;
    }
  };

  const updateArticles = async (articles: WebsiteData['articles']) => {
    setData((prev) => ({ ...prev, articles }));
  };

  const updateEvents = async (events: WebsiteData['events']) => {
    setData((prev) => ({ ...prev, events }));
  };

  const updateSettings = async (settings: WebsiteData['settings']) => updateGlobal({ settings });
  const updateAppearance = async (appearance: WebsiteData['appearance']) => updateGlobal({ appearance });

  const setPreview = useCallback((preview: Partial<WebsiteData> | null) => {
    if (!preview) {
      setPreviewData(null);
      return;
    }
    setPreviewData((prev) => {
      const base = prev ?? dataRef.current;
      const next: WebsiteData = {
        ...base,
        ...preview,
        ...(preview.settings != null && {
          settings: mergeRemoteSettings({
            ...base.settings,
            ...preview.settings,
            conference: preview.settings.conference
              ? mergeConferenceContent({
                  ...base.settings.conference,
                  ...preview.settings.conference,
                })
              : base.settings.conference,
          }),
        }),
        ...(preview.appearance != null && {
          appearance: {
            ...base.appearance,
            ...preview.appearance,
            typography: {
              ...base.appearance.typography,
              ...preview.appearance.typography,
            },
            theme: {
              ...base.appearance.theme,
              ...preview.appearance.theme,
            },
          },
        }),
      };
      if (prev && JSON.stringify(prev) === JSON.stringify(next)) {
        return prev;
      }
      return hydrateHomepage(next);
    });
  }, []);

  const togglePreviewVisible = useCallback(() => {
    setIsPreviewVisible((visible) => {
      const next = !visible;
      localStorage.setItem(PREVIEW_STORAGE_KEY, String(next));
      if (!next) setPreviewData(null);
      return next;
    });
  }, []);

  const resetData = () => {
    setData(initialData);
    setPreviewData(null);
    localStorage.removeItem('adminToken');
    hasLoadedRef.current = false;
  };

  const refresh = useCallback(() => fetchContent({ silent: true }), [fetchContent]);

  return (
    <WebsiteDataContext.Provider
      value={{
        data: previewData || data,
        sourceData: data,
        loading,
        refreshing,
        updateArticles,
        createArticle,
        updateArticle,
        deleteArticle,
        createEvent,
        updateEvent,
        deleteEvent,
        updateEvents,
        updateSettings,
        updateAppearance,
        setPreview,
        isPreviewVisible,
        togglePreviewVisible,
        resetData,
        refresh,
        contentVersion,
      }}
    >
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
