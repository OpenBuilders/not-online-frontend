import { useRef, useState } from 'react';
import { BottomBar } from '@/components/desktop/BottomBar';
import { DesktopIconLayer } from '@/components/desktop/DesktopIconLayer';
import { HomeBar } from '@/components/desktop/HomeBar';
import { MySubmissions } from '@/components/desktop/MySubmissions';
import { TopRow } from '@/components/desktop/TopRow';
import { LoginScreen } from '@/components/login/LoginScreen';
import { WindowManager } from '@/components/windows/WindowManager';
import { useAppState } from '@/state/AppStateContext';
import { useAutoLayout } from '@/state/useAutoLayout';
import { useSessionSync } from '@/state/useAuth';

// TODO(stage 4/5): derive from state.wallpaper once Settings > Backgrounds is wired up.
const DEFAULT_WALLPAPER = '/images/screen_1.jpg';

/**
 * The whole-screen shell. Ported from Tools.html:1598-1700 — `.desktop` and
 * its dot-grid overlay live in styles/base.css as global rules rather than
 * a CSS module, since this is the one true root of the app, not a
 * reusable piece.
 */
export function Desktop() {
  const desktopRef = useRef<HTMLDivElement>(null);
  const { state } = useAppState();
  const [loginOpen, setLoginOpen] = useState(false);
  const { checkingSession } = useSessionSync();

  useAutoLayout(desktopRef, [state.logged, state.tours.size]);

  if (checkingSession) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.6)',
          fontFamily: 'inherit',
          fontSize: 13,
        }}
      >
        Checking session…
      </div>
    );
  }

  return (
    <div className="desktop" id="desktop" ref={desktopRef} style={{ backgroundImage: `url('${DEFAULT_WALLPAPER}')` }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)', zIndex: 0 }} />

      <TopRow onRequestLogin={() => setLoginOpen(true)} />

      {/* Widgets (Radar/Toolbox/Orgs/SMM/Website Builder) are parked for
          this pass — Market, Settings, and the desktop shell only. */}
      <DesktopIconLayer desktopRef={desktopRef} />
      <MySubmissions />

      <BottomBar />

      <WindowManager />
      <HomeBar />

      {loginOpen && <LoginScreen backgroundImage={DEFAULT_WALLPAPER} onClose={() => setLoginOpen(false)} />}
    </div>
  );
}
