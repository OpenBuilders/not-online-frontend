/**
 * ILLUSTRATIVE DATA for the Network tab only: made-up institutions, backers
 * and programmes that show how money and co-organising tie the field
 * together. The gallery runs on real events (radar.ts); this stays until
 * real links between institutions are mapped. The tab says so.
 */
import type { Door } from '@/data/artIndex';

/**
 * Radar's mock database.
 *
 * Every institution, sponsor and programme here is invented. That is a
 * deliberate choice rather than a placeholder: Radar marks some
 * organisations as ones *we* stand behind ("NOT pick"), and pinning that
 * mark — or its absence — on a real museum or a real sponsor would put an
 * endorsement in their mouth that nobody gave. The cities and their
 * coordinates are real, because the map has to be.
 *
 * Dates are written against late October 2026.
 */

// ---- places ---------------------------------------------------------------

export interface RadarCity {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export const CITIES: RadarCity[] = [
  { id: 'tbilisi', name: 'Tbilisi', country: 'Georgia', lat: 41.7151, lng: 44.8271 },
  { id: 'berlin', name: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.405 },
  { id: 'london', name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
  { id: 'paris', name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { id: 'lisbon', name: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393 },
  { id: 'istanbul', name: 'Istanbul', country: 'Türkiye', lat: 41.0082, lng: 28.9784 },
  { id: 'yerevan', name: 'Yerevan', country: 'Armenia', lat: 40.1792, lng: 44.4991 },
  { id: 'kassel', name: 'Kassel', country: 'Germany', lat: 51.3127, lng: 9.4797 },
  { id: 'basel', name: 'Basel', country: 'Switzerland', lat: 47.5596, lng: 7.5886 },
  { id: 'venice', name: 'Venice', country: 'Italy', lat: 45.4408, lng: 12.3155 },
  { id: 'newyork', name: 'New York', country: 'United States', lat: 40.7128, lng: -74.006 },
  { id: 'mexico', name: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332 },
  { id: 'saopaulo', name: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333 },
  { id: 'lagos', name: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792 },
  { id: 'seoul', name: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.978 },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
  { id: 'hongkong', name: 'Hong Kong', country: 'China', lat: 22.3193, lng: 114.1694 },
];

export const CITY_BY_ID: Record<string, RadarCity> = Object.fromEntries(CITIES.map((c) => [c.id, c]));

/** Where "you" can be. Local mode is everything in that city. */
export const HOME_CITIES = ['tbilisi', 'berlin', 'london'] as const;
export type HomeCityId = (typeof HOME_CITIES)[number];

// ---- institutions ---------------------------------------------------------

export type InstitutionKind =
  | 'museum'
  | 'kunsthalle'
  | 'gallery'
  | 'festival'
  | 'collective'
  | 'residency'
  | 'school'
  | 'foundation'
  | 'fund'
  | 'brand'
  | 'patron';

/** The kinds that pay for things rather than put them on. */
export const BACKER_KINDS: InstitutionKind[] = ['foundation', 'fund', 'brand', 'patron'];

export interface Institution {
  id: string;
  name: string;
  kind: InstitutionKind;
  cityId: string;
  /** One of ours: an organisation we know and stand behind. Shown as "NOT pick". */
  known: boolean;
  /** Standing in the art world, 1-5. Feeds "sort by standing" and the network. */
  weight: number;
  /** Who funds them. The vertical links in the network. */
  backers: string[];
  blurb: string;
}

export const INSTITUTIONS: Institution[] = [
  // the ones we stand behind
  { id: 'low-signal', name: 'Low Signal Collective', kind: 'collective', cityId: 'tbilisi', known: true, weight: 3, backers: ['atlas', 'grey-heron'], blurb: 'Artist-run, basement-based, allergic to wall text.' },
  { id: 'basement-nine', name: 'Basement Nine', kind: 'gallery', cityId: 'tbilisi', known: true, weight: 2, backers: ['grey-heron'], blurb: 'Nine rooms, one stair, no white cube.' },
  { id: 'nordwand', name: 'Kunsthalle Nordwand', kind: 'kunsthalle', cityId: 'berlin', known: true, weight: 4, backers: ['atlas', 'halcyon', 'kessler'], blurb: 'A public hall that still answers its email.' },
  { id: 'blank-biennial', name: 'Blank Biennial', kind: 'festival', cityId: 'lisbon', known: true, weight: 4, backers: ['atlas', 'meridian'], blurb: 'Every two years, a city-wide exhibition with no theme.' },
  { id: 'outpost', name: 'Outpost Residency', kind: 'residency', cityId: 'kassel', known: true, weight: 3, backers: ['kessler'], blurb: 'Studios in a former bus depot. Bring boots.' },
  { id: 'mono-school', name: 'Mono School', kind: 'school', cityId: 'london', known: true, weight: 3, backers: ['grey-heron', 'orbit'], blurb: 'Night classes for people who already make things.' },
  { id: 'atlas', name: 'Atlas Foundation for the Arts', kind: 'foundation', cityId: 'basel', known: true, weight: 5, backers: ['kessler'], blurb: 'Funds the unglamorous parts: rent, travel, time.' },
  { id: 'grey-heron', name: 'Grey Heron Trust', kind: 'fund', cityId: 'london', known: true, weight: 3, backers: [], blurb: 'Small grants, fast answers, no reports.' },

  // the rest of the field
  { id: 'meridian-museum', name: 'Meridian Museum of Now', kind: 'museum', cityId: 'newyork', known: false, weight: 5, backers: ['halcyon', 'meridian', 'saltwater'], blurb: 'Big rooms, bigger donor wall.' },
  { id: 'palais-vide', name: 'Palais Vide', kind: 'kunsthalle', cityId: 'paris', known: false, weight: 4, backers: ['orbit', 'halcyon'], blurb: 'Grand staircase, uncertain heating.' },
  { id: 'nine-dragons', name: 'Nine Dragons Art Centre', kind: 'museum', cityId: 'hongkong', known: false, weight: 4, backers: ['saltwater', 'meridian'], blurb: 'Harbour views and a very good shop.' },
  { id: 'hangar-sul', name: 'Hangar Sul', kind: 'gallery', cityId: 'saopaulo', known: false, weight: 3, backers: ['orbit'], blurb: 'A warehouse gallery on the edge of the centre.' },
  { id: 'eko-house', name: 'Eko House', kind: 'collective', cityId: 'lagos', known: false, weight: 3, backers: ['atlas'], blurb: 'Studios, a press, and a rooftop for screenings.' },
  { id: 'casa-tiempo', name: 'Casa Tiempo', kind: 'gallery', cityId: 'mexico', known: false, weight: 3, backers: ['kessler'], blurb: 'A house where every room is a show.' },
  { id: 'han-river', name: 'Han River Biennale', kind: 'festival', cityId: 'seoul', known: false, weight: 4, backers: ['meridian', 'orbit'], blurb: 'Large, ambitious, slightly overcatalogued.' },
  { id: 'kiln-tokyo', name: 'Kiln', kind: 'residency', cityId: 'tokyo', known: false, weight: 3, backers: ['saltwater'], blurb: 'Four studios and a shared kitchen in Setagaya.' },
  { id: 'golden-horn', name: 'Golden Horn Fair', kind: 'festival', cityId: 'istanbul', known: false, weight: 3, backers: ['halcyon'], blurb: 'An art fair that is mostly a party, honestly.' },
  { id: 'cascade-lab', name: 'Cascade Lab', kind: 'collective', cityId: 'yerevan', known: false, weight: 2, backers: ['grey-heron'], blurb: 'Media art and very long conversations.' },
  { id: 'lagoon-pavilion', name: 'Lagoon Pavilion', kind: 'gallery', cityId: 'venice', known: false, weight: 4, backers: ['saltwater', 'halcyon'], blurb: 'Open when the water allows.' },
  { id: 'spree-gallery', name: 'Spree Projects', kind: 'gallery', cityId: 'berlin', known: false, weight: 2, backers: ['orbit'], blurb: 'Commercial, but in a friendly way.' },
  { id: 'thames-fair', name: 'Thames Contemporary Fair', kind: 'festival', cityId: 'london', known: false, weight: 4, backers: ['halcyon', 'meridian'], blurb: 'Booths, badges, and very tired dealers.' },
  { id: 'vera-hall', name: 'Vera Hall', kind: 'kunsthalle', cityId: 'tbilisi', known: false, weight: 2, backers: ['halcyon'], blurb: 'A municipal hall with a new director.' },

  // the money
  { id: 'halcyon', name: 'Halcyon Bank Art Fund', kind: 'fund', cityId: 'london', known: false, weight: 5, backers: [], blurb: 'Collects, sponsors, and likes its logo large.' },
  { id: 'meridian', name: 'Meridian Motors Culture', kind: 'brand', cityId: 'newyork', known: false, weight: 4, backers: [], blurb: 'A car company with an art budget.' },
  { id: 'kessler', name: 'Kessler Family Trust', kind: 'patron', cityId: 'basel', known: false, weight: 5, backers: [], blurb: 'Old money, quiet, everywhere.' },
  { id: 'orbit', name: 'Orbit Telecom Arts', kind: 'brand', cityId: 'paris', known: false, weight: 3, backers: [], blurb: 'Sponsors anything with a screen in it.' },
  { id: 'saltwater', name: 'Saltwater Collectors Circle', kind: 'patron', cityId: 'hongkong', known: false, weight: 4, backers: [], blurb: 'Fifty collectors and a yacht.' },
];

export const INSTITUTION_BY_ID: Record<string, Institution> = Object.fromEntries(INSTITUTIONS.map((i) => [i.id, i]));

// ---- what is on -----------------------------------------------------------

/** The two halves of Radar: where to go, and where to apply. */
export type RadarGroup = 'event' | 'call';

export type EventType = 'exhibition' | 'festival' | 'fair' | 'talk' | 'screening' | 'party' | 'workshop';
export type CallType = 'residency' | 'grant' | 'open call' | 'commission' | 'fellowship' | 'prize';
export type RadarType = EventType | CallType;

export const EVENT_TYPES: EventType[] = ['exhibition', 'festival', 'fair', 'talk', 'screening', 'party', 'workshop'];
export const CALL_TYPES: CallType[] = ['open call', 'residency', 'grant', 'commission', 'fellowship', 'prize'];

/** From the original Radar's vibe chips. "closing soon" and "NOT pick" are worked out, not stored. */
export type Vibe = 'worth your time' | 'funded' | 'no bullshit' | 'free entry';

export interface RadarItem {
  id: string;
  group: RadarGroup;
  type: RadarType;
  title: string;
  orgId: string;
  /** Co-organisers — the horizontal links between institutions. */
  coOrgIds: string[];
  /** Sponsors of this one programme, on top of whoever funds the organiser. */
  sponsorIds: string[];
  venue: string;
  cityId: string;
  lat: number;
  lng: number;
  /** Events: when it opens. Calls: when it was announced. */
  start: string;
  /** Events: when it closes. */
  end?: string;
  /** Calls: when applications close. */
  deadline?: string;
  /** Calls: what you get. */
  offer?: string;
  /** Calls: what they want from you. */
  ask?: string;
  url: string;
  vibes: Vibe[];
  blurb: string;
  /** Days since it was added to Radar, for "newest first". */
  addedDaysAgo: number;
}

const u = (slug: string) => `https://example.com/radar/${slug}`;

export const RADAR_ITEMS: RadarItem[] = [
  // ---- Tbilisi ------------------------------------------------------------
  { id: 'e-tb-1', group: 'event', type: 'exhibition', title: 'Static, Mostly', orgId: 'low-signal', coOrgIds: ['basement-nine'], sponsorIds: [], venue: 'Basement Nine, Sololaki', cityId: 'tbilisi', lat: 41.689, lng: 44.8, start: '2026-10-24', end: '2026-12-06', url: u('static-mostly'), vibes: ['worth your time', 'free entry'], blurb: 'Twelve artists, one radio frequency, no wall text.', addedDaysAgo: 2 },
  { id: 'e-tb-2', group: 'event', type: 'party', title: 'Signal Loss — opening night', orgId: 'low-signal', coOrgIds: [], sponsorIds: [], venue: 'Courtyard, Marjanishvili', cityId: 'tbilisi', lat: 41.711, lng: 44.797, start: '2026-10-31', url: u('signal-loss'), vibes: ['free entry'], blurb: 'DJs from the collective, until the neighbours win.', addedDaysAgo: 1 },
  { id: 'e-tb-3', group: 'event', type: 'talk', title: 'Who pays for the room?', orgId: 'vera-hall', coOrgIds: [], sponsorIds: ['halcyon'], venue: 'Vera Hall', cityId: 'tbilisi', lat: 41.705, lng: 44.778, start: '2026-11-07', url: u('who-pays'), vibes: ['no bullshit'], blurb: 'Three directors and an accountant on how a show gets funded.', addedDaysAgo: 6 },
  { id: 'e-tb-4', group: 'event', type: 'workshop', title: 'Risograph in a weekend', orgId: 'basement-nine', coOrgIds: [], sponsorIds: [], venue: 'Basement Nine, Sololaki', cityId: 'tbilisi', lat: 41.6895, lng: 44.8008, start: '2026-11-14', end: '2026-11-15', url: u('riso-weekend'), vibes: ['worth your time'], blurb: 'Two days, two colours, one zine you made yourself.', addedDaysAgo: 3 },
  { id: 'e-tb-5', group: 'event', type: 'screening', title: 'Night shift films', orgId: 'vera-hall', coOrgIds: ['low-signal'], sponsorIds: [], venue: 'Vera Hall rooftop', cityId: 'tbilisi', lat: 41.7055, lng: 44.7785, start: '2026-11-21', url: u('night-shift'), vibes: ['free entry'], blurb: 'Short films shot after midnight, shown after midnight.', addedDaysAgo: 9 },
  { id: 'c-tb-1', group: 'call', type: 'open call', title: 'Basement Nine — spring programme', orgId: 'basement-nine', coOrgIds: [], sponsorIds: ['grey-heron'], venue: 'Basement Nine', cityId: 'tbilisi', lat: 41.6892, lng: 44.8004, start: '2026-10-10', deadline: '2026-11-02', offer: 'Solo show + €1,500 fee', ask: 'Portfolio + one paragraph', url: u('b9-spring'), vibes: ['funded', 'no bullshit'], blurb: 'Four solo slots for 2027. They read everything.', addedDaysAgo: 10 },
  { id: 'c-tb-2', group: 'call', type: 'grant', title: 'Low Signal micro-grants', orgId: 'low-signal', coOrgIds: [], sponsorIds: ['atlas'], venue: 'Online', cityId: 'tbilisi', lat: 41.715, lng: 44.765, start: '2026-10-01', deadline: '2026-12-15', offer: '€500, paid in a week', ask: 'Three sentences', url: u('ls-micro'), vibes: ['funded', 'no bullshit', 'worth your time'], blurb: 'Small money, fast, for things that need small money fast.', addedDaysAgo: 19 },

  // ---- Berlin -------------------------------------------------------------
  { id: 'e-be-1', group: 'event', type: 'exhibition', title: 'Nothing to Declare', orgId: 'nordwand', coOrgIds: [], sponsorIds: ['halcyon'], venue: 'Kunsthalle Nordwand, Wedding', cityId: 'berlin', lat: 52.5503, lng: 13.3504, start: '2026-10-17', end: '2027-01-24', url: u('nothing-to-declare'), vibes: ['worth your time'], blurb: 'A group show about customs, borders and the things we carry.', addedDaysAgo: 5 },
  { id: 'e-be-2', group: 'event', type: 'talk', title: 'The invoice as artwork', orgId: 'nordwand', coOrgIds: ['mono-school'], sponsorIds: [], venue: 'Nordwand auditorium', cityId: 'berlin', lat: 52.5505, lng: 13.3508, start: '2026-11-05', url: u('invoice'), vibes: ['no bullshit', 'free entry'], blurb: 'How artists price their time, said out loud.', addedDaysAgo: 4 },
  { id: 'e-be-3', group: 'event', type: 'exhibition', title: 'Soft Hardware', orgId: 'spree-gallery', coOrgIds: [], sponsorIds: ['orbit'], venue: 'Spree Projects, Kreuzberg', cityId: 'berlin', lat: 52.4987, lng: 13.4033, start: '2026-10-29', end: '2026-12-12', url: u('soft-hardware'), vibes: [], blurb: 'Sculpture made of cables, foam and slightly too much LED.', addedDaysAgo: 8 },
  { id: 'e-be-4', group: 'event', type: 'party', title: 'Closing party: Soft Hardware', orgId: 'spree-gallery', coOrgIds: [], sponsorIds: ['orbit'], venue: 'Spree Projects, Kreuzberg', cityId: 'berlin', lat: 52.4989, lng: 13.4036, start: '2026-12-12', url: u('soft-hardware-closing'), vibes: ['free entry'], blurb: 'Sponsored drinks, unsponsored dancing.', addedDaysAgo: 8 },
  { id: 'c-be-1', group: 'call', type: 'commission', title: 'Nordwand facade commission', orgId: 'nordwand', coOrgIds: [], sponsorIds: ['kessler'], venue: 'Kunsthalle Nordwand', cityId: 'berlin', lat: 52.5501, lng: 13.35, start: '2026-09-28', deadline: '2026-11-30', offer: '€18,000 production budget', ask: 'Proposal + budget sketch', url: u('nordwand-facade'), vibes: ['funded', 'worth your time'], blurb: 'Twelve metres of wall, twelve months on show.', addedDaysAgo: 22 },
  { id: 'c-be-2', group: 'call', type: 'residency', title: 'Spree studio, three months', orgId: 'spree-gallery', coOrgIds: [], sponsorIds: [], venue: 'Spree Projects, Neukölln studio', cityId: 'berlin', lat: 52.4811, lng: 13.4354, start: '2026-10-12', deadline: '2026-11-09', offer: 'Studio + €900/month', ask: 'CV + 10 images + €25 fee', url: u('spree-studio'), vibes: [], blurb: 'A studio, a show at the end, and an application fee.', addedDaysAgo: 9 },

  // ---- London -------------------------------------------------------------
  { id: 'e-lo-1', group: 'event', type: 'fair', title: 'Thames Contemporary', orgId: 'thames-fair', coOrgIds: [], sponsorIds: ['halcyon', 'meridian'], venue: 'Southbank halls', cityId: 'london', lat: 51.5055, lng: -0.116, start: '2026-10-29', end: '2026-11-01', url: u('thames'), vibes: [], blurb: '140 galleries, one coffee queue.', addedDaysAgo: 12 },
  { id: 'e-lo-2', group: 'event', type: 'workshop', title: 'Writing about your own work', orgId: 'mono-school', coOrgIds: [], sponsorIds: [], venue: 'Mono School, Bloomsbury', cityId: 'london', lat: 51.5226, lng: -0.1279, start: '2026-11-03', end: '2026-11-24', url: u('writing'), vibes: ['worth your time', 'no bullshit'], blurb: 'Four Tuesday evenings. You leave with a statement you do not hate.', addedDaysAgo: 7 },
  { id: 'e-lo-3', group: 'event', type: 'screening', title: 'Peckham after dark', orgId: 'mono-school', coOrgIds: ['grey-heron'], sponsorIds: [], venue: 'Car park roof, Peckham', cityId: 'london', lat: 51.4736, lng: -0.0693, start: '2026-11-12', url: u('peckham'), vibes: ['free entry'], blurb: 'Student films on a projector, in the cold.', addedDaysAgo: 3 },
  { id: 'c-lo-1', group: 'call', type: 'grant', title: 'Grey Heron quick grants', orgId: 'grey-heron', coOrgIds: [], sponsorIds: [], venue: 'Online', cityId: 'london', lat: 51.5265, lng: -0.0786, start: '2026-10-05', deadline: '2026-10-30', offer: 'Up to £2,000', ask: 'One page', url: u('grey-heron-quick'), vibes: ['funded', 'no bullshit'], blurb: 'Decided in ten days, paid in twenty.', addedDaysAgo: 15 },
  { id: 'c-lo-2', group: 'call', type: 'fellowship', title: 'Mono teaching fellowship', orgId: 'mono-school', coOrgIds: [], sponsorIds: ['orbit'], venue: 'Mono School, Hackney', cityId: 'london', lat: 51.545, lng: -0.0553, start: '2026-10-14', deadline: '2026-12-01', offer: 'Paid, one year, two days a week', ask: 'Statement + teaching idea', url: u('mono-fellow'), vibes: ['funded', 'worth your time'], blurb: 'Teach one evening class, make work the rest of the week.', addedDaysAgo: 6 },

  // ---- the rest of the world ---------------------------------------------
  { id: 'e-li-1', group: 'event', type: 'festival', title: 'Blank Biennial: no theme', orgId: 'blank-biennial', coOrgIds: ['atlas'], sponsorIds: ['meridian'], venue: 'Across Lisbon', cityId: 'lisbon', lat: 38.7223, lng: -9.1393, start: '2026-11-06', end: '2027-02-14', url: u('blank'), vibes: ['worth your time', 'free entry'], blurb: '60 artists, 14 venues, deliberately no curatorial statement.', addedDaysAgo: 11 },
  { id: 'c-li-1', group: 'call', type: 'open call', title: 'Blank Biennial — open slot', orgId: 'blank-biennial', coOrgIds: [], sponsorIds: ['atlas'], venue: 'Lisbon', cityId: 'lisbon', lat: 38.7139, lng: -9.1334, start: '2026-10-02', deadline: '2026-11-12', offer: 'Travel, fee, production', ask: 'Portfolio only', url: u('blank-open'), vibes: ['funded', 'no bullshit'], blurb: 'One artist picked from an open call, every edition.', addedDaysAgo: 18 },
  { id: 'e-pa-1', group: 'event', type: 'exhibition', title: 'Le Vide, encore', orgId: 'palais-vide', coOrgIds: [], sponsorIds: ['orbit', 'halcyon'], venue: 'Palais Vide', cityId: 'paris', lat: 48.8566, lng: 2.3522, start: '2026-10-22', end: '2027-03-01', url: u('le-vide'), vibes: [], blurb: 'A retrospective of an artist who mostly made empty rooms.', addedDaysAgo: 14 },
  { id: 'c-pa-1', group: 'call', type: 'prize', title: 'Orbit Screen Prize', orgId: 'palais-vide', coOrgIds: [], sponsorIds: ['orbit'], venue: 'Palais Vide', cityId: 'paris', lat: 48.8606, lng: 2.3376, start: '2026-09-20', deadline: '2026-12-20', offer: '€25,000 + show', ask: 'One moving-image work + €40 fee', url: u('orbit-prize'), vibes: ['funded'], blurb: 'For work with a screen in it. The sponsor is a phone company.', addedDaysAgo: 30 },
  { id: 'e-is-1', group: 'event', type: 'fair', title: 'Golden Horn Art Fair', orgId: 'golden-horn', coOrgIds: [], sponsorIds: ['halcyon'], venue: 'Shipyard, Haliç', cityId: 'istanbul', lat: 41.0352, lng: 28.95, start: '2026-11-19', end: '2026-11-22', url: u('golden-horn'), vibes: [], blurb: 'Fair by day, party by night, ferry in between.', addedDaysAgo: 5 },
  { id: 'e-ye-1', group: 'event', type: 'exhibition', title: 'Long Conversations', orgId: 'cascade-lab', coOrgIds: ['low-signal'], sponsorIds: ['grey-heron'], venue: 'Cascade Lab', cityId: 'yerevan', lat: 40.1792, lng: 44.4991, start: '2026-11-10', end: '2026-12-20', url: u('long-conversations'), vibes: ['worth your time'], blurb: 'Media art shown with the transcripts of how it was made.', addedDaysAgo: 4 },
  { id: 'c-ka-1', group: 'call', type: 'residency', title: 'Outpost winter residency', orgId: 'outpost', coOrgIds: [], sponsorIds: ['kessler'], venue: 'Outpost, former bus depot', cityId: 'kassel', lat: 51.3127, lng: 9.4797, start: '2026-10-08', deadline: '2026-11-20', offer: '3 months, studio, flat, €1,200/month', ask: 'Statement + 8 images', url: u('outpost-winter'), vibes: ['funded', 'worth your time', 'no bullshit'], blurb: 'Quiet, cold, productive. Heating is included.', addedDaysAgo: 12 },
  { id: 'c-ba-1', group: 'call', type: 'grant', title: 'Atlas travel grants', orgId: 'atlas', coOrgIds: [], sponsorIds: [], venue: 'Online', cityId: 'basel', lat: 47.5596, lng: 7.5886, start: '2026-09-15', deadline: '2027-01-31', offer: 'Up to CHF 4,000 for travel', ask: 'Where, why, how much', url: u('atlas-travel'), vibes: ['funded', 'no bullshit'], blurb: 'For going somewhere to make something. That is the whole brief.', addedDaysAgo: 35 },
  { id: 'e-ve-1', group: 'event', type: 'exhibition', title: 'High Water Marks', orgId: 'lagoon-pavilion', coOrgIds: [], sponsorIds: ['saltwater'], venue: 'Lagoon Pavilion', cityId: 'venice', lat: 45.4408, lng: 12.3155, start: '2026-11-01', end: '2027-02-28', url: u('high-water'), vibes: [], blurb: 'Painting about flooding, in a building that floods.', addedDaysAgo: 16 },
  { id: 'e-ny-1', group: 'event', type: 'exhibition', title: 'Now, Forever', orgId: 'meridian-museum', coOrgIds: [], sponsorIds: ['meridian', 'halcyon', 'saltwater'], venue: 'Meridian Museum of Now', cityId: 'newyork', lat: 40.7128, lng: -74.006, start: '2026-10-25', end: '2027-04-11', url: u('now-forever'), vibes: [], blurb: 'The collection, rehung, with a car in the lobby.', addedDaysAgo: 13 },
  { id: 'c-ny-1', group: 'call', type: 'fellowship', title: 'Meridian new media fellowship', orgId: 'meridian-museum', coOrgIds: [], sponsorIds: ['meridian'], venue: 'Meridian Museum of Now', cityId: 'newyork', lat: 40.7306, lng: -73.9866, start: '2026-10-01', deadline: '2026-11-15', offer: '$30,000 + studio', ask: 'Portfolio + 3 references + $50 fee', url: u('meridian-fellow'), vibes: ['funded'], blurb: 'Generous, prestigious, and very competitive.', addedDaysAgo: 20 },
  { id: 'e-mx-1', group: 'event', type: 'exhibition', title: 'Cuartos', orgId: 'casa-tiempo', coOrgIds: [], sponsorIds: ['kessler'], venue: 'Casa Tiempo, Roma Norte', cityId: 'mexico', lat: 19.4326, lng: -99.1332, start: '2026-11-08', end: '2026-12-18', url: u('cuartos'), vibes: ['worth your time'], blurb: 'Every room in the house given to a different artist.', addedDaysAgo: 6 },
  { id: 'e-sp-1', group: 'event', type: 'exhibition', title: 'Galpão', orgId: 'hangar-sul', coOrgIds: [], sponsorIds: ['orbit'], venue: 'Hangar Sul', cityId: 'saopaulo', lat: -23.5505, lng: -46.6333, start: '2026-11-15', end: '2027-01-10', url: u('galpao'), vibes: [], blurb: 'Large-scale installation in a working warehouse.', addedDaysAgo: 9 },
  { id: 'c-la-1', group: 'call', type: 'residency', title: 'Eko House press residency', orgId: 'eko-house', coOrgIds: [], sponsorIds: ['atlas'], venue: 'Eko House, Yaba', cityId: 'lagos', lat: 6.5244, lng: 3.3792, start: '2026-10-11', deadline: '2026-12-05', offer: '6 weeks, print studio, stipend', ask: 'A publication idea', url: u('eko-press'), vibes: ['funded', 'worth your time'], blurb: 'Make a book with a press that prints its own.', addedDaysAgo: 8 },
  { id: 'e-se-1', group: 'event', type: 'festival', title: 'Han River Biennale', orgId: 'han-river', coOrgIds: [], sponsorIds: ['meridian', 'orbit'], venue: 'Along the river', cityId: 'seoul', lat: 37.5665, lng: 126.978, start: '2026-10-30', end: '2027-01-15', url: u('han-river'), vibes: [], blurb: 'Big, ambitious, with a 400-page catalogue.', addedDaysAgo: 10 },
  { id: 'c-to-1', group: 'call', type: 'residency', title: 'Kiln spring residency', orgId: 'kiln-tokyo', coOrgIds: [], sponsorIds: ['saltwater'], venue: 'Kiln, Setagaya', cityId: 'tokyo', lat: 35.6762, lng: 139.6503, start: '2026-10-03', deadline: '2026-11-25', offer: '2 months, studio, kitchen', ask: 'Portfolio + ¥5,000 fee', url: u('kiln-spring'), vibes: [], blurb: 'Four studios. Shared kitchen. Shared everything, really.', addedDaysAgo: 17 },
  { id: 'e-hk-1', group: 'event', type: 'exhibition', title: 'Harbour Lights', orgId: 'nine-dragons', coOrgIds: [], sponsorIds: ['saltwater', 'meridian'], venue: 'Nine Dragons Art Centre', cityId: 'hongkong', lat: 22.3193, lng: 114.1694, start: '2026-11-04', end: '2027-02-02', url: u('harbour-lights'), vibes: [], blurb: 'Light installations facing the water.', addedDaysAgo: 7 },
];

export const ITEM_BY_ID: Record<string, RadarItem> = Object.fromEntries(RADAR_ITEMS.map((i) => [i.id, i]));

// ---- worked out, not stored -----------------------------------------------

/** The "today" Radar is written against. Fixed so the mock data stays sensible. */
export const RADAR_TODAY = '2026-10-20';

const DAY = 86_400_000;
export const daysUntil = (iso: string) => Math.round((Date.parse(iso) - Date.parse(RADAR_TODAY)) / DAY);

/** An application that closes within a fortnight. */
export const isClosingSoon = (item: RadarItem) =>
  item.group === 'call' && !!item.deadline && daysUntil(item.deadline) >= 0 && daysUntil(item.deadline) <= 14;

/** Run by, or co-run by, an organisation we stand behind. */
export const isNotPick = (item: RadarItem) =>
  [item.orgId, ...item.coOrgIds].some((id) => INSTITUTION_BY_ID[id]?.known);

/**
 * How much weight a programme carries in the field: the organiser's own
 * standing, plus everyone paying for it, directly or through the
 * organiser. It is what "sort by standing" sorts by, and it is the same
 * sum the network view draws.
 */
export function standing(item: RadarItem): number {
  const org = INSTITUTION_BY_ID[item.orgId];
  const backers = new Set([...(org?.backers ?? []), ...item.sponsorIds]);
  let score = (org?.weight ?? 0) * 2;
  backers.forEach((id) => (score += INSTITUTION_BY_ID[id]?.weight ?? 0));
  return score;
}

/**
 * How open each call is, on the same four-step scale as the Index: 4 open
 * to anyone, 3 apply with conditions, 2 through someone, 1 invitation.
 */
const CALL_DOORS: Record<string, Door> = {
  'c-tb-1': 4, 'c-tb-2': 3, 'c-be-1': 2, 'c-be-2': 3, 'c-lo-1': 4, 'c-lo-2': 2, 'c-li-1': 4,
  'c-pa-1': 3, 'c-ka-1': 3, 'c-ba-1': 3, 'c-ny-1': 2, 'c-la-1': 3, 'c-to-1': 3,
};
export const doorOf = (item: RadarItem): Door | null => (item.group === 'call' ? (CALL_DOORS[item.id] ?? 3) : null);

/** The date a card leads with: the deadline for a call, the opening for an event. */
export const keyDate = (item: RadarItem) => (item.group === 'call' ? (item.deadline ?? item.start) : item.start);

/** Great-circle distance in km, for "nearest first". */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

// ---- glossary ---------------------------------------------------------------

/**
 * In the media kit glossary's own shape, so Radar renders it with the same
 * component. `**phrase**` marks the part of each definition that is the
 * actual answer.
 */

// ---- helpers the Network tab used from the old gallery query ----------------

/** Still on: an event not yet closed, a call not yet past its deadline. */
export function isLive(item: RadarItem): boolean {
  if (item.group === 'call') return !item.deadline || daysUntil(item.deadline) >= 0;
  return daysUntil(item.end ?? item.start) >= 0;
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const shortDate = (iso: string) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;

export function whenLine(item: RadarItem): string {
  if (item.group === 'call' && item.deadline) return `closes ${shortDate(item.deadline)}`;
  if (item.end && item.end !== item.start) return `${shortDate(item.start)} – ${shortDate(item.end)}`;
  return shortDate(item.start);
}
