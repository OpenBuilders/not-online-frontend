import { useRef } from 'react';
import { AeroButton } from '@/components/shared/AeroButton';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import type { MarketItem } from '@/types';
import { ItemMedia } from './ItemMedia';
import styles from './ItemDetail.module.css';

interface ItemDetailProps {
  item: MarketItem;
  onBack: () => void;
  onAddToCart: (sourceEl: HTMLElement) => void;
}

/** Click-through detail panel for one item. Ported in spirit from `detail()` (Tools.html:3204-3216). */
export function ItemDetail({ item, onBack, onAddToCart }: ItemDetailProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <AeroButton variant="ghost" size="sm" theme="light" onClick={onBack}>
        <MaterialIcon name="arrow_back" size={14} />
        Back
      </AeroButton>
      <div className={styles.layout}>
        <div ref={previewRef} className={styles.preview}>
          <ItemMedia item={item} iconSize={64} />
        </div>
        <div className={styles.info}>
          <h3 className={styles.name}>{item.name}</h3>
          <div className={styles.price}>${item.price}</div>
          {item.desc && <div className={styles.desc}>{item.desc}</div>}
          {item.contact && <div className={styles.contact}>Contact: {item.contact}</div>}
          <AeroButton
            variant="lime"
            className={styles.addButton}
            onClick={() => previewRef.current && onAddToCart(previewRef.current)}
          >
            <MaterialIcon name="add_shopping_cart" size={16} />
            Add to cart
          </AeroButton>
        </div>
      </div>
    </div>
  );
}
