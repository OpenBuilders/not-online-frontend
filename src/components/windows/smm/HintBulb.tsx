import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { cx } from '@/lib/cx';
import styles from './HintBulb.module.css';

interface HintBulbProps {
  title: string;
  children: ReactNode;
  /** Which edge the panel hangs from — the default opens to the left. */
  align?: 'left' | 'right';
  /** The glyph on the trigger when it is closed. */
  icon?: string;
  /** `sticker` is the pink peel-off used where the trigger adds something
   *  rather than explains something. */
  variant?: 'bulb' | 'sticker';
  /** Sticker variant only: the word beside the glyph. */
  stickerLabel?: string;
}

/**
 * Advice, folded away behind a bulb until it is wanted.
 *
 * Both Plan and Compose used to carry their hints as a permanent block
 * under the working area. They are read once and then ignored for good,
 * so that block was spending real estate on something already known and,
 * in Plan's case, pushing the grid itself below the fold.
 *
 * The panel is positioned relative to the button rather than centred in
 * the window, so it reads as belonging to the control that opened it.
 * Closing on Escape and on an outside click is what makes it feel like a
 * popover instead of a second, competing layout.
 */
export function HintBulb({ title, children, align = 'right', icon = 'lightbulb', variant = 'bulb', stickerLabel }: HintBulbProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    // Capture phase: a click inside the panel that also closes something
    // else must not lose the outside test to a stopped propagation.
    document.addEventListener('pointerdown', onDown, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown, true);
    };
  }, [open]);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={cx(
          variant === 'sticker' ? styles.sticker : styles.bulb,
          open && (variant === 'sticker' ? styles.stickerOn : styles.bulbOn),
        )}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title={title}
        aria-label={title}
      >
        <MaterialIcon name={open ? 'close' : icon} size={16} />
        {variant === 'sticker' && stickerLabel && <span>{stickerLabel}</span>}
      </button>

      {open && (
        <div className={cx(styles.panel, styles[align])} role="dialog" aria-label={title}>
          <div className={styles.head}>{title}</div>
          {children}
        </div>
      )}
    </div>
  );
}
