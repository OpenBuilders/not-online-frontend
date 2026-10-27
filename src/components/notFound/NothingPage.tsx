import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { cx } from '@/lib/cx';
import styles from './NothingPage.module.css';

const LINES = ['Nothing', 'on this page'];

/** A fixed tumble per letter, so the fall looks thrown rather than uniform. */
const tumble = (i: number) => ({
  '--rot': `${((i * 47) % 70) - 35}deg`,
  '--dx': `${((i * 29) % 30) - 15}vw`,
  '--delay': `${(i * 37) % 160}ms`,
});

/**
 * The quiet one: a blank page that says so, very large. "Nothing" fills
 * the width, "on this page" fills it again underneath, and the 404 is a
 * footnote. The one button turns the empty page into the start of a real
 * one — the links-page builder.
 *
 * Each line is sized to the width by measurement, not by vw guesses: the
 * same words have to fill a phone and a monitor edge to edge.
 */
export function NothingPage() {
  const boxRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [falling, setFalling] = useState(false);

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const fit = () => {
      const w = box.clientWidth;
      const h = box.clientHeight;
      const sizes = lineRefs.current.map((el) => {
        if (!el) return 0;
        el.style.fontSize = '100px';
        return (100 * w) / el.offsetWidth;
      });
      // Never taller than the space it has: shrink both lines together.
      const total = sizes.reduce((s, x) => s + x * 0.86, 0);
      const k = Math.min(1, h / total);
      lineRefs.current.forEach((el, i) => el && (el.style.fontSize = `${sizes[i] * k}px`));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    void document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, []);

  const turn = () => {
    const go = () => window.location.assign('/?build');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return go();
    setFalling(true);
    window.setTimeout(go, 1100);
  };

  let n = 0;
  return (
    <main className={cx(styles.page, falling && styles.falling)}>
      <header className={styles.top}>
        <span className={styles.code}>Error 404</span>
        <a className={styles.home} href="/">
          Back to the desktop
        </a>
      </header>

      <div className={styles.words} ref={boxRef}>
        <h1 className={styles.h1}>
          {LINES.map((line, li) => (
            <span key={line} className={cx(styles.line, li === 0 && styles.lead)}>
              <span className={styles.fit} ref={(el) => void (lineRefs.current[li] = el)}>
                {[...line].map((ch, ci) => (
                  <span key={ci} className={styles.letter} style={tumble(n++) as CSSProperties}>
                    {ch === ' ' ? ' ' : ch}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </h1>
      </div>

      <footer className={styles.bottom}>
        <p className={styles.note}>The link you followed leads nowhere. It could lead to you instead.</p>
        <button type="button" className={styles.turn} onClick={turn} disabled={falling}>
          Turn into something
          <MaterialIcon name="arrow_forward" size={20} />
        </button>
      </footer>
    </main>
  );
}
