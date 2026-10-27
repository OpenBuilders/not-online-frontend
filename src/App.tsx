import { useEffect } from 'react';
import { Desktop } from '@/components/desktop/Desktop';
import { NotFound } from '@/components/notFound/NotFound';
import { AppStateProvider } from '@/state/AppStateContext';
import { WindowManagerProvider, useWindowManager } from '@/state/WindowManagerContext';

/**
 * No router: the desktop lives at `/`, and anything else is a 404. `?404`
 * shows the 404 at the root too, so the versions can be compared without
 * inventing a broken link first.
 */
const params = new URLSearchParams(window.location.search);
const isNotFound = params.has('404') || !['/', '/index.html'].includes(window.location.pathname);

/**
 * `?build` opens the links-page builder on arrival — where the 404's
 * "Turn into something" lands. The param is dropped once used, so a
 * reload is just the desktop again.
 */
function OpenFromUrl() {
  const { openWindow } = useWindowManager();
  useEffect(() => {
    if (!params.has('build')) return;
    openWindow({ kind: 'websiteBuilder', title: 'Your links page', width: 1040, height: 660, singleton: true });
    window.history.replaceState(null, '', window.location.pathname);
  }, [openWindow]);
  return null;
}

export default function App() {
  if (isNotFound) return <NotFound />;
  return (
    <AppStateProvider>
      <WindowManagerProvider>
        <OpenFromUrl />
        <Desktop />
      </WindowManagerProvider>
    </AppStateProvider>
  );
}
