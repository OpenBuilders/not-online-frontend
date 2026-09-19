import type { RefObject } from 'react';
import { DesktopIcon } from '@/components/desktop/DesktopIcon';
import { MarketCta } from '@/components/desktop/MarketCta';
import { APP_ICON_PATHS } from '@/data/iconOverrides';
import { useWindowManager } from '@/state/WindowManagerContext';

interface DesktopIconLayerProps {
  desktopRef: RefObject<HTMLElement | null>;
}

/**
 * Ported from the INITIAL seed array + click routing (Tools.html:2563-2582).
 * Market and Settings are the only two desktop icons that exist today;
 * `DesktopIcon` itself is generic (folder/file/app) so more can be added
 * here later without touching that component.
 *
 * Both are visible from the start — Settings used to only render once a
 * guest finished the Market tour, but a guest peeking into it early (and
 * seeing what's still locked) is the point now; the per-option unlock
 * progression still lives inside Settings > Backgrounds itself.
 */
export function DesktopIconLayer({ desktopRef }: DesktopIconLayerProps) {
  const { openWindow } = useWindowManager();

  return (
    <>
      <DesktopIcon
        type="app"
        app="market"
        name="Market"
        imageSrc={APP_ICON_PATHS.market}
        x={44}
        y={100}
        desktopRef={desktopRef}
        onOpen={() => openWindow({ kind: 'market', title: 'Market', width: 760, height: 580, singleton: true })}
        extra={
          <MarketCta
            onOpen={() => openWindow({ kind: 'market', title: 'Market', width: 760, height: 580, singleton: true })}
          />
        }
      />
      <DesktopIcon
        type="app"
        app="settings"
        name="Settings"
        imageSrc={APP_ICON_PATHS.settings}
        x={44}
        y={280}
        desktopRef={desktopRef}
        onOpen={() => openWindow({ kind: 'settings', title: 'Settings', width: 700, height: 520, singleton: true })}
      />
    </>
  );
}
