import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { CITY_BY_ID, type RadarItem } from '@/data/radar';
import { RadarCard } from './RadarCard';
import styles from './GridView.module.css';
import type { RadarQuery, useFavourites } from './radarQuery';

interface GridViewProps {
  items: RadarItem[];
  favourites: ReturnType<typeof useFavourites>;
  query: RadarQuery;
  /** Favourites says "nothing saved yet" rather than "nothing matches". */
  emptyKind?: 'search' | 'favourites';
}

/** The plain one: every card, in a grid, in the order the sort put them. */
export function GridView({ items, favourites, query, emptyKind = 'search' }: GridViewProps) {
  if (items.length === 0) return <Empty kind={emptyKind} query={query} />;

  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <RadarCard
          key={item.id}
          item={item}
          saved={favourites.has(item.id)}
          onToggleSave={() => favourites.toggle(item.id)}
        />
      ))}
    </div>
  );
}

/**
 * Says why it is empty, because the reason is almost always one of the
 * filters — and names it, so the way out is obvious.
 */
export function Empty({ kind, query }: { kind: 'search' | 'favourites'; query: RadarQuery }) {
  if (kind === 'favourites') {
    return (
      <div className={styles.empty}>
        <MaterialIcon name="favorite" size={30} />
        <p className={styles.emptyTitle}>Nothing saved yet</p>
        <p className={styles.emptyBody}>Tap the heart on anything in the gallery and it waits for you here.</p>
      </div>
    );
  }
  const why = [
    query.scope === 'local' && `only ${CITY_BY_ID[query.city]?.name ?? query.city}`,
    query.notPickOnly && 'only NOT picks',
    query.type && `only ${query.type}`,
  ].filter(Boolean);
  return (
    <div className={styles.empty}>
      <MaterialIcon name="radar" size={30} />
      <p className={styles.emptyTitle}>Nothing on the radar</p>
      <p className={styles.emptyBody}>
        {why.length > 0
          ? `You are looking at ${why.join(', ')}. Widen any of those and it fills up.`
          : 'Nothing is open right now. Check back — it fills up fast.'}
      </p>
    </div>
  );
}
