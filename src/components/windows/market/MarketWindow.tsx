import { useRef, useState } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { cx } from '@/lib/cx';
import { useAppState } from '@/state/AppStateContext';
import { BrowseTab } from './BrowseTab';
import styles from './MarketWindow.module.css';
import { SellForm } from './SellForm';
import { StatsLocked } from './StatsLocked';

type Tab = 'sell' | 'browse' | 'stats';

/**
 * Tab shell for Market. Ported in spirit from openMarket() (Tools.html:3186-
 * 3348) — browse/apply/stats. There's no in-app buy flow (every Browse item
 * either redirects out to the live site or is the "+ Publish" tile), so
 * there's no Cart tab either — real listings go through the moderation
 * queue (src/api/marketSubmissions.ts) and surface in the desktop's
 * MySubmissions panel, not here. A guest who hasn't finished the market
 * onboarding yet always lands on Sell first; everyone else lands on
 * Browse.
 *
 * Tabs live in a left rail (`.set-rail`'s original Finder-style treatment,
 * Tools.html:1174) rather than a top bar.
 */
export function MarketWindow() {
  const { state } = useAppState();
  const isFirstRun = !state.logged && !state.tours.has('market');
  const [tab, setTab] = useState<Tab>(isFirstRun ? 'sell' : 'browse');
  // Passed down to SellForm so its FocusTour can darken the whole window
  // (rail included) instead of just its own tab content — see FocusTour.tsx.
  const windowRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.window} ref={windowRef}>
      <div className={styles.rail}>
        <button type="button" className={cx(styles.railItem, tab === 'sell' && styles.on)} onClick={() => setTab('sell')}>
          <MaterialIcon name="add_box" size={17} />
          Sell
        </button>
        <button type="button" className={cx(styles.railItem, tab === 'browse' && styles.on)} onClick={() => setTab('browse')}>
          <MaterialIcon name="storefront" size={17} />
          Browse
        </button>
        <button type="button" className={cx(styles.railItem, tab === 'stats' && styles.on)} onClick={() => setTab('stats')}>
          <MaterialIcon name="bar_chart" size={17} />
          Stats
        </button>
      </div>
      <div className={styles.body}>
        {tab === 'sell' && <SellForm onSubmitted={() => setTab('browse')} windowRef={windowRef} />}
        {tab === 'browse' && <BrowseTab onPublish={() => setTab('sell')} />}
        {tab === 'stats' && <StatsLocked />}
      </div>
    </div>
  );
}
