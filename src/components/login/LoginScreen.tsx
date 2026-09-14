import { useEffect, useRef, useState } from 'react';
import { EmailStep } from '@/components/login/EmailStep';
import { OtpStep } from '@/components/login/OtpStep';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { ApiError, useRequestOtp, useVerifyOtp } from '@/state/useAuth';
import styles from './LoginScreen.module.css';

interface LoginScreenProps {
  backgroundImage: string;
  onClose: () => void;
}

type Step = 'email' | 'otp';

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return error instanceof Error ? error.message : 'Something went wrong.';
}

/**
 * Ported from Tools.html:1720-1767 (markup) + the login IIFE (~2815-2880).
 * Mounted only while open (App/Desktop conditionally renders it) rather
 * than always-present with a `.open` class toggle — the fade-in animation
 * plays the same way on mount either way, and there's no state worth
 * keeping alive while it's closed.
 *
 * Now wired to the real backend (`not-online-frontend`'s `/auth/otp/*`)
 * instead of the mock ALLOWED_EMAILS/VALID_OTP check this used to run —
 * see useRequestOtp/useVerifyOtp (state/useAuth.ts). The "email not with
 * us yet -> become a patron/artist" JoinCards flow that used to live here
 * is parked: the real `/auth/otp/request` has no documented "unrecognized
 * email" signal yet to route on, so re-add it once that contract exists.
 */
export function LoginScreen({ backgroundImage, onClose }: LoginScreenProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpHint, setOtpHint] = useState('code sent, check your inbox');
  const [error, setError] = useState('');

  const [clock, setClock] = useState({ time: '00:00', date: '—' });
  const emailRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);

  const requestOtpMutation = useRequestOtp();
  const verifyOtpMutation = useVerifyOtp();
  const busy = requestOtpMutation.isPending || verifyOtpMutation.isPending;

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock({
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    (step === 'otp' ? otpRef : emailRef).current?.focus();
  }, [step]);

  function sendCode() {
    const v = email.trim().toLowerCase();
    if (!v || !/.+@.+\..+/.test(v)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    requestOtpMutation.mutate(v, {
      onSuccess: (response) => {
        setEmail(v);
        setOtpHint(response.message || `code sent to ${v}`);
        setStep('otp');
      },
      onError: (err) => setError(errorMessage(err)),
    });
  }

  function verify() {
    verifyOtpMutation.mutate(
      { email, code: otp },
      {
        onSuccess: () => onClose(),
        onError: (err) => {
          setError(errorMessage(err));
          setOtp('');
          otpRef.current?.focus();
        },
      }
    );
    // TODO(stage 5): toast('Welcome back', "You're signed in.", [...])
  }

  return (
    <div className={styles.screen} style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className={styles.clock}>
        <div className={styles.clockTime}>{clock.time}</div>
        <div className={styles.clockDate}>{clock.date}</div>
      </div>

      <div className={styles.card}>
        <div className={styles.avatar}>
          <MaterialIcon name="person" />
        </div>
        <div className={styles.name}>{step === 'otp' ? 'Check your email' : 'Nothing User'}</div>

        {step === 'email' ? (
          <EmailStep value={email} onChange={setEmail} onSubmit={sendCode} busy={busy} inputRef={emailRef} />
        ) : (
          <OtpStep value={otp} onChange={setOtp} onSubmit={verify} hint={otpHint} busy={busy} inputRef={otpRef} />
        )}

        <div className={styles.err}>{error}</div>
      </div>

      <button type="button" className={styles.cancel} onClick={onClose}>
        Continue as guest
      </button>
    </div>
  );
}
