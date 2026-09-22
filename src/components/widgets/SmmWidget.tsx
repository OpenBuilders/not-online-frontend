import { useMemo, type RefObject } from 'react';
import { StickerFrame } from '@/components/widgets/StickerWidget';
import { WidgetShell } from '@/components/widgets/WidgetShell';
import { dayKey, shortDay, todayKey } from '@/components/windows/smm/dates';
import { cx } from '@/lib/cx';
import { useAppState } from '@/state/AppStateContext';
import { useWindowManager } from '@/state/WindowManagerContext';
import type { SmmPost } from '@/types';
import styles from './SmmWidget.module.css';

interface SmmWidgetProps {
  desktopRef: RefObject<HTMLElement | null>;
}

/** Dropped in by hand later; a missing file leaves a clean sticker. */
const ART_EMPTY = '/assets/builder/smm.png';
const ART_DRAFTS = '/assets/builder/smm-2.png';
/** How far past the featured day the run of squares reaches. */
const STRIP_DAYS = 7;

/**
 * Ported from Tools.html:1680-1686. Login-only (`.member`), same as Toolbox.
 *
 * This is the testbed for the second sticker format: no action button, the
 * whole face is the target, and a peel-off tab in the corner names the
 * tool instead of an icon disc. The button was costing 32px plus its
 * margin — a fifth of the card — to say what clicking the card already
 * says, and once it was gone each of the three faces had room for the
 * thing it actually reports.
 *
 * Which face shows is decided by how far through the tool's own loop the
 * person has got, so the desktop answers "what do I owe this week"
 * without the window being opened:
 *
 *   nothing written   -> the pitch, set along the bottom
 *   written, no dates -> the count, set as large as the card allows
 *   dates set         -> the next post in full, then the run after it
 *
 * Lime where the page builder is pink, with the corner tab inverting that.
 */
export function SmmWidget({ desktopRef }: SmmWidgetProps) {
  const { state } = useAppState();
  const { openWindow } = useWindowManager();
  const posts = state.smm.posts;
  const today = todayKey();

  const { drafts, scheduled, byDay } = useMemo(() => {
    const sched = posts
      .filter((p) => p.status === 'scheduled' && p.day)
      .sort((a, b) => (a.day as string).localeCompare(b.day as string));
    return {
      drafts: posts.filter((p) => p.status === 'draft').length,
      scheduled: sched,
      byDay: new Set(sched.map((p) => p.day as string)),
    };
  }, [posts]);

  /** The run of days shown as squares, starting the day after the featured one. */
  const strip = useMemo(() => {
    const first = scheduled.find((p) => (p.day as string) >= today) ?? scheduled[0];
    if (!first) return [];
    const [y, m, d] = (first.day as string).split('-').map(Number);
    return Array.from({ length: STRIP_DAYS }, (_, i) => {
      const date = new Date(y, m - 1, d + i + 1);
      const key = dayKey(date);
      return { key, date: date.getDate() };
    });
  }, [scheduled, today]);

  const next: SmmPost | undefined = scheduled.find((p) => (p.day as string) >= today) ?? scheduled[0];
  const face = next ? 'calendar' : drafts > 0 ? 'count' : 'empty';

  return (
    <WidgetShell id="widgetSMM" desktopRef={desktopRef} x={1140} y={100} dragAnywhere>
      {(hasMoved) => (
        <StickerFrame
          color="lime"
          rotate={-2}
          badge="Plan"
          badgeColor="pink"
          onActivate={() => {
            // The whole card is the target now, so the drag guard matters
            // more than it did: without it, every drag of this widget also
            // opened the window when the pointer came up.
            if (hasMoved.current) {
              hasMoved.current = false;
              return;
            }
            openWindow({ kind: 'smm', title: 'not media kit', width: 900, height: 640, singleton: true });
          }}
        >
          {face === 'empty' && (
            <div className={styles.face}>
              <img className={styles.art} src={ART_EMPTY} alt="" onError={hideArt} />
              <div className={styles.grow} />
              <div className={styles.lead}>
                post <b>nothing</b>
              </div>
              <div className={styles.kicker}>not media kit</div>
            </div>
          )}

          {face === 'count' && (
            <div className={styles.face}>
              <img className={cx(styles.art, styles.artDrafts)} src={ART_DRAFTS} alt="" onError={hideArt} />
              <div className={styles.grow} />
              <div className={styles.countRow}>
                <span className={styles.number}>{drafts}</span>
                <span className={styles.numberWord}>{drafts === 1 ? 'draft' : 'drafts'}</span>
              </div>
              <div className={styles.kicker}>nothing scheduled</div>
            </div>
          )}

          {face === 'calendar' && next && (
            <div className={styles.face}>
              <div className={styles.todayRow}>
                today is
                <span className={styles.todayPill}>{shortDay(today)}</span>
              </div>

              {/* The featured day, drawn as an oversized version of one of
                  the squares below it — same fill, so the run reads as a
                  continuation of it rather than a separate widget. The
                  month sits under the number rather than beside it: the
                  run below can cross into the next month, and "24" alone
                  stops meaning anything once it does. */}
              <div className={styles.feature}>
                <span className={styles.featureLabel}>closest post</span>
                <div className={styles.featureBody}>
                  <span className={styles.featureDate}>
                    {Number((next.day as string).slice(8))}
                    <span className={styles.featureMonth}>{shortDay(next.day as string).split(' ')[1]}</span>
                  </span>
                  <span className={styles.featureTitle}>{next.title || 'Untitled'}</span>
                </div>
              </div>

              <div className={styles.strip} aria-hidden="true">
                {strip.map((c) => (
                  <span key={c.key} className={cx(styles.day, byDay.has(c.key) && styles.dayOn)}>
                    {c.date}
                  </span>
                ))}
              </div>
            </div>
          )}
        </StickerFrame>
      )}
    </WidgetShell>
  );
}

/** A widget whose artwork has not been drawn yet reads as a clean sticker. */
function hideArt(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = 'none';
}
