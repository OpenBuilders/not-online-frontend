import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { cx } from '@/lib/cx';
import styles from './SiteSelect.module.css';

export interface SiteSelectOption {
  value: string;
  label: string;
  /** Drawn before the label, in the trigger and in the list. */
  icon?: ReactNode;
}

interface SiteSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SiteSelectOption[];
  /** Named for screen readers, since the control carries no visible label. */
  ariaLabel: string;
  /** Inverted, for a filter that is currently doing something. */
  active?: boolean;
  className?: string;
}

/**
 * The app's dropdown: a trigger and a floating menu, built the same way
 * the page builder's icon picker is — white card, 13px radius, a real
 * shadow — rather than a native `<select>` wearing a border.
 *
 * A native select cannot be styled past its own box: the menu it opens is
 * drawn by the operating system, and its width is fixed to the *widest*
 * option, so a filter offering "behind the scenes" sat at that width even
 * while reading "all labels". Here both the closed control and the open
 * menu are ours, and the trigger hugs whatever it currently says.
 */
export function SiteSelect({ value, onChange, options, ariaLabel, active, className }: SiteSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    // Capture, so a click that also closes something else cannot lose the
    // outside test to stopped propagation.
    document.addEventListener('pointerdown', onDown, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown, true);
    };
  }, [open]);

  /** Arrow keys move the selection directly, the way a native select does
   *  when it is closed — no menu needed for the common one-step change. */
  function step(by: number) {
    const i = options.findIndex((o) => o.value === value);
    const next = options[Math.min(options.length - 1, Math.max(0, i + by))];
    if (next && next.value !== value) onChange(next.value);
  }

  return (
    <div className={cx(styles.root, className)} ref={rootRef}>
      <button
        type="button"
        className={cx(styles.trigger, active && styles.active)}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            open ? setOpen(false) : step(1);
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            step(-1);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        {current?.icon}
        <span className={styles.text}>{current?.label ?? ''}</span>
        <MaterialIcon name="expand_more" size={15} className={styles.chevron} />
      </button>

      {open && (
        <div className={styles.menu} role="listbox" aria-label={ariaLabel}>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={o.value === value}
              className={cx(styles.option, o.value === value && styles.optionOn)}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              {o.icon}
              <span className={styles.text}>{o.label}</span>
              {o.value === value && <MaterialIcon name="check" size={14} className={styles.tick} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
