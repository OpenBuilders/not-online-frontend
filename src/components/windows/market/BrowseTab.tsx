import { SEED_MARKET_ITEMS } from '@/data/marketItems';
import { useAppState } from '@/state/AppStateContext';
import { AddItemTile } from './AddItemTile';
import { ItemCard } from './ItemCard';
import styles from './BrowseTab.module.css';

interface BrowseTabProps {
  onPublish: () => void;
}

/**
 * Browse shows only the two fixed catalogue items — clicking either opens
 * the live site (this desktop doesn't handle checkout), not an in-app
 * detail/cart flow. A real listing goes through the moderation queue (see
 * src/api/marketSubmissions.ts) and shows up in the always-on MySubmissions
 * desktop panel instead of here, matching the actual moderation model: a
 * submission may be rejected, so it's deliberately not inserted into this
 * public-facing grid.
 */
export function BrowseTab({ onPublish }: BrowseTabProps) {
  const { markExploredCatalog } = useAppState();

  return (
    <div className={styles.grid}>
      {SEED_MARKET_ITEMS.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onClick={() => {
            if (!item.externalUrl) return;
            markExploredCatalog();
            window.open(item.externalUrl, '_blank', 'noopener');
          }}
        />
      ))}
      <AddItemTile onClick={onPublish} />
    </div>
  );
}
