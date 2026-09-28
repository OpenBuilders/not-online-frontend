import { useMemo, useRef, useState } from 'react';
import { AeroButton } from '@/components/shared/AeroButton';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { BRAINSTORM_QUESTIONS } from '@/data/smmHints';
import { cx } from '@/lib/cx';
import { useMediaKit } from '@/hooks/useMediaKit';
import { backupMediaKitPost } from '@/api/mediaKit';
import { useAppState } from '@/state/AppStateContext';
import type { SmmPost, SmmPostDraft } from '@/types';
import styles from './ArchiveTab.module.css';
import { BingoPanel } from './BingoPanel';
import { PostCard } from './PostCard';
import { blankPost, postDraft } from './newPost';
import { PostEditor } from './PostEditor';

interface ArchiveTabProps {
  onPlan: () => void;
  onPickDate: (postId: string) => void;
  onJoin: (title: string, sub: string) => void;
}

type Editing = SmmPost | 'new' | null;
type Panel = 'questions' | 'bingo' | null;

export function ArchiveTab({ onPlan, onPickDate, onJoin }: ArchiveTabProps) {
  const { state } = useAppState();
  const { posts, createPost, updatePost, removePost, addPhotos, removePhoto } = useMediaKit();
  const guest = !state.logged;
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [editing, setEditing] = useState<Editing>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [showPosted, setShowPosted] = useState(false);
  const autosavedPostRef = useRef<SmmPost | null>(null);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const editorSessionRef = useRef(0);

  function closeEditor() {
    editorSessionRef.current += 1;
    autosavedPostRef.current = null;
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

  const { open, posted } = useMemo(
    () => ({
      open: posts.filter((post) => post.status !== 'posted'),
      posted: posts.filter((post) => post.status === 'posted'),
    }),
    [posts],
  );

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
        onClose={closeEditor}
        onDelete={
          post
            ? async () => {
                try {
                  await queue(() => removePost(post.id));
                  closeEditor();
                } catch {
                  // Keep the editor open when the delete could not reach the server.
                }
              }
            : undefined
        }
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
        <div className={styles.newWrap}>
          <AeroButton
            variant="lime"
            size="sm"
            onClick={() => {
              if (guest) {
                onJoin('Posts need an account', 'Sign in to write a draft and keep it on every device.');
                return;
              }
              editorSessionRef.current += 1;
              autosavedPostRef.current = null;
              setEditing('new');
            }}
          >
            <MaterialIcon name="add" size={15} />
            New post
          </AeroButton>
        </div>

        <div className={styles.spacer} />

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
                onClick={() => void createPost(blankPost(question, ['idea'])).catch(() => undefined)}
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
            <div className={styles.empty}>
              <MaterialIcon name="edit_note" size={34} />
              <p className={styles.emptyTitle}>Nothing written down yet</p>
              <p className={styles.emptyBody}>
                Ideas do not survive the walk home. Put one here as a draft — it does not have to be finished, or good.
              </p>
            </div>
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
