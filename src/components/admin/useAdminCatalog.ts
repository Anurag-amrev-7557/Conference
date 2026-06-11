import { useCallback, useEffect, useRef, useState } from 'react';
import type { Article, AppEvent } from '../../lib/websiteData';
import { api } from '../../lib/api';

const CONTENT_REFRESHED = 'website-content-refreshed';

function getAdminToken() {
  return localStorage.getItem('adminToken') || '';
}

/** Reload admin catalog lists when shared public content refreshes (e.g. after saves). */
export function notifyWebsiteContentRefreshed() {
  window.dispatchEvent(new CustomEvent(CONTENT_REFRESHED));
}

type ReloadOptions = {
  /** When true, keep showing existing rows while fetching (no skeleton flash). */
  silent?: boolean;
};

function useAdminCatalogList<T>(
  fetcher: (token: string) => Promise<T[]>,
): { items: T[]; loading: boolean; reload: (options?: ReloadOptions) => Promise<T[]> } {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const reloadInFlightRef = useRef<Promise<T[]> | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const reload = useCallback(async (options?: ReloadOptions): Promise<T[]> => {
    if (reloadInFlightRef.current) {
      return reloadInFlightRef.current;
    }

    const run = async (): Promise<T[]> => {
      const token = getAdminToken();
      const silent = options?.silent ?? hasLoadedRef.current;

      if (!token) {
        setItems([]);
        setLoading(false);
        return [];
      }

      if (!silent) {
        setLoading(true);
      }

      try {
        const next = await fetcher(token);
        setItems(next);
        hasLoadedRef.current = true;
        return next;
      } catch (error) {
        console.error('Failed to load admin catalog:', error);
        return itemsRef.current;
      } finally {
        if (!silent) {
          setLoading(false);
        }
        reloadInFlightRef.current = null;
      }
    };

    reloadInFlightRef.current = run();
    return reloadInFlightRef.current;
  }, [fetcher]);

  useEffect(() => {
    void reload({ silent: false });
  }, [reload]);

  useEffect(() => {
    const onRefreshed = () => {
      void reload({ silent: true });
    };
    window.addEventListener(CONTENT_REFRESHED, onRefreshed);
    return () => window.removeEventListener(CONTENT_REFRESHED, onRefreshed);
  }, [reload]);

  return { items, loading, reload };
}

export function useAdminArticles() {
  return useAdminCatalogList<Article>((token) => api.getAdminArticles(token));
}

export function useAdminEvents() {
  return useAdminCatalogList<AppEvent>((token) => api.getAdminEvents(token));
}
