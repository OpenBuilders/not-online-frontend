import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { cx } from '@/lib/cx';
import styles from './ErrorCascade.module.css';

const WIN_W = 340;
const WIN_H = 170;
const CAP = 160; // past this the browser starts to feel it, and the joke has landed
const FINALE_AT = 40;

const LINES = [
  'The page you are looking for has moved, been deleted, or never existed.',
  'Nothing found. Which, to be fair, is our whole thing.',
  'Clicking OK made two more. You probably noticed.',
  'This window is not the page either.',
  'Error 404: page not found. Error 405: patience not found.',
  'Still nothing here.',
  'Have you tried turning the internet off and on again?',
  'Error: too much online.',
  'This error has been reported to nobody.',
  'The page is fine. It is just somewhere else.',
];

interface Win {
  id: number;
  x: number;
  y: number;
  line: string;
}

/**
 * The 404 as a desktop having a bad day: one "File not found" dialog,
 * and OK is a lie — every OK (and every red close dot) opens two more.
 * The only real way out is "Cancel everything", which takes you home.
 *
 * Plain windows in the desktop's own chrome rather than WindowFrame:
 * those belong to the window manager, and this page lives outside it.
 */
export function ErrorCascade() {
  const nextId = useRef(2);
  const [wins, setWins] = useState<Win[]>(() => [
    { id: 1, x: (window.innerWidth - WIN_W) / 2, y: (window.innerHeight - WIN_H) / 2 - 40, line: LINES[0] },
  ]);
  const [spawned, setSpawned] = useState(1);
  const [dismissed, setDismissed] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const drag = useRef<{ id: number; dx: number; dy: number } | null>(null);

  const clamp = (x: number, y: number) => ({
    x: Math.max(8, Math.min(window.innerWidth - WIN_W - 8, x)),
    y: Math.max(8, Math.min(window.innerHeight - WIN_H - 60, y)),
  });

  /** OK: this one goes, two arrive somewhere near it. */
  const ok = (w: Win) => {
    setWins((list) => {
      const rest = list.filter((x) => x.id !== w.id);
      if (rest.length + 2 > CAP) return rest;
      const twins = [0, 1].map((k) => {
        const angle = Math.random() * Math.PI * 2;
        const d = 60 + Math.random() * 140;
        return {
          id: nextId.current++,
          ...clamp(w.x + Math.cos(angle) * d, w.y + Math.sin(angle) * d * 0.7),
          line: LINES[(nextId.current + k) % LINES.length],
        };
      });
      return [...rest, ...twins];
    });
    setSpawned((n) => n + 2);
  };

  /** "Make it worse": every open window doubles at once. */
  const worse = () => {
    setDismissed(true);
    setWins((list) => list.slice(0, CAP / 2).flatMap((w) => [w, { ...w, id: nextId.current++, ...clamp(w.x + 30, w.y + 24) }]));
  };

  const cancelAll = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return window.location.assign('/');
    setLeaving(true);
    window.setTimeout(() => window.location.assign('/'), 700);
  };

  // Dragging by the titlebar, through window listeners so a fast drag
  // never loses the window.
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      setWins((list) => list.map((w) => (w.id === d.id ? { ...w, ...clamp(e.clientX - d.dx, e.clientY - d.dy) } : w)));
    };
    const up = () => (drag.current = null);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, []);

  const grab = (e: ReactPointerEvent, w: Win) => {
    if ((e.target as HTMLElement).closest('button')) return;
    drag.current = { id: w.id, dx: e.clientX - w.x, dy: e.clientY - w.y };
    // Whatever you grab comes to the front.
    setWins((list) => [...list.filter((x) => x.id !== w.id), w]);
  };

  return (
    <main className={cx(styles.desk, leaving && styles.leaving)}>
      <h1 className={styles.srOnly}>404: page not found.</h1>
      <span className={styles.counter} aria-live="polite">
        Errors: {spawned}
      </span>

      {wins.map((w, i) => {
        const top = i === wins.length - 1;
        return (
          <section
            key={w.id}
            className={cx(styles.win, top && styles.top)}
            style={{ left: w.x, top: w.y, zIndex: 10 + i, transitionDelay: leaving ? `${(i % 30) * 12}ms` : undefined }}
            role="alertdialog"
            aria-label="File not found"
          >
            <header className={styles.titlebar} onPointerDown={(e) => grab(e, w)}>
              <span className={styles.dots}>
                <button type="button" className={cx(styles.dot, styles.red)} onClick={() => ok(w)} aria-label="Close" />
                <span className={cx(styles.dot, styles.yellow)} />
                <span className={cx(styles.dot, styles.green)} />
              </span>
              <span className={styles.title}>File not found</span>
            </header>
            <div className={styles.body}>
              <MaterialIcon name="error" size={30} className={styles.icon} />
              <p>{w.line}</p>
            </div>
            <footer className={styles.actions}>
              <button type="button" className={styles.cancel} onClick={cancelAll}>
                Cancel everything
              </button>
              <button type="button" className={styles.ok} onClick={() => ok(w)} autoFocus={top}>
                OK
              </button>
            </footer>
          </section>
        );
      })}

      {spawned >= FINALE_AT && !dismissed && (
        <div className={styles.scrim}>
          <section className={styles.finale} role="alertdialog" aria-label="Too many errors">
            <span className={styles.finaleCount}>{spawned}</span>
            <h2>errors. You win.</h2>
            <p>The page is still not here. But you are very good at clicking OK.</p>
            <div className={styles.finaleActions}>
              <button type="button" className={styles.home} onClick={cancelAll}>
                Take me home
              </button>
              <button type="button" className={styles.worse} onClick={worse}>
                Make it worse
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
