import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import styles from './FocusTour.module.css';

export interface FocusTourStep {
  ref: RefObject<HTMLElement | null>;
  text: string;
  /** Input-type steps only: shows a small "Next" button in the bubble (in addition to pressing
   *  Enter in the field itself) — typing shouldn't advance the tour on the first keystroke, the
   *  way a click-type step (a real button) naturally does. */
  onNext?: () => void;
}

interface FocusTourProps {
  /** The positioned ancestor the spotlight rect is measured against — must have `position: relative`.
   *  The overlay is portaled directly into this element, so it can darken the whole window (rail
   *  included) even though FocusTour itself renders deep inside one tab's content. */
  containerRef: RefObject<HTMLElement | null>;
  steps: FocusTourStep[];
  activeIndex: number;
  /** Renders a way out of the tour. A spotlight with no exit is a trap —
   *  the Market tour omits this because its own form has a visible Close. */
  onSkip?: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const BUBBLE_WIDTH = 220;
const BUBBLE_HEIGHT_EST = 64;
const GAP = 12;
const PAD = 6;
const HOLE_RADIUS = 12; // matches .ring's own border-radius, so the glow and the cutout agree

/** An SVG path for a rounded rect, for use inside `clip-path: path(...)`. */
function roundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M${x + rr},${y} H${x + w - rr} A${rr},${rr} 0 0 1 ${x + w},${y + rr} V${y + h - rr} A${rr},${rr} 0 0 1 ${x + w - rr},${y + h} H${x + rr} A${rr},${rr} 0 0 1 ${x},${y + h - rr} V${y + rr} A${rr},${rr} 0 0 1 ${x + rr},${y} Z`;
}

/**
 * Guided-focus overlay for the guest Sell form: darkens the whole window
 * except the current target, with a funny bubble next to it. Purely
 * visual/positional — advancing to the next step is the form's own job
 * (call the step's real onClick/onChange as normal; the form bumps its own
 * tour-index state from inside those same handlers). An earlier version had
 * FocusTour attach its own native `addEventListener` per target to
 * auto-advance, which raced with React's own synthetic onClick/onChange on
 * the exact same element — the target's real handler (e.g. "upload the demo
 * clip") could lose that race, so the tour would visibly advance while the
 * actual action silently didn't happen. Explicit beats implicit here.
 *
 * The dark layer is a single element with a `clip-path: path(evenodd, ...)`
 * — two closed subpaths (the full container rect, and a rounded-rect hole)
 * that the evenodd rule excludes wherever they overlap. `clip-path`
 * genuinely removes the excluded region from hit-testing in every modern
 * engine, unlike `mask` or the box-shadow-cutout trick (a box-shadow never
 * participates in hit testing at all, so a shadow "hole" would leave the
 * dimmed area fully clickable) or several hand-placed blocking rectangles
 * (fussy to keep seamless — a 1px rounding gap between them reads as
 * separate dark squares instead of one frame). One element, one path, no
 * seams, and real arcs on the hole so its corners match `.ring`'s.
 *
 * Input-type steps (typing into a field) show a small "Next" button in the
 * bubble instead of auto-advancing on the first keystroke — see `onNext`.
 */
export function FocusTour({ containerRef, steps, activeIndex, onSkip }: FocusTourProps) {
  const [rect, setRect] = useState<Rect | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  // The portal target lives in state (set alongside rect), not read from
  // containerRef.current during render — refs are meant to be read in
  // effects/handlers, not render, since a render-time read can silently
  // desync from what actually got committed.
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const step = steps[activeIndex];

  // A target can sit below the fold of a scrolling panel (the page builder's
  // setup column is taller than the window), where a spotlight on it would
  // point at nothing.
  useEffect(() => {
    step?.ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [activeIndex, step]);

  useLayoutEffect(() => {
    if (!step) return;
    let frame: number;
    function measure() {
      const container = containerRef.current;
      const target = step.ref.current;
      if (container && target) {
        const c = container.getBoundingClientRect();
        const t = target.getBoundingClientRect();
        setContainerSize({ width: c.width, height: c.height });
        setRect({ top: t.top - c.top, left: t.left - c.left, width: t.width, height: t.height });
        setPortalTarget(container);
      } else {
        setRect(null);
        setPortalTarget(null);
      }
      frame = requestAnimationFrame(measure);
    }
    measure();
    return () => cancelAnimationFrame(frame);
    // re-measures every frame while a step is active — cheap (a couple of getBoundingClientRect
    // calls) and keeps the cutout glued to its target through the step's own layout transitions
    // without needing a ResizeObserver per target.
  }, [activeIndex, containerRef, step]);

  if (!step || !rect || !portalTarget) return null;

  const hole = {
    top: Math.max(0, rect.top - PAD),
    left: Math.max(0, rect.left - PAD),
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
  };
  const holeBottom = hole.top + hole.height;
  const { width: cw, height: ch } = containerSize;

  // Two independent closed subpaths — the full container rect and a
  // *rounded*-rect hole — combined with the `evenodd` fill rule, which
  // treats anywhere the two overlap as excluded. Rounding the hole this
  // way (real SVG arcs) keeps the cutout's corners matching `.ring`'s own
  // border-radius exactly, instead of the plain-rectangle hole a polygon
  // donut gives you.
  const outerPath = `M0,0 H${cw} V${ch} H0 Z`;
  const holePath = roundedRectPath(hole.left, hole.top, hole.width, hole.height, HOLE_RADIUS);
  const clipPath = `path(evenodd, "${outerPath} ${holePath}")`;

  const bubbleHeightEst = step.onNext ? BUBBLE_HEIGHT_EST + 34 : BUBBLE_HEIGHT_EST;
  const spaceBelow = ch - holeBottom;
  const spaceAbove = hole.top;
  const placeBelow = spaceBelow >= bubbleHeightEst + GAP || spaceBelow >= spaceAbove;
  const bubbleTop = placeBelow
    ? Math.min(holeBottom + GAP, Math.max(8, ch - bubbleHeightEst - 8))
    : Math.max(8, hole.top - GAP - bubbleHeightEst);
  const bubbleLeft = Math.min(Math.max(hole.left, 8), Math.max(8, cw - BUBBLE_WIDTH - 8));

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.scrim} style={{ clipPath }} />
      <div className={styles.ring} style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }} />
      <div
        className={styles.bubble}
        style={{ top: bubbleTop, left: bubbleLeft, width: BUBBLE_WIDTH }}
        data-arrow={placeBelow ? 'up' : 'down'}
      >
        {step.text}
        {step.onNext && (
          <button type="button" className={styles.bubbleNext} onClick={step.onNext}>
            Next
          </button>
        )}
        {onSkip && (
          <button type="button" className={styles.bubbleSkip} onClick={onSkip}>
            Skip
          </button>
        )}
      </div>
    </div>,
    portalTarget
  );
}
