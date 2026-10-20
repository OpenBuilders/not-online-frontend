import type { SiteConfig } from '@/types';
import { BoldTemplate } from './BoldTemplate';
import { ButtonTemplate } from './ButtonTemplate';
import { FoldersTemplate } from './FoldersTemplate';
import { PosterTemplate } from './PosterTemplate';
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
 * Chooses the page implementation. Its DOM and styles are owned entirely by
 * the selected template, so a change in one page cannot constrain another.
 */
export function SitePage({ cfg }: { cfg: SiteConfig }) {
  const Template = TEMPLATE_COMPONENTS[cfg.template] ?? PosterTemplate;
  return <Template cfg={cfg} content={pageContent(cfg)} />;
}
