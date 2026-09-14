import type { ButtonHTMLAttributes } from 'react';
import { cx } from '@/lib/cx';
import styles from './AeroButton.module.css';

export type AeroVariant = 'silver' | 'lime' | 'pink' | 'dark' | 'ghost';

type AeroButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: AeroVariant;
  /** Ported from `.win.light .aero.ghost` — pass this inside a light-themed window. */
  theme?: 'dark' | 'light';
  size?: 'md' | 'sm';
  wide?: boolean;
  /** Renders the "SOON" ribbon used on locked options (Tools.html .soonbub). */
  soon?: boolean;
};

export function AeroButton({
  variant = 'silver',
  theme = 'dark',
  size = 'md',
  wide = false,
  soon = false,
  className,
  children,
  disabled,
  ...props
}: AeroButtonProps) {
  const variantClass =
    variant === 'ghost' && theme === 'light' ? styles.ghostLight : variant === 'silver' ? undefined : styles[variant];

  const button = (
    <button
      className={cx(styles.aero, variantClass, size === 'sm' && styles.sm, wide && styles.wide, className)}
      disabled={disabled || soon}
      {...props}
    >
      {children}
    </button>
  );

  if (!soon) return button;

  // Badge sits as a sibling of the button, not a child of it — a disabled
  // button's opacity would otherwise wash the badge out along with it, and
  // the badge is exactly the thing that's supposed to stay fully legible.
  return (
    <span className={cx(styles.wrapper, wide && styles.wide)}>
      {button}
      <span className={styles.soonBubble}>Soon</span>
    </span>
  );
}
