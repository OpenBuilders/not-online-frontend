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
 * Browse shows only public catalogue items. New SellWizard submissions are
 * moderation requests and are deliberately not inserted into this list.
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
