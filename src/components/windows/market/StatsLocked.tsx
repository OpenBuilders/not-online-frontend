import { AeroButton } from '@/components/shared/AeroButton';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { Sticker } from '@/components/shared/Sticker';
import { PATRON_URL } from '@/data/links';
import { cx } from '@/lib/cx';
import { useAppState } from '@/state/AppStateContext';
import { useMyMarketSubmissions } from '@/state/useMarketSubmissions';
import styles from './StatsLocked.module.css';

const FAKE_STATS = [
  { v: '—', k: 'items listed' },
  { v: '—', k: 'approved' },
  { v: '—', k: 'in queue' },
  { v: '—', k: 'stock value' },
];

const STATUS_LABEL: Record<string, string> = {
  PENDING_REVIEW: 'in queue',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

/**
 * Stats is locked behind "become a partner" for a guest — but a logged-in
 * user already is a partner, so they see the real numbers instead, driven
 * by the same `useMyMarketSubmissions()` the MySubmissions desktop panel
 * uses, not a client-only mock.
 */
export function StatsLocked() {
  const { state } = useAppState();
  const isPartner = state.logged;
  const submissions = useMyMarketSubmissions();

  if (isPartner) {
    const items = submissions.data ?? [];
    const approved = items.filter((i) => i.status === 'APPROVED').length;
    const pending = items.filter((i) => i.status === 'PENDING_REVIEW').length;
    const stockValue = items.reduce((sum, i) => sum + (Number(i.price) || 0), 0);
    const stats = [
      { v: items.length, k: 'items listed' },
      { v: approved, k: 'approved' },
      { v: pending, k: 'in queue' },
      { v: `$${stockValue}`, k: 'stock value' },
    ];

    return (
      <div className={styles.wrap}>
        <div className={styles.grid}>
          {stats.map((s) => (
            <div key={s.k} className={styles.stat}>
              <div className={styles.v}>{s.v}</div>
              <div className={styles.k}>{s.k}</div>
            </div>
          ))}
        </div>
        <div className={styles.moreSoon}>More stats soon</div>
        <div className={styles.railHead}>Your queue</div>
        {submissions.isPending ? (
          <div className={styles.empty}>Loading…</div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>Nothing listed yet — head to Sell.</div>
        ) : (
          <div className={styles.rows}>
            {items.map((item) => (
              <div key={item.id} className={styles.row}>
                <div className={styles.rowMain}>
                  <div className={styles.rowName}>{item.title}</div>
                  <div className={styles.rowSub}>
                    ${item.price}
                  </div>
                </div>
                <span className={cx(styles.rowBadge, item.status === 'APPROVED' && styles.rowBadgeLive)}>
                  {STATUS_LABEL[item.status] ?? item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.teaser}>
        <div className={cx(styles.grid, styles.blurred)}>
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
          <AeroButton variant="pink" size="sm" onClick={() => window.open(PATRON_URL, '_blank', 'noopener')}>
            Become a partner
          </AeroButton>
        </div>
      </div>
    </div>
  );
}
