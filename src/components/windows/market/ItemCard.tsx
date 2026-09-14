import { forwardRef } from 'react';
import { Sticker } from '@/components/shared/Sticker';
import type { MarketItem } from '@/types';
import { ItemMedia } from './ItemMedia';
import styles from './ItemCard.module.css';

interface ItemCardProps {
  item: MarketItem;
  onClick: () => void;
  callout?: string;
}

/** One tile in the Browse grid. Ported in spirit from `.mk2-card` (Tools.html:1230-1238). */
export const ItemCard = forwardRef<HTMLDivElement, ItemCardProps>(function ItemCard({ item, onClick, callout }, ref) {
  return (
    <div ref={ref} className={styles.card} onClick={onClick}>
      {callout && <Sticker text={callout} color="pink" rotate={-6} className={styles.callout} />}
      <div className={styles.preview}>
        <ItemMedia item={item} />
      </div>
      <div className={styles.info}>
        <div className={styles.name}>{item.name}</div>
        <div className={styles.price}>${item.price}</div>
      </div>
    </div>
  );
});
