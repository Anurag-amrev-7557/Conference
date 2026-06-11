import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useWorkspaceTabParam<T extends string>(
  validIds: readonly T[],
  defaultId: T,
  paramName = 'tab',
) {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = (() => {
    const raw = searchParams.get(paramName);
    if (raw && (validIds as readonly string[]).includes(raw)) {
      return raw as T;
    }
    return defaultId;
  })();

  const setActiveTab = useCallback(
    (id: T) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (id === defaultId) {
            next.delete(paramName);
          } else {
            next.set(paramName, id);
          }
          return next;
        },
        { replace: true },
      );
    },
    [defaultId, paramName, setSearchParams],
  );

  return [activeTab, setActiveTab] as const;
}
