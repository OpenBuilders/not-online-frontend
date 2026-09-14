import { ArtistApplyWindow } from '@/components/windows/ArtistApplyWindow';
import { BlankWindow } from '@/components/windows/BlankWindow';
import { NotFoundWindow } from '@/components/windows/NotFoundWindow';
import { PatronWindow } from '@/components/windows/PatronWindow';
import { WindowFrame } from '@/components/windows/WindowFrame';
import { MarketWindow } from '@/components/windows/market/MarketWindow';
import { SettingsWindow } from '@/components/windows/settings/SettingsWindow';
import { useWindowManager } from '@/state/WindowManagerContext';
import type { WindowKind } from '@/types';
import type { JSX } from 'react';

// Widget-backed windows (radar/tools/orgs/smm/websiteBuilder) are parked
// with the widgets themselves — add their entries back here when they do.
const CONTENT_BY_KIND: Record<WindowKind, () => JSX.Element> = {
  market: MarketWindow,
  settings: SettingsWindow,
  patron: PatronWindow,
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
