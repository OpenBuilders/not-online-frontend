import { useCallback, useEffect, useRef, useState } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import styles from './useFlyToCart.module.css';

interface FlyState {
  id: number;
  img: string | null;
  icon: string;
  from: DOMRect;
  to: DOMRect;
  landed: boolean;
}

/**
 * FLIP-style "item flies into the cart" animation. `start()` takes the
 * clicked card's element and the header cart button's element, clones the
 * thumbnail into a fixed-position overlay, and animates it from the card's
 * rect to the cart button's rect. `flyingNode` is the JSX to render
 * alongside the grid (a portal isn't needed — both rects are viewport
 * coordinates via getBoundingClientRect, and the overlay is `position:
 * fixed`, so it isn't affected by being nested inside the window's own
 * scroll container).
 */
export function useFlyToCart() {
  const [fly, setFly] = useState<FlyState | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!fly || fly.landed) return;
    const raf = requestAnimationFrame(() => {
      setFly((cur) => (cur ? { ...cur, landed: true } : cur));
    });
    return () => cancelAnimationFrame(raf);
  }, [fly]);

  const start = useCallback((sourceEl: HTMLElement, targetEl: HTMLElement, img: string | null, icon: string, onLand: () => void) => {
    const from = sourceEl.getBoundingClientRect();
    const to = targetEl.getBoundingClientRect();
    const id = Date.now();
    setFly({ id, img, icon, from, to, landed: false });
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setFly((cur) => (cur?.id === id ? null : cur));
      onLand();
    }, 550);
  }, []);

  const flyingNode = fly ? (
    <div
      className={styles.thumb}
      style={{
        left: fly.landed ? fly.to.left + fly.to.width / 2 - 10 : fly.from.left,
        top: fly.landed ? fly.to.top + fly.to.height / 2 - 10 : fly.from.top,
        width: fly.landed ? 20 : fly.from.width,
        height: fly.landed ? 20 : fly.from.height,
        opacity: fly.landed ? 0.2 : 1,
      }}
    >
      {fly.img ? <img src={fly.img} alt="" /> : <MaterialIcon name={fly.icon} size={22} />}
    </div>
  ) : null;

  return { start, flyingNode };
}
