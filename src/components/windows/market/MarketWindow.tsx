import { useRef, useState } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { cx } from '@/lib/cx';
import { useAppState } from '@/state/AppStateContext';
import { BrowseTab } from './BrowseTab';
import { CartTab } from './CartTab';
import styles from './MarketWindow.module.css';
import { SellWizard } from './SellWizard';
import { StatsLocked } from './StatsLocked';

type Tab = 'sell' | 'browse' | 'stats' | 'cart';

/**
 * Tab shell for Market. Ported in spirit from openMarket() (Tools.html:3186-
 * 3348) — browse/apply/stats — plus a real Cart panel and a first-run Sell
 * step the original didn't have. A guest who hasn't finished the market
 * onboarding yet always lands on Sell first; everyone else lands on Browse.
 * Cart is a persistent header button (with a count badge) rather than one
 * of the equal tabs, since it's a destination you jump to from anywhere.
 */
export function MarketWindow() {
  const { state } = useAppState();
  const isFirstRun = !state.logged && !state.tours.has('market');
  const [tab, setTab] = useState<Tab>(isFirstRun ? 'sell' : 'browse');
  const cartButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={styles.window}>
      <div className={styles.tabs}>
        <button type="button" className={cx(styles.tab, tab === 'sell' && styles.on)} onClick={() => setTab('sell')}>
          <MaterialIcon name="add_box" size={16} />
          Sell
        </button>
        <button type="button" className={cx(styles.tab, tab === 'browse' && styles.on)} onClick={() => setTab('browse')}>
          <MaterialIcon name="storefront" size={16} />
          Browse
        </button>
        <button type="button" className={cx(styles.tab, tab === 'stats' && styles.on)} onClick={() => setTab('stats')}>
          <MaterialIcon name="bar_chart" size={16} />
          Stats
        </button>
        <div className={styles.spacer} />
        <button
          ref={cartButtonRef}
          type="button"
          className={cx(styles.cartButton, tab === 'cart' && styles.on)}
          onClick={() => setTab('cart')}
          aria-label="Cart"
        >
          <MaterialIcon name="shopping_cart" size={18} />
          {state.cart.length > 0 && <span className={styles.badge}>{state.cart.length}</span>}
        </button>
      </div>
      <div className={styles.body}>
        {tab === 'sell' && <SellWizard onSubmitted={() => setTab('browse')} />}
        {tab === 'browse' && <BrowseTab cartButtonRef={cartButtonRef} />}
        {tab === 'stats' && <StatsLocked />}
        {tab === 'cart' && <CartTab onBack={() => setTab('browse')} />}
      </div>
    </div>
  );
}
