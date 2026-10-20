import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AeroButton } from '@/components/shared/AeroButton';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import styles from './FeatureIntroModal.module.css';

interface FeatureIntroModalProps {
  /** The active window body, so the scrim covers its entire working area. */
  container: HTMLElement | null;
  icon: string;
  eyebrow: string;
  title: string;
  copy: string;
  note: string;
  /** Leave the feature and return to the window's first tab. */
  onDismiss: () => void;
  onJoin: () => void;
  onLogin: () => void;
}

/** Shared guest orientation for a feature that needs a signed-in account. */
export function FeatureIntroModal({
  container,
  icon,
  eyebrow,
  title,
  copy,
  note,
  onDismiss,
  onJoin,
  onLogin,
}: FeatureIntroModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onDismiss]);

  if (!container) return null;

  return createPortal(
    <div className={styles.overlay} onMouseDown={onDismiss}>
      <section
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className={styles.close}
          onClick={onDismiss}
          aria-label={`Close ${title}`}
        >
          <MaterialIcon name="close" size={18} />
        </button>

        <div className={styles.icon} aria-hidden="true">
          <MaterialIcon name={icon} size={28} />
        </div>
        <h3 id={titleId} className={styles.title}>{title}</h3>
        <p className={styles.copy}>{copy}</p>

        <div className={styles.actions}>
          <AeroButton variant="lime" wide onClick={onJoin}>
            Join the circle
          </AeroButton>
          <AeroButton variant="ghost" theme="light" wide onClick={onLogin}>
            Log in
          </AeroButton>
        </div>
      </section>
    </div>,
    container,
  );
}
