import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Sticker } from '@/components/shared/Sticker';
import { cx } from '@/lib/cx';
import styles from './DoNothing.module.css';

/** What the page says, by seconds of stillness. The last one passed wins. */
const LINES: [number, string][] = [
  [0, 'There is nothing on this page. Do nothing with it.'],
  [3, 'Good start.'],
  [10, 'Ten seconds without a feed.'],
  [20, 'Your thumb is wondering what is going on.'],
  [30, 'Half a minute of nothing. Rare these days.'],
  [45, 'Nobody is posting anything here. Including you.'],
  [60, 'One whole minute. That is the product.'],
  [120, 'Two minutes. You can stop now. Or not.'],
  [300, 'Five minutes. Please teach us.'],
];
const BADGE_AT = 60;
const DARK_AT = 90; // seconds for the room to go fully dark
const BEST_KEY = 'nothing.404.idleBest.v1';

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

/**
 * The 404 that praises you for not using it. It counts how long you go
 * without touching anything — a mouse move, a key, a scroll starts it
 * again — and the room slowly gets darker the longer you leave it. A
 * minute earns a sticker.
 *
 * It is the brand in one page: an online tool for being offline.
 */
export function DoNothing() {
  const [idle, setIdle] = useState(0);
  const [best, setBest] = useState(readBest);
  const [moved, setMoved] = useState(false);
  const start = useRef(0);
  const idleRef = useRef(0);

  useEffect(() => {
    start.current = performance.now();
    const t = window.setInterval(() => {
      const s = (performance.now() - start.current) / 1000;
      idleRef.current = s;
      setIdle(s);
    }, 250);

    const poke = () => {
      // A twitch in the first second is not worth a lecture.
      if (idleRef.current > 3) {
        setMoved(true);
        const run = idleRef.current;
        setBest((b) => {
          const next = Math.max(b, run);
          try {
            localStorage.setItem(BEST_KEY, String(Math.floor(next)));
          } catch {
            /* best just won't be remembered */
          }
          return next;
        });
      }
      start.current = performance.now();
      idleRef.current = 0;
      setIdle(0);
    };
    const events = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'] as const;
    events.forEach((e) => window.addEventListener(e, poke, { passive: true }));
    return () => {
      window.clearInterval(t);
      events.forEach((e) => window.removeEventListener(e, poke));
    };
  }, []);

  // The "you moved" note shows until you have been still again for a moment.
  const line = moved && idle <= 2.5 ? 'You moved. Starting again.' : [...LINES].reverse().find(([s]) => idle >= s)![1];
  const calm = Math.min(1, idle / DARK_AT);
  const badge = idle >= BADGE_AT || best >= BADGE_AT;

  return (
    <main className={cx(styles.room, calm >= 0.5 && styles.dark)} style={{ '--calm': calm } as CSSProperties}>
      <header className={styles.top}>
        <span className={styles.code}>Error 404</span>
        <a className={styles.home} href="/">
          Back to the desktop
        </a>
      </header>

      <div className={styles.centre}>
        <span className={styles.clock} aria-label={`${Math.floor(idle)} seconds of nothing`}>
          {fmt(idle)}
        </span>
        <p className={styles.line} aria-live="polite">
          {line}
        </p>
        {badge && <Sticker text="Did nothing, on purpose" color="lime" rotate={-5} className={styles.badge} />}
      </div>

      <footer className={styles.bottom}>
        {best > 0 ? <span>Your best: {fmt(best)}</span> : <span>Moving anything starts the count again.</span>}
      </footer>
    </main>
  );
}
