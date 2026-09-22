import { siteUrl } from '@/data/siteTemplates';
import type { TemplateProps } from './SitePage';
import styles from './BoldTemplate.module.css';

/**
 * "Bold" — the whole page is the list. Wide mono, one link per line, set as
 * large as it will go. The numbers are the index of the list, not
 * decoration: they are what a reader uses to refer to a row out loud.
 */
export function BoldTemplate({ cfg, content }: TemplateProps) {
  const { name, handle, bio, links } = content;

  return (
    <div className={styles.root}>
      <div className={styles.frame}>
        <div className={styles.top}>
          <div className={styles.head}>
            <div className={styles.name}>{name}</div>
            <div className={styles.url}>{siteUrl(cfg.handle)}</div>
          </div>
          <span className={styles.mark} aria-hidden="true">
            {handle.slice(0, 3)}
          </span>
        </div>

        <ol className={styles.list}>
          {links.map((l, i) => (
            <li key={l.id}>
              <a
                href={l.url || '#'}
                target="_blank"
                rel="noreferrer"
                data-link-id={l.id}
                data-link-title={l.title}
                data-link-position={i + 1}
              >
                <span className={styles.num}>#{i + 1}</span>
                <span className={styles.title}>{l.title}</span>
                <span className={styles.go}>↗</span>
              </a>
            </li>
          ))}
        </ol>

        <div className={styles.bio}>{bio}</div>
      </div>
    </div>
  );
}
