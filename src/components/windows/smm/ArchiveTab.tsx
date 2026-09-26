import { useMemo, useRef, useState, type RefObject } from 'react';
import { AeroButton } from '@/components/shared/AeroButton';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { FocusTour } from '@/components/shared/FocusTour';
import { BRAINSTORM_QUESTIONS } from '@/data/smmHints';
import { DEMO_POST } from '@/data/smmDemo';
import { cx } from '@/lib/cx';
import { useAppState } from '@/state/AppStateContext';
import type { SmmPost } from '@/types';
import styles from './ArchiveTab.module.css';
import { BingoPanel } from './BingoPanel';
import { PostCard } from './PostCard';
import { blankPost, newPostId } from './newPost';
import { PostEditor } from './PostEditor';

interface ArchiveTabProps {
  onPlan: () => void;
  /** Sends a post to Plan so a calendar cell can be picked for it. */
  onPickDate: (postId: string) => void;
  /** The guest demo's step while it is on this tab: 0 is New post, 1 is
   *  save. The window owns the number because the run crosses both tabs. */
  demoStep?: number | null;
  onDemoNext?: (step: number | null) => void;
  /** The window element the spotlight measures against and portals into. */
  containerRef?: RefObject<HTMLElement | null>;
  /** Opens the join CTA over the whole window. Patron-only features call
   *  it instead of opening. */
  onJoin: (title: string, sub: string) => void;
}

/** `new` is the create case, `demo` the same case with the guided demo's
 *  post already in the fields; a post object is the edit case. */
type Editing = SmmPost | 'new' | 'demo' | null;
/** At most one brainstorming surface is open at a time. */
type Panel = 'questions' | 'bingo' | null;


/**
 * The working list. Everything still to do is here; anything already
 * posted drops into a collapsed shelf at the bottom, so the list is always
 * a list of work rather than a growing history.
 *
 * Both brainstorming surfaces — the questions and the bingo board — open
 * from this toolbar rather than from the rail. Neither is a stage of the
 * pipeline: they are what you reach for when the first stage is blocked,
 * and each one replaces the list while it is open, because nobody is
 * scanning drafts and hunting for an idea in the same moment.
 */
export function ArchiveTab({
  onPlan,
  onPickDate,
  demoStep = null,
  onDemoNext,
  containerRef,
  onJoin,
}: ArchiveTabProps) {
  const { state, addSmmPost, updateSmmPost, removeSmmPost } = useAppState();
  const guest = !state.logged;
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [editing, setEditing] = useState<Editing>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [showPosted, setShowPosted] = useState(false);
  const newRef = useRef<HTMLButtonElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);
  /** Holds a new post after its first blur, before the editor has re-rendered
   * with that post as its prop. It prevents a blur immediately followed by
   * Save from creating the same post twice. */
  const autosavedPostRef = useRef<SmmPost | null>(null);
  const skipDemo = () => onDemoNext?.(null);

  function closeEditor() {
    autosavedPostRef.current = null;
    setEditing(null);
  }

  const posts = state.smm.posts;
  const { open, posted } = useMemo(
    () => ({
      open: posts.filter((p) => p.status !== 'posted'),
      posted: posts.filter((p) => p.status === 'posted'),
    }),
    [posts]
  );

  if (editing) {
    const post = editing === 'new' || editing === 'demo' ? null : editing;
    return (
      <>
      <PostEditor
        post={post}
        seed={editing === 'demo' ? DEMO_POST : undefined}
        saveRef={saveRef}
        onClose={closeEditor}
        onDelete={
          post
            ? () => {
                removeSmmPost(post.id);
                closeEditor();
              }
            : undefined
        }
        onAutoSave={(draft) => {
          const existing = post ?? autosavedPostRef.current;
          if (existing) {
            updateSmmPost(existing.id, draft);
            const saved = { ...existing, ...draft };
            autosavedPostRef.current = saved;
            setEditing(saved);
            return;
          }

          // Do not create empty cards just because someone tabs through an
          // untouched form. The first meaningful blur becomes the draft.
          if (!draft.title && !draft.body && draft.labels.length === 0 && draft.photos.length === 0) return;
          const saved = { ...draft, id: newPostId(), createdAt: Date.now() };
          autosavedPostRef.current = saved;
          addSmmPost(saved);
          setEditing(saved);
        }}
        onSave={(draft) => {
          const existing = post ?? autosavedPostRef.current;
          if (existing) updateSmmPost(existing.id, draft);
          else addSmmPost({ ...draft, id: newPostId(), createdAt: Date.now() });
          closeEditor();
          // Saved during the demo, so the run moves to Plan, where the
          // post is now sitting with no date on it.
          if (demoStep === 1) onDemoNext?.(2);
        }}
      />
      {demoStep === 1 && containerRef && (
        <FocusTour
          containerRef={containerRef}
          activeIndex={0}
          steps={[{ ref: saveRef, text: 'Already written. File it — you can edit it later.' }]}
          onSkip={skipDemo}
        />
      )}
      </>
    );
  }

  const openPanel = (which: Exclude<Panel, null>) => {
    // A guest never opens the board — the button is the lock, and what it
    // opens is the join CTA. Rendering the CTA *inside* the panel put its
    // scrim inside the tab, which left the window's header lit above it.
    if (which === 'bingo' && guest) {
      onJoin('Bingo is a patron thing', 'Nine prompts, two clicks each. Move the light, pick your role.');
      return;
    }
    setPanel(which);
  };

  return (
    <div className={styles.tab}>
      <div className={styles.toolbar}>
        {/* Wrapped because on a phone it leaves the toolbar entirely and
            sits at the foot of the tab, where a thumb is. */}
        <div className={styles.newWrap}>
          <AeroButton
            ref={newRef}
            variant="lime"
            size="sm"
            onClick={() => {
              // During the demo this opens the editor with a post already
              // in it, so the first thing a visitor sees the tool do is
              // the tool doing something.
              autosavedPostRef.current = null;
              setEditing(demoStep === 0 ? 'demo' : 'new');
              if (demoStep === 0) onDemoNext?.(1);
            }}
          >
            <MaterialIcon name="add" size={15} />
            New post
          </AeroButton>
        </div>

        <div className={styles.spacer} />

        {/* These are explicit views of the workspace, rather than toggles
            that rename themselves to Close. Posts returns to the default
            archive list; Stuck? and Bingo open their respective surfaces.

            The prompts are not offered to a guest at all. Unlike bingo and
            the wallpaper, there is nothing to show them behind a lock — a
            list of questions is its own whole feature, and a locked one
            would only be a list they can read but not use. */}
        {!guest && (
          <button
            type="button"
            className={cx(styles.ghost, panel === 'questions' && styles.ghostOn)}
            onClick={() => openPanel('questions')}
            aria-pressed={panel === 'questions'}
            aria-label="Stuck?"
          >
            <MaterialIcon name="lightbulb" size={15} />
            <span className={styles.ghostLabel}>Stuck?</span>
          </button>
        )}

        <button
          type="button"
          className={cx(styles.ghost, panel === 'bingo' && styles.ghostOn)}
          onClick={() => openPanel('bingo')}
          aria-pressed={panel === 'bingo'}
          aria-label="Bingo"
        >
          <MaterialIcon name="apps" size={15} />
          <span className={styles.ghostLabel}>Bingo</span>
        </button>

        <button
          type="button"
          className={cx(styles.ghost, panel === null && styles.ghostOn)}
          onClick={() => setPanel(null)}
          aria-pressed={panel === null}
          aria-label="Posts"
        >
          <MaterialIcon name="view_list" size={15} />
          <span className={styles.ghostLabel}>Posts</span>
        </button>

        <div className={styles.viewToggle} role="group" aria-label="View">
          <button
            type="button"
            className={cx(styles.viewBtn, view === 'list' && styles.viewOn)}
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
            title="List"
          >
            <MaterialIcon name="view_list" size={16} />
          </button>
          <button
            type="button"
            className={cx(styles.viewBtn, view === 'grid' && styles.viewOn)}
            onClick={() => setView('grid')}
            aria-pressed={view === 'grid'}
            title="Grid"
          >
            <MaterialIcon name="grid_view" size={16} />
          </button>
        </div>
      </div>

      {demoStep === 0 && containerRef && (
        <FocusTour
          containerRef={containerRef}
          activeIndex={0}
          steps={[{ ref: newRef, text: 'Start here. Everything begins as something written down.' }]}
          onSkip={skipDemo}
        />
      )}

      {panel === 'bingo' && <BingoPanel />}

      {panel === 'questions' && !guest && (
        <div className={cx(styles.questions, styles.scroll)}>
          <p className={styles.questionsHead}>Answer one of these out loud. The answer is the post.</p>
          <div className={styles.questionList}>
            {BRAINSTORM_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                className={styles.question}
                // A question you like becomes the title of a new draft, so
                // the thought does not have to be retyped from memory.
                onClick={() => addSmmPost(blankPost(q, ['idea']))}
              >
                {q}
                <MaterialIcon name="add" size={14} />
              </button>
            ))}
          </div>
        </div>
      )}

      {panel === null && (
        <div className={styles.scroll}>
          {open.length === 0 ? (
            <div className={styles.empty}>
              <MaterialIcon name="edit_note" size={34} />
              <p className={styles.emptyTitle}>Nothing written down yet</p>
              <p className={styles.emptyBody}>
                Ideas do not survive the walk home. Put one here as a draft — it does not have to be finished, or
                good.
              </p>
            </div>
          ) : (
            <>
              <div className={cx(styles.posts, styles[view])}>
                {open.map((p) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    view={view}
                    onOpen={() => {
                      autosavedPostRef.current = null;
                      setEditing(p);
                    }}
                    onTogglePosted={() => updateSmmPost(p.id, { status: 'posted' })}
                    onPickDate={() => onPickDate(p.id)}
                  />
                ))}
              </div>

              {/* The one nudge onward. Drafts with no date are the state
                  this tool exists to get people out of. */}
              {open.some((p) => p.status === 'draft') && (
                <button type="button" className={styles.next} onClick={onPlan}>
                  <MaterialIcon name="calendar_month" size={15} />
                  {open.filter((p) => p.status === 'draft').length} with no date — put them in the calendar
                  <MaterialIcon name="arrow_forward" size={14} />
                </button>
              )}
            </>
          )}

          {posted.length > 0 && (
            <div className={styles.shelf}>
              <button type="button" className={styles.shelfHead} onClick={() => setShowPosted((v) => !v)}>
                <MaterialIcon name={showPosted ? 'expand_more' : 'chevron_right'} size={16} />
                Posted
                <span className={styles.shelfCount}>{posted.length}</span>
              </button>
              {showPosted && (
                // Always a list, whichever view the working set is in. A
                // posted post is a record, and a record is read down a
                // column — the grid's tiles gave equal weight to work that
                // is finished and work that is not.
                <div className={cx(styles.posts, styles.list)}>
                  {posted.map((p) => (
                    <PostCard
                      key={p.id}
                      post={p}
                      view="list"
                      onOpen={() => {
                        autosavedPostRef.current = null;
                        setEditing(p);
                      }}
                      onTogglePosted={() => updateSmmPost(p.id, { status: p.day ? 'scheduled' : 'draft' })}
                      onDelete={() => removeSmmPost(p.id)}
                      onPickDate={() => onPickDate(p.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
