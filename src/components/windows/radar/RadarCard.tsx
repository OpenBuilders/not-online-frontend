import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { Sticker } from '@/components/shared/Sticker';
import { isClosingSoon, isNotPick, isOnNow, type RadarItem } from '@/data/radar';
import { cx } from '@/lib/cx';
import { DoorChip } from './DoorChip';
import { RadarArt } from './RadarArt';
import styles from './RadarCard.module.css';
import { placeLine, whenLine } from './radarQuery';

interface RadarCardProps {
  item: RadarItem;
  saved: boolean;
  onToggleSave: () => void;
}

/**
 * One listing in the grid: a picture, what it is, when, where, and a way
 * out to the real thing. A call also says what you get and what it costs,
 * because that is what decides whether to open it.
 *
 * "Dates estimated" is said out loud: those follow the usual calendar and
 * are not announced yet. The "NOT pick" sticker appears only for
 * organisers on our own hand-kept list.
 */
export function RadarCard({ item, saved, onToggleSave }: RadarCardProps) {
  const pick = isNotPick(item);
  const call = item.group === 'call';

  return (
    <article className={cx(styles.card, pick && styles.pick)}>
      <div className={styles.media}>
        <RadarArt item={item} className={styles.art} />
        {pick && <Sticker text="NOT pick" color="lime" rotate={-7} className={styles.pickSticker} />}
        <button
          type="button"
          className={cx(styles.save, saved && styles.saveOn)}
          onClick={onToggleSave}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${item.title} from favourites` : `Save ${item.title}`}
        >
          <MaterialIcon name="favorite" size={15} />
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.chips}>
          <span className={styles.type}>{item.type}</span>
          {isOnNow(item) && <span className={styles.onNow}>on now</span>}
          {isClosingSoon(item) && <span className={styles.soon}>closing soon</span>}
          {item.status === 'estimated' && (
            <span className={styles.est} title="Follows the usual calendar; not announced yet">
              dates estimated
            </span>
          )}
          {call && item.door !== null && item.door > 0 && <DoorChip door={item.door} />}
          {pick && <span className={styles.srOnly}>NOT pick — an organisation we stand behind.</span>}
        </div>
        <h3 className={styles.title}>{item.title}</h3>
        <p className={styles.when}>{whenLine(item)}</p>
        {call && item.get ? <p className={styles.offer}>{item.get}</p> : item.note && <p className={styles.note}>{item.note}</p>}
        {call && item.fee && <p className={styles.fee}>Fee: {item.fee}</p>}
        <p className={styles.who}>{placeLine(item)}</p>
        <a className={styles.open} href={item.url} target="_blank" rel="noreferrer">
          {call ? 'Apply' : 'Open'}
          <MaterialIcon name="arrow_outward" size={14} />
        </a>
      </div>
    </article>
  );
}
