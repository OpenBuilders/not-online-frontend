import { useRef, useState } from 'react';
import { CircleJoinCta } from '@/components/cta/CircleJoinCta';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { PATRON_URL } from '@/data/links';
import { cx } from '@/lib/cx';
import { useAppState } from '@/state/AppStateContext';
import { ArchiveTab } from './ArchiveTab';
import { GlossaryTab } from './GlossaryTab';
import { PlanTab } from './PlanTab';
import styles from './SmmWindow.module.css';

type Tab = 'archive' | 'plan' | 'glossary';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'archive', label: 'Archive', icon: 'inbox' },
  { id: 'plan', label: 'Plan', icon: 'calendar_month' },
  { id: 'glossary', label: 'Glossary', icon: 'menu_book' },
];

/**
 * The SMM multitool. Ported in spirit from openSMM() (Tools.html:2665-2794),
 * which was a single flat panel — this is the same idea taken through the
 * whole loop a post actually travels.
 *
 * The rail order *is* the pipeline, and that is the only reason these
 * sections sit in one window: write it down (Archive), decide when it
 * goes out (Plan), and look a word up when either of them uses one
 * (Glossary). A creator moves down the rail, not around it.
 *
 * Bingo used to be a stop of its own and is now a panel inside Archive. It
 * was never a stage of that pipeline — it is what you do when the first
 * stage is blocked — and giving it a rail item implied a step everybody
 * had to walk through.
 *
 * Compose (GridCompositor) is parked: the component is still in the tree
 * and still builds, it just has no rail item. It is NOT part of what ships
 * to production — re-add its entry to TABS and its line below to bring it
 * back.
 *
 * The rail is icons until it is pointed at, then it opens over the
 * content rather than pushing it. Three labels do not need 150px of the
 * window's width standing by all the time, and expanding in flow would
 * reflow the calendar — which is aspect-ratio locked — on every pass of
 * the cursor.
 */
export function SmmWindow() {
  const { state, completeTour } = useAppState();
  const guest = !state.logged;
  const windowRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>('archive');

  /**
   * The guided demo, as a step index across both tabs: 0 New post, 1 save,
   * 2 the tray, 3 the calendar, 4 the join CTA.
   *
   * It only starts for a logged-out visitor with an empty archive. The
   * posts survive a reload now, so "has not seen it" cannot be read from
   * the tour set alone — someone coming back to their own drafts would
   * otherwise be walked through writing a demo post on top of them.
   */
  /** The join CTA, when something asked for it. One instance, mounted at
   *  the window so its scrim covers the whole thing. */
  const [cta, setCta] = useState<{ title?: string; sub?: string } | null>(null);

  const [demo, setDemo] = useState<number | null>(() =>
    !state.logged && !state.tours.has('smm') && state.smm.posts.length === 0 ? 0 : null
  );
  // Derived rather than cleared in an effect: logging in mid-run ends it
  // without a second render pass.
  const demoStep = guest ? demo : null;

  function goDemo(next: number | null) {
    // Either way it does not run again this session.
    if (next === null || next === 4) completeTour('smm');
    if (next === 4) {
      setDemo(null);
      setCta({});
      return;
    }
    setDemo(next);
    if (next === 2) setTab('plan');
  }
  /**
   * The post waiting for a calendar cell. Lives here rather than in either
   * tab because the hand-off crosses them: Archive starts it, Plan
   * finishes it, and the window is the only thing that sees both.
   */
  const [pickingFor, setPickingFor] = useState<string | null>(null);

  return (
    <div className={styles.window} ref={windowRef}>
      <div className={styles.rail}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={cx(styles.railItem, tab === t.id && styles.on)}
            onClick={() => {
              setTab(t.id);
              // Leaving by the rail abandons a pending pick, so Plan never
              // reopens still waiting for a cell.
              setPickingFor(null);
            }}
          >
            <MaterialIcon name={t.icon} size={18} />
            <span className={styles.railLabel}>{t.label}</span>
          </button>
        ))}
      </div>
      <div className={styles.body}>
        {/* Said once, at the top of the tool, rather than on each tab: it
            is true of everything in here. Stated plainly — there is no
            server behind this for a guest, and the posts really are only
            in this browser. */}
        {guest && (
          <p className={styles.localNote}>
            <MaterialIcon name="save" size={14} className={styles.noteIcon} />
            <span className={styles.noteText}>
              Your data is saved locally, in this browser only. Join us to keep your posts safe.
            </span>
            <button type="button" onClick={() => window.open(PATRON_URL, '_blank', 'noopener')}>
              Join
            </button>
          </p>
        )}

        {tab === 'archive' && (
          <ArchiveTab
            onPlan={() => setTab('plan')}
            onPickDate={(postId) => {
              setPickingFor(postId);
              setTab('plan');
            }}
            demoStep={demoStep !== null && demoStep <= 1 ? demoStep : null}
            onDemoNext={goDemo}
            containerRef={windowRef}
            onJoin={(title, sub) => setCta({ title, sub })}
          />
        )}
        {tab === 'plan' && (
          <PlanTab
            pickingFor={pickingFor}
            onPickDone={() => setPickingFor(null)}
            demoStep={demoStep !== null && demoStep >= 2 ? demoStep : null}
            onDemoNext={goDemo}
            containerRef={windowRef}
            onJoin={(title, sub) => setCta({ title, sub })}
          />
        )}
        {tab === 'glossary' && <GlossaryTab />}
      </div>

      {/* One CTA for the whole window: the end of the demo run, and every
          patron-only feature a guest reaches for. */}
      {cta && <CircleJoinCta title={cta.title} sub={cta.sub} onClose={() => setCta(null)} />}
    </div>
  );
}
