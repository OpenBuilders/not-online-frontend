import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { LinkIcon, hasIcon } from './LinkIcon';
import type { TemplateProps } from './SitePage';
import styles from './PosterTemplate.module.css';

/**
 * "Poster" — the brutalist one: oversized stacked display type, the bio set
 * as knocked-out highlight blocks, and links as full-width slabs with a
 * hard offset shadow.
 */
export function PosterTemplate({ content }: TemplateProps) {
  const { name, handle, bio, links, initials, avatar } = content;

  return (
    <div className={styles.root}>
      <div className={styles.head}>
        <div className={styles.avatar}>
          {avatar ? <img src={avatar} alt="" /> : <span className={styles.initials}>{initials}</span>}
        </div>
        <div className={styles.handleChip}>not.online/{handle}</div>
      </div>

      <h1 className={styles.name}>{name}</h1>
      <p className={styles.bio}>
        <span>{bio}</span>
      </p>

      <div className={styles.links}>
        {links.map((l, i) => (
          <a
            key={l.id}
            className={styles.link}
            href={l.url || '#'}
            target="_blank"
            rel="noreferrer"
            data-link-id={l.id}
            data-link-title={l.title}
            data-link-position={i + 1}
          >
            {hasIcon(l.icon) && (
              <span className={styles.linkIcon}>
                <LinkIcon icon={l.icon} size={20} />
              </span>
            )}
            <span className={styles.linkLabel}>{l.title}</span>
            <MaterialIcon name="arrow_outward" size={20} />
          </a>
        ))}
      </div>

      <div className={styles.foot}>
        <span className={styles.footMark}>Probably nothing</span>
      </div>
    </div>
  );
}
