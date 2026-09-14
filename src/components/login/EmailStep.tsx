import type { RefObject } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import styles from './LoginScreen.module.css';

interface EmailStepProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  busy: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
}

/** Ported from Tools.html:1728-1734 (the `data-step="email"` block). */
export function EmailStep({ value, onChange, onSubmit, busy, inputRef }: EmailStepProps) {
  return (
    <>
      <div className={styles.field}>
        <input
          ref={inputRef}
          className={`${styles.input} ${styles.emailInput}`}
          type="email"
          placeholder="your email"
          autoComplete="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit();
          }}
        />
        <button type="button" className={styles.go} aria-label="Send code" disabled={busy} onClick={onSubmit}>
          <MaterialIcon name="arrow_forward" />
        </button>
      </div>
      <div className={styles.hint}>we'll send a one-time code</div>
    </>
  );
}
