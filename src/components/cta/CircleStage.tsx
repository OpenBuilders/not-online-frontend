import type { CSSProperties } from 'react';
import { cx } from '@/lib/cx';
import { GREEN_SRC, PINK_SRC } from './circleProbe';
import styles from './CircleStage.module.css';
import { useCircleLight } from './useCircleLight';

const COPY = {
  patron: 'Click to become a patron',
  artist: 'Click to apply as artist',
} as const;

interface CircleStageProps {
  /** Dismisses whatever is hosting the stage when picking a side opens a window. */
  onClose?: () => void;
  /** Overrides the drawing's width, for the narrower spots inside a window. */
  size?: number;
  className?: string;
}

/**
 * The join CTA itself: five figures hold hands in a black ring, and a soft
 * circular mask follows the pointer to reveal the coloured version
 * underneath. Green are patrons, pink are artists — moving the light across
 * the ring is how you find out which is which.
 *
 * The figure is the click target, and the call to action rides with the
 * cursor. An earlier pass put the action on a button below the ring, which
 * could never be reached: moving towards it took the light off the figure,
 * and the button vanished before the cursor arrived.
 *
 * Rendered bare rather than inside a popup shell, because it goes in three
 * places with three different frames around it — the login screen after an
 * unrecognised email, the Market Stats tab for a guest, and the builder's
 * publish celebration.
 */
export function CircleStage({ onClose, size, className }: CircleStageProps) {
  const { stageRef, over, lit, point, flip, act, onPointerMove, onPointerLeave, onPointerDown } =
    useCircleLight(onClose);

  // The cursor bubble is sized against the ring, not the viewport, so it
  // stays the same share of the drawing wherever the stage is embedded.
  const stageStyle = size
    ? ({ width: `min(${size}px, 86%)`, '--bubble-fs': `${((size / 340) * 12.5).toFixed(2)}px` } as CSSProperties)
    : undefined;

  return (
    <div className={cx(styles.wrap, className)}>
      <div
        ref={stageRef}
        className={cx(styles.stage, lit && styles.lit, over && styles.armed)}
        style={stageStyle}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
      >
        <img className={styles.base} src="/assets/cta/base_circle.png" alt="Five figures holding hands in a ring" />
        <img className={styles.reveal} src={GREEN_SRC} alt="" />
        <img className={styles.reveal} src={PINK_SRC} alt="" />
        <span className={styles.torch} aria-hidden="true" />

        {/* Positioned from the pointer rather than laid out, so it tracks
            without the browser reflowing the drawing underneath it. */}
        <span
          className={cx(styles.bubble, over && styles.on)}
          data-side={over ?? 'patron'}
          data-flip={flip || undefined}
          style={{ transform: `translate3d(${point.x}px, ${point.y}px, 0)` }}
          aria-hidden="true"
        >
          <span className={styles.bubbleInner}>{over ? COPY[over] : ''}</span>
        </span>
      </div>

      {/* Keyboard users never get a pointer, so the two routes stay reachable. */}
      <div className={styles.fallback}>
        <button type="button" className={styles.link} onClick={() => act('patron')}>
          Become a patron
        </button>
        <span className={styles.sep} aria-hidden="true">
          ·
        </span>
        <button type="button" className={styles.link} onClick={() => act('artist')}>
          Apply as artist
        </button>
      </div>
    </div>
  );
}
