import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { FocusTour } from '@/components/shared/FocusTour';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { Sticker } from '@/components/shared/Sticker';
import { PlatformIcon } from '@/components/shared/PlatformIcon';
import { TIMING_HINTS } from '@/data/smmHints';
import { cx } from '@/lib/cx';
import { useAppState } from '@/state/AppStateContext';
import type { SmmPost } from '@/types';
import { dayOfMonth, monthShort, monthSpan, rollingGrid, todayKey, weekdaysFrom } from './dates';
import { HintBulb } from './HintBulb';
import styles from './PlanTab.module.css';
import { WallpaperButton } from './WallpaperButton';

/** Four is where a day stops being a plan and becomes a spam run. */
const MAX_PER_DAY = 4;
/**
 * Six weeks, seven to a row. The columns are real weekdays — the grid
 * rolls from today, so they start on today's day and the header names
 * them once for the whole grid.
 *
 * Six rows rather than four is what squares the cells. Seven columns in
 * the width the side panel leaves fixes how wide a cell can be; the only
 * free variable is how many rows share the height, and at four they came
 * out half again as tall as they were wide. Six fills the same box with
 * square cells, and six weeks is a longer horizon than anyone plans past
 * anyway.
 */
const PAGE = 42;
const COLUMNS = 7;
const ROWS = PAGE / COLUMNS;

interface PlanTabProps {
  /** A post handed over from Archive, waiting for a cell. */
  pickingFor?: string | null;
  /** The guest demo's step while it is on this tab: 2 is the tray post, 3
   *  is the calendar. */
  demoStep?: number | null;
  onDemoNext?: (step: number | null) => void;
  /** The window element the spotlight measures against. */
  containerRef?: RefObject<HTMLElement | null>;
  /** Opens the join CTA over the whole window, for the wallpaper lock. */
  onJoin: (title: string, sub: string) => void;
  onPickDone?: () => void;
}

/**
 * The calendar, with a panel beside it that changes what it holds.
 *
 * The grid starts at *today* rather than at the first of the month: a
 * month view spent its first rows on days that had already happened and
 * could never be dropped on, so a third of it was permanently inert.
 *
 * A cell shows its date at poster size and its posts as dots. Titles used
 * to sit in the cell as chips, which meant the grid could only show one
 * clipped line of each and a busy week read as a wall of truncated text.
 * Dots say how full a day is at a glance, the hover card says what is in
 * it, and the panel on the right says it properly once the day is opened —
 * three levels of detail, each reached by doing less.
 *
 * Both restrictions are enforced rather than discouraged, because both
 * produce plans that cannot be executed: nothing lands on a day that has
 * gone, and no day takes more than four posts. A cell that cannot accept
 * what is being dragged never lights up, so it reads as a property of the
 * day rather than an error the person made.
 *
 * `pickingFor` is the second way in. Clicking the date on an archive card
 * sends the post here instead of opening a date picker: a picker asks you
 * to choose a day with no idea what is already on it, which is the single
 * thing this grid exists to show.
 */
export function PlanTab({ pickingFor = null, onPickDone, demoStep = null, onDemoNext, containerRef, onJoin }: PlanTabProps) {
  const { state, updateSmmPost } = useAppState();
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  /** The day whose contents the right-hand panel is showing. */
  const [openDay, setOpenDay] = useState<string | null>(null);

  /**
   * A post picked from the tray right here, as opposed to `pickingFor`,
   * which arrives from the archive.
   *
   * This is the only way to schedule a post on a phone. The tray drags
   * with the HTML5 drag-and-drop API, which no mobile browser implements
   * for touch — `dragstart` simply never fires from a finger, so the
   * grip did nothing there. Rather than hand-rolling a pointer drag into
   * 40px cells, a tap hands the post to the picker the archive already
   * uses. It works with a mouse too, and is faster than dragging.
   */
  const [localPick, setLocalPick] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const trayRef = useRef<HTMLDivElement>(null);

  const guest = !state.logged;
  const posts = state.smm.posts;
  const today = todayKey();
  const pickId = pickingFor ?? localPick;
  const picking = pickId ? (posts.find((p) => p.id === pickId) ?? null) : null;

  const endPick = useCallback(() => {
    setLocalPick(null);
    onPickDone?.();
  }, [onPickDone]);

  const start = useMemo(() => {
    const [y, m, d] = today.split('-').map(Number);
    const s = new Date(y, m - 1, d + offset * PAGE);
    return `${s.getFullYear()}-${`${s.getMonth() + 1}`.padStart(2, '0')}-${`${s.getDate()}`.padStart(2, '0')}`;
  }, [today, offset]);

  const cells = useMemo(() => rollingGrid(start, PAGE), [start]);
  const weekdays = useMemo(() => weekdaysFrom(start), [start]);

  const tray = posts.filter((p) => p.status === 'draft');

  const byDay = useMemo(() => {
    const map = new Map<string, SmmPost[]>();
    for (const p of posts) {
      if (!p.day || p.status === 'draft') continue;
      map.set(p.day, [...(map.get(p.day) ?? []), p]);
    }
    // Oldest draft first, so a day's order is the order they were written.
    for (const list of map.values()) list.sort((a, b) => a.createdAt - b.createdAt);
    return map;
  }, [posts]);

  // A day emptied from anywhere stops being the open day, so its cell
  // repaints the moment its last post leaves rather than staying dark.
  useEffect(() => {
    if (openDay && !byDay.has(openDay)) setOpenDay(null);
  }, [openDay, byDay]);

  useEffect(() => {
    if (!picking) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') endPick();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [picking, endPick]);

  function canDrop(key: string): boolean {
    if (key < today) return false;
    const here = byDay.get(key);
    // A post already in this day is a re-order, not a fifth arrival.
    if (dragging && here?.some((p) => p.id === dragging)) return true;
    return (here?.length ?? 0) < MAX_PER_DAY;
  }

  /**
   * Placing a post deliberately leaves the panel on the queue. Opening
   * the day it landed in swapped the queue away mid-flow, so emptying a
   * queue of six meant six trips back to it.
   */
  function drop(key: string) {
    const post = posts.find((p) => p.id === dragging);
    setOver(null);
    setDragging(null);
    if (!post) return;
    updateSmmPost(post.id, { status: 'scheduled', day: key });
  }

  const openPosts = openDay ? (byDay.get(openDay) ?? []) : [];
  // A day emptied from the panel stops being worth showing.
  const showDay = openDay !== null && openPosts.length > 0;

  return (
    <div className={styles.tab}>
      <div className={styles.main}>
        <div className={styles.head}>
          <button
            type="button"
            className={styles.nav}
            onClick={() => setOffset((o) => Math.max(0, o - 1))}
            disabled={offset === 0}
            aria-label="Earlier"
          >
            <MaterialIcon name="chevron_left" size={18} />
          </button>
          <button type="button" className={styles.nav} onClick={() => setOffset((o) => o + 1)} aria-label="Later">
            <MaterialIcon name="chevron_right" size={18} />
          </button>
          <div className={styles.month}>{monthSpan(cells)}</div>

          <WallpaperButton onJoin={onJoin} />

          {offset > 0 && (
            <button type="button" className={styles.today} onClick={() => setOffset(0)}>
              today
            </button>
          )}

          {/* Hidden for a guest, like the prompts in Archive. */}
          {!guest && (
            <HintBulb title="When to post">
              <ul className={styles.hints}>
                {TIMING_HINTS.map((h) => (
                  <li key={h.when}>
                    <b>{h.when}</b>
                    {h.why}
                  </li>
                ))}
              </ul>
            </HintBulb>
          )}
        </div>

        {picking && (
          <div className={styles.pickBar}>
            <MaterialIcon name="event" size={16} />
            <span>
              {picking.day ? 'Pick date to change' : 'Pick a day for'} — <b>{picking.title || 'Untitled'}</b>
            </span>
            <button type="button" className={styles.pickCancel} onClick={endPick}>
              Cancel
            </button>
          </div>
        )}

        <div className={styles.weekdays} style={{ ['--cols' as string]: COLUMNS }}>
          {weekdays.map((d, i) => (
            <span key={`${d}-${i}`}>{d}</span>
          ))}
        </div>

        <div
          ref={gridRef}
          className={cx(styles.grid, picking && styles.gridPicking)}
          style={{ ['--cols' as string]: COLUMNS, ['--rows' as string]: ROWS }}
        >
          {cells.map((cell, index) => {
            const dayPosts = byDay.get(cell.key) ?? [];
            const droppable = dragging !== null && canDrop(cell.key);
            const pickable = picking !== null && canDrop(cell.key);
            const filled = dayPosts.length > 0;
            return (
              <div
                key={cell.key}
                className={cx(
                  styles.cell,
                  filled && styles.filled,
                  cell.isToday && styles.todayCell,
                  openDay === cell.key && styles.openCell,
                  droppable && styles.droppable,
                  pickable && styles.pickable,
                  picking !== null && !pickable && styles.unpickable,
                  over === cell.key && droppable && styles.overCell
                )}
                onClick={() => {
                  if (picking) {
                    if (!pickable) return;
                    updateSmmPost(picking.id, { status: 'scheduled', day: cell.key });
                    endPick();
                    // The post now has a date, which is the end of the
                    // loop the demo set out to show.
                    if (demoStep === 3) onDemoNext?.(4);
                    return;
                  }
                  if (filled) setOpenDay(cell.key === openDay ? null : cell.key);
                }}
                onDragOver={(e) => {
                  if (!droppable) return;
                  e.preventDefault();
                  setOver(cell.key);
                }}
                onDragLeave={() => setOver((k) => (k === cell.key ? null : k))}
                onDrop={(e) => {
                  if (!droppable) return;
                  e.preventDefault();
                  drop(cell.key);
                }}
              >
                <span className={styles.date}>{cell.date}</span>

                {/* Only where the run crosses into a new month, which is
                    the one place a bare number is ambiguous. A stuck-on
                    tab rather than a label inside the cell: it is an event
                    in the run, not a property of that one day. */}
                {cell.startsMonth && (
                  // Centring goes through `style`, not CSS: Sticker writes
                  // its rotation as an inline transform, which would win
                  // over a translate in the stylesheet.
                  <Sticker
                    text={cell.month}
                    color="pink"
                    className={styles.monthTab}
                    style={{ transform: 'translateX(-50%) rotate(-7deg)' }}
                  />
                )}

                {/* One dot per post. How full a day is reads instantly;
                    what is in it is the hover card's job. */}
                {filled && (
                  <span className={styles.dots} aria-label={`${dayPosts.length} posts`}>
                    {dayPosts.map((p) => (
                      <span key={p.id} className={styles.dot} />
                    ))}
                  </span>
                )}

                {/* Shown on hover, and clipped by nothing — `.cell` keeps
                    `overflow: visible` so this can hang over its
                    neighbours. */}
                {filled && (
                  // Top row flips below the cell: above it, the card runs
                  // under the toolbar and loses its own heading.
                  <div className={cx(styles.peek, index < COLUMNS && styles.peekBelow)}>
                    <div className={styles.peekHead}>
                      {dayOfMonth(cell.key)} {monthShort(cell.key)}
                    </div>
                    <ul className={styles.peekList}>
                      {dayPosts.map((p) => (
                        <li key={p.id}>
                          <PlatformIcon platform={p.platform} size={11} />
                          <span>{p.title || 'Untitled'}</span>
                        </li>
                      ))}
                    </ul>
                    <div className={styles.peekFoot}>click to reveal the day</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* One panel, two contents. The queue is what you need while the
          calendar still has gaps; a day's contents are what you need once
          it does not — and they are never wanted at the same moment. */}
      <aside className={cx(styles.side, picking && styles.sideDim)}>
        {showDay && openDay ? (
          <>
            <div className={styles.sideHead}>
              <span className={styles.sideDate}>
                {dayOfMonth(openDay)} {monthShort(openDay)}
              </span>
              <button
                type="button"
                className={styles.sideClose}
                onClick={() => setOpenDay(null)}
                aria-label="Back to the queue"
              >
                <MaterialIcon name="close" size={15} />
              </button>
            </div>

            <div className={styles.dayList}>
              {openPosts.map((p) => (
                <div key={p.id} className={styles.dayItem}>
                  <span className={styles.dayThumb}>
                    {p.photos[0] ? <img src={p.photos[0]} alt="" /> : <PlatformIcon platform={p.platform} size={14} />}
                  </span>
                  <span className={styles.dayTitle}>{p.title || 'Untitled'}</span>
                  <button
                    type="button"
                    className={styles.dayRemove}
                    onClick={() => updateSmmPost(p.id, { status: 'draft', day: null })}
                    title="Back to the queue"
                  >
                    <MaterialIcon name="undo" size={13} />
                  </button>
                </div>
              ))}
            </div>

            <p className={styles.sideNote}>
              {openPosts.length} of {MAX_PER_DAY} slots used
            </p>
          </>
        ) : (
          <>
            <div className={styles.sideHead}>
              <span className={styles.sideTitle}>No date yet</span>
              <span className={styles.sideCount}>{tray.length}</span>
            </div>

            {tray.length === 0 ? (
              <p className={styles.sideNote}>Add a post in the archive and it shows up here.</p>
            ) : (
              <>
                <div className={styles.trayList}>
                  {tray.map((p, i) => (
                    <div
                      key={p.id}
                      ref={i === 0 ? trayRef : undefined}
                      className={cx(styles.trayItem, dragging === p.id && styles.trayItemDragging)}
                      draggable
                      onDragStart={() => setDragging(p.id)}
                      onDragEnd={() => {
                        setDragging(null);
                        setOver(null);
                      }}
                      role="button"
                      tabIndex={0}
                      title="Pick a day for this post"
                      onClick={() => {
                        setLocalPick(p.id);
                        if (demoStep === 2) onDemoNext?.(3);
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter' && e.key !== ' ') return;
                        e.preventDefault();
                        setLocalPick(p.id);
                        if (demoStep === 2) onDemoNext?.(3);
                      }}
                    >
                      <span className={styles.dayThumb}>
                        {p.photos[0] ? (
                          <img src={p.photos[0]} alt="" />
                        ) : (
                          <PlatformIcon platform={p.platform} size={14} />
                        )}
                      </span>
                      <span className={styles.dayTitle}>{p.title || 'Untitled'}</span>
                      {/* Hidden on touch, where dragging is not on offer —
                          a grip that cannot be dragged is a lie about the
                          control. */}
                      <MaterialIcon name="drag_indicator" size={15} className={styles.trayGrip} />
                    </div>
                  ))}
                </div>
                <p className={styles.sideNote}>Tap one, then tap a day — or drag it across</p>
              </>
            )}
          </>
        )}
      </aside>

      {(demoStep === 2 || demoStep === 3) && containerRef && (
        <FocusTour
          containerRef={containerRef}
          activeIndex={demoStep - 2}
          steps={[
            { ref: trayRef, text: 'It landed here, with no date on it. Pick it up.' },
            { ref: gridRef, text: 'Now give it a day. Any one from today on.' },
          ]}
          onSkip={() => onDemoNext?.(null)}
        />
      )}
    </div>
  );
}
