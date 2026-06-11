import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

/** Persistent chrome for marketing routes — avoids full-screen blank state during lazy loads. */
export function PublicLayout() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[10000] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-neutral-950 focus:shadow-sm dark:focus:bg-neutral-950 dark:focus:text-neutral-50"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}
