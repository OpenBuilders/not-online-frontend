import { Desktop } from '@/components/desktop/Desktop';
import { AppStateProvider } from '@/state/AppStateContext';
import { WindowManagerProvider } from '@/state/WindowManagerContext';

export default function App() {
  return (
    <AppStateProvider>
      <WindowManagerProvider>
        <Desktop />
      </WindowManagerProvider>
    </AppStateProvider>
  );
}
