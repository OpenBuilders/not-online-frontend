import { MaterialIcon } from '@/components/shared/MaterialIcon';
import type { MarketSubmissionStatus } from '@/api/marketSubmissions';
import { useAppState } from '@/state/AppStateContext';
import { useMyMarketSubmissions } from '@/state/useMarketSubmissions';
import styles from './MySubmissions.module.css';

const STATUS_LABELS: Record<MarketSubmissionStatus, string> = {
  PENDING_REVIEW: 'Pending review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export function MySubmissions() {
  const { state } = useAppState();
  const submissions = useMyMarketSubmissions();
  const items = submissions.data ?? [];

  return (
    <aside className={styles.panel} aria-label="My market applications">
      <header className={styles.header}>
        <span className={styles.headingIcon}>
          <MaterialIcon name="inventory_2" size={18} />
        </span>
        <div>
          <h2>My applications</h2>
          <p>{state.logged ? 'Synced with your account' : 'Saved in this browser'}</p>
        </div>
        <span className={styles.count}>{items.length}</span>
      </header>

      {submissions.isPending && <div className={styles.message}>Loading…</div>}
      {submissions.isError && <div className={styles.message}>Could not load applications.</div>}
      {submissions.isSuccess && items.length === 0 && (
        <div className={styles.empty}>
          <MaterialIcon name="inbox" size={28} />
          <span>No applications yet</span>
        </div>
      )}

      {items.length > 0 && (
        <div className={styles.list}>
          {items.map((item) => (
            <article className={styles.item} key={item.id}>
              <img
                className={styles.image}
                src={item.imageUrl}
                alt=""
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.style.visibility = 'hidden';
                }}
              />
              <div className={styles.info}>
                <div className={styles.itemTop}>
                  <strong title={item.title}>{item.title}</strong>
                  <span className={styles.status} data-status={item.status}>
                    {STATUS_LABELS[item.status]}
                  </span>
                </div>
                <div className={styles.meta}>
                  <span>${item.price}</span>
                  <span>qty {item.quantity}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </aside>
  );
}
