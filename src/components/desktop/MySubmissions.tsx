import { useEffect, useRef, useState } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import type { MarketSubmission, MarketSubmissionStatus } from '@/api/marketSubmissions';
import { useAppState } from '@/state/AppStateContext';
import { useMyMarketSubmissions } from '@/state/useMarketSubmissions';
import styles from './MySubmissions.module.css';

const STATUS_LABELS: Record<MarketSubmissionStatus, string> = {
  PENDING_REVIEW: 'In queue',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

/** "1 in queue", "2 in queue · 1 approved" — a glance at the compact trigger without opening it. */
function summarize(items: MarketSubmission[]): string {
  if (items.length === 0) return 'No applications yet';
  const counts: Record<MarketSubmissionStatus, number> = { PENDING_REVIEW: 0, APPROVED: 0, REJECTED: 0 };
  for (const item of items) counts[item.status]++;
  const parts: string[] = [];
  if (counts.PENDING_REVIEW) parts.push(`${counts.PENDING_REVIEW} in queue`);
  if (counts.APPROVED) parts.push(`${counts.APPROVED} approved`);
  if (counts.REJECTED) parts.push(`${counts.REJECTED} rejected`);
  return parts.join(' · ');
}

/**
 * A compact trigger — "1 in queue", say — that expands into a dropdown with
 * the full list on click. Same component, same `useMyMarketSubmissions()`
 * data source, for both a guest (localStorage) and a logged-in seller
 * (`/market/submissions/mine`); only the "saved where" subtitle inside the
 * dropdown differs.
 *
 * The trigger and its dropdown live in two independently-positioned
 * containers, not one nested column, on purpose: on mobile the trigger has
 * to squeeze onto the same row as AuthPill's compact circle (so it needs a
 * narrow, left-aligned box that stops short of that circle), while the
 * dropdown still wants to be a wide, centered panel below the whole top
 * row regardless of where that narrow trigger box sits.
 */
export function MySubmissions() {
  const { state } = useAppState();
  const submissions = useMyMarketSubmissions();
  const items = submissions.data ?? [];
  const [open, setOpen] = useState(false);
  const triggerWrapRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (triggerWrapRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <>
      <div ref={triggerWrapRef} className={styles.triggerWrap}>
        <button type="button" className={styles.trigger} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span className={styles.headingIcon}>
            <MaterialIcon name="inventory_2" size={15} />
          </span>
          <span className={styles.triggerText}>{summarize(items)}</span>
          <MaterialIcon name={open ? 'expand_less' : 'expand_more'} size={16} />
        </button>
      </div>

      {open && (
        <div className={styles.dropdownAnchor}>
          <div ref={dropdownRef} className={styles.dropdown} aria-label="My market applications">
            <header className={styles.header}>
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
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
