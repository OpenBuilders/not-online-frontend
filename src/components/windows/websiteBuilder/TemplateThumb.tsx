import type { CSSProperties } from 'react';
import type { SitePalette } from '@/data/siteTemplates';
import type { SiteTemplateId } from '@/types';
import styles from './TemplateThumb.module.css';

interface TemplateThumbProps {
  template: SiteTemplateId;
  palette: SitePalette;
}

/**
 * A miniature of each layout for the picker. Abstracted shapes rather than a
 * scaled-down real render: at 78px wide a real render is an unreadable
 * smudge, while the silhouette of each layout is exactly what distinguishes
 * them. Colours come from the selected palette, so the picker updates when
 * the palette changes.
 */
export function TemplateThumb({ template, palette }: TemplateThumbProps) {
  const vars = {
    '--t-bg': palette.bg,
    '--t-ink': palette.ink,
    '--t-accent': palette.accent,
    '--t-accent-2': palette.accent2,
  } as CSSProperties;

  return (
    <div className={styles.thumb} style={vars} data-template={template} aria-hidden="true">
      {template === 'stack' && (
        <>
          <span className={styles.stackTitle} />
          <span className={styles.stackHl} />
          <span className={styles.slab} />
          <span className={styles.slab} />
        </>
      )}
      {template === 'grid' && (
        <>
          <span className={styles.stripTop} />
          <span className={styles.collagePhoto} />
          <span className={styles.collageTiles}>
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className={styles.stripBottom} />
        </>
      )}
      {template === 'stick' && (
        <>
          <span className={styles.stkA} />
          <span className={styles.stkB} />
          <span className={styles.stkC} />
        </>
      )}
      {template === 'web1' && (
        <>
          <span className={styles.winBar} />
          <span className={styles.winBody}>
            <i className={styles.winH} />
            <i className={styles.winLine} />
            <i className={styles.winLine} />
          </span>
        </>
      )}
    </div>
  );
}
