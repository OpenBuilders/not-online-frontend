import type { CSSProperties } from 'react';
import { getPalette } from '@/data/siteTemplates';
import type { SiteConfig } from '@/types';
import { BoldTemplate } from './BoldTemplate';
import { ButtonTemplate } from './ButtonTemplate';
import { FoldersTemplate } from './FoldersTemplate';
import { PosterTemplate } from './PosterTemplate';
import styles from './SitePage.module.css';
import { StickerTemplate } from './StickerTemplate';
import { Web1Template } from './Web1Template';
import { pageContent } from './pageContent';

export interface TemplateProps {
  cfg: SiteConfig;
  content: ReturnType<typeof pageContent>;
}

const TEMPLATE_COMPONENTS = {
  poster: PosterTemplate,
  stickers: StickerTemplate,
  bold: BoldTemplate,
  folders: FoldersTemplate,
  web1: Web1Template,
  button: ButtonTemplate,
};

/**
 * The published page itself — palette as CSS variables, a backdrop layer
 * drawn from those variables, and the chosen template on top. Everything
 * inside is sized in px against a fixed logical viewport; SitePreview
 * scales the whole thing to whatever room the window has.
 */
export function SitePage({ cfg }: { cfg: SiteConfig }) {
  const p = getPalette(cfg.palette);
  const content = pageContent(cfg);
  const Template = TEMPLATE_COMPONENTS[cfg.template] ?? PosterTemplate;

  const vars = {
    '--pg-bg': p.bg,
    '--pg-ink': p.ink,
    '--pg-accent': p.accent,
    '--pg-accent-ink': p.accentInk,
    '--pg-accent-2': p.accent2,
  } as CSSProperties;

  const usePhoto = cfg.backdrop === 'photo' && cfg.backdropImage;

  return (
    <div className={styles.page} style={vars}>
      <div
        className={styles.backdrop}
        data-kind={usePhoto ? 'photo' : cfg.backdrop === 'photo' ? 'flat' : cfg.backdrop}
        style={usePhoto ? { backgroundImage: `url(${cfg.backdropImage})` } : undefined}
      />

      <div className={styles.body}>
        <Template cfg={cfg} content={content} />
      </div>

      <span className={styles.mark}>cultofnot</span>
    </div>
  );
}
