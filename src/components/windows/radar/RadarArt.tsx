import type { CSSProperties } from 'react';
import { cx } from '@/lib/cx';
import type { RadarItem } from '@/data/radar';
import styles from './RadarArt.module.css';

const LIME = '#a8ff1a';
const PINK = '#ff1a91';
const INK = '#0d0d0f';
const PAPER = '#f2f2ee';

/** Stable per item, so a card keeps its picture between renders and views. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

type Pattern = (a: string, b: string) => string;

/*
  The same family as the page builder's backgrounds (rays, checker,
  stripes) so a placeholder reads as part of this desktop rather than as a
  grey box waiting for a photo.
*/
const PATTERNS: Pattern[] = [
  (a, b) => `repeating-conic-gradient(from 8deg at 30% 110%, ${a} 0 9deg, ${b} 9deg 18deg)`,
  (a, b) => `repeating-conic-gradient(${a} 0 25%, ${b} 0 50%) 0 0 / 22px 22px`,
  (a, b) => `repeating-linear-gradient(-35deg, ${a} 0 10px, ${b} 10px 20px)`,
  (a, b) => `radial-gradient(circle, ${a} 34%, transparent 36%) 0 0 / 16px 16px, ${b}`,
  (a, b) => `linear-gradient(${a} 2px, transparent 2px) 0 0 / 18px 18px, linear-gradient(90deg, ${a} 2px, ${b} 2px) 0 0 / 18px 18px`,
  (a, b) => `radial-gradient(circle at 70% 35%, ${a} 0 28%, ${b} 29%)`,
];

interface RadarArtProps {
  item: RadarItem;
  className?: string;
  /** Hides the type word — for thumbnails too small to carry it. */
  bare?: boolean;
}

/**
 * Stand-in artwork for a card until real images exist: one of six
 * patterns, in the brand's two colours against ink or paper, chosen from
 * the item's id. Events lean lime and calls lean pink, so the two halves
 * of Radar are told apart before a word is read.
 */
export function RadarArt({ item, className, bare }: RadarArtProps) {
  const h = hash(item.id);
  const accent = item.group === 'event' ? LIME : PINK;
  const ground = h % 3 === 0 ? PAPER : INK;
  const style: CSSProperties = { background: PATTERNS[h % PATTERNS.length](accent, ground) };

  return (
    <div className={cx(styles.art, className)} style={style} aria-hidden="true">
      {!bare && (
        <span className={cx(styles.word, ground === INK ? styles.onInk : styles.onPaper)} style={{ '--len': item.type.length } as CSSProperties}>
          {item.type}
        </span>
      )}
    </div>
  );
}
