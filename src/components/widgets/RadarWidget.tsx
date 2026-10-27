import { useEffect, useRef, useState, type RefObject } from 'react';
import { StickerFrame } from '@/components/widgets/StickerWidget';
import { WidgetShell } from '@/components/widgets/WidgetShell';
import { cx } from '@/lib/cx';
import { useWindowManager } from '@/state/WindowManagerContext';
import styles from './RadarWidget.module.css';

interface Topic {
  label: string;
  angle: number;
  radius: number;
  /** Which of the two brand colours this blip burns. */
  tone: 'lime' | 'pink';
}

// Ported from Tools.html:2292-2297. The icons each one used to carry are
// gone: at this card size they were 13px glyphs that read as smudges, and
// four different pictures on one dial is four things to decode. A dot in
// one of two colours is all a blip has ever needed to say.
const TOPICS: Topic[] = [
  { label: 'Open Calls', angle: -58, radius: 0.78, tone: 'lime' },
  { label: 'Grants', angle: 46, radius: 0.62, tone: 'pink' },
  { label: 'Residency', angle: 150, radius: 0.7, tone: 'lime' },
  { label: 'Research', angle: -140, radius: 0.55, tone: 'pink' },
];

const SWEEP_MS = 3400;
const angleDiff = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

interface RadarWidgetProps {
  desktopRef: RefObject<HTMLElement | null>;
}

/**
 * Ported from Tools.html:1637-1662 (markup) + 2292-2341 (sweep tick, blip
 * pings, count-up). The sweep loop toggles each blip's "on" class by
 * mutating its DOM node directly via ref inside a requestAnimationFrame
 * loop, the same as the original — driving that through React state would
 * mean a re-render on every frame for something purely visual.
 *
 * It is a sticker like every other widget now: the same 176px card from
 * WidgetShell, and the whole face opens the window. The "View all" button
 * it used to carry spent a fifth of the card restating what clicking the
 * card already did, and the clock above it was a second thing ticking on
 * a card whose whole point is that something is already moving.
 *
 * The dial fills the card and the count sits on top of it. At a third of
 * the height it was an illustration of a radar next to a number; at full
 * bleed it is the background the number is read against.
 */
export function RadarWidget({ desktopRef }: RadarWidgetProps) {
  const blipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { openWindow } = useWindowManager();

  const [count, setCount] = useState(0);
  const [countDone, setCountDone] = useState(false);

  useEffect(() => {
    const target = Math.floor(Math.random() * 400) + 80;
    const step = Math.max(1, Math.round(target / 40));
    const id = setInterval(() => {
      setCount((cur) => {
        const next = Math.min(target, cur + step);
        if (next >= target) {
          clearInterval(id);
          setCountDone(true);
        }
        return next;
      });
    }, 28);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const pingTimers = new Map<number, ReturnType<typeof setTimeout>>();
    let frame: number;
    const start = performance.now();

    const tick = (now: number) => {
      const sweepAngle = (((now - start) % SWEEP_MS) / SWEEP_MS) * 360;
      TOPICS.forEach((topic, i) => {
        const el = blipRefs.current[i];
        if (!el) return;
        const near = angleDiff(sweepAngle, (topic.angle + 360) % 360) < 16;
        const was = el.classList.contains(styles.on);
        if (near && !was) {
          el.classList.add(styles.on);
          const existing = pingTimers.get(i);
          if (existing) clearTimeout(existing);
          pingTimers.set(
            i,
            setTimeout(() => el.classList.remove(styles.on), 1600),
          );
        }
      });
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      pingTimers.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <WidgetShell id="widgetRadar" desktopRef={desktopRef} x={620} y={100} dragAnywhere>
      {(hasMoved) => (
        <StickerFrame
          color="dark"
          rotate={-2}
          badge="Radar"
          badgeColor="lime"
          onActivate={() => {
            if (hasMoved.current) {
              hasMoved.current = false;
              return;
            }
            openWindow({ kind: 'radar', title: 'nothing radar', width: 1060, height: 680, singleton: true });
          }}
        >
          <div className={styles.face}>
            <div className={styles.radarContainer}>
              <div className={styles.radar}>
                <div className={cx(styles.cross, styles.crossV)} />
                <div className={cx(styles.cross, styles.crossH)} />
                <div className={cx(styles.cross, styles.crossD1)} />
                <div className={cx(styles.cross, styles.crossD2)} />
                <div className={cx(styles.ring, styles.ring1)} />
                <div className={cx(styles.ring, styles.ring2)} />
                <div className={styles.sweep} />
                <div className={styles.sweepLine} />
                <div className={styles.centerDot} />
                {TOPICS.map((topic, i) => {
                  const rad = (topic.angle * Math.PI) / 180;
                  const x = 50 + Math.cos(rad) * topic.radius * 50;
                  const y = 50 + Math.sin(rad) * topic.radius * 50;
                  return (
                    <div
                      key={topic.label}
                      ref={(el) => {
                        blipRefs.current[i] = el;
                      }}
                      className={cx(styles.blip, styles[topic.tone])}
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      <span className={styles.ping} />
                      <span className={styles.dot} />
                      <span className={styles.lbl}>{topic.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.bottom}>
              <div className={styles.count}>
                {count.toLocaleString()}
                {countDone && <span className={styles.plus}>+</span>}
              </div>
              <div className={styles.countLabel}>opportunities found</div>
            </div>
          </div>
        </StickerFrame>
      )}
    </WidgetShell>
  );
}
