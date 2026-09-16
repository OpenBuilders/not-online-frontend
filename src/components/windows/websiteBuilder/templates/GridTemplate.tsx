import { MaterialIcon } from '@/components/shared/MaterialIcon';
import type { TemplateProps } from './SitePage';
import styles from './GridTemplate.module.css';
import { noise } from './pageContent';

/** A four-point sparkle, drawn rather than typed — the reference's Y2K stars. */
function Sparkle({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0c1 7 4 10 12 12-8 2-11 5-12 12-1-7-4-10-12-12C8 10 11 7 12 0Z" fill="currentColor" />
    </svg>
  );
}

/**
 * "Collage" — the Y2K scrapbook: scrolling ticker strips top and bottom, a
 * taped photo, and link tiles pinned at slightly different angles.
 */
export function GridTemplate({ cfg, content }: TemplateProps) {
  const { name, handle, bio, links, initials, avatar } = content;
  const strip = `${handle}.not.online`;

  return (
    <div className={styles.root}>
      <div className={styles.strip}>
        <div className={styles.stripTrack}>
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i}>
              {strip}
              <i className={styles.stripDot} />
            </span>
          ))}
        </div>
      </div>

      <div className={styles.stage}>
        <Sparkle className={styles.starA} />
        <Sparkle className={styles.starB} />

        <div className={styles.top}>
          <div className={styles.polaroid}>
            <span className={styles.tape} />
            <div className={styles.photo}>
              {avatar ? <img src={avatar} alt="" /> : <span className={styles.initials}>{initials}</span>}
            </div>
            <div className={styles.caption}>{handle}</div>
          </div>
          <div className={styles.intro}>
            <h1 className={styles.name}>{name}</h1>
            <div className={styles.note}>{bio}</div>
          </div>
        </div>

        <div className={styles.tiles}>
          {links.map((l, i) => (
            <a
              key={l.id}
              className={styles.tile}
              href={l.url || '#'}
              target="_blank"
              rel="noreferrer"
              data-tone={i % 3}
              style={{ '--tilt': `${(noise(cfg.seed, i, 3) * 6 - 3).toFixed(2)}deg` } as React.CSSProperties}
            >
              <MaterialIcon name={l.icon} size={30} />
              <span className={styles.tileLabel}>{l.title}</span>
            </a>
          ))}
        </div>
      </div>

      <div className={styles.strip} data-reverse="true">
        <div className={styles.stripTrack}>
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i}>
              probably nothing
              <i className={styles.stripDot} />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
