import { useRef, useState } from 'react';
import { DesktopIconLayer } from '@/components/desktop/DesktopIconLayer';
import { HomeBar } from '@/components/desktop/HomeBar';
import { TopRow } from '@/components/desktop/TopRow';
import { LoginScreen } from '@/components/login/LoginScreen';
import { WebsiteBuilderWidget } from '@/components/widgets/WebsiteBuilderWidget';
import { WindowManager } from '@/components/windows/WindowManager';
import { BACKGROUND_OPTIONS } from '@/data/backgrounds';
import { useAppState } from '@/state/AppStateContext';
import { useAutoLayout } from '@/state/useAutoLayout';
import { useSessionSync } from '@/state/useAuth';

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
  const wallpaperSrc = BACKGROUND_OPTIONS.find((o) => o.id === state.wallpaper)?.src ?? DEFAULT_WALLPAPER;

  // `checkingSession` is a dependency because this component returns a
  // placeholder while it's true — the desktop isn't in the DOM yet, so the
  // first layout pass has nothing to measure and every icon and widget
  // would keep the seed position React rendered, unclamped.
  useAutoLayout(desktopRef, [state.logged, state.tours.size, checkingSession]);

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
    <div className="desktop" id="desktop" ref={desktopRef} style={{ backgroundImage: `url('${wallpaperSrc}')` }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)', zIndex: 0 }} />

      <TopRow onRequestLogin={() => setLoginOpen(true)} />

      {/* The Radar/Toolbox/Orgs/SMM widgets are still parked — their tools
          don't exist here yet. The links page does, so its widget is live. */}
      <WebsiteBuilderWidget desktopRef={desktopRef} />

      <DesktopIconLayer desktopRef={desktopRef} />
      {/* MySubmissions is kept in the tree but no longer rendered. Every
          number it carried is now stated by the widget that owns it — the
          page's address and its traffic sit on the builder sticker — so a
          bar restating them across the top summarised things already on
          screen, and was the one piece of chrome that made the desktop
          read as a dashboard. */}
      {/* BottomBar (the running line) is kept in the tree but not rendered —
          the component stays available for when it's wanted back. */}

      <WindowManager />
      <HomeBar />

      {loginOpen && <LoginScreen backgroundImage={DEFAULT_WALLPAPER} onClose={() => setLoginOpen(false)} />}
    </div>
  );
}
