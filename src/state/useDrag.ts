import { useEffect, useRef, type RefObject } from 'react';

export type DragBounds = 'viewport' | RefObject<HTMLElement | null>;

export interface UseDragOptions {
  /** The element whose `left`/`top` get moved. Positioned elements only (absolute/fixed). */
  elementRef: RefObject<HTMLElement | null>;
  /** Where pointerdown starts a drag. Defaults to `elementRef` itself (e.g. a window's titlebar). */
  handleRef?: RefObject<HTMLElement | null>;
  /** What the element's position is clamped within. */
  bounds: DragBounds;
  /** Inset from the bounds edges, in px (window drag uses 4, widget drag uses 0). */
  margin?: number;
  /** Comma-separated selector list; a pointerdown that lands on a match doesn't start a drag
   *  (buttons and other interactive children inside a draggable surface). */
  excludeSelector?: string;
  /** Called once when a drag actually starts (after the exclude/button checks pass). */
  onDragStart?: () => void;
  /** Called once a drag ends, whether or not the pointer actually moved. */
  onDragEnd?: (moved: boolean) => void;
  /** Toggle `document.body.style.userSelect` while dragging (window drag wants this, widgets don't). */
  disableTextSelection?: boolean;
  disabled?: boolean;
}

/**
 * Shared pointer-event drag: works for mouse, touch and pen alike. Replaces
 * Tools.html's mousedown/mousemove/mouseup pairs (makeDraggable,
 * makeWindowDraggable) with pointerdown/pointermove/pointerup, which is what
 * that file was upgraded to for touch support this session.
 *
 * Returns a ref that reflects whether the last pointerdown turned into an
 * actual move — check it in a click handler to ignore the click that follows
 * a drag (e.g. don't open an app icon you just dragged).
 */
export function useDrag({
  elementRef,
  handleRef,
  bounds,
  margin = 0,
  excludeSelector,
  onDragStart,
  onDragEnd,
  disableTextSelection = false,
  disabled = false,
}: UseDragOptions) {
  const hasMovedRef = useRef(false);
  // Mutable drag state lives in refs, not closure locals, so it survives
  // this effect being torn down and re-run mid-gesture — which happens
  // whenever a caller passes an inline `onDragStart`/`onDragEnd` (WindowFrame
  // does, to call `focusWindow`): that dispatch re-renders the component,
  // the inline function gets a new identity, the dependency array below
  // changes, and the effect restarts between pointerdown and pointermove.
  // A closure-local `dragging = false` would silently reset and eat the
  // rest of the drag; a ref doesn't.
  const draggingRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (disabled) return;
    const handle = (handleRef ?? elementRef).current;
    const element = elementRef.current;
    if (!handle || !element) return;

    function getBoundsRect(): { left: number; top: number; width: number; height: number } {
      if (bounds === 'viewport') {
        return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      }
      const rect = bounds.current?.getBoundingClientRect();
      return rect ?? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    }

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0) return;
      if (excludeSelector && (e.target as HTMLElement).closest(excludeSelector)) return;
      if (!element) return;

      draggingRef.current = true;
      hasMovedRef.current = false;
      const rect = element.getBoundingClientRect();
      offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (disableTextSelection) document.body.style.userSelect = 'none';
      onDragStart?.();
      e.preventDefault();
    }

    function onPointerMove(e: PointerEvent) {
      if (!draggingRef.current || !element) return;
      hasMovedRef.current = true;
      const b = getBoundsRect();
      const { x: offsetX, y: offsetY } = offsetRef.current;
      const maxX = b.width - element.offsetWidth - margin;
      const maxY = b.height - element.offsetHeight - margin;
      const x = Math.max(margin, Math.min(e.clientX - b.left - offsetX, Math.max(margin, maxX)));
      const y = Math.max(margin, Math.min(e.clientY - b.top - offsetY, Math.max(margin, maxY)));
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
    }

    function onPointerUp() {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      if (disableTextSelection) document.body.style.userSelect = '';
      onDragEnd?.(hasMovedRef.current);
    }

    handle.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      handle.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [elementRef, handleRef, bounds, margin, excludeSelector, onDragStart, onDragEnd, disableTextSelection, disabled]);

  return hasMovedRef;
}
