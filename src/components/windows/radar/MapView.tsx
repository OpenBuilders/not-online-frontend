import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { CITY_BY_ID, MAPPED_CITY_IDS, isNotPick, type RadarItem } from '@/data/radar';
import { LAND_FINE, WORLD_FINE } from '@/data/worldMask';
import { cx } from '@/lib/cx';
import { CityLayers } from './CityBase';
import { fitFrame, projectTo, useCityMaps } from './cityKit';
import { Empty } from './GridView';
import { RadarArt } from './RadarArt';
import styles from './MapView.module.css';
import { placeLine, whenLine, type RadarQuery, type useFavourites } from './radarQuery';

interface MapViewProps {
  items: RadarItem[];
  favourites: ReturnType<typeof useFavourites>;
  query: RadarQuery;
  onScope: (scope: RadarQuery['scope']) => void;
  /** Open one city's local map. */
  onCity: (cityId: string) => void;
}

// ---- the world, in regions ---------------------------------------------------

/** Equirectangular on the 1-degree land grid, 10 units a degree. */
const CELL = 10;
const projectGlobal = (lat: number, lng: number) => ({ x: (lng + 180) * CELL, y: (WORLD_FINE.latTop - lat) * CELL });
const cellLatLng = (c: number, r: number) => ({
  lat: WORLD_FINE.latTop - (r + 0.5) * WORLD_FINE.step,
  lng: -180 + (c + 0.5) * WORLD_FINE.step,
});

/**
 * The world is mostly empty on Radar's terms, so it is not drawn whole:
 * three regions where things actually happen, each filling the panel.
 * Bounds in degrees; anything outside all three is listed as "also".
 */
const REGIONS = [
  { id: 'europe', name: 'Europe', w: -12, e: 40, n: 61, s: 35 },
  { id: 'america', name: 'North America', w: -126, e: -58, n: 50, s: 16 },
  { id: 'east', name: 'East', w: 30, e: 146, n: 48, s: -4 },
] as const;
type Region = (typeof REGIONS)[number];
const inRegion = (r: Region, lat: number, lng: number) => lng >= r.w && lng <= r.e && lat <= r.n && lat >= r.s;

const MAPPED = new Set<string>(MAPPED_CITY_IDS);
/** Glow steps, from a faint trace to the brightest hubs. */
const LEVELS = [0.12, 0.3, 0.55];

interface Hub {
  id: string;
  name: string;
  lat: number;
  lng: number;
  items: RadarItem[];
}

interface Pin {
  key: string;
  x: number;
  y: number;
  items: RadarItem[];
  label: string;
  pick: boolean;
  /** Placed by district or city, not by door. */
  rough: boolean;
}

/**
 * The gallery's list beside a map of it. Pointing at either side lights up
 * the other.
 *
 * Global is a heat map of one region at a time — Europe, North America,
 * the East — never the empty whole: every land dot glows by how much is on
 * near it, in three steps, green for going and pink for applying. Point
 * anywhere to find the nearest hub; click it to open that city's own map.
 * Cities outside the three are listed underneath.
 *
 * Local is the city from OpenStreetMap on black — water-blue water,
 * hairline green streets — framed to where things actually are rather
 * than to the whole city, so the pins get the room.
 */
export function MapView({ items, favourites, query, onScope, onCity }: MapViewProps) {
  const [hover, setHover] = useState<string | null>(null);
  const [hoverHub, setHoverHub] = useState<string | null>(null);
  const [pickedRegion, setPickedRegion] = useState<Region['id'] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const local = query.scope === 'local';
  const call = query.group === 'call';
  const maps = useCityMaps(local);
  const cityMap = local ? maps?.find((m) => m.id === query.city) : undefined;

  // ---- global: hubs and the glow they cast ----

  const hubs = useMemo<Hub[]>(() => {
    const by = new Map<string, RadarItem[]>();
    items.forEach((i) => i.lat !== null && CITY_BY_ID[i.cityId] && by.set(i.cityId, [...(by.get(i.cityId) ?? []), i]));
    return [...by.entries()].map(([id, list]) => {
      const c = CITY_BY_ID[id];
      return { id, name: c.name, lat: c.lat, lng: c.lng, items: list };
    });
  }, [items]);

  /** Hubs per region, and the busiest region, which opens first. */
  const byRegion = useMemo(
    () => Object.fromEntries(REGIONS.map((r) => [r.id, hubs.filter((h) => inRegion(r, h.lat, h.lng))])) as Record<Region['id'], Hub[]>,
    [hubs],
  );
  const count = (id: Region['id']) => byRegion[id].reduce((n, h) => n + h.items.length, 0);
  const busiest = [...REGIONS].sort((a, b) => count(b.id) - count(a.id))[0];
  const region = REGIONS.find((r) => r.id === pickedRegion) ?? busiest;
  const elsewhere = hubs.filter((h) => !REGIONS.some((r) => inRegion(r, h.lat, h.lng)));

  /** The region's land, each dot at a glow level 0-3 from a gaussian sum over its hubs. */
  const cells = useMemo(() => {
    const spread = (region.e - region.w) / 38; // glow reach scales with the region
    const regionHubs = byRegion[region.id];
    const raw = LAND_FINE.filter(([c, r]) => {
      const p = cellLatLng(c, r);
      return p.lng >= region.w - 2 && p.lng <= region.e + 2 && p.lat <= region.n + 2 && p.lat >= region.s - 2;
    }).map(([c, r]) => {
      const p = cellLatLng(c, r);
      const k = Math.cos((p.lat * Math.PI) / 180);
      const v = regionHubs.reduce((sum, h) => {
        const dx = (h.lng - p.lng) * k;
        const dy = h.lat - p.lat;
        return sum + h.items.length * Math.exp(-(dx * dx + dy * dy) / (2 * spread * spread));
      }, 0);
      return { c, r, v };
    });
    const max = Math.max(1e-9, ...raw.map((x) => x.v));
    return raw.map(({ c, r, v }) => {
      const n = Math.sqrt(v / max); // square root, so a single show still registers
      return { c, r, level: n >= LEVELS[2] ? 3 : n >= LEVELS[1] ? 2 : n >= LEVELS[0] ? 1 : 0 };
    });
  }, [region, byRegion]);

  const nearestHub = (lat: number, lng: number) => {
    const within = (region.e - region.w) / 14;
    let best: Hub | null = null;
    let bestD = within;
    byRegion[region.id].forEach((h) => {
      const d = Math.hypot((h.lng - lng) * Math.cos((lat * Math.PI) / 180), h.lat - lat);
      if (d < bestD) {
        best = h;
        bestD = d;
      }
    });
    return best as Hub | null;
  };

  /** The pointer, in degrees, off the region map. */
  const pointerLatLng = (e: ReactMouseEvent) => {
    const m = svgRef.current?.getScreenCTM();
    if (!m) return null;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { lat: WORLD_FINE.latTop - pt.y / CELL, lng: pt.x / CELL - 180 };
  };

  // ---- local: pins, and a frame fitted to them ----

  const pins = useMemo<Pin[]>(() => {
    if (!local || !cityMap) return [];
    const at = (lat: number, lng: number) => projectTo(cityMap, lat, lng);
    // One pin per place: two shows in one museum are one pin with a 2.
    const byPlace = new Map<string, RadarItem[]>();
    items.forEach((i) => {
      if (i.lat === null || i.lng === null) return;
      const k = `${i.lat.toFixed(3)},${i.lng.toFixed(3)}`;
      byPlace.set(k, [...(byPlace.get(k) ?? []), i]);
    });
    return [...byPlace.entries()].map(([key, list]) => ({
      key,
      ...at(list[0].lat!, list[0].lng!),
      items: list,
      label: list[0].precision === 'city' ? `Somewhere in ${list[0].city}` : list[0].venue || list[0].inst || list[0].city,
      pick: list.some(isNotPick),
      rough: list.every((i) => i.precision !== 'venue'),
    }));
  }, [items, local, cityMap]);

  /** The frame: fitted to the pins, so they get the room. */
  const frame = useMemo(() => (cityMap ? fitFrame(cityMap, pins) : null), [pins, cityMap]);

  // A row lit from the map scrolls into view, so the two sides stay in step.
  useEffect(() => {
    if (!hover) return;
    listRef.current?.querySelector(`[data-id="${hover}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [hover]);

  const active = hover ?? selected;
  const activeItem = items.find((i) => i.id === active);
  const litHub = hoverHub ? hubs.find((h) => h.id === hoverHub) : activeItem ? hubs.find((h) => h.id === activeItem.cityId) : undefined;
  const selectedItem = items.find((i) => i.id === selected);

  if (items.length === 0) return <Empty kind="search" query={query} />;

  // Pins sized to the frame, so they read the same however far it zooms.
  const unit = frame ? frame.w / 520 : 1;
  // Pins that would touch on screen become one pin with the sum: a cluster
  // of galleries round the Louvre is one "7", not seven overlapping dots.
  const clustered = pins.reduce<Pin[]>((out, p) => {
    const near = out.find((o) => Math.hypot(o.x - p.x, o.y - p.y) < 24 * unit);
    if (!near) return [...out, p];
    const n = near.items.length;
    return out.map((o) =>
      o === near
        ? {
            ...o,
            x: (o.x * n + p.x * p.items.length) / (n + p.items.length),
            y: (o.y * n + p.y * p.items.length) / (n + p.items.length),
            items: [...o.items, ...p.items],
            label: `${o.label} and nearby`,
            pick: o.pick || p.pick,
            rough: o.rough && p.rough,
          }
        : o,
    );
  }, []);
  const activeCluster = clustered.find((c) => c.items.some((i) => i.id === active));
  // The region's frame, and type sized to it so names read the same in every region.
  const rx = (region.w + 180) * CELL;
  const ry = (WORLD_FINE.latTop - region.n) * CELL;
  const rw = (region.e - region.w) * CELL;
  const rh = (region.n - region.s) * CELL;
  const k = rw / 460;
  const topHubs = [...byRegion[region.id]].sort((a, b) => b.items.length - a.items.length).slice(0, 7);
  // Named quietly, busiest first, skipping any that would sit on a name already placed.
  const namedHubs = topHubs.reduce<Hub[]>((placed, h) => {
    const p = projectGlobal(h.lat, h.lng);
    const clear = placed.every((o) => {
      const q = projectGlobal(o.lat, o.lng);
      return Math.abs(q.x - p.x) > 95 * k || Math.abs(q.y - p.y) > 22 * k;
    });
    return clear ? [...placed, h] : placed;
  }, []);

  return (
    <div className={styles.split}>
      <ul className={styles.list} ref={listRef} onMouseLeave={() => setHover(null)}>
        {items.map((item) => (
          <li key={item.id} data-id={item.id}>
            <button
              type="button"
              className={cx(styles.row, active === item.id && styles.rowOn)}
              onMouseEnter={() => setHover(item.id)}
              onFocus={() => setHover(item.id)}
              onClick={() => setSelected((s) => (s === item.id ? null : item.id))}
            >
              <RadarArt item={item} bare className={styles.thumb} />
              <span className={styles.rowText}>
                <span className={styles.rowTitle}>
                  {isNotPick(item) && <span className={styles.rowPick} title="NOT pick" />}
                  {item.title}
                </span>
                <span className={styles.rowMeta}>
                  {whenLine(item)} · {local ? item.venue || item.inst || 'location approximate' : item.city}
                </span>
              </span>
              {favourites.has(item.id) && <MaterialIcon name="favorite" size={13} className={styles.rowSaved} />}
            </button>
          </li>
        ))}
      </ul>

      <div className={cx(styles.mapPanel, call && styles.callMode)}>
        {local ? (
          !cityMap || !frame ? (
            <p className={styles.loading}>Drawing {CITY_BY_ID[query.city]?.name ?? 'the city'}…</p>
          ) : (
            <svg
              className={styles.map}
              viewBox={`${frame.x} ${frame.y} ${frame.w} ${frame.h}`}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label={`Map of ${cityMap.name}`}
            >
              <CityLayers map={cityMap} />

              {clustered.map((p) => {
                const on = p === activeCluster;
                const dim = Boolean(activeCluster) && !on;
                const r = (p.items.length > 1 ? 13 : 10) * unit;
                return (
                  <g
                    key={p.key}
                    className={cx(styles.pin, dim && styles.pinDim)}
                    transform={`translate(${p.x} ${p.y})`}
                    onMouseEnter={() => setHover(p.items[0].id)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => setSelected(p.items[0].id)}
                  >
                    {on && <circle r={r * 2} className={styles.pulse} strokeWidth={3 * unit} />}
                    <circle r={r} className={cx(styles.pinDot, p.pick && styles.pinPick, p.rough && styles.pinRough)} strokeWidth={3 * unit} />
                    {p.items.length > 1 && (
                      <text className={styles.count} dy={r * 0.36} fontSize={r * 1.05}>
                        {p.items.length}
                      </text>
                    )}
                    {on && (
                      <text className={styles.label} x={r + 7 * unit} dy={5 * unit} fontSize={15 * unit} strokeWidth={5 * unit}>
                        {p.items.length > 1 ? `${p.label} · ${p.items.length}` : p.items[0].title}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )
        ) : (
          <svg
            ref={svgRef}
            className={cx(styles.map, styles.world)}
            viewBox={`${rx} ${ry} ${rw} ${rh}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`${region.name}: ${topHubs.map((h) => `${h.name} ${h.items.length}`).join(', ')}`}
            onMouseMove={(e) => {
              const p = pointerLatLng(e);
              setHoverHub(p ? (nearestHub(p.lat, p.lng)?.id ?? null) : null);
            }}
            onMouseLeave={() => setHoverHub(null)}
            onClick={(e) => {
              const p = pointerLatLng(e);
              const h = p && nearestHub(p.lat, p.lng);
              if (!h) return;
              if (MAPPED.has(h.id)) onCity(h.id);
              else setSelected(h.items[0].id);
            }}
          >
            <g>
              {cells.map(({ c, r, level }) => (
                <circle
                  key={`${c}-${r}`}
                  cx={c * CELL + CELL / 2}
                  cy={r * CELL + CELL / 2}
                  r={level === 3 ? 4.4 : level === 2 ? 3.9 : 3.3}
                  className={styles[`heat${level}`]}
                />
              ))}
            </g>

            {/* The busiest hubs, named quietly; the one you point at, loudly. */}
            {namedHubs.map((h) => {
              const p = projectGlobal(h.lat, h.lng);
              if (h.id === litHub?.id) return null;
              return (
                <text key={h.id} x={p.x} y={p.y - 9 * k} className={styles.hubName} fontSize={11 * k} strokeWidth={3.5 * k}>
                  {h.name} {h.items.length}
                </text>
              );
            })}
            {litHub &&
              byRegion[region.id].includes(litHub) &&
              (() => {
                const p = projectGlobal(litHub.lat, litHub.lng);
                return (
                  <g className={styles.hubOn} transform={`translate(${p.x} ${p.y})`}>
                    <circle r={15 * k} className={styles.hubRing} strokeWidth={1.6 * k} strokeDasharray={`${3 * k} ${2.5 * k}`} />
                    <text y={-21 * k} className={styles.hubLabel} fontSize={14 * k} strokeWidth={4.5 * k}>
                      {litHub.name} · {litHub.items.length}
                      {MAPPED.has(litHub.id) ? ' · open map' : ''}
                    </text>
                  </g>
                );
              })()}
          </svg>
        )}

        <div className={styles.zoom} role="group" aria-label="Zoom">
          <button type="button" onClick={() => onScope('local')} disabled={local} aria-label={`Zoom in to ${CITY_BY_ID[query.city]?.name}`} title="Local">
            <MaterialIcon name="add" size={16} />
          </button>
          <button type="button" onClick={() => onScope('global')} disabled={!local} aria-label="Zoom out to the world" title="Global">
            <MaterialIcon name="remove" size={16} />
          </button>
        </div>

        {local ? (
          <span className={styles.scopeTag}>local · {cityMap?.name ?? CITY_BY_ID[query.city]?.name ?? ''}</span>
        ) : (
          <div className={styles.regions} role="tablist" aria-label="Region">
            {REGIONS.filter((r) => count(r.id) > 0).map((r) => (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={r.id === region.id}
                className={cx(styles.regionBtn, r.id === region.id && styles.regionOn)}
                onClick={() => setPickedRegion(r.id)}
              >
                {r.name} <span>{count(r.id)}</span>
              </button>
            ))}
          </div>
        )}
        {!local && elsewhere.length > 0 && (
          <div className={styles.also}>
            also
            {elsewhere.map((h) => (
              <button key={h.id} type="button" onClick={() => setSelected(h.items[0].id)}>
                {h.name} {h.items.length}
              </button>
            ))}
          </div>
        )}
        {local ? (
          <span className={styles.credit}>Map data © OpenStreetMap contributors</span>
        ) : (
          <div className={styles.legend} aria-hidden="true">
            <span>
              <i className={styles.heat1} /> a little
            </span>
            <span>
              <i className={styles.heat2} /> a lot
            </span>
            <span>
              <i className={styles.heat3} /> the most
            </span>
          </div>
        )}

        {selectedItem && (
          <div className={styles.callout}>
            <div className={styles.calloutText}>
              <span className={styles.calloutTitle}>{selectedItem.title}</span>
              <span className={styles.calloutMeta}>
                {placeLine(selectedItem)} · {whenLine(selectedItem)}
                {selectedItem.precision !== 'venue' && ' · location approximate'}
              </span>
            </div>
            <a className={styles.calloutOpen} href={selectedItem.url} target="_blank" rel="noreferrer">
              {selectedItem.group === 'call' ? 'Apply' : 'Open'}
              <MaterialIcon name="arrow_outward" size={13} />
            </a>
            <button type="button" className={styles.calloutClose} onClick={() => setSelected(null)} aria-label="Close">
              <MaterialIcon name="close" size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
