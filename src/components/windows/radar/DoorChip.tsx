import type { Door } from '@/data/artIndex';
import styles from './DoorChip.module.css';
import { DOORS } from './indexMeta';

/** The Index's door scale at chip size, for a call's card: how you get in, before you open it. */
export function DoorChip({ door }: { door: Door }) {
  return (
    <span className={styles.chip} title={DOORS[door].hint}>
      <span className={styles.bars} aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <i key={i} className={i <= door ? styles.lit : undefined} />
        ))}
      </span>
      {DOORS[door].label}
    </span>
  );
}
