import { useState } from 'react';
import { AeroButton } from '@/components/shared/AeroButton';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { useAppState } from '@/state/AppStateContext';
import { ItemMedia } from './ItemMedia';
import styles from './CartTab.module.css';

interface CartTabProps {
  onBack: () => void;
}

/** Ported in spirit from `viewCart()` (Tools.html:3218-3244). */
export function CartTab({ onBack }: CartTabProps) {
  const { state, removeFromCart, clearCart } = useAppState();
  const [placed, setPlaced] = useState(false);
  const total = state.cart.reduce((sum, item) => sum + item.price, 0);

  if (placed) {
    return (
      <div className={styles.placed}>
        <div className={styles.placedIcon}>
          <MaterialIcon name="check" size={36} />
        </div>
        <h3>Order placed</h3>
        <p>Thanks. Your nothing is on its way.</p>
        <AeroButton variant="lime" size="sm" onClick={onBack}>
          Back to market
        </AeroButton>
      </div>
    );
  }

  return (
    <div>
      <AeroButton variant="ghost" size="sm" theme="light" onClick={onBack}>
        <MaterialIcon name="arrow_back" size={14} />
        Keep shopping
      </AeroButton>
      <h3 className={styles.heading}>Your cart</h3>
      {state.cart.length === 0 ? (
        <div className={styles.empty}>Cart is empty.</div>
      ) : (
        <div className={styles.rows}>
          {state.cart.map((item, i) => (
            <div key={`${item.id}-${i}`} className={styles.row}>
              <div className={styles.rowIcon}>
                <ItemMedia item={item} iconSize={18} />
              </div>
              <div className={styles.rowMain}>
                <div className={styles.rowName}>{item.name}</div>
                <div className={styles.rowPrice}>${item.price}</div>
              </div>
              <AeroButton variant="ghost" size="sm" theme="light" onClick={() => removeFromCart(i)}>
                Remove
              </AeroButton>
            </div>
          ))}
        </div>
      )}
      <div className={styles.totalRow}>
        <div className={styles.totalValue}>${total}</div>
        <div className={styles.totalLabel}>total</div>
      </div>
      <AeroButton
        variant="lime"
        wide
        disabled={state.cart.length === 0}
        onClick={() => {
          clearCart();
          setPlaced(true);
        }}
      >
        Place order
      </AeroButton>
    </div>
  );
}
