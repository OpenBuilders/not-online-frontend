import type { RefObject } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import styles from './LoginScreen.module.css';

interface OtpStepProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onRequestNewCode: () => void;
  hint: string;
  busy: boolean;
  secondsLeft: number;
  inputRef: RefObject<HTMLInputElement | null>;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Ported from Tools.html:1736-1742 (the `data-step="otp"` block). 6 digits,
 * not 4 — that's what the real backend (`not-online-frontend`'s
 * `/auth/otp/verify`, `pattern="[0-9]{6}"`) actually issues.
 */
export function OtpStep({
  value,
  onChange,
  onSubmit,
  onRequestNewCode,
  hint,
  busy,
  secondsLeft,
  inputRef,
}: OtpStepProps) {
  const expired = secondsLeft <= 0;

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
          disabled={busy || expired}
        />
        <button
          type="button"
          className={styles.go}
          aria-label="Verify"
          disabled={busy || expired}
          onClick={onSubmit}
        >
          <MaterialIcon name="arrow_forward" />
        </button>
      </div>
      <div className={styles.hint}>{hint}</div>
      <div className={`${styles.otpTimer} ${expired ? styles.otpTimerExpired : ''}`}>
        {expired ? (
          <>
            <span>Code expired.</span>
            <button
              type="button"
              className={styles.requestNewCode}
              disabled={busy}
              onClick={onRequestNewCode}
            >
              Request a new code
            </button>
          </>
        ) : (
          <span>
            Code expires in{' '}
            <time dateTime={`PT${secondsLeft}S`}>{formatTime(secondsLeft)}</time>
          </span>
        )}
      </div>
    </>
  );
}
