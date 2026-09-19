import { CircleStage } from '@/components/cta/CircleStage';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { cx } from '@/lib/cx';
import { useAppState } from '@/state/AppStateContext';
import { useMyMarketSubmissions } from '@/state/useMarketSubmissions';
import styles from './StatsLocked.module.css';

const STATUS_LABEL: Record<string, string> = {
  PENDING_REVIEW: 'in queue',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

/**
 * Stats belongs to patrons, so a guest gets the join CTA here instead —
 * the interactive one, in the window itself rather than behind a lock
 * icon over four blurred dashes. A teaser of numbers that are all em-dashes
 * promises nothing and asks the visitor to imagine the payoff; the ring is
 * the actual thing being offered, so it is what the tab shows.
 *
 * A logged-in user already is a patron, so they see the real numbers,
 * driven by the same `useMyMarketSubmissions()` the MySubmissions desktop
 * panel uses, not a client-only mock.
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
                <div className={styles.rowImage}>
                  <MaterialIcon name="image" size={22} />
                  <img
                    src={item.imageUrl}
                    alt=""
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
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
    <div className={cx(styles.wrap, styles.joinWrap)}>
      <h3 className={styles.joinTitle}>Join the circle</h3>
      <p className={styles.joinSub}>Move the light. Pick your role</p>
      <CircleStage size={250} className={styles.joinStage} />
      <p className={styles.joinFoot}>Stats turn on the moment you&apos;re in.</p>
    </div>
  );
}
