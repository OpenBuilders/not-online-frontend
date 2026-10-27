import { ArtistApplyWindow } from '@/components/windows/ArtistApplyWindow';
import { AdminWindow } from '@/components/windows/admin/AdminWindow';
import { BlankWindow } from '@/components/windows/BlankWindow';
import { NotFoundWindow } from '@/components/windows/NotFoundWindow';
import { WindowFrame } from '@/components/windows/WindowFrame';
import { MarketWindow } from '@/components/windows/market/MarketWindow';
import { SettingsWindow } from '@/components/windows/settings/SettingsWindow';
import { SmmWindow } from '@/components/windows/smm/SmmWindow';
import { WebsiteBuilderWindow } from '@/components/windows/websiteBuilder/WebsiteBuilderWindow';
import { useWindowManager } from '@/state/WindowManagerContext';
import type { WindowKind } from '@/types';
import { Suspense, lazy, type JSX } from 'react';

/**
 * Radar carries 311 real listings and its own code: it loads the first
 * time the window opens, not with the desktop.
 */
const RadarLazy = lazy(() => import('@/components/windows/radar/RadarWindow').then((m) => ({ default: m.RadarWindow })));
function RadarWindow() {
  return (
    <Suspense fallback={<div style={{ flex: 1, background: 'var(--c-paper)' }} />}>
      <RadarLazy />
    </Suspense>
  );
}

// The remaining widget-backed windows (tools/orgs) are parked with
// the widgets themselves — add their entries back here when they do.
// "Become a partner" everywhere now opens https://probablynothing.xyz/patrons?utm_campaign=notonline&utm_source=not-online-cta
// in a new tab instead of an in-app window — see src/data/links.ts.
const CONTENT_BY_KIND: Record<WindowKind, () => JSX.Element> = {
  admin: AdminWindow,
  radar: RadarWindow,
  market: MarketWindow,
  settings: SettingsWindow,
  websiteBuilder: WebsiteBuilderWindow,
  smm: SmmWindow,
  artistApply: ArtistApplyWindow,
  notFound: NotFoundWindow,
  blank: BlankWindow,
};

/** Renders every open window through the shared WindowFrame chrome, picking content by `kind`. */
export function WindowManager() {
  const { windows } = useWindowManager();

  return (
    <>
      {windows.map((win) => {
        const Content = CONTENT_BY_KIND[win.kind];
        return (
          <WindowFrame key={win.id} win={win}>
            <Content />
          </WindowFrame>
        );
      })}
    </>
  );
}
