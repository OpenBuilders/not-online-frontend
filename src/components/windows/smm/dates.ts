/**
 * Calendar arithmetic, kept in local time on purpose.
 *
 * A post scheduled for "the 14th" means the 14th where the person sits, so
 * every key here is a `YYYY-MM-DD` string built from local getters rather
 * than `toISOString()`, which converts to UTC first and silently moves
 * anything scheduled in the evening to the next day for half the world.
 */

export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];

/** `YYYY-MM-DD` for a Date, in local time. */
export function dayKey(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function todayKey(): string {
  return dayKey(new Date());
}

export function monthLabel(year: number, month: number): string {
  return `${MONTHS[month]} ${year}`;
}

/** `SEP`, or `SEP / OCT` when the run crosses a month boundary. */
export function monthSpan(cells: { key: string }[]): string {
  const months = [...new Set(cells.map((c) => MONTHS[Number(c.key.slice(5, 7)) - 1].slice(0, 3)))];
  return months.join(' / ').toUpperCase();
}

/** Weekday initials rotated so the first column is `startKey`'s own day. */
export function weekdaysFrom(startKey: string): string[] {
  const [y, m, d] = startKey.split('-').map(Number);
  const offset = (new Date(y, m - 1, d).getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => WEEKDAYS[(offset + i) % 7]);
}

/**
 * A rolling run of days beginning at `startKey`, not a calendar month.
 *
 * The month view it replaced spent its first two rows on days that had
 * already happened and could never be dropped on — a third of the grid
 * permanently inert. Starting at today means every cell on screen is a
 * cell you can actually use, and the seven columns still line up as weeks
 * because the weekday labels rotate with the start (see `weekdaysFrom`).
 */
export function rollingGrid(startKey: string, days: number): RollingCell[] {
  const [y, m, d] = startKey.split('-').map(Number);
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(y, m - 1, d + i);
    const key = dayKey(date);
    return {
      key,
      date: date.getDate(),
      isToday: i === 0,
      /** First cell of a new month — the grid marks it so the run stays readable. */
      startsMonth: i > 0 && date.getDate() === 1,
      month: MONTHS[date.getMonth()].slice(0, 3),
    };
  });
}

export interface RollingCell {
  key: string;
  date: number;
  isToday: boolean;
  startsMonth: boolean;
  month: string;
}

export interface CalendarCell {
  key: string;
  date: number;
  /** Days spilling in from the neighbouring months, shown greyed. */
  outside: boolean;
  isToday: boolean;
  isPast: boolean;
}

/**
 * The full month as a 6x7 block, Monday-first, padded with the
 * neighbouring months' days so every row is complete. Always six rows —
 * a grid that changes height between months makes the whole tab jump.
 */
export function monthGrid(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month, 1);
  // getDay() is Sunday-first; this desktop's week starts on Monday.
  const lead = (first.getDay() + 6) % 7;
  const today = todayKey();

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(year, month, 1 - lead + i);
    const key = dayKey(d);
    return {
      key,
      date: d.getDate(),
      outside: d.getMonth() !== month,
      isToday: key === today,
      isPast: key < today,
    };
  });
}

/** The three-letter month of a `YYYY-MM-DD` key, e.g. `mar`. */
export function monthShort(key: string): string {
  return MONTHS[Number(key.slice(5, 7)) - 1].slice(0, 3);
}

/** The day-of-month of a `YYYY-MM-DD` key, without its leading zero. */
export function dayOfMonth(key: string): number {
  return Number(key.slice(8, 10));
}

/** "14 mar" — for the chip on a scheduled post in the archive list. */
export function shortDay(key: string): string {
  const [, m, d] = key.split('-');
  return `${Number(d)} ${MONTHS[Number(m) - 1].slice(0, 3)}`;
}
