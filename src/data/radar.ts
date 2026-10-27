import type { GlossarySection } from '@/data/smmGlossary';
import { RADAR_ITEMS, type CallType, type EventType, type RadarItem } from '@/data/radarEvents';

/**
 * Radar's data layer over the real listings (radarEvents.ts, generated):
 * the date maths, the cities, what counts as live, and the glossary.
 */

export { RADAR_ITEMS };
export type { CallType, EventType, RadarGroup, RadarItem, RadarType } from '@/data/radarEvents';

export const EVENT_TYPES: EventType[] = ['exhibition', 'fair', 'biennial', 'art week', 'auction'];
export const CALL_TYPES: CallType[] = ['open call', 'residency', 'grant', 'prize', 'education'];

export const ITEM_BY_ID: Record<string, RadarItem> = Object.fromEntries(RADAR_ITEMS.map((i) => [i.id, i]));

// ---- dates ------------------------------------------------------------------

const pad = (n: number) => String(n).padStart(2, '0');
const d = new Date();
/** Today in the viewer's own calendar: the listings are real, so is the date. */
export const TODAY = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const DAY = 86_400_000;
export const daysUntil = (iso: string) => Math.round((Date.parse(iso) - Date.parse(TODAY)) / DAY);

/** A call that closes within two weeks. */
export const isClosingSoon = (item: RadarItem) =>
  item.group === 'call' && !!item.deadline && daysUntil(item.deadline) >= 0 && daysUntil(item.deadline) <= 14;

/** An event that has opened and not yet closed. */
export const isOnNow = (item: RadarItem) =>
  item.group === 'event' && !!item.start && !!item.end && item.start <= TODAY && item.end >= TODAY;

/** Still worth showing: an event not yet over, a call not yet past its deadline (rolling calls always). */
export function isLive(item: RadarItem): boolean {
  if (item.group === 'call') return !item.deadline || daysUntil(item.deadline) >= 0;
  return !!item.end && daysUntil(item.end) >= 0;
}

/**
 * The date a listing is ordered by: the deadline for a call, the opening
 * for an event — or today, for one already on. Rolling calls sort last.
 */
export function keyDate(item: RadarItem): string {
  if (item.group === 'call') return item.deadline ?? '9999-12-31';
  return item.start && item.start < TODAY ? TODAY : (item.start ?? '9999-12-31');
}

// ---- NOT picks ----------------------------------------------------------------

/**
 * Organisers we stand behind, by their Index name. Empty on purpose: on
 * real institutions a NOT pick is a public endorsement, and that list is
 * ours to write by hand, not something to infer. Add names here and the
 * stickers, the map rings and the "NOT picks only" filter all appear.
 */
export const NOT_PICKS: string[] = [];
export const isNotPick = (item: RadarItem) => NOT_PICKS.includes(item.inst);

// ---- cities -----------------------------------------------------------------

export interface RadarCity {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  count: number;
}

/**
 * Every city with something in it, placed at the middle of its pins (a
 * city's own centre when nothing in it is placed closer), busiest first.
 */
export const CITIES: RadarCity[] = (() => {
  const by = new Map<string, RadarItem[]>();
  RADAR_ITEMS.forEach((i) => i.lat !== null && by.set(i.cityId, [...(by.get(i.cityId) ?? []), i]));
  return [...by.entries()]
    .map(([id, list]) => {
      const placed = list.filter((i) => i.lat !== null && i.lng !== null);
      const home = list.find((i) => i.city.toLowerCase().replace(/[^a-z]+/g, '-') === id) ?? list[0];
      return {
        id,
        name: home.city,
        country: home.country,
        lat: placed.reduce((s, i) => s + i.lat!, 0) / placed.length,
        lng: placed.reduce((s, i) => s + i.lng!, 0) / placed.length,
        count: list.length,
      };
    })
    .sort((a, b) => b.count - a.count);
})();
export const CITY_BY_ID: Record<string, RadarCity> = Object.fromEntries(CITIES.map((c) => [c.id, c]));

/** The cities with a drawn local map (cityMaps.ts), in the order the picker lists them. */
export const MAPPED_CITY_IDS = [
  'london', 'new-york', 'paris', 'los-angeles', 'miami', 'hong-kong', 'seoul',
  'berlin', 'amsterdam', 'basel', 'shanghai', 'madrid', 'venice',
] as const;

/** Great-circle distance in km. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// ---- glossary -----------------------------------------------------------------

export const RADAR_GLOSSARY: GlossarySection[] = [
  {
    id: 'applying',
    tone: 'pink',
    label: 'applying',
    kicker: 'the words on an open call',
    terms: [
      { term: 'open call', body: 'anyone can apply — the opposite of an **invitation-only** programme. read who "anyone" actually means before you start.' },
      { term: 'application fee', body: 'money you pay to be considered. common, but a call that **charges you to apply** is worth a second look at who it is for.' },
      { term: 'statement', body: 'a short text on what you make and why. one honest paragraph **beats a page of theory**.' },
      { term: 'stipend', body: 'a fixed sum for living while you work — **not a fee for the work itself**.' },
      { term: 'honorarium', body: 'a one-off payment for a talk, a workshop or a contribution. usually **smaller than it sounds**.' },
      { term: 'production budget', body: 'money for making the piece, kept separate from what you are paid. **ask which one a number is**.' },
    ],
  },
  {
    id: 'doors',
    tone: 'ink',
    label: 'getting in',
    kicker: 'the four doors in the index',
    terms: [
      { term: 'open to anyone', body: 'an open call, open show or competition. **you can apply today**, sometimes with a fee.' },
      { term: 'apply', body: 'an open application with conditions: age, country, years of practice. **read the small print first**.' },
      { term: 'through someone', body: 'needs a gallery, a curator, a nomination or **your country\'s arts fund** to put you forward.' },
      { term: 'invitation only', body: 'they choose. the way in is **a track record they notice**, not a form.' },
      { term: 'nomination', body: 'someone already inside **puts your name forward**. you usually cannot nominate yourself.' },
      { term: 'tier', body: 'A, B or C: **weight within its own field**. an A school and an A fair are heavy in different ways.' },
    ],
  },
  {
    id: 'going',
    tone: 'lime',
    label: 'going',
    kicker: 'the words on an invitation',
    terms: [
      { term: 'vernissage', body: 'the opening night. **the party**, more than the show.' },
      { term: 'finissage', body: 'the closing night. quieter, and often **the better time** to actually see the work.' },
      { term: 'biennial', body: 'a large exhibition every **two years**, usually spread across a city.' },
      { term: 'kunsthalle', body: 'a public exhibition hall **with no collection of its own** — it only shows, never keeps.' },
      { term: 'artist-run space', body: 'a venue **run by artists** rather than by an institution or a dealer.' },
    ],
  },
  {
    id: 'money',
    tone: 'ink',
    label: 'the money',
    kicker: 'who pays for any of it',
    terms: [
      { term: 'patron', body: 'a person or family who funds art **privately**, often for decades.' },
      { term: 'corporate sponsor', body: 'a company paying for visibility. **the logo is the point** — read who it is.' },
      { term: 'foundation', body: 'an organisation set up to **give money away** for a stated purpose.' },
      { term: 'NOT pick', body: 'our mark: an organisation **we know and stand behind**. no mark does not mean bad — just not ours to vouch for.' },
    ],
  },
];
