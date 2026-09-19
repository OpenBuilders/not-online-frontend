import { TICKER_USERS } from '@/data/tickerUsers';
import styles from './BottomBar.module.css';

/** Ported from Tools.html:1696-1699 (markup) + buildRunningLine() (~1868-1875). Doubles the list so the marquee loops seamlessly at -50%. */
export function BottomBar() {
  const items = [...TICKER_USERS, ...TICKER_USERS];

  return (
    <div className={styles.bottomBar}>
      <div className={styles.runningLine}>
        {items.map((u, i) => (
          <span key={i} className={styles.item}>
            <span className={styles.num}>{u.num}</span>
            <span className={styles.name}>{u.name}</span>
            <span className={styles.dot} />
          </span>
        ))}
      </div>
    </div>
  );
}
