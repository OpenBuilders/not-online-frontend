import { useState } from 'react';
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
  const { state } = useAppState();
  const guest = !state.logged;
  const [tab, setTab] = useState<Tab>('archive');

  /** The join CTA, when something asked for it. One instance, mounted at
   *  the window so its scrim covers the whole thing. */
  const [cta, setCta] = useState<{ title?: string; sub?: string } | null>(null);

  /**
   * The post waiting for a calendar cell. Lives here rather than in either
   * tab because the hand-off crosses them: Archive starts it, Plan
   * finishes it, and the window is the only thing that sees both.
   */
  const [pickingFor, setPickingFor] = useState<string | null>(null);
  /**
   * Bumped when Plan asks for a new post. A counter rather than a boolean
   * because the request can be made again after the editor has been
   * closed, and a boolean would have to be reset by the tab it was sent to.
   */
  const [newPostSignal, setNewPostSignal] = useState(0);

  return (
    <div className={styles.window}>
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
        {/* The guest sees the tool but cannot create browser-only drafts:
            every real post now belongs to the authenticated account. */}
        {guest && (
          <p className={styles.localNote}>
            <MaterialIcon name="save" size={14} className={styles.noteIcon} />
            <span className={styles.noteText}>
              Sign in to write posts. Your media kit then follows your account, not this browser.
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
            onJoin={(title, sub) => setCta({ title, sub })}
            newPostSignal={newPostSignal}
          />
        )}
        {tab === 'plan' && (
          <PlanTab
            pickingFor={pickingFor}
            onPickDone={() => setPickingFor(null)}
            onJoin={(title, sub) => setCta({ title, sub })}
            onNewPost={() => {
              setPickingFor(null);
              setTab('archive');
              setNewPostSignal((n) => n + 1);
            }}
          />
        )}
        {tab === 'glossary' && <GlossaryTab />}
      </div>

      {/* One CTA for the whole window and every patron-only feature. */}
      {cta && <CircleJoinCta title={cta.title} sub={cta.sub} onClose={() => setCta(null)} />}
    </div>
  );
}
