import type { CSSProperties } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { getPalette } from '@/data/siteTemplates';
import { LinkIcon, hasIcon } from './LinkIcon';
import { scopeCustomCss } from './customCss';
import type { TemplateProps } from './SitePage';
import styles from './PosterTemplate.module.css';

/**
 * "Poster" — the brutalist one: oversized stacked display type, the bio set
 * as knocked-out highlight blocks, and links as full-width slabs with a
 * hard offset shadow.
 */
export function PosterTemplate({ cfg, content }: TemplateProps) {
  const { name, handle, bio, links, initials, avatar } = content;
  const p = getPalette(cfg.palette);
  const vars = {
    '--pg-bg': p.bg,
    '--pg-ink': p.ink,
    '--pg-accent': p.accent,
    '--pg-accent-ink': p.accentInk,
    '--pg-accent-2': p.accent2,
  } as CSSProperties;
  const { css: customCss } = scopeCustomCss(cfg.customCss);

  return (
    <div className={styles.page} data-site-page data-page-handle={cfg.handle} style={vars}>
      {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}
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
            {links.map((l) => (
              <a
                key={l.id}
                className={styles.link}
                href={l.url || '#'}
                target="_blank"
                rel="noreferrer"
                data-link-title={l.title}
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
      </div>
      <a href="https://instagram.com/cultofnot" target="_blank" rel="noreferrer" className={styles.mark}>
        cultofnot
      </a>
    </div>
  );
}
