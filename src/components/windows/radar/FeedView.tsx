import { Fragment, useMemo } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { Sticker } from '@/components/shared/Sticker';
import { isClosingSoon, isNotPick, isOnNow, keyDate, type RadarItem } from '@/data/radar';
import { cx } from '@/lib/cx';
import { Empty } from './GridView';
import { DoorChip } from './DoorChip';
import { RadarArt } from './RadarArt';
import styles from './FeedView.module.css';
import { placeLine, whenLine, type RadarQuery, type useFavourites } from './radarQuery';

interface FeedViewProps {
  items: RadarItem[];
  favourites: ReturnType<typeof useFavourites>;
  query: RadarQuery;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/**
 * The same list as a timeline you scroll through: what is on now first,
 * then one month after another, each entry hung from a big date. Always in
 * date order, whatever the sort says — a feed is read as "what is next",
 * and a timeline in any other order is just a list with dates on it.
 *
 * For calls the date is the deadline, so the feed reads as a run of
 * things closing, which is how anyone applying actually thinks about them.
 * Rolling calls, with no deadline at all, come last.
 */
export function FeedView({ items, favourites, query }: FeedViewProps) {
  const months = useMemo(() => {
    const sorted = [...items].sort((a, b) => keyDate(a).localeCompare(keyDate(b)) || a.title.localeCompare(b.title));
    const groups = new Map<string, RadarItem[]>();
    sorted.forEach((i) => {
      const key = isOnNow(i) ? 'now' : i.group === 'call' && !i.deadline ? 'rolling' : keyDate(i).slice(0, 7);
      groups.set(key, [...(groups.get(key) ?? []), i]);
    });
    return [...groups.entries()];
  }, [items]);

  const heading = (key: string) =>
    key === 'now' ? (
      <>On now</>
    ) : key === 'rolling' ? (
      <>Any time</>
    ) : (
      <>
        {MONTHS[Number(key.slice(5, 7)) - 1]} <span>{key.slice(0, 4)}</span>
      </>
    );

  /** The big date: the opening (or the deadline); for what is already on, the day it ends. */
  const dateCell = (item: RadarItem) => {
    if (item.group === 'call' && !item.deadline) return { day: '—', label: 'rolling' };
    if (isOnNow(item) && item.end) return { day: String(Number(item.end.slice(8, 10))), label: `until ${MONTHS[Number(item.end.slice(5, 7)) - 1].slice(0, 3).toLowerCase()}` };
    const date = keyDate(item);
    return {
      day: String(Number(date.slice(8, 10))),
      label: item.group === 'call' ? 'closes' : WEEKDAYS[new Date(`${date}T12:00:00`).getDay()],
    };
  };

  if (items.length === 0) return <Empty kind="search" query={query} />;

  return (
    <div className={styles.feed}>
      {months.map(([ym, list]) => (
        <Fragment key={ym}>
          <h3 className={styles.month}>{heading(ym)}</h3>
          <ol className={styles.entries}>
            {list.map((item) => {
              const cell = dateCell(item);
              const pick = isNotPick(item);
              const saved = favourites.has(item.id);
              return (
                <li key={item.id} className={styles.entry}>
                  <div className={styles.date}>
                    <span className={styles.day}>{cell.day}</span>
                    <span className={styles.weekday}>{cell.label}</span>
                  </div>

                  <article className={cx(styles.card, pick && styles.pick)}>
                    <RadarArt item={item} bare className={styles.art} />
                    {pick && <Sticker text="NOT pick" color="lime" rotate={-5} className={styles.sticker} />}
                    <div className={styles.text}>
                      <div className={styles.chips}>
                        <span className={styles.type}>{item.type}</span>
                        {isClosingSoon(item) && <span className={styles.soon}>closing soon</span>}
                        {item.status === 'estimated' && <span className={styles.vibe}>dates estimated</span>}
                        {item.group === 'call' && item.door !== null && item.door > 0 && <DoorChip door={item.door} />}
                      </div>
                      <h4 className={styles.title}>{item.title}</h4>
                      {(item.group === 'call' ? item.get : item.note) && (
                        <p className={styles.blurb}>{item.group === 'call' ? item.get : item.note}</p>
                      )}
                      {item.group === 'call' && item.who && <p className={styles.meta}>Who: {item.who}</p>}
                      <p className={styles.meta}>
                        {[placeLine(item), whenLine(item), item.fee && `fee ${item.fee}`].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={cx(styles.save, saved && styles.saveOn)}
                        onClick={() => favourites.toggle(item.id)}
                        aria-pressed={saved}
                        aria-label={saved ? `Remove ${item.title} from favourites` : `Save ${item.title}`}
                      >
                        <MaterialIcon name="favorite" size={15} />
                      </button>
                      <a className={styles.open} href={item.url} target="_blank" rel="noreferrer">
                        {item.group === 'call' ? 'Apply' : 'Open'}
                        <MaterialIcon name="arrow_outward" size={14} />
                      </a>
                    </div>
                    {pick && <span className={styles.srOnly}>NOT pick — an organisation we stand behind.</span>}
                  </article>
                </li>
              );
            })}
          </ol>
        </Fragment>
      ))}
    </div>
  );
}
