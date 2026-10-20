import type { CSSProperties } from 'react';
import { getButtonColor, getPalette, siteUrl } from '@/data/siteTemplates';
import type { TemplateProps } from './SitePage';
import { scopeCustomCss } from './customCss';
import styles from './ButtonTemplate.module.css';

/**
 * "Just a button" — one link, and nothing competing with it. The handle and
 * the bio are present but deliberately almost invisible: if anything else
 * on this page draws the eye, the template has failed.
 *
 * The face (which era of interface the button came from) and the colourway
 * are separate choices, so the CSS below builds every style out of the same
 * four colour variables rather than hardcoding one palette per style.
 */
export function ButtonTemplate({ cfg, content }: TemplateProps) {
  const { bio, links } = content;
  const link = links[0];
  const c = getButtonColor(cfg.buttonColor);
  const p = getPalette(cfg.palette);

  const vars = {
    '--pg-bg': p.bg,
    '--pg-ink': p.ink,
    '--pg-accent': p.accent,
    '--pg-accent-ink': p.accentInk,
    '--pg-accent-2': p.accent2,
    '--b-base': c.base,
    '--b-hi': c.hi,
    '--b-lo': c.lo,
    '--b-ink': c.ink,
  } as CSSProperties;
  const { css: customCss } = scopeCustomCss(cfg.customCss);

  return (
    <div className={styles.page} data-site-page data-page-handle={cfg.handle} style={vars}>
      {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}
      <div className={styles.root}>
          <div className={styles.whisper}>{siteUrl(cfg.handle)}</div>

          <a
            className={styles.button}
            data-style={cfg.buttonStyle}
            style={vars}
            href={link?.url || '#'}
            target="_blank"
            rel="noreferrer"
            data-link-title={link?.title}
          >
            <span className={styles.label}>{link?.title || 'Press me'}</span>
          </a>

          <div className={styles.whisper}>{bio}</div>
      </div>
      <a href="https://instagram.com/cultofnot" target="_blank" rel="noreferrer" className={styles.mark}>
        cultofnot
      </a>
    </div>
  );
}
