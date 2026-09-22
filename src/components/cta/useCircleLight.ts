import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ARTIST_URL, PATRON_URL } from '@/data/links';
import { loadAlphaMaps, sampleSide, type AlphaMaps, type Side } from './circleProbe';

/** How long the beam lingers after a tap before fading out on its own. */
const TOUCH_LINGER_MS = 1700;

/**
 * The shared behaviour behind the circle CTA: a light that follows the
 * pointer, reads which kind of figure it's over, and acts when clicked.
 *
 * On a pointer device the beam tracks the cursor. On touch there's nothing
 * to track, so a tap places the beam where the finger landed, reads what's
 * there, then fades the light back out — the choice it revealed stays on
 * screen, because that's the part you need to act on.
 *
 * `onClose` is optional: the CTA also renders inline inside a window (the
 * Market Stats tab), where there is no popup for picking a side to dismiss.
 */
export function useCircleLight(onClose?: () => void) {
  const stageRef = useRef<HTMLDivElement>(null);
  const mapsRef = useRef<AlphaMaps | null>(null);
  const fadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [over, setOver] = useState<Side | null>(null);
  const [lit, setLit] = useState(false);
  const [point, setPoint] = useState({ x: 0, y: 0 });
  // Past the halfway mark a tooltip drawn to the right of the cursor runs
  // off the card, which clips it — so it swaps to the other side.
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    let alive = true;
    loadAlphaMaps()
      .then((maps) => {
        if (alive) mapsRef.current = maps;
      })
      .catch(() => {
        // Sampling is an enhancement; without it the light still moves,
        // there just isn't a choice attached to it.
      });
    return () => {
      alive = false;
      if (fadeRef.current) clearTimeout(fadeRef.current);
    };
  }, []);

  const place = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', `${nx * 100}%`);
    el.style.setProperty('--my', `${ny * 100}%`);
    setPoint({ x: e.clientX - r.left, y: e.clientY - r.top });
    setFlip(nx > 0.52);
    return mapsRef.current ? sampleSide(mapsRef.current, nx, ny) : null;
  }, []);

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== 'mouse') return;
      const side = place(e);
      setLit(true);
      setOver(side);
    },
    [place]
  );

  const onPointerLeave = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    setLit(false);
    setOver(null);
  }, []);

  // Both roles lead off the desktop to the main site. The artist side used
  // to open an in-app window whose content was still a placeholder, so half
  // of this CTA's whole purpose dead-ended on an empty panel.
  const act = useCallback(
    (side: Side) => {
      window.open(side === 'patron' ? PATRON_URL : ARTIST_URL, '_blank', 'noopener');
    },
    []
  );

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'mouse') {
        // The figure itself is the target, so there's nothing to travel to
        // — moving off it to reach a button is what made this unusable.
        if (over) act(over);
        return;
      }
      const side = place(e);
      setLit(true);
      setOver(side);
      if (fadeRef.current) clearTimeout(fadeRef.current);
      fadeRef.current = setTimeout(() => setLit(false), TOUCH_LINGER_MS);
    },
    [act, over, place]
  );

  return { stageRef, over, lit, point, flip, act, onPointerMove, onPointerLeave, onPointerDown };
}
