import type { CSSProperties } from 'react';
import { getPalette, siteUrl } from '@/data/siteTemplates';
import type { TemplateProps } from './SitePage';
import { scopeCustomCss } from './customCss';
import styles from './BoldTemplate.module.css';

/**
 * "Bold" — the whole page is the list. Wide mono, one link per line, set as
 * large as it will go. The numbers are the index of the list, not
 * decoration: they are what a reader uses to refer to a row out loud.
 */
export function BoldTemplate({ cfg, content }: TemplateProps) {
  const { name, bio, links, avatar } = content;
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
          <div className={styles.frame}>
            <div className={styles.top}>
              <div className={styles.head}>
                <div className={styles.name}>{name}</div>
                <div className={styles.url}>{siteUrl(cfg.handle)}</div>
              </div>
              {avatar && (
                <span className={styles.mark} aria-hidden="true">
                  <img src={avatar} alt="" />
                </span>
              )}
            </div>

            <ol className={styles.list}>
              {links.map((l, i) => (
                <li key={l.id}>
                  <a
                    href={l.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    data-link-title={l.title}
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
      <a href="https://instagram.com/cultofnot" target="_blank" rel="noreferrer" className={styles.pageMark}>
        cultofnot
      </a>
    </div>
  );
}
