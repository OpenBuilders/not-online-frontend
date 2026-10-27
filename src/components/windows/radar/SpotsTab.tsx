import { useEffect, useMemo, useRef, useState } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { SiteSelect } from '@/components/shared/SiteSelect';
import { CITY_BY_ID } from '@/data/radar';
import { RECOMMENDER_BY_ID, SPOTS, SPOT_CITIES, SPOT_TYPES, type Spot, type SpotType } from '@/data/spots';
import { cx } from '@/lib/cx';
import { CityLayers } from './CityBase';
import { fitFrame, projectTo, useCityMaps } from './cityKit';
import type { useFavourites } from './radarQuery';
import styles from './SpotsTab.module.css';

const cityName = (id: string) => CITY_BY_ID[id]?.name ?? id;

/**
 * Spots: where to go when nothing is on. A feed of places recommended by
 * people we trust, beside the city they are in. A city, a kind of place,
 * and that is all the filtering; the heart saves a spot to Favourites.
 *
 * The map is the same readable city map as the gallery's, with plain pins
 * that carry the kind of place as an icon. Who recommends it is on the
 * card, where there is room to say so.
 */
export function SpotsTab({ favourites }: { favourites: ReturnType<typeof useFavourites> }) {
  const [city, setCity] = useState(SPOT_CITIES[0].id);
  const [type, setType] = useState<SpotType | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const feedRef = useRef<HTMLOListElement>(null);
  const maps = useCityMaps(true);
  const cityMap = maps?.find((m) => m.id === city);

  const inCity = useMemo(() => SPOTS.filter((s) => s.cityId === city), [city]);
  const spots = useMemo(() => inCity.filter((s) => !type || s.type === type), [inCity, type]);
  const types = useMemo(() => [...new Set(inCity.map((s) => s.type))], [inCity]);

  const pins = useMemo(() => (cityMap ? spots.map((s) => ({ spot: s, ...projectTo(cityMap, s.lat, s.lng) })) : []), [spots, cityMap]);
  const frame = useMemo(() => (cityMap ? fitFrame(cityMap, pins, 0.3) : null), [cityMap, pins]);
  // Pins sized to the frame, so they read the same however far it zooms.
  const unit = frame ? frame.w / 340 : 1;

  const active = hover ?? selected;

  // A pin picked on the map brings its card into view.
  useEffect(() => {
    if (!selected) return;
    feedRef.current?.querySelector(`[data-id="${selected}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selected]);

  const switchCity = (id: string) => {
    setCity(id);
    setType(null);
    setSelected(null);
  };

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h2 className={styles.title}>Spots</h2>
        <p className={styles.sub}>
          Places people we trust actually go to, between openings and instead of them. Not sponsored, not ranked.
        </p>
        <p className={styles.sample}>Sample for now: the places are real, the people recommending them are placeholders.</p>
      </header>

      <div className={styles.cities} role="tablist" aria-label="City">
        {SPOT_CITIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={city === c.id}
            className={cx(styles.city, city === c.id && styles.on)}
            onClick={() => switchCity(c.id)}
          >
            {cityName(c.id)} <span>{c.count}</span>
          </button>
        ))}
      </div>

      <div className={styles.filters}>
        <SiteSelect
          value={type ?? ''}
          onChange={(v) => setType((v || null) as SpotType | null)}
          ariaLabel="Kind of place"
          active={Boolean(type)}
          options={[
            { value: '', label: 'every kind of place' },
            ...types.map((t) => ({ value: t, label: SPOT_TYPES[t].label.toLowerCase(), icon: SPOT_TYPES[t].icon })),
          ]}
        />
        <span className={styles.count}>
          {spots.length} {spots.length === 1 ? 'spot' : 'spots'}
        </span>
      </div>

      <div className={styles.split}>
        <ol className={styles.feed} ref={feedRef} onMouseLeave={() => setHover(null)}>
          {spots.map((s) => (
            <SpotCard
              key={s.id}
              spot={s}
              on={active === s.id}
              onHover={() => setHover(s.id)}
              onPick={() => setSelected(selected === s.id ? null : s.id)}
              saved={favourites.has(s.id)}
              onSave={() => favourites.toggle(s.id)}
            />
          ))}
          {spots.length === 0 && <li className={styles.empty}>Nothing of that kind here yet.</li>}
        </ol>

        <div className={styles.mapPanel}>
          {!cityMap || !frame ? (
            <p className={styles.loading}>Drawing {cityName(city)}…</p>
          ) : (
            <svg className={styles.map} viewBox={`${frame.x} ${frame.y} ${frame.w} ${frame.h}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Spots in ${cityName(city)}`}>
              <CityLayers map={cityMap} />
              {/* The pin you are on is drawn last, so it is never under a neighbour. */}
              {[...pins].sort((a, b) => Number(a.spot.id === active) - Number(b.spot.id === active)).map(({ spot, x, y }) => {
                const on = active === spot.id;
                const dim = Boolean(active) && !on;
                const r = 13 * unit;
                return (
                  <g
                    key={spot.id}
                    className={cx(styles.pin, on && styles.pinOn, dim && styles.pinDim)}
                    transform={`translate(${x} ${y})`}
                    onMouseEnter={() => setHover(spot.id)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => setSelected(spot.id)}
                  >
                    <circle r={r} className={styles.pinDot} strokeWidth={2.5 * unit} />
                    <text className={styles.pinIcon} fontSize={r * 1.2} dy={r * 0.42}>
                      {SPOT_TYPES[spot.type].icon}
                    </text>
                    {on && (
                      <text className={styles.pinLabel} x={r * 1.5} dy={5 * unit} fontSize={14 * unit} strokeWidth={5 * unit}>
                        {spot.name}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}
          <span className={styles.credit}>Map data © OpenStreetMap contributors</span>
        </div>
      </div>
    </div>
  );
}

export function SpotCard({
  spot,
  on = false,
  onHover,
  onPick,
  saved,
  onSave,
}: {
  spot: Spot;
  on?: boolean;
  onHover?: () => void;
  onPick?: () => void;
  saved: boolean;
  onSave: () => void;
}) {
  const t = SPOT_TYPES[spot.type];
  const [first, ...others] = spot.by.map((id) => RECOMMENDER_BY_ID[id]);
  return (
    <li data-id={spot.id} className={cx(styles.card, on && styles.cardOn)} onMouseEnter={onHover}>
      <button type="button" className={styles.cardHead} onClick={onPick} aria-label={`Show ${spot.name} on the map`}>
        <span className={styles.typeIcon}>
          <MaterialIcon name={t.icon} size={18} />
        </span>
        <span className={styles.cardTitle}>
          <span className={styles.name}>{spot.name}</span>
          <span className={styles.meta}>
            {t.label} · {spot.area}
          </span>
        </span>
        {spot.checked && (
          <span className={styles.checked} title="We have been, and it holds up">
            <MaterialIcon name="verified" size={13} />
            checked
          </span>
        )}
      </button>
      <button
        type="button"
        className={cx(styles.save, saved && styles.saveOn)}
        onClick={onSave}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${spot.name} from favourites` : `Save ${spot.name}`}
      >
        <MaterialIcon name="favorite" size={15} />
      </button>

      <blockquote className={styles.quote}>{spot.quote}</blockquote>

      <div className={styles.cardFoot}>
        <span className={styles.by}>
          <img src={first.avatar} alt="" />
          <span>
            <b>{first.name}</b>, {first.role}
            {others.length > 0 && <> · also {others.map((o) => o.name).join(', ')}</>}
          </span>
        </span>
        <span className={styles.goodFor}>
          {spot.goodFor.map((g) => (
            <span key={g}>{g}</span>
          ))}
        </span>
      </div>
    </li>
  );
}
