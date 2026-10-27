import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { StickerFrame } from '@/components/widgets/StickerWidget';
import { WidgetShell } from '@/components/widgets/WidgetShell';
import { cx } from '@/lib/cx';
import { useWindowManager } from '@/state/WindowManagerContext';
import styles from './RadarBeamWidget.module.css';

/*
  Every number below was taken off the approved mockup, not eyeballed: the
  mockup was measured as a 744px square card and each figure turned into a
  percentage of it, so it holds at the card's real 176px.

  - The dish placement (in the stylesheet) came from fitting the artwork's
    lime silhouette onto the mockup's — 0.89 overlap at 121% wide, shifted
    -54% / -29%.
  - The beams are three straight lines fitted through the mockup's white
    pixels; ORIGIN is where those lines meet.
*/

/** Where the beams leave the dish's horn, in percent of the card. */
const ORIGIN = { x: 47.85, y: 39.53 };

/** Measured from the positive x axis; negative is up the card. */
const RAY_ANGLES = [-50.8, -28.3, -8];

/**
 * Distance of each dot from the horn, in percent of the card. Evenly spaced
 * along every beam, which is why the third one only shows on the middle
 * beam — the outer two have left the card by then, and the middle one is
 * caught by the edge halfway through its dot, exactly as drawn.
 */
const DOT_DISTANCES = [22.7, 41.2, 59.7];

/** Per beam, per dot — the mockup's own colouring. */
const TONES: ('lime' | 'pink')[][] = [
  ['pink', 'pink', 'lime'],
  ['lime', 'pink', 'lime'],
  ['pink', 'lime', 'pink'],
];

const WAVE_MS = 2400;

interface Dot {
  key: string;
  x: number;
  y: number;
  /** 0 at the horn, 1 at the farthest stop — what the wave front is compared to. */
  t: number;
  tone: 'lime' | 'pink';
}

interface RadarBeamWidgetProps {
  desktopRef: RefObject<HTMLElement | null>;
}

/**
 * The second take on the radar card: instead of a dial being swept, a dish
 * throwing beams at the opposite corner, with the finds lighting up along
 * them as a wave travels out.
 *
 * Both radar cards are on the desktop at once so they can be compared; the
 * loser comes out.
 *
 * The wave is one rAF loop writing a class straight onto the dots, the
 * same discipline RadarWidget's sweep uses — a purely visual cycle that
 * would otherwise re-render the card every frame.
 */
export function RadarBeamWidget({ desktopRef }: RadarBeamWidgetProps) {
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const { openWindow } = useWindowManager();
  const [count, setCount] = useState(0);

  const dots = useMemo<Dot[]>(() => {
    const far = DOT_DISTANCES[DOT_DISTANCES.length - 1];
    return RAY_ANGLES.flatMap((angle, ri) => {
      const rad = (angle * Math.PI) / 180;
      return DOT_DISTANCES.map((d, di) => ({
        key: `${ri}-${di}`,
        x: ORIGIN.x + Math.cos(rad) * d,
        y: ORIGIN.y + Math.sin(rad) * d,
        t: d / far,
        tone: TONES[ri][di],
      }));
    });
  }, []);

  useEffect(() => {
    const target = Math.floor(Math.random() * 400) + 80;
    const step = Math.max(1, Math.round(target / 40));
    const id = setInterval(() => {
      setCount((cur) => {
        const next = Math.min(target, cur + step);
        if (next >= target) clearInterval(id);
        return next;
      });
    }, 28);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      // Runs past 1 so the outermost dot has time to fade before the next
      // wave leaves the horn.
      const front = (((now - start) % WAVE_MS) / WAVE_MS) * 1.3;
      dots.forEach((dot, i) => {
        dotRefs.current[i]?.classList.toggle(styles.on, Math.abs(front - dot.t) < 0.16);
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [dots]);

  return (
    <WidgetShell id="widgetRadarBeam" desktopRef={desktopRef} x={620} y={330} dragAnywhere>
      {(hasMoved) => (
        <StickerFrame
          color="dark"
          rotate={2}
          badge="Radar"
          badgeColor="pink"
          onActivate={() => {
            if (hasMoved.current) {
              hasMoved.current = false;
              return;
            }
            openWindow({ kind: 'radar', title: 'nothing radar', width: 1060, height: 680, singleton: true });
          }}
        >
          <div className={styles.face}>
            <img
              className={styles.dish}
              src="/assets/radar/radar_widget_illustration.png"
              alt=""
              aria-hidden="true"
            />

            <div className={styles.beams} aria-hidden="true">
              {RAY_ANGLES.map((angle) => (
                <span
                  key={angle}
                  className={styles.ray}
                  style={{ left: `${ORIGIN.x}%`, top: `${ORIGIN.y}%`, transform: `rotate(${angle}deg)` }}
                />
              ))}
              {dots.map((dot, i) => (
                <span
                  key={dot.key}
                  ref={(el) => {
                    dotRefs.current[i] = el;
                  }}
                  className={cx(styles.dot, styles[dot.tone])}
                  style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
                />
              ))}
            </div>

            <div className={styles.count}>{count.toLocaleString()}</div>
            <div className={styles.countLabel}>
              opportunities
              <br />
              around
            </div>
          </div>
        </StickerFrame>
      )}
    </WidgetShell>
  );
}
