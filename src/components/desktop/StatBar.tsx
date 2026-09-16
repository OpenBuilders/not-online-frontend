import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { useAppState } from '@/state/AppStateContext';
import { useWindowManager } from '@/state/WindowManagerContext';
import { useMyMarketSubmissions } from '@/state/useMarketSubmissions';
import styles from './StatBar.module.css';

/**
 * Ported from Tools.html:1611-1625. Only ever rendered while logged in —
 * TopRow doesn't mount it otherwise, which already covers what
 * `body:not(.logged) .statbar{display:none}` did in the original, so that
 * rule (and the redundant `.member` class on the "open calls" segment) has
 * nothing left to do here.
 */
export function StatBar() {
  const { state } = useAppState();
  const { openWindow } = useWindowManager();
  const submissions = useMyMarketSubmissions();

  // The "open calls" (Radar) segment still points at a window parked with
  // its widget, so it stays out until that comes back.
  const siteLabel = state.site ? `${state.site.handle}.not.online`.slice(0, 16) : '—';

  return (
    <div className={styles.statbar}>
      <button
        type="button"
        className={styles.seg}
        onClick={() => openWindow({ kind: 'market', title: 'Market', width: 760, height: 580, singleton: true })}
      >
        <span className={styles.ic}>
          <MaterialIcon name="storefront" />
        </span>
        <span className={styles.txt}>
          <span className={styles.v}>{submissions.data?.length ?? 0}</span>
          <span className={styles.k}>items listed</span>
        </span>
      </button>
      <button
        type="button"
        className={styles.seg}
        onClick={() =>
          openWindow({ kind: 'websiteBuilder', title: 'Your links page', width: 1040, height: 660, singleton: true })
        }
      >
        <span className={styles.ic}>
          <MaterialIcon name="public" />
        </span>
        <span className={styles.txt}>
          <span className={styles.v}>{siteLabel}</span>
          <span className={styles.k}>your page</span>
        </span>
      </button>
    </div>
  );
}
