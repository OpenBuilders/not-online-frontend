import { useRef, useState, type ReactNode, type RefObject } from 'react';
import { defaultIcon, type AppIconName, type DesktopIconType } from '@/data/icons';
import { cx } from '@/lib/cx';
import { useDrag } from '@/state/useDrag';
import styles from './DesktopIcon.module.css';

interface DesktopIconProps {
  type: DesktopIconType;
  name: string;
  app?: AppIconName;
  /** Custom artwork overriding the built-in line icon (ICON_OVERRIDES in Tools.html:1790-1799). Falls back to the built-in icon if it fails to load. */
  imageSrc?: string;
  x: number;
  y: number;
  desktopRef: RefObject<HTMLElement | null>;
  onOpen: () => void;
  /** Onboarding callout (sticker + button) anchored to this icon — renders as a child so it
   * always tracks the icon's real position instead of needing separate coordinate math across
   * the desktop/mobile-grid layouts. */
  extra?: ReactNode;
}

/**
 * One draggable desktop icon. Ported from createIcon() (Tools.html:2521-2560)
 * and the click-routing listener right after it (2569+) — click-vs-drag
 * disambiguation (a real click opens the app; a drag that happened to end
 * doesn't) comes straight from useDrag's `hasMoved` flag, replacing the
 * original's `icon._moved` property on the DOM node.
 */
export function DesktopIcon({ type, name, app, imageSrc, x, y, desktopRef, onOpen, extra }: DesktopIconProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [imageFailed, setImageFailed] = useState(false);

  const hasMovedRef = useDrag({ elementRef, bounds: desktopRef });

  return (
    <div
      ref={elementRef}
      className={cx(styles.icon, styles[type], 'desktop-icon')}
      style={{ left: x, top: y }}
      data-x={x}
      data-y={y}
      onClick={() => {
        if (hasMovedRef.current) {
          hasMovedRef.current = false;
          return;
        }
        onOpen();
      }}
    >
      <div className={styles.iconImg}>
        {imageSrc && !imageFailed ? (
          <img src={imageSrc} alt="" onError={() => setImageFailed(true)} />
        ) : (
          defaultIcon(type, app)
        )}
      </div>
      <span className={styles.label}>{name}</span>
      {extra}
    </div>
  );
}
