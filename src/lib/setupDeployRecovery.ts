const CHUNK_RELOAD_KEY = 'app-chunk-reload';

function isChunkLoadError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('failed to fetch dynamically imported module') ||
    normalized.includes('importing a module script failed') ||
    normalized.includes('error loading dynamically imported module')
  );
}

/** After a deploy, cached entry JS may reference removed chunks — reload once to pick up index.html. */
export function setupDeployRecovery(): void {
  const reloadOnce = (): boolean => {
    if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return false;
    sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
    window.location.reload();
    return true;
  };

  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    reloadOnce();
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message =
      typeof reason === 'string'
        ? reason
        : reason instanceof Error
          ? reason.message
          : String(reason ?? '');
    if (isChunkLoadError(message)) {
      event.preventDefault();
      reloadOnce();
    }
  });

  window.setTimeout(() => {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  }, 15_000);
}

export function isChunkLoadFailure(error: Error | null | undefined): boolean {
  if (!error?.message) return false;
  return isChunkLoadError(error.message);
}
