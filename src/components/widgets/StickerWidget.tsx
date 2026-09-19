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
  /** The big display line. */
  lead: ReactNode;
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
  children: ReactNode;
}

/**
 * Just the sticker shell — cut-line, shadow, tilt — around content that
 * brings its own layout (a widget whose body can't be expressed as
 * title/lead/sub).
 */
export function StickerFrame({ color, rotate = 0, children }: StickerFrameProps) {
  return (
    <div
      className={cx(styles.shell, styles[color], styles.frame)}
      style={{ '--rest-rotate': `${rotate}deg` } as CSSProperties}
    >
      <div className={styles.face}>{children}</div>
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
        {art && <img className={styles.art} src={art} alt="" aria-hidden="true" />}

        {/* An icon disc and a corner badge would fight over the same
            corner, so a widget carries one or the other. */}
        {!badge && (
          <span className={styles.iconBadge} aria-hidden="true">
            <MaterialIcon name={icon} size={26} />
          </span>
        )}

        <div className={styles.title}>{title}</div>
        <div className={styles.lead}>{lead}</div>
        {sub && <div className={styles.sub}>{sub}</div>}
        {!sub && <div className={styles.spacer} />}

        <button type="button" className={styles.button} onClick={onOpen}>
          <MaterialIcon name={icon} size={14} />
          {actionLabel}
        </button>
      </div>

      {badge && <span className={styles.badge}>{badge}</span>}
    </div>
  );
}
