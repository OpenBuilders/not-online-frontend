import { useEffect, useMemo, useRef, useState } from 'react';
import { AeroButton } from '@/components/shared/AeroButton';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { BRAINSTORM_QUESTIONS } from '@/data/smmHints';
import { SiteSelect } from '@/components/shared/SiteSelect';
import { cx } from '@/lib/cx';
import { useMediaKit } from '@/hooks/useMediaKit';
import { backupMediaKitPost } from '@/api/mediaKit';
import { useAppState } from '@/state/AppStateContext';
import type { SmmPost, SmmPostDraft } from '@/types';
import styles from './ArchiveTab.module.css';
import { BingoPanel } from './BingoPanel';
import { PostCard } from './PostCard';
import { postDraft } from './newPost';
import { PostEditor } from './PostEditor';

interface ArchiveTabProps {
  onPlan: () => void;
  onPickDate: (postId: string) => void;
  onJoin: (title: string, sub: string) => void;
  /** Incremented by the window when another tab asks for a blank post. */
  newPostSignal?: number;
}

type Editing = SmmPost | 'new' | null;
type Panel = 'questions' | 'bingo' | null;

export function ArchiveTab({ onPlan, onPickDate, onJoin, newPostSignal = 0 }: ArchiveTabProps) {
  const { state } = useAppState();
  const { posts, createPost, updatePost, removePost, addPhotos, removePhoto } = useMediaKit();
  const guest = !state.logged;
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [editing, setEditing] = useState<Editing>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [showPosted, setShowPosted] = useState(false);
  /** Null is "everything". Kept as a plain string so a label that stops
   *  existing simply stops matching, instead of hiding the whole list. */
  const [labelFilter, setLabelFilter] = useState<string | null>(null);
  /** Set when a brainstorm question opens the editor, so the post starts
   *  as that question rather than as an empty form someone has to
   *  remember the question for. */
  const [seedTitle, setSeedTitle] = useState<string | null>(null);
  const lastNewPostSignal = useRef(newPostSignal);
  const autosavedPostRef = useRef<SmmPost | null>(null);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const editorSessionRef = useRef(0);

  // Opening the editor is the answer to an event in another tab, which is
  // exactly the case an effect is for: there is no render-time value that
  // says "Plan just asked for this".
  useEffect(() => {
    if (newPostSignal === lastNewPostSignal.current) return;
    lastNewPostSignal.current = newPostSignal;
    editorSessionRef.current += 1;
    autosavedPostRef.current = null;
    setSeedTitle(null);
    setPanel(null);
    setEditing('new');
  }, [newPostSignal]);

  function startNewPost() {
    if (guest) {
      onJoin('Posts need an account', 'Sign in to write a draft and keep it on every device.');
      return;
    }
    editorSessionRef.current += 1;
    autosavedPostRef.current = null;
    setSeedTitle(null);
    setEditing('new');
  }

  function closeEditor() {
    editorSessionRef.current += 1;
    autosavedPostRef.current = null;
    setSeedTitle(null);
    setEditing(null);
  }

  function queue<T>(operation: () => Promise<T>): Promise<T> {
    const next = saveQueueRef.current.then(operation, operation);
    saveQueueRef.current = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  }

  /** Every label in use, for the filter. Sorted so the list does not
   *  reshuffle itself as posts are edited. */
  const allLabels = useMemo(
    () => [...new Set(posts.flatMap((post) => post.labels))].sort((a, b) => a.localeCompare(b)),
    [posts],
  );

  const { open, posted } = useMemo(() => {
    const shown = labelFilter ? posts.filter((post) => post.labels.includes(labelFilter)) : posts;
    return {
      open: shown.filter((post) => post.status !== 'posted'),
      posted: shown.filter((post) => post.status === 'posted'),
    };
  }, [posts, labelFilter]);

  if (editing) {
    const post = editing === 'new' ? null : editing;
    const editorSession = editorSessionRef.current;
    const persistDraft = (draft: SmmPostDraft, forceCreate = false): Promise<SmmPost | null> =>
      queue(async () => {
        if (editorSession !== editorSessionRef.current) return null;
        const existing = autosavedPostRef.current ?? post;
        const meaningful = Boolean(draft.title || draft.body || draft.labels.length);
        if (!existing && !forceCreate && !meaningful) return null;

        try {
          const saved = existing ? await updatePost(existing, draft) : await createPost(draft);
          if (editorSession === editorSessionRef.current) {
            autosavedPostRef.current = saved;
            setEditing(saved);
          }
          return saved;
        } catch {
          return null;
        }
      });

    return (
      <PostEditor
        post={post}
        seed={
          !post && seedTitle
            ? { title: seedTitle, body: '', platform: 'instagram', labels: ['idea'] }
            : undefined
        }
        onClose={closeEditor}
        onBackup={(draft) => backupMediaKitPost(autosavedPostRef.current ?? post, draft)}
        onSave={async (draft) => {
          if (await persistDraft(draft, true)) closeEditor();
        }}
        onUploadPhotos={async (draft, files) => {
          const saved = await persistDraft(draft, true);
          if (!saved || editorSession !== editorSessionRef.current) return null;
          try {
            const updated = await queue(() => addPhotos(saved.id, files));
            if (editorSession === editorSessionRef.current) {
              autosavedPostRef.current = updated;
              setEditing(updated);
            }
            return updated;
          } catch {
            return null;
          }
        }}
        onRemovePhoto={async (photoId) => {
          if (editorSession !== editorSessionRef.current) return null;
          const saved = autosavedPostRef.current ?? post;
          if (!saved) return null;
          try {
            const updated = await queue(() => removePhoto(saved.id, photoId));
            if (editorSession === editorSessionRef.current) {
              autosavedPostRef.current = updated;
              setEditing(updated);
            }
            return updated;
          } catch {
            return null;
          }
        }}
      />
    );
  }

  function openPanel(which: Exclude<Panel, null>) {
    if (guest && which === 'bingo') {
      onJoin('Bingo is a patron thing', 'Nine prompts, two clicks each. Move the light, pick your role.');
      return;
    }
    setPanel(which);
  }

  return (
    <div className={styles.tab}>
      <div className={styles.toolbar}>
        {/* Everything that changes what the panel below shows, in the order
            it is reached for: the list itself, the two ways of getting
            unstuck, then how the list is narrowed and drawn. New post is
            the only thing here that makes something, so it sits apart, at
            the far end. */}
        <button
          type="button"
          className={cx(styles.ghost, panel === null && styles.ghostOn)}
          onClick={() => setPanel(null)}
          aria-pressed={panel === null}
          aria-label="Posts"
        >
          <MaterialIcon name="inbox" size={15} />
          <span className={styles.ghostLabel}>Posts</span>
        </button>

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

        {/* Only once there is something to filter by. An empty dropdown is
            a control that explains nothing and does nothing. */}
        {allLabels.length > 0 && (
          <SiteSelect
            value={labelFilter ?? ''}
            onChange={(next) => setLabelFilter(next || null)}
            ariaLabel="Filter by label"
            active={Boolean(labelFilter)}
            options={[{ value: '', label: 'all labels' }, ...allLabels.map((l) => ({ value: l, label: l }))]}
          />
        )}

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

        <div className={styles.spacer} />

        <div className={styles.newWrap}>
          <AeroButton variant="lime" size="sm" onClick={startNewPost} aria-label="New post" title="New post">
            <MaterialIcon name="add" size={17} />
          </AeroButton>
        </div>
      </div>

      {panel === 'bingo' && <BingoPanel />}

      {panel === 'questions' && !guest && (
        <div className={cx(styles.questions, styles.scroll)}>
          <p className={styles.questionsHead}>Answer one of these out loud. The answer is the post.</p>
          <div className={styles.questionList}>
            {BRAINSTORM_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                className={styles.question}
                onClick={() => {
                  // Straight into the editor with the question as the
                  // title. Creating it silently in the background left
                  // you looking at the same list of questions, with no
                  // sign that anything had happened.
                  editorSessionRef.current += 1;
                  autosavedPostRef.current = null;
                  setSeedTitle(question);
                  setPanel(null);
                  setEditing('new');
                }}
              >
                {question}
                <MaterialIcon name="add" size={14} />
              </button>
            ))}
          </div>
        </div>
      )}

      {panel === null && (
        <div className={styles.scroll}>
          {open.length === 0 ? (
            /* The empty state is the biggest target in the window and,
               until now, the only one that did nothing. Pointing at it
               turns the cursor itself into a plus — the whole panel is
               the button, so nothing inside it has to move to say so. */
            <button type="button" className={styles.empty} onClick={startNewPost}>
              <MaterialIcon name="edit_note" size={34} />
              <p className={styles.emptyTitle}>
                {labelFilter ? `Nothing labelled "${labelFilter}"` : 'Nothing written down yet'}
              </p>
              <p className={styles.emptyBody}>
                {labelFilter
                  ? 'Every post with this label is in the posted shelf, or there are none left.'
                  : 'Ideas do not survive the walk home. Put one here as a draft — it does not have to be finished, or good.'}
              </p>
            </button>
          ) : (
            <>
              <div className={cx(styles.posts, styles[view])}>
                {open.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    view={view}
                    onOpen={() => {
                      editorSessionRef.current += 1;
                      autosavedPostRef.current = post;
                      setEditing(post);
                    }}
                    onTogglePosted={() => void updatePost(post, postDraft(post, { status: 'posted' })).catch(() => undefined)}
                    onPickDate={() => onPickDate(post.id)}
                  />
                ))}
              </div>

              {open.some((post) => post.status === 'draft') && (
                <button type="button" className={styles.next} onClick={onPlan}>
                  <MaterialIcon name="calendar_month" size={15} />
                  {open.filter((post) => post.status === 'draft').length} with no date — put them in the calendar
                  <MaterialIcon name="arrow_forward" size={14} />
                </button>
              )}
            </>
          )}

          {posted.length > 0 && (
            <div className={styles.shelf}>
              <button type="button" className={styles.shelfHead} onClick={() => setShowPosted((value) => !value)}>
                <MaterialIcon name={showPosted ? 'expand_more' : 'chevron_right'} size={16} />
                Posted
                <span className={styles.shelfCount}>{posted.length}</span>
              </button>
              {showPosted && (
                <div className={cx(styles.posts, styles.list)}>
                  {posted.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      view="list"
                      onOpen={() => {
                        editorSessionRef.current += 1;
                        autosavedPostRef.current = post;
                        setEditing(post);
                      }}
                      onTogglePosted={() =>
                        void updatePost(post, postDraft(post, { status: post.day ? 'scheduled' : 'draft' })).catch(() => undefined)
                      }
                      onDelete={() => void removePost(post.id).catch(() => undefined)}
                      onPickDate={() => onPickDate(post.id)}
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
