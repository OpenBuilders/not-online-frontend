import { useState, type RefObject } from 'react';
import { SEED_MARKET_ITEMS } from '@/data/marketItems';
import { useAppState } from '@/state/AppStateContext';
import type { MarketItem } from '@/types';
import { ItemCard } from './ItemCard';
import { ItemDetail } from './ItemDetail';
import styles from './BrowseTab.module.css';
import { useFlyToCart } from './useFlyToCart';

interface BrowseTabProps {
  cartButtonRef: RefObject<HTMLButtonElement | null>;
}

/**
 * Browse grid: the always-present SEED_MARKET_ITEMS plus whatever the guest
 * has listed themselves — first time through that's exactly 3 cards, the
 * "your item plus 2 more" moment. A pink callout nudges toward one seed
 * item until the guest has actually put something in the cart, matching
 * "guide user to buy it" without pointing them at their own fresh listing.
 */
export function BrowseTab({ cartButtonRef }: BrowseTabProps) {
  const { state, addToCart } = useAppState();
  const [selected, setSelected] = useState<MarketItem | null>(null);
  const { start, flyingNode } = useFlyToCart();

  const items = [...SEED_MARKET_ITEMS, ...state.myItems];
  const showGuide = state.cart.length === 0;
  const guideItemId = SEED_MARKET_ITEMS[0]?.id;

  return (
    <>
      {selected ? (
        <ItemDetail
          item={selected}
          onBack={() => setSelected(null)}
          onAddToCart={(sourceEl) => {
            const cartEl = cartButtonRef.current;
            if (!cartEl) return;
            addToCart(selected);
            start(sourceEl, cartEl, selected.img, selected.icon, () => setSelected(null));
          }}
        />
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={() => setSelected(item)}
              callout={showGuide && item.id === guideItemId ? 'Try buying this' : undefined}
            />
          ))}
        </div>
      )}
      {flyingNode}
    </>
  );
}
