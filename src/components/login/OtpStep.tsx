import type { RefObject } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import styles from './LoginScreen.module.css';

interface OtpStepProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  hint: string;
  busy: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
}

/**
 * Ported from Tools.html:1736-1742 (the `data-step="otp"` block). 6 digits,
 * not 4 — that's what the real backend (`not-online-frontend`'s
 * `/auth/otp/verify`, `pattern="[0-9]{6}"`) actually issues.
 */
export function OtpStep({ value, onChange, onSubmit, hint, busy, inputRef }: OtpStepProps) {
  return (
    <>
      <div className={styles.field}>
        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="• • • • • •"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit();
          }}
          disabled={busy}
        />
        <button type="button" className={styles.go} aria-label="Verify" disabled={busy} onClick={onSubmit}>
          <MaterialIcon name="arrow_forward" />
        </button>
      </div>
      <div className={styles.hint}>{hint}</div>
    </>
  );
}
