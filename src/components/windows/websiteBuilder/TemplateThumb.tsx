import type { CSSProperties } from 'react';
import { FOLDER_COLORS } from '@/data/siteAssets';
import type { SitePalette } from '@/data/siteTemplates';
import type { SiteTemplateId } from '@/types';
import styles from './TemplateThumb.module.css';

interface TemplateThumbProps {
  template: SiteTemplateId;
  palette: SitePalette;
}

/**
 * A miniature of each layout for the picker. Abstracted shapes rather than a
 * scaled-down real render: at 80px wide a real render is an unreadable
 * smudge, while the silhouette of each layout is exactly what distinguishes
 * them. Colours come from the selected palette, so the picker updates when
 * the palette changes.
 */
export function TemplateThumb({ template, palette }: TemplateThumbProps) {
  const vars = {
    '--t-bg': palette.bg,
    '--t-ink': palette.ink,
    '--t-accent': palette.accent,
    '--t-accent-ink': palette.accentInk,
    '--t-accent-2': palette.accent2,
  } as CSSProperties;

  return (
    <div className={styles.thumb} style={vars} data-template={template} aria-hidden="true">
      {template === 'poster' && (
        <>
          <span className={styles.posterTitle} />
          <span className={styles.posterHl} />
          <span className={styles.slab} />
          <span className={styles.slab} />
        </>
      )}
      {template === 'stickers' && (
        <>
          <span className={styles.stkA} />
          <span className={styles.stkB} />
          <span className={styles.stkC} />
        </>
      )}
      {template === 'bold' && (
        <span className={styles.boldFrame}>
          <i className={styles.boldRow} />
          <i className={styles.boldRow} data-hot="true" />
          <i className={styles.boldRow} />
        </span>
      )}
      {template === 'folders' && (
        <span className={styles.shelf}>
          {FOLDER_COLORS.slice(0, 4).map((f) => (
            <img key={f.id} src={f.src} alt="" />
          ))}
        </span>
      )}
      {template === 'web1' && (
        <span className={styles.geo}>
          <i className={styles.geoKicker} />
          <i className={styles.geoH} />
          <i className={styles.geoRule} />
          <i className={styles.geoLink} />
          <i className={styles.geoLink} data-hot="true" />
        </span>
      )}
      {template === 'button' && <span className={styles.bigBtn} />}
    </div>
  );
}
