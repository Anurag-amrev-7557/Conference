import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { useWebsiteData } from '../components/WebsiteDataProvider';

const STORAGE_KEY = 'book-site-theme';

export { STORAGE_KEY };

/**
 * Bridges CMS `appearance.colorScheme` to `next-themes`.
 * When CMS sets `light` or `dark`, `forcedTheme` wins over visitor storage (D-17-05 / D-17-06).
 */
export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const { data } = useWebsiteData();
  const mode = data.appearance.colorScheme ?? 'system';
  const forcedTheme = mode === 'light' || mode === 'dark' ? mode : undefined;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      forcedTheme={forcedTheme}
      storageKey={STORAGE_KEY}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
