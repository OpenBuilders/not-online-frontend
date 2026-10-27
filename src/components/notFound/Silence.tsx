import { useEffect, useRef, useState } from 'react';
import { cx } from '@/lib/cx';
import styles from './Silence.module.css';

const LENGTH = 404; // seconds: six minutes and forty-four
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

type Phase = 'ready' | 'running' | 'done' | 'stopped';

/**
 * 404 seconds of nothing. One button; then the screen goes black,
 * full-screen where the browser allows it, with a small clock counting
 * down at the bottom and nothing else. Escape or the stop link ends it
 * early, and the page tells you how long you lasted.
 */
export function Silence() {
  const [phase, setPhase] = useState<Phase>('ready');
  const [left, setLeft] = useState(LENGTH);
  const endsAt = useRef(0);

  const leaveFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  };

  const start = () => {
    endsAt.current = Date.now() + LENGTH * 1000;
    setLeft(LENGTH);
    setPhase('running');
    // Full screen is a bonus, not a requirement: some browsers refuse it.
    void document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const stop = () => {
    setPhase('stopped');
    leaveFullscreen();
  };

  useEffect(() => {
    if (phase !== 'running') return;
    const t = window.setInterval(() => {
      const s = Math.max(0, Math.ceil((endsAt.current - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) {
        setPhase('done');
        leaveFullscreen();
      }
    }, 250);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && stop();
    // Leaving full screen with the browser's own Escape counts as stopping.
    const onFs = () => !document.fullscreenElement && setPhase((p) => (p === 'running' ? 'stopped' : p));
    window.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFs);
    return () => {
      window.clearInterval(t);
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('fullscreenchange', onFs);
    };
  }, [phase]);

  if (phase === 'running') {
    return (
      <main className={cx(styles.page, styles.black)}>
        <h1 className={styles.srOnly}>Nothing is happening. {fmt(left)} left.</h1>
        <div className={styles.quiet}>
          <span className={styles.clock}>{fmt(left)}</span>
          <button type="button" className={styles.stop} onClick={stop}>
            Stop
          </button>
        </div>
      </main>
    );
  }

  const lasted = LENGTH - left;
  return (
    <main className={styles.page}>
      <header className={styles.top}>
        <span className={styles.code}>Error 404</span>
        <a className={styles.home} href="/">
          Back to the desktop
        </a>
      </header>

      <div className={styles.centre}>
        {phase === 'ready' && (
          <>
            <h1 className={styles.title}>
              404 seconds
              <br />
              of nothing
            </h1>
            <p className={styles.body}>
              This page does not exist, so have it the way it is: six minutes and forty-four seconds with no feed, no sound and
              no page. Just this.
            </p>
            <button type="button" className={styles.go} onClick={start}>
              Start nothing
            </button>
          </>
        )}
        {phase === 'done' && (
          <>
            <h1 className={styles.title}>That was 404 seconds of nothing</h1>
            <p className={styles.body}>How was it? You do not have to tell anyone.</p>
            <button type="button" className={styles.go} onClick={start}>
              Again
            </button>
          </>
        )}
        {phase === 'stopped' && (
          <>
            <h1 className={styles.title}>You lasted {fmt(lasted)}</h1>
            <p className={styles.body}>{lasted < 60 ? 'Nothing is harder than it looks.' : 'Respectable. Nothing will wait for you.'}</p>
            <button type="button" className={styles.go} onClick={start}>
              Try again
            </button>
          </>
        )}
      </div>
    </main>
  );
}
