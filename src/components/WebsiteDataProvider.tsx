import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import type { WebsiteData } from '../lib/websiteData';
import { pillarIcons, perkIcons } from '../lib/websiteData';
import { mergeRemoteWebsiteData } from '../lib/mergeRemoteWebsiteData';
import { hydrateHomepage } from '../lib/homepageContent';
import { api } from '../lib/api';
import { setSiteOrigin } from '../seo/siteUrl';
import { writeSessionCmsCache } from '../lib/cmsBootstrap';
import { resolveInitialWebsiteData } from '../lib/resolveInitialWebsiteData';
import { structuralDefaults } from '../lib/structuralDefaults';
import { getAdminToken } from '../lib/adminAuth';
import { config } from '../lib/config';
import { notifyWebsiteContentRefreshed } from './admin/useAdminCatalog';
import { ADMIN_SESSION_CHANGED } from '../lib/adminSessionEvents';

function hasAdminSession(): boolean {
  return !!localStorage.getItem(config.admin.sessionKey);
}

interface WebsiteDataContextType {
  data: WebsiteData;
  /** Persisted CMS data — use for editor form sync. */
  sourceData: WebsiteData;
  /** True only during the first CMS load. */
  loading: boolean;
  /** True during background refetch (save, tab focus) — does not unmount the app. */
  refreshing: boolean;
  updateArticles: (articles: WebsiteData['articles']) => Promise<void>;
  createArticle: (article: Record<string, unknown>) => Promise<void>;
  updateArticle: (id: string, article: Record<string, unknown>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  createEvent: (event: Record<string, unknown>) => Promise<void>;
  updateEvent: (id: string, event: Record<string, unknown>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  updateEvents: (events: WebsiteData['events']) => Promise<void>;
  updateSettings: (settings: WebsiteData['settings']) => Promise<void>;
  updateAppearance: (appearance: WebsiteData['appearance']) => Promise<void>;
  resetData: () => void;
  refresh: () => Promise<void>;
  contentVersion: number;
}

const WebsiteDataContext = createContext<WebsiteDataContextType | undefined>(undefined);

const VISIBILITY_REFETCH_COOLDOWN_MS = 60_000;

type FetchOptions = {
  /** When true, skip the full-page loading gate (default: true after first load). */
  silent?: boolean;
};

export const WebsiteDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = useMemo(() => resolveInitialWebsiteData(), []);
  const [data, setData] = useState<WebsiteData>(initial.data);
  const [sourceData, setSourceData] = useState<WebsiteData>(initial.data);
  const sourceDataRef = useRef<WebsiteData>(initial.data);
  const [loading, setLoading] = useState(initial.source === 'structural');
  const [refreshing, setRefreshing] = useState(false);
  const [contentVersion, setContentVersion] = useState(initial.contentVersion);
  const contentVersionRef = useRef(initial.contentVersion);
  const hasLoadedRef = useRef(initial.source !== 'structural');
  const fetchInFlightRef = useRef<Promise<void> | null>(null);
  const lastVisibilityRefetchRef = useRef(0);

  const fetchContent = useCallback(
    async (options?: FetchOptions) => {
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
          let remotePayload: Record<string, unknown> | null = null;

          if (typeof window !== 'undefined' && window.__CMS_BOOTSTRAP_PROMISE__) {
            try {
              remotePayload = (await window.__CMS_BOOTSTRAP_PROMISE__) as Record<
                string,
                unknown
              > | null;
            } catch {
              remotePayload = null;
            }
          }

          if (!remotePayload) {
            remotePayload = (await api.getContentBootstrap()) as Record<string, unknown>;
          }

          const site = remotePayload ?? {};

          if (typeof site.siteUrl === 'string') {
            setSiteOrigin(site.siteUrl);
          }

          const remoteVersion =
            typeof site.contentVersion === 'number'
              ? site.contentVersion
              : contentVersionRef.current;

          const merged = (() => {
            const base = hasLoadedRef.current ? sourceDataRef.current : structuralDefaults;
            return mergeRemoteWebsiteData(site, base);
          })();

          const versionChanged = remoteVersion !== contentVersionRef.current;
          const firstLoad = !hasLoadedRef.current;

          if (firstLoad || versionChanged) {
            sourceDataRef.current = merged;
            setSourceData(merged);
            setData(merged);
            contentVersionRef.current = remoteVersion;
            setContentVersion(remoteVersion);
            writeSessionCmsCache(merged, remoteVersion);
          }

          hasLoadedRef.current = true;
          notifyWebsiteContentRefreshed();
        } catch (error) {
          console.error('Failed to fetch from backend, using fallback data:', error);
          if (!hasLoadedRef.current && initial.source === 'structural') {
            sourceDataRef.current = structuralDefaults;
            setData(structuralDefaults);
            setSourceData(structuralDefaults);
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
    },
    [initial.source],
  );

  useEffect(() => {
    // When baked bootstrap exists, refresh silently — avoids blank first paint.
    void fetchContent({ silent: initial.source !== 'structural' });
  }, [fetchContent, initial.source]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible' || !hasLoadedRef.current) return;
      const now = Date.now();
      if (now - lastVisibilityRefetchRef.current < VISIBILITY_REFETCH_COOLDOWN_MS) return;
      lastVisibilityRefetchRef.current = now;
      void fetchContent({ silent: true });
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchContent]);

  useEffect(() => {
    const onSessionChanged = () => {
      void fetchContent({ silent: true });
    };
    window.addEventListener(ADMIN_SESSION_CHANGED, onSessionChanged);
    return () => window.removeEventListener(ADMIN_SESSION_CHANGED, onSessionChanged);
  }, [fetchContent]);

  const mutateList = useCallback(
    async (mutation: () => Promise<void>) => {
      await mutation();
      await fetchContent({ silent: true });
    },
    [fetchContent],
  );

  const updateGlobal = useCallback(
    async (updates: Partial<WebsiteData>) => {
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
          throw new Error(
            'Someone else saved changes first. Content was refreshed — review and save again.',
          );
        }
        console.error('Persistence error:', error);
        throw error;
      }
    },
    [contentVersion, fetchContent],
  );

  const createArticle = useCallback(
    async (article: Record<string, unknown>) => {
      if (!hasAdminSession()) return;
      const token = getAdminToken();
      try {
        await mutateList(() => api.createArticle(token, article));
      } catch (err) {
        console.error('Failed to create article:', err);
        throw err;
      }
    },
    [mutateList],
  );

  const updateArticle = useCallback(
    async (id: string, article: Record<string, unknown>) => {
      if (!hasAdminSession()) return;
      const token = getAdminToken();
      try {
        await mutateList(() => api.updateArticle(token, id, article));
      } catch (err) {
        console.error('Failed to update article:', err);
        throw err;
      }
    },
    [mutateList],
  );

  const deleteArticle = useCallback(
    async (id: string) => {
      if (!hasAdminSession()) return;
      const token = getAdminToken();
      try {
        await mutateList(() => api.deleteArticle(token, id));
      } catch (err) {
        console.error('Failed to delete article:', err);
        throw err;
      }
    },
    [mutateList],
  );

  const createEvent = useCallback(
    async (event: Record<string, unknown>) => {
      if (!hasAdminSession()) return;
      const token = getAdminToken();
      try {
        await mutateList(() => api.createEvent(token, event));
      } catch (err) {
        console.error('Failed to create event:', err);
        throw err;
      }
    },
    [mutateList],
  );

  const updateEvent = useCallback(
    async (id: string, event: Record<string, unknown>) => {
      if (!hasAdminSession()) return;
      const token = getAdminToken();
      try {
        await mutateList(() => api.updateEvent(token, id, event));
      } catch (err) {
        console.error('Failed to update event:', err);
        throw err;
      }
    },
    [mutateList],
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      if (!hasAdminSession()) return;
      const token = getAdminToken();
      try {
        await mutateList(() => api.deleteEvent(token, id));
      } catch (err) {
        console.error('Failed to delete event:', err);
        throw err;
      }
    },
    [mutateList],
  );

  const updateArticles = useCallback(async (articles: WebsiteData['articles']) => {
    setData((prev) => ({ ...prev, articles }));
  }, []);

  const updateEvents = useCallback(async (events: WebsiteData['events']) => {
    setData((prev) => ({ ...prev, events }));
  }, []);

  const updateSettings = useCallback(
    async (settings: WebsiteData['settings']) => updateGlobal({ settings }),
    [updateGlobal],
  );

  const updateAppearance = useCallback(
    async (appearance: WebsiteData['appearance']) => updateGlobal({ appearance }),
    [updateGlobal],
  );

  const resetData = useCallback(() => {
    sourceDataRef.current = structuralDefaults;
    setData(structuralDefaults);
    setSourceData(structuralDefaults);
    contentVersionRef.current = 1;
    setContentVersion(1);
    localStorage.removeItem(config.admin.sessionKey);
    hasLoadedRef.current = false;
  }, []);

  const refresh = useCallback(() => fetchContent({ silent: true }), [fetchContent]);

  const contextValue = useMemo(
    () => ({
      data,
      sourceData,
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
      resetData,
      refresh,
      contentVersion,
    }),
    [
      data,
      sourceData,
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
      resetData,
      refresh,
      contentVersion,
    ],
  );

  return <WebsiteDataContext.Provider value={contextValue}>{children}</WebsiteDataContext.Provider>;
};

export const useWebsiteData = () => {
  const context = useContext(WebsiteDataContext);
  if (context === undefined) {
    throw new Error('useWebsiteData must be used within a WebsiteDataProvider');
  }
  return context;
};

export { pillarIcons, perkIcons };
