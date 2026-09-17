import type { CSSProperties } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import type { SitePalette } from '@/data/siteTemplates';
import styles from './BackdropSwatch.module.css';

interface BackdropSwatchProps {
  kind: string;
  palette: SitePalette;
  /** Only for kind "photo" — the uploaded image, if there is one yet. */
  image?: string | null;
}

/**
 * A small render of what a background actually looks like, in the palette
 * it will be drawn in. The patterns used to be named chips ("Graph",
 * "Rays"), which asked you to guess and then check the preview.
 *
 * The rules here mirror SitePage.module.css at a smaller scale rather than
 * sharing them: at 54px the full-size pattern sizes read as flat colour.
 */
export function BackdropSwatch({ kind, palette, image }: BackdropSwatchProps) {
  const vars = {
    '--s-bg': palette.bg,
    '--s-ink': palette.ink,
    '--s-accent': palette.accent,
  } as CSSProperties;

  return (
    <span className={styles.swatch} style={vars} data-kind={kind} aria-hidden="true">
      {kind === 'photo' &&
        (image ? (
          <img src={image} alt="" />
        ) : (
          <span className={styles.empty}>
            <MaterialIcon name="add_photo_alternate" size={16} />
          </span>
        ))}
    </span>
  );
}
