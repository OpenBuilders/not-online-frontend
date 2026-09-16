import { useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { StickerWidget, type StickerColor } from '@/components/widgets/StickerWidget';
import { useDrag } from '@/state/useDrag';
import { cx } from '@/lib/cx';
import styles from './WidgetCard.module.css';

interface WidgetCardProps {
  id: string;
  title: ReactNode;
  lead: ReactNode;
  sub: ReactNode;
  buttonLabel: string;
  buttonIcon: string;
  onOpen: () => void;
  /** Initial desktop position (Tools.html seeds these inline, e.g. top:100px; left:880px). */
  x: number;
  y: number;
  desktopRef: RefObject<HTMLElement | null>;
  color: StickerColor;
  rotate?: number;
}

/**
 * Shared shell for the four simple card widgets (Toolbox, Orgs, SMM,
 * Website Builder). Ported from .widget-card/.wc-* (Tools.html:812-821),
 * now rendered as a StickerWidget — the widget itself is the sticker, with
 * its content on the face. Radar has its own bespoke layout and doesn't use
 * this, though it wraps its own content the same way.
 *
 * Carries a plain `widget-card` marker class alongside the CSS-module
 * class — useAutoLayout queries the desktop for that literal selector to
 * stack widgets on mobile, same as it does for `.desktop-icon`. It's a
 * query hook, not a style hook; every visual rule lives under the module's
 * hashed class instead.
 */
export function WidgetCard({
  id,
  title,
  lead,
  sub,
  buttonLabel,
  buttonIcon,
  onOpen,
  x,
  y,
  desktopRef,
  color,
  rotate,
}: WidgetCardProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  const hasMovedRef = useDrag({
    elementRef,
    bounds: desktopRef,
    excludeSelector: `.${styles.stickerRoot} button`,
  });

  const style: CSSProperties = { left: x, top: y };

  return (
    <div id={id} ref={elementRef} className={cx(styles.wrap, styles.stickerRoot, 'widget-card')} style={style} data-x={x} data-y={y}>
      <StickerWidget
        color={color}
        icon={buttonIcon}
        title={title}
        lead={lead}
        sub={sub}
        actionLabel={buttonLabel}
        rotate={rotate}
        onOpen={() => {
          // Same click-vs-drag disambiguation DesktopIcon uses — a drag that
          // happens to end on the button shouldn't also open the window.
          if (hasMovedRef.current) {
            hasMovedRef.current = false;
            return;
          }
          onOpen();
        }}
      />
    </div>
  );
}
