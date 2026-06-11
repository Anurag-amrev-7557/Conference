/** Shared API base URL resolution — used by api client and bootstrap prefetch. */

function requireProductionApiUrl(): string {
  const envApiBase = import.meta.env.VITE_API_URL?.trim();
  if (!envApiBase) {
    throw new Error(
      'VITE_API_URL is required for production builds. Set it in .env.production or CI environment.',
    );
  }
  return envApiBase.replace(/\/$/, '');
}

/** Dev default uses Vite proxy (`vite.config.ts` → localhost:3001) to avoid CORS blocks. */
export const API_BASE = import.meta.env.PROD
  ? requireProductionApiUrl()
  : import.meta.env.VITE_API_URL?.trim().replace(/\/$/, '') || '/api/v1';

export const BOOTSTRAP_URL = `${API_BASE}/content/bootstrap`;
