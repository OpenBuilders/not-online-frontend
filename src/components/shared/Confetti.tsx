import { useMemo } from 'react';
import styles from './Confetti.module.css';

const BRAND = ['#a8ff1a', '#000000', '#ffffff', '#ff1a91'];
const PIECE_COUNT = 90;

interface Piece {
  left: number;
  background: string;
  duration: number;
  delay: number;
  rotate: number;
}

/**
 * A one-shot confetti burst. Ported from `confetti()` (Tools.html:2924-2936)
 * — mount it, it falls for ~3.8s, the caller unmounts it (or renders it
 * conditionally for that long) once done. No animation library: same
 * randomized-divs-plus-CSS-keyframe approach as the original.
 */
export function Confetti() {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: PIECE_COUNT }, () => ({
        left: Math.random() * 100,
        background: BRAND[Math.floor(Math.random() * BRAND.length)],
        duration: 1.6 + Math.random() * 1.6,
        delay: Math.random() * 0.4,
        rotate: Math.random() * 360,
      })),
    []
  );

  return (
    <div className={styles.confetti} aria-hidden="true">
      {pieces.map((p, i) => (
        <i
          key={i}
          style={{
            left: `${p.left}%`,
            background: p.background,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
