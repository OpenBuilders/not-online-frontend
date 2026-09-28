import { useRef, type CSSProperties, type MutableRefObject, type ReactNode, type RefObject } from 'react';
import { cx } from '@/lib/cx';
import { useDrag } from '@/state/useDrag';
import styles from './WidgetCard.module.css';

interface WidgetShellProps {
  id: string;
  /** Initial desktop position (Tools.html seeds these inline, e.g. top:100px; left:880px). */
  x: number;
  y: number;
  desktopRef: RefObject<HTMLElement | null>;
  /**
   * For a widget whose whole face is the button. `useDrag` normally
   * refuses to start a drag on a `button`, so that a click on the action
   * control is never swallowed — but when the face *is* the control, that
   * rule makes the widget impossible to move at all. Dragging then falls
   * back to the guard below, which is what tells a click from a drag.
   */
  dragAnywhere?: boolean;
  /**
   * Receives the drag guard: true when the pointer travelled, so a click
   * that merely ended a drag does not also open a window.
   */
  children: (hasMoved: MutableRefObject<boolean>) => ReactNode;
}

/**
 * The positioned, draggable square a widget lives in — everything a widget
 * needs to sit on the desktop, and nothing about what it looks like.
 *
 * Split out of WidgetCard once a second widget (SMM) needed the same
 * placement and drag behaviour but a face that changes shape with its own
 * state. Duplicating `useDrag`'s wiring is the one thing not to do here:
 * its mutable state lives in refs precisely because an inline callback
 * tears the listener down mid-gesture, and that is easy to get subtly
 * wrong a second time.
 *
 * Carries the literal `widget-card` marker class alongside the hashed one —
 * useAutoLayout queries the desktop for that selector to stack widgets on
 * mobile. It is a query hook, not a style hook.
 */
export function WidgetShell({ id, x, y, desktopRef, dragAnywhere = false, children }: WidgetShellProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  const hasMovedRef = useDrag({
    elementRef,
    bounds: desktopRef,
    excludeSelector: dragAnywhere ? undefined : `.${styles.stickerRoot} button`,
  });

  const style: CSSProperties = { left: x, top: y };

  return (
    <div
      id={id}
      ref={elementRef}
      className={cx(styles.wrap, styles.stickerRoot, 'widget-card')}
      style={style}
      data-x={x}
      data-y={y}
    >
      {children(hasMovedRef)}
    </div>
  );
}
