import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { useAppState } from '@/state/AppStateContext';
import { useWindowManager } from '@/state/WindowManagerContext';
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

  // The "your page" (Website Builder) and "open calls" (Radar) segments
  // pointed at windows that are parked with their widgets — trimmed to the
  // one stat that's actually live right now.
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
          <span className={styles.v}>{state.myItems.length}</span>
          <span className={styles.k}>items listed</span>
        </span>
      </button>
    </div>
  );
}
