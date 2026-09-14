import type { CSSProperties } from 'react';
import { cx } from '@/lib/cx';
import styles from './Sticker.module.css';

export type StickerColor = 'lime' | 'pink' | 'dark' | 'white';

interface StickerProps {
  text: string;
  color?: StickerColor;
  rotate?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * A standalone rotated callout badge — the same visual language as
 * AeroButton's `.soonBubble` (AeroButton.module.css) scaled up to stand on
 * its own instead of pinned to a button's corner. Purely decorative: no
 * click handler, `pointer-events: none`, `aria-hidden`. Pair it with a real
 * button nearby for anything that needs to be clickable — the sticker
 * itself should never be the only way to trigger an action.
 */
export function Sticker({ text, color = 'lime', rotate = -6, className, style }: StickerProps) {
  return (
    <span
      className={cx(styles.sticker, styles[color], className)}
      style={{ transform: `rotate(${rotate}deg)`, ...style }}
      aria-hidden="true"
    >
      {text}
    </span>
  );
}
