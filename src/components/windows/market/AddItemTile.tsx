import { MaterialIcon } from '@/components/shared/MaterialIcon';
import styles from './AddItemTile.module.css';

interface AddItemTileProps {
  onClick: () => void;
}

/** Last tile in the Browse grid — jumps to Sell. Clickable even past the application cap: Sell itself shows the limit message, which explains more than a disabled tile would. */
export function AddItemTile({ onClick }: AddItemTileProps) {
  return (
    <button type="button" className={styles.tile} onClick={onClick}>
      <MaterialIcon name="add" size={28} />
      <span>Publish your item</span>
    </button>
  );
}
