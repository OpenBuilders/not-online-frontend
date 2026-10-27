import { useCallback, useEffect, useMemo, useState } from 'react';
import { RADAR_ITEMS, TODAY, daysUntil, isLive, isNotPick, isOnNow, keyDate, type RadarGroup, type RadarItem, type RadarType } from '@/data/radar';

export type Scope = 'global' | 'local';
export type SortKey = 'soonest' | 'biggest' | 'az';
export type ViewKey = 'grid' | 'map' | 'feed';

export interface RadarQuery {
  group: RadarGroup;
  scope: Scope;
  /** The city the local scope looks at: one of the cities with a map. */
  city: string;
  sort: SortKey;
  /** null is every type in the group. */
  type: RadarType | null;
  notPickOnly: boolean;
}

export const DEFAULT_QUERY: RadarQuery = {
  group: 'event',
  scope: 'global',
  city: 'london',
  sort: 'soonest',
  type: null,
  notPickOnly: false,
};

const TIER = { A: 3, B: 2, C: 1 } as const;

/**
 * Everything the controls describe, as one filtered, sorted list. Every
 * view — grid, map, feed — reads from this, so switching between them
 * never changes what you are looking at, only how.
 */
export function runQuery(q: RadarQuery, items: RadarItem[] = RADAR_ITEMS): RadarItem[] {
  const list = items.filter(
    (i) =>
      i.group === q.group &&
      isLive(i) &&
      (q.scope === 'global' || i.cityId === q.city) &&
      (!q.type || i.type === q.type) &&
      (!q.notPickOnly || isNotPick(i)),
  );
  const by: Record<SortKey, (a: RadarItem, b: RadarItem) => number> = {
    soonest: (a, b) => keyDate(a).localeCompare(keyDate(b)) || a.title.localeCompare(b.title),
    // The weight of the organiser in its field, from the Index; unknown organisers last.
    biggest: (a, b) => (b.tier ? TIER[b.tier] : 0) - (a.tier ? TIER[a.tier] : 0) || keyDate(a).localeCompare(keyDate(b)),
    az: (a, b) => a.title.localeCompare(b.title),
  };
  return list.sort(by[q.sort]);
}

// ---- favourites -------------------------------------------------------------

const FAV_KEY = 'nothing.radar.favourites.v2';

function readFavourites(): string[] {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Saved items, kept in this browser. Like the media kit's posts, this is
 * the one bit of Radar that outlives a reload — something you saved to go
 * to should still be there tomorrow. (v2: the ids changed with the move to
 * real listings, so v1's saved mock ids are left behind.)
 */
export function useFavourites() {
  const [ids, setIds] = useState<string[]>(readFavourites);

  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(ids));
    } catch {
      // Storage blocked or full — saving silently fails rather than the tab.
    }
  }, [ids]);

  const toggle = useCallback((id: string) => {
    setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur]));
  }, []);

  const set = useMemo(() => new Set(ids), [ids]);
  return { ids, has: (id: string) => set.has(id), toggle };
}

// ---- dates --------------------------------------------------------------------

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const THIS_YEAR = TODAY.slice(0, 4);

/** "23 oct", or "28 jan 2027" when it is not this year. */
export const shortDate = (iso: string) =>
  `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}${iso.slice(0, 4) === THIS_YEAR ? '' : ` ${iso.slice(0, 4)}`}`;

/** One line that says when, in the terms that matter for the group. */
export function whenLine(item: RadarItem): string {
  if (item.group === 'call') {
    if (!item.deadline) return 'rolling · apply any time';
    const left = daysUntil(item.deadline);
    const tail = left === 0 ? 'today' : left === 1 ? 'tomorrow' : left <= 60 ? `in ${left} days` : '';
    return `closes ${shortDate(item.deadline)}${tail ? ` · ${tail}` : ''}`;
  }
  if (!item.start) return '';
  if (isOnNow(item) && item.end) return `on now · until ${shortDate(item.end)}`;
  if (item.end && item.end !== item.start) return `${shortDate(item.start)} – ${shortDate(item.end)}`;
  return shortDate(item.start);
}

/** Where, in one short line: the venue when it is known, then the city. */
export const placeLine = (item: RadarItem) =>
  item.precision === 'none' ? 'Online' : [item.venue || item.inst, item.city].filter(Boolean).join(' · ');
