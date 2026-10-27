import { Suspense, lazy, useMemo, useState } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { SiteSelect } from '@/components/shared/SiteSelect';
import {
  CALL_TYPES,
  CITY_BY_ID,
  EVENT_TYPES,
  MAPPED_CITY_IDS,
  NOT_PICKS,
  RADAR_GLOSSARY,
  RADAR_ITEMS,
  type RadarGroup,
  type RadarType,
} from '@/data/radar';
import { SPOTS } from '@/data/spots';
import { cx } from '@/lib/cx';
import { GlossaryTab } from '@/components/windows/smm/GlossaryTab';
import { FeedView } from './FeedView';
import { GridView } from './GridView';
import { MapView } from './MapView';
import { NetworkTab } from './NetworkTab';
import { SpotCard, SpotsTab } from './SpotsTab';
import { DEFAULT_QUERY, runQuery, useFavourites, type RadarQuery, type Scope, type SortKey, type ViewKey } from './radarQuery';
import styles from './RadarWindow.module.css';

// 357 institutions: fetched when the tab is first opened, not with the desktop.
const IndexTab = lazy(() => import('./IndexTab').then((m) => ({ default: m.IndexTab })));

type Tab = 'gallery' | 'spots' | 'favourites' | 'useful';
type Useful = 'index' | 'network' | 'glossary';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'gallery', label: 'Gallery', icon: 'travel_explore' },
  { id: 'spots', label: 'Spots', icon: 'pin_drop' },
  { id: 'favourites', label: 'Favourites', icon: 'favorite' },
  { id: 'useful', label: 'Useful', icon: 'lightbulb' },
];

/** The reference shelf: one rail entry, three things on it. */
const USEFUL: { id: Useful; label: string; hint: string }[] = [
  { id: 'index', label: 'Where you can get in', hint: 'open calls and applications' },
  { id: 'network', label: 'How the field is wired', hint: 'who pays for what' },
  { id: 'glossary', label: 'Glossary', hint: 'the words on invitations' },
];

const VIEWS: { id: ViewKey; label: string; icon: string }[] = [
  { id: 'grid', label: 'Grid', icon: 'grid_view' },
  { id: 'map', label: 'Map', icon: 'public' },
  { id: 'feed', label: 'Feed', icon: 'view_agenda' },
];

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'soonest', label: 'soonest first' },
  { value: 'biggest', label: 'biggest names first' },
  { value: 'az', label: 'A to Z' },
];

const GROUPS: { id: RadarGroup; label: string; hint: string }[] = [
  { id: 'event', label: 'Where to go', hint: 'shows, fairs, biennials' },
  { id: 'call', label: 'Where to apply', hint: 'open calls, grants, residencies' },
];

/**
 * Nothing Radar: what is on, and what is open.
 *
 * Built from scratch rather than ported from Tools.html's buildListWindow()
 * (2037-2254) — that was a single filtered list of opportunities, and this
 * splits the field into its two real halves (going, applying), knows where
 * you are, and knows who stands behind what. The original's vocabulary is
 * kept: "NOT pick" and the vibe chips come from it.
 *
 * Same chrome as the media kit on purpose: a rail of sections on the
 * left, the work on the right. Map is a way of looking at the gallery,
 * not a place of its own — it shows the same filtered list as the grid
 * and the feed, so switching between the three never changes what you
 * are looking at, only how.
 */
export function RadarWindow() {
  const [tab, setTab] = useState<Tab>('gallery');
  const [useful, setUseful] = useState<Useful>('index');
  const [view, setView] = useState<ViewKey>('grid');
  const [query, setQuery] = useState<RadarQuery>(DEFAULT_QUERY);
  const favourites = useFavourites();

  const patch = (p: Partial<RadarQuery>) => setQuery((q) => ({ ...q, ...p }));
  const items = useMemo(() => runQuery(query), [query]);
  const counts = useMemo(
    () => ({
      event: runQuery({ ...query, group: 'event', type: null }).length,
      call: runQuery({ ...query, group: 'call', type: null }).length,
    }),
    [query],
  );

  const types: RadarType[] = query.group === 'event' ? EVENT_TYPES : CALL_TYPES;
  const saved = useMemo(
    () => favourites.ids.map((id) => RADAR_ITEMS.find((i) => i.id === id)).filter((i) => i !== undefined),
    [favourites.ids],
  );
  const savedSpots = useMemo(() => SPOTS.filter((sp) => favourites.ids.includes(sp.id)), [favourites.ids]);

  return (
    <div className={styles.window}>
      <nav className={styles.rail} aria-label="Radar sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={cx(styles.railItem, tab === t.id && styles.on)}
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id}
          >
            <MaterialIcon name={t.icon} size={18} />
            <span className={styles.railLabel}>{t.label}</span>
            {t.id === 'favourites' && favourites.ids.length > 0 && (
              <span className={styles.railCount}>{favourites.ids.length}</span>
            )}
          </button>
        ))}
      </nav>

      <div className={styles.body}>
        {tab === 'gallery' && (
          <>
            <div className={styles.controls}>
              {/* The two halves of Radar, as the first and biggest choice. */}
              <div className={styles.groups} role="tablist" aria-label="What you are looking for">
                {GROUPS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    role="tab"
                    aria-selected={query.group === g.id}
                    className={cx(styles.group, query.group === g.id && styles.groupOn)}
                    onClick={() => patch({ group: g.id, type: null })}
                  >
                    <span className={styles.groupLabel}>{g.label}</span>
                    <span className={styles.groupHint}>
                      {counts[g.id]} · {g.hint}
                    </span>
                  </button>
                ))}
              </div>

              <div className={styles.views} role="group" aria-label="View">
                {VIEWS.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className={cx(styles.viewBtn, view === v.id && styles.viewOn)}
                    onClick={() => setView(v.id)}
                    aria-pressed={view === v.id}
                    title={v.label}
                    aria-label={v.label}
                  >
                    <MaterialIcon name={v.icon} size={16} />
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filters}>
              <div className={styles.scope} role="group" aria-label="Scope">
                {(['global', 'local'] as Scope[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={cx(styles.scopeBtn, query.scope === s && styles.scopeOn)}
                    onClick={() => patch({ scope: s })}
                    aria-pressed={query.scope === s}
                  >
                    <MaterialIcon name={s === 'global' ? 'public' : 'my_location'} size={14} />
                    {s}
                  </button>
                ))}
              </div>

              {/* The city only matters once you zoom in to one. */}
              {query.scope === 'local' && (
                <>
                  <span className={styles.youAre}>in</span>
                  <SiteSelect
                    value={query.city}
                    onChange={(v) => patch({ city: v })}
                    ariaLabel="City"
                    options={MAPPED_CITY_IDS.map((id) => ({ value: id, label: CITY_BY_ID[id]?.name ?? id }))}
                  />
                </>
              )}

              <SiteSelect
                value={query.type ?? ''}
                onChange={(v) => patch({ type: (v || null) as RadarType | null })}
                ariaLabel="Type"
                active={Boolean(query.type)}
                options={[{ value: '', label: 'every type' }, ...types.map((t) => ({ value: t, label: t }))]}
              />

              <SiteSelect
                value={query.sort}
                onChange={(v) => patch({ sort: v as SortKey })}
                ariaLabel="Sort"
                options={SORTS}
              />

              {/* Only once we have named organisers we stand behind (NOT_PICKS in radar.ts). */}
              {NOT_PICKS.length > 0 && (
                <button
                  type="button"
                  className={cx(styles.pickToggle, query.notPickOnly && styles.pickToggleOn)}
                  onClick={() => patch({ notPickOnly: !query.notPickOnly })}
                  aria-pressed={query.notPickOnly}
                >
                  <MaterialIcon name="verified" size={14} />
                  NOT picks only
                </button>
              )}
            </div>

            {view === 'grid' && <GridView items={items} favourites={favourites} query={query} />}
            {view === 'map' && <MapView
                items={items}
                favourites={favourites}
                query={query}
                onScope={(s) => patch({ scope: s })}
                onCity={(city) => patch({ scope: 'local', city })}
              />}
            {view === 'feed' && <FeedView items={items} favourites={favourites} query={query} />}
          </>
        )}

        {tab === 'favourites' && (
          <>
            <header className={styles.pageHead}>
              <h2 className={styles.pageTitle}>Favourites</h2>
              <p className={styles.pageSub}>Saved in this browser. Past dates drop off on their own.</p>
            </header>
            {(saved.length > 0 || savedSpots.length === 0) && (
              <GridView items={saved} favourites={favourites} query={query} emptyKind="favourites" />
            )}
            {savedSpots.length > 0 && (
              <>
                <h3 className={styles.sectionTitle}>Spots</h3>
                <ol className={styles.savedSpots}>
                  {savedSpots.map((sp) => (
                    <SpotCard key={sp.id} spot={sp} saved onSave={() => favourites.toggle(sp.id)} />
                  ))}
                </ol>
              </>
            )}
          </>
        )}

        {tab === 'spots' && <SpotsTab favourites={favourites} />}

        {tab === 'useful' && (
          <>
            <div className={styles.useful} role="tablist" aria-label="Useful">
              {USEFUL.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  role="tab"
                  aria-selected={useful === u.id}
                  className={cx(styles.usefulTab, useful === u.id && styles.usefulOn)}
                  onClick={() => setUseful(u.id)}
                >
                  <span>{u.label}</span>
                  <small>{u.hint}</small>
                </button>
              ))}
            </div>
            {useful === 'index' && (
              <Suspense fallback={<p className={styles.pageSub}>Loading the index…</p>}>
                <IndexTab />
              </Suspense>
            )}
            {useful === 'network' && <NetworkTab />}
            {useful === 'glossary' && (
              <GlossaryTab
                sections={RADAR_GLOSSARY}
                title="radar glossary"
                standfirst="the words on invitations, open calls and the bits in between"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
