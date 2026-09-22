import type { CSSProperties, ReactNode } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { cx } from '@/lib/cx';
import styles from './StickerWidget.module.css';

export type StickerColor = 'lime' | 'pink' | 'dark';

interface StickerWidgetProps {
  color: StickerColor;
  icon: string;
  /** Small kicker above the headline, e.g. "◇ nothing toolbox". */
  title: ReactNode;
  /** The big display line. Omitted by a widget that supplies its own `body`. */
  lead?: ReactNode;
  /**
   * Replaces the headline with bespoke content, keeping everything else —
   * face, padding, kicker, button. A widget whose middle changes with its
   * own state uses this instead of re-implementing the face, which is how
   * its paddings drift away from every other widget's.
   */
  body?: ReactNode;
  /** Supporting line under the headline. Omit it when the art says enough. */
  sub?: ReactNode;
  actionLabel: string;
  onOpen: () => void;
  /** Resting tilt, so it reads as stuck on rather than laid out. */
  rotate?: number;
  /** Illustration behind the content, cropped to the sticker's shape. */
  art?: string;
  /** Peel-off label stuck to the top-left corner, e.g. "TRY ME". */
  badge?: string;
}

interface StickerFrameProps {
  color: StickerColor;
  rotate?: number;
  /** Peel-off label over the top-left corner, e.g. "PLAN". */
  badge?: string;
  /** The badge's colourway — lime by default, pink to mark a second tool. */
  badgeColor?: 'lime' | 'pink';
  /**
   * Makes the entire face the click target instead of a button inside it.
   * The caller still owns drag-vs-click: this fires on any click the
   * sticker receives.
   */
  onActivate?: () => void;
  /**
   * Controls drawn over the face rather than inside it. With `onActivate`
   * the face *is* a button, and a button inside a button is invalid HTML
   * that the browser silently unnests — so anything clickable that is not
   * the card itself has to be a sibling of the face, the way the badge is.
   */
  overlay?: ReactNode;
  children: ReactNode;
}

/**
 * Just the sticker shell — cut-line, shadow, tilt — around content that
 * brings its own layout (a widget whose body can't be expressed as
 * title/lead/sub).
 */
export function StickerFrame({
  color,
  rotate = 0,
  badge,
  badgeColor = 'lime',
  onActivate,
  overlay,
  children,
}: StickerFrameProps) {
  return (
    <div
      className={cx(styles.shell, styles[color], styles.frame)}
      style={{ '--rest-rotate': `${rotate}deg` } as CSSProperties}
    >
      {onActivate ? (
        // A real button, so the whole sticker is reachable by keyboard —
        // a div with onClick would leave this widget the only one on the
        // desktop that cannot be tabbed to.
        <button type="button" className={cx(styles.face, styles.faceHit)} onClick={onActivate}>
          {children}
        </button>
      ) : (
        <div className={styles.face}>{children}</div>
      )}
      {overlay}
      {/* Sibling of the face, not a child: the face clips, and the badge
          is meant to hang over the cut-line. */}
      {badge && <span className={cx(styles.badge, badgeColor === 'pink' && styles.badgePink)}>{badge}</span>}
    </div>
  );
}

/**
 * The widget format: the widget *is* a die-cut sticker. Heavy white
 * cut-line, hard offset shadow, resting tilt, content on the face, and the
 * icon knocked out in a disc pinned to the corner the way a real die-cut
 * sticker carries its mark. No front/back layers and no peel-to-open
 * mechanic — that read as a puzzle to solve rather than a thing to look at.
 */
export function StickerWidget({
  color,
  icon,
  title,
  lead,
  body,
  sub,
  actionLabel,
  onOpen,
  rotate = 0,
  art,
  badge,
}: StickerWidgetProps) {
  return (
    <div className={cx(styles.shell, styles[color])} style={{ '--rest-rotate': `${rotate}deg` } as CSSProperties}>
      <div className={styles.face}>
        {/* Behind the content and clipped by `.face`'s own radius — the
            illustration runs off the top edge rather than sitting politely
            inside it. */}
        {art && (
          <img
            className={styles.art}
            src={art}
            alt=""
            aria-hidden="true"
            // A widget whose artwork has not been drawn yet should read as
            // a clean sticker, not as a broken image in the corner.
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}

        {/* The disc sits in the top-right, which is also where the artwork
            hangs in from — so a widget with art carries the art instead.
            A badge suppresses it too: that widget already has its mark. */}
        {!art && !badge && (
          <span className={styles.iconBadge} aria-hidden="true">
            <MaterialIcon name={icon} size={26} />
          </span>
        )}

        <div className={styles.title}>{title}</div>

        {body ? (
          <div className={styles.body}>{body}</div>
        ) : (
          <>
            <div className={styles.lead}>{lead}</div>
            {sub && <div className={styles.sub}>{sub}</div>}
            {!sub && <div className={styles.spacer} />}
          </>
        )}

        <button type="button" className={styles.button} onClick={onOpen}>
          <MaterialIcon name={icon} size={14} />
          {actionLabel}
        </button>
      </div>

      {badge && <span className={styles.badge}>{badge}</span>}
    </div>
  );
}
