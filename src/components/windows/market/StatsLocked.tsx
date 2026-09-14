import { AeroButton } from '@/components/shared/AeroButton';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { Sticker } from '@/components/shared/Sticker';
import { useWindowManager } from '@/state/WindowManagerContext';
import styles from './StatsLocked.module.css';

const FAKE_STATS = [
  { v: '—', k: 'items listed' },
  { v: '—', k: 'live' },
  { v: '—', k: 'views' },
  { v: '—', k: 'stock value' },
];

/** Stats always renders this — not a real feature yet, just the upsell entry point. */
export function StatsLocked() {
  const { openWindow } = useWindowManager();

  return (
    <div className={styles.wrap}>
      <div className={styles.teaser}>
        <div className={styles.grid}>
          {FAKE_STATS.map((s) => (
            <div key={s.k} className={styles.stat}>
              <div className={styles.v}>{s.v}</div>
              <div className={styles.k}>{s.k}</div>
            </div>
          ))}
        </div>
        <div className={styles.lockOverlay}>
          <Sticker text="Become a partner to unlock" color="pink" rotate={-4} className={styles.sticker} />
          <MaterialIcon name="lock" size={30} />
          <p>Real-time stats are a partner perk.</p>
          <AeroButton
            variant="pink"
            size="sm"
            onClick={() => openWindow({ kind: 'patron', title: 'become a patron of nothing', width: 580, singleton: true })}
          >
            Become a partner
          </AeroButton>
        </div>
      </div>
    </div>
  );
}
