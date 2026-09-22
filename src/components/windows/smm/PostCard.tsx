import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { PlatformIcon } from '@/components/shared/PlatformIcon';
import { LabelPill, toneForLabel } from '@/components/shared/LabelPill';
import { PLATFORM_BY_ID } from '@/data/smmHints';
import { cx } from '@/lib/cx';
import type { SmmPost } from '@/types';
import { dayOfMonth, monthShort } from './dates';
import styles from './PostCard.module.css';

interface PostCardProps {
  post: SmmPost;
  /** `grid` leads with the photo; `list` is text-first. */
  view: 'list' | 'grid';
  onOpen: () => void;
  onTogglePosted: () => void;
  /** Hands the post to Plan, which picks the new day on the calendar. */
  onPickDate: () => void;
  /** Present only on the posted shelf, where removing is the next step. */
  onDelete?: () => void;
}

const STATUS_LABEL: Record<SmmPost['status'], string> = {
  draft: 'draft',
  scheduled: 'scheduled',
  posted: 'posted',
};

/**
 * One post, in either view. The two are the same component rather than
 * two, because the only real difference is whether the photo leads — and
 * splitting them would duplicate the status chips, the platform mark and
 * the posted toggle three ways.
 *
 * A post with no photo gets no thumbnail at all in list view. The old
 * placeholder — a platform glyph in a grey square — filled the same 54px
 * on every row and made a list of text-only drafts look like a list of
 * failed image loads.
 *
 * A scheduled post carries its day as a number too tall for the card,
 * cropped by its edges. That is deliberate: the date is the one thing
 * separating a plan from a pile of drafts, and at a polite size it sat in
 * the metadata row reading as one more chip.
 *
 * It is also the control. Clicking it does not open a date picker — it
 * hands the post to Plan and asks for a cell. A native picker made you
 * choose a date with no idea what was already on it, which is the one
 * thing the calendar exists to show.
 */
export function PostCard({ post, view, onOpen, onTogglePosted, onPickDate, onDelete }: PostCardProps) {
  const platform = PLATFORM_BY_ID[post.platform];
  const cover = post.photos[0];
  const showThumb = view === 'grid' || Boolean(cover);
  const scheduled = post.status === 'scheduled' && post.day;
  const posted = post.status === 'posted';

  return (
    <div className={cx(styles.card, styles[view], post.status === 'posted' && styles.done, scheduled && styles.dated)}>
      <button type="button" className={styles.hit} onClick={onOpen}>
        {showThumb && (
          <span className={cx(styles.thumb, !cover && styles.thumbEmpty)}>
            {cover ? <img src={cover} alt="" /> : <MaterialIcon name="image" size={22} />}
            {post.photos.length > 1 && <span className={styles.count}>{post.photos.length}</span>}
          </span>
        )}

        <span className={styles.main}>
          <span className={styles.title}>{post.title || 'Untitled'}</span>
          {post.body && <span className={styles.excerpt}>{post.body}</span>}

          {/* One row. The stickers lead it — they are the post's own
              words, and the platform/status chips after them are the
              system's. A second row for the labels spent a card's whole
              height on four words. */}
          <span className={styles.meta}>
            {post.labels.map((t) => (
              <LabelPill key={t} tone={toneForLabel(t)} sticker>
                {t}
              </LabelPill>
            ))}
            <span className={styles.platform}>
              <PlatformIcon platform={post.platform} size={13} />
              {platform.label}
            </span>
            <span className={cx(styles.status, styles[post.status])}>{STATUS_LABEL[post.status]}</span>
          </span>
        </span>
      </button>

      {/* Outside the hit area, like the tick — a button inside a button is
          invalid markup, and moving the post must not also open it. */}
      {scheduled && post.day && (
        <button
          type="button"
          className={styles.date}
          onClick={onPickDate}
          title="Pick another day on the calendar"
          aria-label={`Scheduled for ${dayOfMonth(post.day)} ${monthShort(post.day)} — pick another day`}
        >
          <span className={styles.dateDay}>{dayOfMonth(post.day)}</span>
          <span className={styles.dateMonth}>{monthShort(post.day)}</span>
        </button>
      )}

      {/* Closing the loop is a different action from opening the post, and
          one should never fire the other. On the posted shelf the tick has
          nothing left to confirm, so it becomes the way back out. */}
      <div className={styles.actions}>
        {posted && onDelete && (
          <button type="button" className={styles.trash} onClick={onDelete} title="Delete this post">
            <MaterialIcon name="delete" size={15} />
          </button>
        )}
        <button
          type="button"
          className={cx(styles.tick, posted && styles.tickOn)}
          onClick={onTogglePosted}
          aria-pressed={posted}
          title={posted ? 'Move it back' : 'Mark as posted'}
        >
          <MaterialIcon name={posted ? 'undo' : 'check'} size={15} />
        </button>
      </div>
    </div>
  );
}
