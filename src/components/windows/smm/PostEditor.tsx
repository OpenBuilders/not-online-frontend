import { useRef, useState, type RefObject } from 'react';
import { AeroButton } from '@/components/shared/AeroButton';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { PlatformIcon } from '@/components/shared/PlatformIcon';
import { LabelPill, toneForLabel } from '@/components/shared/LabelPill';
import { PLATFORMS, PLATFORM_BY_ID } from '@/data/smmHints';
import { cx } from '@/lib/cx';
import type { SmmPlatform, SmmPost } from '@/types';
import styles from './PostEditor.module.css';

interface PostEditorProps {
  /** null while creating — the editor seeds its own blank post in that case. */
  post: SmmPost | null;
  /** Prefilled field values for a new post. Used by the guest demo, which
   *  hands over a finished post rather than an empty form — this is still
   *  the create case, so saving adds rather than updates. */
  seed?: { title: string; body: string; platform: SmmPlatform; labels: string[] };
  /** Lets the demo's spotlight find the save button. */
  saveRef?: RefObject<HTMLButtonElement | null>;
  onSave: (draft: Omit<SmmPost, 'id' | 'createdAt'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
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
export function PostEditor({ post, seed, saveRef, onSave, onDelete, onClose }: PostEditorProps) {
  const [title, setTitle] = useState(post?.title ?? seed?.title ?? '');
  const [body, setBody] = useState(post?.body ?? seed?.body ?? '');
  const [platform, setPlatform] = useState<SmmPlatform>(post?.platform ?? seed?.platform ?? 'instagram');
  const [labels, setLabels] = useState<string[]>(post?.labels ?? seed?.labels ?? []);
  const [photos, setPhotos] = useState<string[]>(post?.photos ?? []);
  const [labelDraft, setLabelDraft] = useState('');
  // Only meaningful once the post has a slot. Plan owns *putting* it in the
  // calendar; this is for nudging one that is already there. The same edit
  // is on the card in the archive, which is where it usually gets made.
  const [day, setDay] = useState(post?.day ?? '');
  const fileRef = useRef<HTMLInputElement>(null);
  const scheduled = post?.status === 'scheduled';

  const info = PLATFORM_BY_ID[platform];
  const over = body.length > info.limit;

  function addLabel() {
    const t = labelDraft.trim().replace(/^#/, '').toLowerCase();
    if (!t || labels.includes(t)) {
      setLabelDraft('');
      return;
    }
    setLabels([...labels, t]);
    setLabelDraft('');
  }

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    const urls = await Promise.all(Array.from(files).map(readAsDataUrl));
    setPhotos((prev) => [...prev, ...urls]);
  }

  function save() {
    onSave({
      title: title.trim(),
      body,
      platform,
      labels,
      photos,
      // A post that already has a slot keeps it, with whatever the two
      // fields below were changed to. Clearing the date is how you send it
      // back to the tray — the status has to follow, or a draft would sit
      // in the archive still claiming to be scheduled.
      status: scheduled && !day ? 'draft' : (post?.status ?? 'draft'),
      day: scheduled ? day || null : (post?.day ?? null),
    });
  }

  return (
    <div className={styles.editor}>
      <div className={styles.head}>
        <button type="button" className={styles.back} onClick={onClose}>
          <MaterialIcon name="arrow_back" size={16} />
          Archive
        </button>
        <div className={styles.headActions}>
          {onDelete && (
            <button type="button" className={styles.delete} onClick={onDelete}>
              <MaterialIcon name="delete" size={15} />
              Delete
            </button>
          )}
          <AeroButton ref={saveRef} variant="lime" size="sm" onClick={save}>
            {post ? 'Save' : 'Add to archive'}
          </AeroButton>
        </div>
      </div>

      <div className={styles.cols}>
        <div className={styles.form}>
          <div className={styles.platforms} role="group" aria-label="Platform">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={cx(styles.platform, platform === p.id && styles.platformOn)}
                onClick={() => setPlatform(p.id)}
                aria-pressed={platform === p.id}
              >
                <PlatformIcon platform={p.id} size={15} />
                {p.label}
              </button>
            ))}
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Working title</span>
            <input
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="what is this post, in four words"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>
              The post
              <span className={cx(styles.counter, over && styles.counterOver)}>
                {body.length} / {info.limit}
              </span>
            </span>
            <textarea
              className={styles.textarea}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="write it, or start from a template on the right"
              rows={9}
            />
          </label>

          {scheduled && (
            <div className={styles.field}>
              <span className={styles.label}>Scheduled for</span>
              <div className={styles.when}>
                <input className={styles.date} type="date" value={day} onChange={(e) => setDay(e.target.value)} />
                {day && (
                  <button type="button" className={styles.unschedule} onClick={() => setDay('')}>
                    <MaterialIcon name="close" size={13} />
                    Back to drafts
                  </button>
                )}
              </div>
            </div>
          )}

          <div className={styles.field}>
            <span className={styles.label}>Labels</span>
            <div className={styles.labelRow}>
              {labels.map((t) => (
                <span key={t} className={styles.labelWrap}>
                  <LabelPill tone={toneForLabel(t)} size="md" sticker>
                    {t}
                  </LabelPill>
                  <button
                    type="button"
                    className={styles.labelX}
                    onClick={() => setLabels(labels.filter((x) => x !== t))}
                    aria-label={`Remove ${t}`}
                  >
                    <MaterialIcon name="close" size={12} />
                  </button>
                </span>
              ))}
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
                onBlur={addLabel}
                placeholder="add a label"
              />
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Photos</span>
            <div className={styles.photos}>
              {photos.map((src, i) => (
                <span key={src.slice(-40) + i} className={styles.photo}>
                  <img src={src} alt="" />
                  <button
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
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

        <aside className={styles.side}>
          <div className={styles.sideHead}>
            <MaterialIcon name="tips_and_updates" size={14} />
            {info.label}
          </div>

          <ul className={styles.hints}>
            {info.hints.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>

          <div className={styles.sideHead}>
            <MaterialIcon name="description" size={14} />
            Templates
          </div>
          <div className={styles.templates}>
            {info.templates.map((t) => (
              <button
                key={t.label}
                type="button"
                className={styles.template}
                // Replacing written work with a template would be a real
                // loss, so a non-empty body has to be cleared deliberately
                // before one can be dropped in.
                disabled={body.trim().length > 0}
                onClick={() => setBody(t.body)}
                title={body.trim().length > 0 ? 'Clear the post first' : undefined}
              >
                {t.label}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
