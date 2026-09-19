import { useCallback, useRef, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { useDrag } from '@/state/useDrag';
import { stackPosition, useWindowManager } from '@/state/WindowManagerContext';
import type { WindowInstance } from '@/types';
import styles from './WindowFrame.module.css';

interface WindowFrameProps {
  win: WindowInstance;
  children: ReactNode;
}

/**
 * Shared chrome for every open app: titlebar, traffic-lights, drag, focus,
 * and the mobile full-screen stacking. Ported from openWindow() +
 * makeWindowDraggable() (Tools.html:2371-2454) — each window kind only
 * needs to provide its own content as `children`.
 */
export function WindowFrame({ win, children }: WindowFrameProps) {
  const { windows, closeWindow, focusWindow } = useWindowManager();
  const elementRef = useRef<HTMLDivElement>(null);
  const titlebarRef = useRef<HTMLDivElement>(null);
  // Stable identity: focusWindow's dispatch re-renders WindowFrame, and an
  // inline `() => ...` here would give useDrag's effect a new dependency
  // every render — tearing the drag listeners down mid-gesture right after
  // the first pointerdown (see the comment in useDrag.ts).
  const onDragStart = useCallback(() => focusWindow(win.id), [focusWindow, win.id]);

  useDrag({
    elementRef,
    handleRef: titlebarRef,
    bounds: 'viewport',
    margin: 4,
    excludeSelector: `.${styles.dot}`,
    disableTextSelection: true,
    onDragStart,
  });

  const stack = stackPosition(windows, win.id);
  // Centred on both axes, then cascaded — a fixed top made a tall window
  // hug the ceiling and a short one float above the middle of the screen.
  const left = `calc(50% - ${win.width / 2}px + ${win.offsetIndex * 26}px)`;
  const top = `calc(50% - ${(win.height ?? 520) / 2}px + ${win.offsetIndex * 26}px)`;

  return (
    <div
      ref={elementRef}
      className={cx(
        styles.win,
        win.className,
        stack === 'stack-top' && styles.stackTop,
        stack === 'stack-bot' && styles.stackBot
      )}
      style={{ width: win.width, height: win.height, left, top, zIndex: win.zIndex }}
      onPointerDown={() => focusWindow(win.id)}
    >
      <div ref={titlebarRef} className={styles.titlebar}>
        <div className={styles.dots}>
          <button
            type="button"
            className={cx(styles.dot, styles.red)}
            aria-label={`Close ${win.title}`}
            onClick={() => closeWindow(win.id)}
          />
          <span className={cx(styles.dot, styles.yellow)} />
          <span className={cx(styles.dot, styles.green)} />
        </div>
        <div className={styles.title}>{win.title}</div>
        <div className={styles.spacer} />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
