import { useMemo, useState } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { SiteSelect } from '@/components/shared/SiteSelect';
import { INDEX, type Door, type IndexCategory, type IndexEntry } from '@/data/artIndex';
import { cx } from '@/lib/cx';
import styles from './IndexTab.module.css';
import { CATEGORY_LABEL, DOORS } from './indexMeta';

const PAGE = 30;
const TIER_WEIGHT = { A: 3, B: 2, C: 1 } as const;
type DoorFilter = 'all' | Door;
type Sort = 'open' | 'big' | 'az';

/** The only two doors the index keeps: open to anyone first, then by application. */
const DOOR_ORDER: Door[] = [4, 3];
/** Only the kinds of place that actually occur in it. */
const KINDS = (Object.keys(CATEGORY_LABEL) as IndexCategory[]).filter((c) => INDEX.some((e) => e.cat === c));

/** Cities ranked by the weight of what is in them (A = 3, B = 2, C = 1). */
const CITIES = (() => {
  const w = new Map<string, number>();
  INDEX.forEach((e) => w.set(e.city, (w.get(e.city) ?? 0) + TIER_WEIGHT[e.tier]));
  return [...w.entries()].sort((a, b) => b[1] - a[1]).map(([city]) => city);
})();

const SORTS: Record<Sort, (a: IndexEntry, b: IndexEntry) => number> = {
  open: (a, b) => b.door - a.door || TIER_WEIGHT[b.tier] - TIER_WEIGHT[a.tier] || a.name.localeCompare(b.name),
  big: (a, b) => TIER_WEIGHT[b.tier] - TIER_WEIGHT[a.tier] || b.door - a.door || a.name.localeCompare(b.name),
  az: (a, b) => a.name.localeCompare(b.name),
};

function DoorMeter({ door }: { door: Door }) {
  return (
    <span className={cx(styles.meter, door === 0 && styles.meterNone)} title={DOORS[door].hint} aria-label={DOORS[door].label}>
      {[1, 2, 3, 4].map((i) => (
        <i key={i} className={cx(i <= door && styles.lit)} />
      ))}
    </span>
  );
}

/**
 * Where you can get in: the places an artist without a gallery can apply
 * to today — open to anyone first, then by application with conditions.
 * Everything invitation-only or through-someone is left out entirely; it
 * is the market, not a way into it. Rows stay one line until you open one.
 */
export function IndexTab() {
  const [door, setDoor] = useState<DoorFilter>('all');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<IndexCategory | ''>('');
  const [city, setCity] = useState('');
  const [sort, setSort] = useState<Sort>('open');
  const [open, setOpen] = useState<string | null>(null);
  const [shown, setShown] = useState(PAGE);

  /** Everything but the door, so the door counts show what each step would give you. */
  const base = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return INDEX.filter(
      (e) =>
        (!cat || e.cat === cat) &&
        (!city || e.city === city) &&
        (!needle || `${e.name} ${e.city} ${e.country} ${e.note}`.toLowerCase().includes(needle)),
    );
  }, [q, cat, city]);

  const rows = useMemo(() => base.filter((e) => door === 'all' || e.door === door).sort(SORTS[sort]), [base, door, sort]);
  const count = (d: Door) => base.filter((e) => e.door === d).length;

  // Any change of filter starts the list from the top again.
  const reset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setShown(PAGE);
    setOpen(null);
  };

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h2 className={styles.title}>Where you can get in</h2>
        <p className={styles.sub}>
          {INDEX.length} places you can apply to without a gallery, a nomination or an invitation: the ones open to anyone first,
          then the ones that take applications.
        </p>
      </header>

      <div className={styles.doors} role="group" aria-label="How open the door is">
        <button type="button" className={cx(styles.door, door === 'all' && styles.on)} aria-pressed={door === 'all'} onClick={() => reset(setDoor)('all')}>
          <span className={styles.doorLabel}>Both</span>
          <span className={styles.doorCount}>{base.length}</span>
        </button>
        {DOOR_ORDER.map((d) => (
          <button key={d} type="button" className={cx(styles.door, door === d && styles.on)} aria-pressed={door === d} onClick={() => reset(setDoor)(d)} title={DOORS[d].hint}>
            <DoorMeter door={d} />
            <span className={styles.doorLabel}>{DOORS[d].label}</span>
            <span className={styles.doorCount}>{count(d)}</span>
          </button>
        ))}
      </div>

      <div className={styles.filters}>
        <label className={styles.search}>
          <MaterialIcon name="search" size={16} />
          <input type="search" value={q} onChange={(e) => reset(setQ)(e.target.value)} placeholder="Name, city or what they do" aria-label="Search the index" />
        </label>
        <SiteSelect
          value={cat}
          onChange={(v) => reset(setCat)(v as IndexCategory | '')}
          ariaLabel="Kind of place"
          active={cat !== ''}
          options={[{ value: '', label: 'every kind' }, ...KINDS.map((value) => ({ value, label: CATEGORY_LABEL[value] }))]}
        />
        <SiteSelect
          value={city}
          onChange={(v) => reset(setCity)(v)}
          ariaLabel="City"
          active={city !== ''}
          options={[{ value: '', label: 'everywhere' }, ...CITIES.map((c) => ({ value: c, label: c }))]}
        />
        <SiteSelect
          value={sort}
          onChange={(v) => reset(setSort)(v as Sort)}
          ariaLabel="Sort"
          options={[
            { value: 'open', label: 'most open first' },
            { value: 'big', label: 'biggest first' },
            { value: 'az', label: 'A to Z' },
          ]}
        />
      </div>

      {rows.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Nothing matches</p>
          <p className={styles.emptyBody}>Try both doors, a wider kind, or clear the search.</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {rows.slice(0, shown).map((e) => {
            const isOpen = open === e.name;
            return (
              <li key={e.name} className={cx(styles.row, isOpen && styles.rowOpen)}>
                <button type="button" className={styles.rowHead} onClick={() => setOpen(isOpen ? null : e.name)} aria-expanded={isOpen}>
                  <DoorMeter door={e.door} />
                  <span className={styles.name}>{e.name}</span>
                  <span className={cx(styles.tier, styles[`tier${e.tier}`])} title={`Tier ${e.tier}`}>
                    {e.tier}
                  </span>
                  <span className={styles.meta}>
                    {CATEGORY_LABEL[e.cat]} · {e.city}
                  </span>
                  <MaterialIcon name="expand_more" size={18} className={styles.chev} />
                </button>
                {isOpen && (
                  <div className={styles.detail}>
                    <p className={styles.note}>
                      {e.note}
                      {e.note && ' · '}
                      {e.city === e.country ? e.city : `${e.city}, ${e.country}`}
                    </p>
                    <div className={styles.how}>
                      <span className={styles.howLabel}>{e.door === 0 ? DOORS[0].label : `How to get in · ${DOORS[e.door].label}`}</span>
                      <p>{e.route || DOORS[e.door].hint}</p>
                    </div>
                    {e.url && (
                      <a className={styles.visit} href={`https://${e.url}`} target="_blank" rel="noreferrer">
                        {e.url}
                        <MaterialIcon name="arrow_outward" size={13} />
                      </a>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {rows.length > shown && (
        <button type="button" className={styles.more} onClick={() => setShown((n) => n + PAGE)}>
          Show {Math.min(PAGE, rows.length - shown)} more of {rows.length - shown}
        </button>
      )}

      <p className={styles.footnote}>
        Tier (A, B, C) is weight within its own field and the door is how open it is to you: both are our estimates, not official
        rankings. Calls change every cycle, so check the site before you apply.
      </p>
    </div>
  );
}
