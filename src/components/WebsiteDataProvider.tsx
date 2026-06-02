import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { WebsiteData } from '../lib/websiteData';
import { initialData, pillarIcons, perkIcons } from '../lib/websiteData';
import { mergeConferenceContent } from '../lib/conferenceDefaults';
import { defaultConferenceRegistrationForm } from '../lib/registrationDefaults';
import { hydrateHomepage } from '../lib/homepageContent';
import { api } from '../lib/api';
import { setSiteOrigin } from '../seo/siteUrl';

interface WebsiteDataContextType {
  /** Merged view used by the live preview (includes preview overrides). */
  data: WebsiteData;
  /** Persisted CMS data without preview overrides — use for editor form sync. */
  sourceData: WebsiteData;
  loading: boolean;
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
  resetData: () => void;
  refresh: () => Promise<void>;
  contentVersion: number;
}

const WebsiteDataContext = createContext<WebsiteDataContextType | undefined>(undefined);

export const WebsiteDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<WebsiteData>(initialData);
  const [previewData, setPreviewData] = useState<WebsiteData | null>(null);
  const isPreviewVisible = false;
  const [loading, setLoading] = useState(true);
  const [contentVersion, setContentVersion] = useState(1);
  const dataRef = useRef(data);
  dataRef.current = data;

  const fetchContent = async () => {
    try {
      setLoading(true);
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
      const remoteData = { ...site, articles, events };

      if (typeof (site as { siteUrl?: string }).siteUrl === 'string') {
        setSiteOrigin((site as { siteUrl: string }).siteUrl);
      }
      if (typeof (site as { contentVersion?: number }).contentVersion === 'number') {
        setContentVersion((site as { contentVersion: number }).contentVersion);
      }

      // Deep merge remoteData with initialData to ensure new fields (typography, theme, etc.) 
      // exist even if the backend record is older.
      setData(() => {
        const merged = { ...initialData, ...remoteData };
        // Ensure nested objects are also merged if they exist in remoteData
        if (remoteData.appearance) {
          merged.appearance = { ...initialData.appearance, ...remoteData.appearance };
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
            const { community: _community, ...visibility } = remoteData.settings.visibility as Record<string, boolean> & { community?: boolean };
            merged.settings.visibility = { ...initialData.settings.visibility, ...visibility };
          }
          if (remoteData.settings.navigation) {
            merged.settings.navigation = {
              ...initialData.settings.navigation,
              ...remoteData.settings.navigation,
              primaryCta: {
                ...initialData.settings.navigation.primaryCta,
                ...remoteData.settings.navigation.primaryCta,
              },
            };
          }
          if (remoteData.settings.catalogPages) {
            merged.settings.catalogPages = {
              ...initialData.settings.catalogPages,
              ...remoteData.settings.catalogPages,
            };
          }
          if (remoteData.settings.sections) {
            const { community: _community, ...sections } = (remoteData.settings.sections ?? {}) as Record<string, unknown> & { community?: unknown };
            merged.settings.sections = {
              ...initialData.settings.sections,
              ...sections,
            };
          }
          if (remoteData.settings.routeSeo) {
            const { '/community': _communitySeo, ...routeSeo } = remoteData.settings.routeSeo as Record<string, unknown>;
            merged.settings.routeSeo = {
              ...initialData.settings.routeSeo,
              ...routeSeo,
            };
          }
          const { communityPage: _communityPage, ...settingsRest } = merged.settings as typeof merged.settings & { communityPage?: unknown };
          merged.settings = settingsRest;
          merged.settings.conference = mergeConferenceContent(remoteData.settings.conference);
          if (remoteData.settings.conferenceRegistration) {
            const fromApi = remoteData.settings.conferenceRegistration;
            const ticketPriceCents =
              typeof fromApi.ticketPriceCents === 'number'
                ? fromApi.ticketPriceCents
                : defaultConferenceRegistrationForm.ticketPriceCents;
            merged.settings.conferenceRegistration = {
              ...defaultConferenceRegistrationForm,
              ...fromApi,
              ticketPriceCents,
              fields: {
                ...defaultConferenceRegistrationForm.fields,
                ...fromApi.fields,
                name: {
                  ...defaultConferenceRegistrationForm.fields.name,
                  ...fromApi.fields?.name,
                },
                email: {
                  ...defaultConferenceRegistrationForm.fields.email,
                  ...fromApi.fields?.email,
                },
                phone: {
                  ...defaultConferenceRegistrationForm.fields.phone,
                  ...fromApi.fields?.phone,
                },
                linkedIn: {
                  ...defaultConferenceRegistrationForm.fields.linkedIn,
                  ...fromApi.fields?.linkedIn,
                },
                designation: {
                  ...defaultConferenceRegistrationForm.fields.designation,
                  ...fromApi.fields?.designation,
                },
              },
              designationOptions:
                fromApi.designationOptions?.length
                  ? fromApi.designationOptions
                  : defaultConferenceRegistrationForm.designationOptions,
              panelStats:
                fromApi.panelStats?.length
                  ? fromApi.panelStats
                  : defaultConferenceRegistrationForm.panelStats,
              panelQuote: {
                ...defaultConferenceRegistrationForm.panelQuote,
                ...fromApi.panelQuote,
              },
              trustFooter: {
                ...defaultConferenceRegistrationForm.trustFooter,
                ...fromApi.trustFooter,
                logos:
                  fromApi.trustFooter?.logos?.length
                    ? fromApi.trustFooter.logos
                    : defaultConferenceRegistrationForm.trustFooter.logos,
              },
            };
          } else {
            merged.settings.conferenceRegistration = defaultConferenceRegistrationForm;
          }
        }
        if (remoteData.hero) {
          const { secondaryCtaHref: _href, secondaryCtaLabel: _label, ...hero } = remoteData.hero as typeof remoteData.hero & {
            secondaryCtaHref?: string;
            secondaryCtaLabel?: string;
          };
          merged.hero = { ...initialData.hero, ...hero };
        }
        if (Array.isArray(remoteData.stats)) {
          merged.stats = remoteData.stats;
        }
        if (Array.isArray(remoteData.pillars)) {
          merged.pillars = remoteData.pillars;
        }
        if (Array.isArray(remoteData.perks)) {
          merged.perks = remoteData.perks;
        }
        return hydrateHomepage(merged);
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
      setData((prev) => hydrateHomepage({ ...prev, ...updates }))
      return
    }

    try {
      const result = await api.updateGlobalContent(token, updates, { version: contentVersion });
      if (typeof result.version === 'number') {
        setContentVersion(result.version);
      }
      await fetchContent(); // Refresh from server
    } catch (error) {
      const err = error as Error & { status?: number };
      if (err.status === 409) {
        await fetchContent();
        window.alert('Someone else saved changes first. Content was refreshed — review and save again.');
      }
      console.error('Persistence error:', error);
      throw error;
    }
  };

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

  const updateArticles = async (articles: WebsiteData['articles']) => {
    // Legacy support for array-wide updates
    setData(prev => ({ ...prev, articles }));
  };

  const updateEvents = async (events: WebsiteData['events']) => {
     setData(prev => ({ ...prev, events }));
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
          settings: { ...base.settings, ...preview.settings },
        }),
        ...(preview.appearance != null && {
          appearance: { ...base.appearance, ...preview.appearance },
        }),
      };
      if (prev && JSON.stringify(prev) === JSON.stringify(next)) {
        return prev;
      }
      return next;
    });
  }, []);

  const resetData = () => {
    setData(initialData);
    setPreviewData(null);
    localStorage.removeItem('adminToken');
  };

  return (
    <WebsiteDataContext.Provider value={{
      data: previewData || data,
      sourceData: data,
      loading,
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
      resetData,
      refresh: fetchContent,
      contentVersion,
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
