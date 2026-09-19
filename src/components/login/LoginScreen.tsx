import { useEffect, useRef, useState } from 'react';
import { CircleJoinCta } from '@/components/cta/CircleJoinCta';
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

/** The countdown shown after a code is sent. Also the fallback when the
 *  response carries no usable `expiresAt`, and the ceiling on one that
 *  does — a server window longer than this would leave the timer sitting
 *  there for minutes, which is not what it's for. */
const OTP_TTL_MILLISECONDS = 2 * 60 * 1_000;

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return error instanceof Error ? error.message : 'Something went wrong.';
}

/**
 * Whether a failed OTP request means "we don't know this address" rather
 * than "that request was malformed" or "slow down".
 *
 * `/auth/otp/request` has no dedicated flag for it, so this reads the
 * status: 400 is a bad payload and 429 is the rate limiter, and every other
 * 4xx on this endpoint is the backend declining to send a code to an
 * address it has no account for. Anything else (a 5xx, a dead connection)
 * is our problem, not the visitor's, and shows as a plain error instead.
 */
function isUnknownEmail(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  return error.status >= 401 && error.status < 500 && error.status !== 429;
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
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(120);
  const [error, setError] = useState('');
  // The email isn't one of ours. The field keeps what was typed so another
  // address can be tried, and the CTA opens over the top of it.
  const [notInCircle, setNotInCircle] = useState(false);

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

  useEffect(() => {
    if (step !== 'otp' || otpExpiresAt === null) return;

    const tick = () => {
      setOtpSecondsLeft(
        Math.max(0, Math.ceil((otpExpiresAt - Date.now()) / 1_000))
      );
    };
    tick();
    const id = window.setInterval(tick, 1_000);
    return () => window.clearInterval(id);
  }, [otpExpiresAt, step]);

  function sendCode() {
    const v = email.trim().toLowerCase();
    if (!v || !/.+@.+\..+/.test(v)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setNotInCircle(false);
    requestOtpMutation.mutate(v, {
      onSuccess: (response) => {
        const ceiling = Date.now() + OTP_TTL_MILLISECONDS;
        const responseExpiry = Date.parse(response.expiresAt);
        const expiresAt = Number.isNaN(responseExpiry) ? ceiling : Math.min(responseExpiry, ceiling);
        setEmail(v);
        setOtp('');
        setOtpHint(response.message || `code sent to ${v}`);
        setOtpExpiresAt(expiresAt);
        setOtpSecondsLeft(
          Math.max(0, Math.ceil((expiresAt - Date.now()) / 1_000))
        );
        setStep('otp');
      },
      onError: (err) => {
        if (isUnknownEmail(err)) {
          setError('We don\u2019t know that address. Try another, or join below.');
          setNotInCircle(true);
          return;
        }
        setError(errorMessage(err));
      },
    });
  }

  function verify() {
    if (otpSecondsLeft <= 0) {
      setError('Code expired. Request a new code.');
      return;
    }

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
          <OtpStep
            value={otp}
            onChange={setOtp}
            onSubmit={verify}
            onRequestNewCode={sendCode}
            hint={otpHint}
            busy={busy}
            secondsLeft={otpSecondsLeft}
            inputRef={otpRef}
          />
        )}

        <div className={styles.err}>{error}</div>
      </div>

      <button type="button" className={styles.cancel} onClick={onClose}>
        Continue as guest
      </button>

      {notInCircle && (
        <CircleJoinCta
          title="Probably not in circle"
          sub="Join us. Move the light, pick your role \u2014 or close this and try another email."
          onClose={() => setNotInCircle(false)}
        />
      )}
    </div>
  );
}
