import type { CSSProperties } from 'react';
import { getPalette } from '@/data/siteTemplates';
import type { SiteConfig } from '@/types';
import { GridTemplate } from './GridTemplate';
import styles from './SitePage.module.css';
import { StackTemplate } from './StackTemplate';
import { StickerTemplate } from './StickerTemplate';
import { Web1Template } from './Web1Template';
import { pageContent } from './pageContent';

export interface TemplateProps {
  cfg: SiteConfig;
  content: ReturnType<typeof pageContent>;
}

const TEMPLATE_COMPONENTS = {
  stack: StackTemplate,
  grid: GridTemplate,
  stick: StickerTemplate,
  web1: Web1Template,
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
  const Template = TEMPLATE_COMPONENTS[cfg.template];

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
    </div>
  );
}
