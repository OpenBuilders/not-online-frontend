import { useEffect, useRef, useState } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import type { MarketSubmission, MarketSubmissionStatus } from '@/api/marketSubmissions';
import { useAppState } from '@/state/AppStateContext';
import { useGuestGating } from '@/state/useGuestGating';
import { useMyMarketSubmissions } from '@/state/useMarketSubmissions';
import { useWindowManager } from '@/state/WindowManagerContext';
import styles from './MySubmissions.module.css';

const STATUS_LABELS: Record<MarketSubmissionStatus, string> = {
  PENDING_REVIEW: 'In queue',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

/** "Page live · 1 in queue" — a glance at the compact trigger without opening it. */
function summarize(items: MarketSubmission[], pageLive: boolean): string {
  const counts: Record<MarketSubmissionStatus, number> = { PENDING_REVIEW: 0, APPROVED: 0, REJECTED: 0 };
  for (const item of items) counts[item.status]++;
  const parts: string[] = [];
  if (pageLive) parts.push('Page live');
  if (counts.PENDING_REVIEW) parts.push(`${counts.PENDING_REVIEW} in queue`);
  if (counts.APPROVED) parts.push(`${counts.APPROVED} approved`);
  if (counts.REJECTED) parts.push(`${counts.REJECTED} rejected`);
  return parts.length ? parts.join(' · ') : 'Nothing here yet';
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
  const { guestUnlocked } = useGuestGating();
  const { openWindow } = useWindowManager();
  const submissions = useMyMarketSubmissions();
  const items = submissions.data ?? [];
  const [open, setOpen] = useState(false);
  const site = state.site;
  const builderUnlocked = guestUnlocked('page');
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
          <span className={styles.triggerText}>{summarize(items, site !== null)}</span>
          <MaterialIcon name={open ? 'expand_less' : 'expand_more'} size={16} />
        </button>
      </div>

      {open && (
        <div className={styles.dropdownAnchor}>
          <div ref={dropdownRef} className={styles.dropdown} aria-label="Your page and market applications">
            <header className={styles.header}>
              <div>
                <h2>Your desk</h2>
                <p>{state.logged ? 'Synced with your account' : 'Saved in this browser'}</p>
              </div>
            </header>

            <section className={styles.pageCard}>
              <div className={styles.pageTop}>
                <span className={styles.pageIcon}>
                  <MaterialIcon name="public" size={15} />
                </span>
                <strong className={styles.pageUrl}>
                  {site ? `${site.handle}.not.online` : 'Your links page'}
                </strong>
                <span className={styles.status} data-status={site ? 'APPROVED' : 'DRAFT'}>
                  {site ? 'Live' : 'Not built'}
                </span>
              </div>

              {site ? (
                <div className={styles.pageStats}>
                  <span>
                    <b>{site.views}</b> views
                  </span>
                  <span>
                    <b>{site.clicks}</b> clicks
                  </span>
                  <span>
                    <b>{site.links.filter((l) => l.title.trim()).length}</b> links
                  </span>
                </div>
              ) : (
                <p className={styles.pageHint}>
                  {builderUnlocked
                    ? 'One page for every link you have. Takes about a minute.'
                    : 'Unlocks once you have listed something and picked a background.'}
                </p>
              )}

              {builderUnlocked && (
                <button
                  type="button"
                  className={styles.pageAction}
                  onClick={() => {
                    setOpen(false);
                    openWindow({
                      kind: 'websiteBuilder',
                      title: 'Your links page',
                      width: 1040,
                      height: 660,
                      singleton: true,
                    });
                  }}
                >
                  {site ? 'Edit your page' : 'Build your page'}
                  <MaterialIcon name="arrow_forward" size={14} />
                </button>
              )}
            </section>

            <div className={styles.sectionHead}>
              <span>Market applications</span>
              <span className={styles.count}>{items.length}</span>
            </div>

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
