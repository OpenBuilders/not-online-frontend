import { useEffect, useRef, useState } from 'react';
import { AeroButton } from '@/components/shared/AeroButton';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { PlatformIcon } from '@/components/shared/PlatformIcon';
import { SiteSelect } from '@/components/shared/SiteSelect';
import { LabelPill, toneForLabel } from '@/components/shared/LabelPill';
import { PLATFORMS, PLATFORM_BY_ID } from '@/data/smmHints';
import { cx } from '@/lib/cx';
import type { SmmPlatform, SmmPost, SmmPostDraft } from '@/types';
import { HintBulb } from './HintBulb';
import styles from './PostEditor.module.css';

interface PostEditorProps {
  /** null while creating — the editor seeds its own blank post in that case. */
  post: SmmPost | null;
  /** Prefilled field values for a new post. Used by the guest demo, which
   *  hands over a finished post rather than an empty form — this is still
   *  the create case, so saving adds rather than updates. */
  seed?: { title: string; body: string; platform: SmmPlatform; labels: string[] };
  onSave: (draft: SmmPostDraft) => Promise<void>;
  /** Sends one best-effort backup when the browser tab is leaving. */
  onBackup: (draft: SmmPostDraft) => void;
  onUploadPhotos: (draft: SmmPostDraft, files: File[]) => Promise<SmmPost | null>;
  onRemovePhoto: (photoId: string) => Promise<SmmPost | null>;
  onClose: () => void;
}

/**
 * Write one post. Takes over the whole Archive tab rather than opening as
 * a dialog: the window is 720px wide at its default size, and a modal
 * inside it would leave a body textarea about as wide as a phone.
 *
 * The hints column is the reason the platform picker sits at the top and
 * not at the bottom next to Save. Choosing where a post goes changes what
 * advice is worth reading and what the body should look like, so it is the
 * first decision here, the same way it is the first decision in reality.
 */
export function PostEditor({
  post,
  seed,
  onSave,
  onBackup,
  onUploadPhotos,
  onRemovePhoto,
  onClose,
}: PostEditorProps) {
  const [title, setTitle] = useState(post?.title ?? seed?.title ?? '');
  const [body, setBody] = useState(post?.body ?? seed?.body ?? '');
  const [platform, setPlatform] = useState<SmmPlatform>(post?.platform ?? seed?.platform ?? 'instagram');
  const [labels, setLabels] = useState<string[]>(post?.labels ?? seed?.labels ?? []);
  const [photos, setPhotos] = useState(post?.photos ?? []);
  const [labelDraft, setLabelDraft] = useState('');
  /** Touch has no hover, so a tap arms a label and the X appears. */
  const [pickedLabel, setPickedLabel] = useState<string | null>(null);
  // Only meaningful once the post has a slot. Plan owns *putting* it in the
  // calendar; this is for nudging one that is already there. The same edit
  // is on the card in the archive, which is where it usually gets made.
  const [day, setDay] = useState(post?.day ?? '');
  const fileRef = useRef<HTMLInputElement>(null);
  const draftRef = useRef<SmmPostDraft | null>(null);
  const dirtyRef = useRef(false);
  const scheduled = post?.status === 'scheduled';

  const info = PLATFORM_BY_ID[platform];
  const over = info.limit !== undefined && body.length > info.limit;

  function currentDraft(overrides: Partial<SmmPostDraft> = {}): SmmPostDraft {
    return {
      title: title.trim(),
      body,
      platform,
      labels,
      // A post that already has a slot keeps it, with whatever the two
      // fields below were changed to. Clearing the date is how you send it
      // back to the tray — the status has to follow, or a draft would sit
      // in the archive still claiming to be scheduled.
      status: scheduled && !day ? 'draft' : (post?.status ?? 'draft'),
      day: scheduled ? day || null : (post?.day ?? null),
      ...overrides,
    };
  }

  function addLabel() {
    const t = labelDraft.trim().replace(/^#/, '').toLowerCase();
    if (!t || labels.includes(t)) {
      setLabelDraft('');
      return;
    }
    const nextLabels = [...labels, t];
    dirtyRef.current = true;
    setLabels(nextLabels);
    setLabelDraft('');
  }

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    const saved = await onUploadPhotos(currentDraft(), Array.from(files));
    if (saved) setPhotos(saved.photos);
  }

  function save() {
    void onSave(currentDraft());
  }

  draftRef.current = currentDraft();

  useEffect(() => {
    const backup = () => {
      const draft = draftRef.current;
      if (!dirtyRef.current || !draft || (!draft.title && !draft.body && draft.labels.length === 0)) return;
      onBackup(draft);
    };
    window.addEventListener('pagehide', backup);
    return () => window.removeEventListener('pagehide', backup);
  }, [onBackup]);

  return (
    <div className={styles.editor}>
      <div className={styles.head}>
        <button type="button" className={styles.back} onClick={onClose}>
          <MaterialIcon name="arrow_back" size={16} />
          Archive
        </button>
        <div className={styles.headActions}>
          <AeroButton variant="lime" size="sm" onClick={save}>
            {post ? 'Save' : 'Add to archive'}
          </AeroButton>
        </div>
      </div>

      <div className={styles.cols}>
        <div className={styles.form}>
          {/* One sentence, read left to right: what this post is, then the
              two things that help you write it. Both helpers are popovers
              rather than panels — they hang off the button that opened
              them and float over the form instead of pushing it down,
              which matters now that the editor fits the window exactly. */}
          <div className={styles.where}>
            <span className={styles.whereLabel}>This post will be</span>

            <SiteSelect
              value={platform}
              onChange={(next) => {
                dirtyRef.current = true;
                setPlatform(next as SmmPlatform);
              }}
              ariaLabel="Where this post is going"
              options={PLATFORMS.map((p) => ({
                value: p.id,
                label: p.id === 'nowhere' ? 'posted nowhere' : `on ${p.label}`,
                icon: <PlatformIcon platform={p.id} size={14} />,
              }))}
            />

            <span className={styles.helpers}>
              <HintBulb title={`Writing for ${info.label}`} icon="tips_and_updates">
                <ul className={styles.hints}>
                  {info.hints.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </HintBulb>

              {info.templates.length > 0 && (
                <HintBulb title="Templates" icon="description">
                  <div className={styles.templates}>
                    {info.templates.map((t) => (
                      <button
                        key={t.label}
                        type="button"
                        className={styles.template}
                        // Replacing written work with a template would be a
                        // real loss, so a non-empty body has to be cleared
                        // deliberately before one can be dropped in.
                        disabled={body.trim().length > 0}
                        onClick={() => {
                          dirtyRef.current = true;
                          setBody(t.body);
                        }}
                        title={body.trim().length > 0 ? 'Clear the post first' : undefined}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </HintBulb>
              )}
            </span>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Working title</span>
            <input
              className={styles.input}
              value={title}
              onChange={(e) => {
                dirtyRef.current = true;
                setTitle(e.target.value);
              }}
              placeholder="what is this post, in four words"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>
              The post
              {info.limit !== undefined && (
                <span className={cx(styles.counter, over && styles.counterOver)}>
                  {body.length} / {info.limit}
                </span>
              )}
            </span>
            <textarea
              className={styles.textarea}
              value={body}
              onChange={(e) => {
                dirtyRef.current = true;
                setBody(e.target.value);
              }}
              placeholder="write it, or start from a template"
              rows={9}
            />
          </label>

          <div className={styles.field}>
            <span className={styles.label}>Labels</span>
            <div className={styles.labelRow}>
                {labels.map((t) => (
                  /* The X is hidden until the label is pointed at, or — where
                     there is no pointer — until it has been tapped once. A
                     row of pills each wearing a delete button reads as a
                     row of delete buttons. */
                  <span
                    key={t}
                    className={cx(styles.labelWrap, pickedLabel === t && styles.labelPicked)}
                    onClick={() => setPickedLabel((cur) => (cur === t ? null : t))}
                  >
                    <LabelPill tone={toneForLabel(t)} size="md" sticker>
                      {t}
                    </LabelPill>
                    <button
                      type="button"
                      className={styles.labelX}
                      onClick={(e) => {
                        e.stopPropagation();
                        dirtyRef.current = true;
                        setLabels(labels.filter((x) => x !== t));
                        setPickedLabel(null);
                      }}
                      aria-label={`Remove ${t}`}
                    >
                      <MaterialIcon name="close" size={12} />
                    </button>
                  </span>
                ))}
            <HintBulb title="Add a label" icon="add" variant="sticker" stickerLabel="add label" align="left">
              <div className={styles.labelAdd}>
                <input
                  className={styles.labelInput}
                  value={labelDraft}
                  onChange={(e) => setLabelDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      addLabel();
                    }
                  }}
                  placeholder="one word"
                  autoFocus
                />
                <button
                  type="button"
                  className={styles.addLabel}
                  onClick={addLabel}
                  disabled={!labelDraft.trim()}
                >
                  Add
                </button>
              </div>
            </HintBulb>
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Photos</span>
            <div className={styles.photos}>
              {photos.map((photo) => (
                <span key={photo.id} className={styles.photo}>
                  <img src={photo.url} alt="" />
                  <button
                    type="button"
                    onClick={() => {
                      void onRemovePhoto(photo.id).then((saved) => {
                        if (saved) setPhotos(saved.photos);
                      });
                    }}
                    aria-label="Remove photo"
                  >
                    <MaterialIcon name="close" size={13} />
                  </button>
                </span>
              ))}
              <button type="button" className={styles.addPhoto} onClick={() => fileRef.current?.click()}>
                <MaterialIcon name="add_photo_alternate" size={20} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  void addPhotos(e.target.files);
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
