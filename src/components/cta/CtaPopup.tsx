import { useEffect, type ReactNode } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { cx } from '@/lib/cx';
import styles from './CtaPopup.module.css';

interface CtaPopupProps {
  title: string;
  sub: string;
  /** The two CTA treatments want opposite grounds — white hands need a dark room, black-and-lime plates need a lit table. */
  tone: 'dark' | 'paper';
  onClose: () => void;
  children: ReactNode;
}

/** Shared shell for the join CTAs: scrim, card, heading, close. */
export function CtaPopup({ title, sub, tone, onClose, children }: CtaPopupProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={styles.scrim} onClick={onClose}>
      {/* The card stops the click so only the scrim itself dismisses. */}
      <div className={cx(styles.card, styles[tone])} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          <MaterialIcon name="close" size={18} />
        </button>
        <div className={styles.head}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.sub}>{sub}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
