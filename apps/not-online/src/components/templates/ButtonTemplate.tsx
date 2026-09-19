import type { CSSProperties } from 'react';
import { getButtonColor, siteUrl } from '@/data/siteTemplates';
import type { TemplateProps } from './SitePage';
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

  const vars = {
    '--b-base': c.base,
    '--b-hi': c.hi,
    '--b-lo': c.lo,
    '--b-ink': c.ink,
  } as CSSProperties;

  return (
    <div className={styles.root}>
      <div className={styles.whisper}>{siteUrl(cfg.handle)}</div>

      <a
        className={styles.button}
        data-style={cfg.buttonStyle}
        style={vars}
        href={link?.url || '#'}
        target="_blank"
        rel="noreferrer"
      >
        <span className={styles.label}>{link?.title || 'Press me'}</span>
      </a>

      <div className={styles.whisper}>{bio}</div>
    </div>
  );
}
