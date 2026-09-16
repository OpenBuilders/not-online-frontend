import type { SiteConfig, SiteLink, SiteTemplateId } from '@/types';

/**
 * Everything the links-page builder offers as a choice. Ported from
 * Tools.html's TEMPLATES/COMBOS/WB_ICONS (3330-3346) and widened: the four
 * templates survive, but each is a real designed layout now rather than
 * three grey bars, and "combo" became a named palette that also drives a
 * separate backdrop layer.
 */

export interface SitePalette {
  id: string;
  name: string;
  bg: string;
  ink: string;
  accent: string;
  /** Text colour that stays legible *on* `accent`. */
  accentInk: string;
  accent2: string;
}

export const PALETTES: SitePalette[] = [
  { id: 'acid', name: 'Acid', bg: '#0b0b0c', ink: '#ffffff', accent: '#a8ff1a', accentInk: '#0d1a00', accent2: '#ff1a91' },
  { id: 'lemon', name: 'Lemon', bg: '#d6ff3d', ink: '#101010', accent: '#101010', accentInk: '#d6ff3d', accent2: '#ffffff' },
  { id: 'ultra', name: 'Ultra', bg: '#1b2cff', ink: '#ffffff', accent: '#ffe500', accentInk: '#0a0a0a', accent2: '#ffffff' },
  { id: 'bubble', name: 'Bubble', bg: '#bfe3ff', ink: '#17124a', accent: '#ff3da5', accentInk: '#ffffff', accent2: '#ffe500' },
  { id: 'paper', name: 'Paper', bg: '#ffffff', ink: '#101010', accent: '#ff1a91', accentInk: '#ffffff', accent2: '#a8ff1a' },
  { id: 'slime', name: 'Slime', bg: '#07110a', ink: '#d7ffe3', accent: '#00ff85', accentInk: '#04120a', accent2: '#ffffff' },
];

export const getPalette = (id: string): SitePalette => PALETTES.find((p) => p.id === id) ?? PALETTES[0];

export interface SiteTemplate {
  id: SiteTemplateId;
  name: string;
  blurb: string;
}

export const TEMPLATES: SiteTemplate[] = [
  { id: 'stack', name: 'Poster', blurb: 'Huge type, highlight blocks, links as full-width slabs' },
  { id: 'grid', name: 'Collage', blurb: 'Y2K scrapbook — taped photo, scrolling strips, tilted tiles' },
  { id: 'stick', name: 'Stickers', blurb: 'Every link is a die-cut sticker scattered on the page' },
  { id: 'web1', name: 'Web 1.0', blurb: 'A window from 1998, pixel type and a hit counter included' },
];

export interface SiteBackdrop {
  id: string;
  name: string;
}

/** Drawn in CSS from the palette (see SitePage.module.css) — no image assets. */
export const BACKDROPS: SiteBackdrop[] = [
  { id: 'flat', name: 'Flat' },
  { id: 'grid', name: 'Graph' },
  { id: 'dots', name: 'Dots' },
  { id: 'rays', name: 'Rays' },
  { id: 'checker', name: 'Checker' },
  { id: 'stripes', name: 'Stripes' },
  { id: 'photo', name: 'Photo' },
];

/** One house avatar for people with nothing to upload — not a gallery to browse. */
export const AVATAR_PRESETS = ['/assets/icons/apps/ava_1.png'];

export const LINK_ICONS: { value: string; label: string }[] = [
  { value: 'link', label: 'Website' },
  { value: 'photo_camera', label: 'Instagram' },
  { value: 'music_note', label: 'Music' },
  { value: 'play_circle', label: 'Video' },
  { value: 'mail', label: 'Email' },
  { value: 'shopping_bag', label: 'Shop' },
  { value: 'edit', label: 'Blog' },
  { value: 'favorite', label: 'Support' },
];

let linkSeq = 0;
export const newLink = (partial: Partial<SiteLink> = {}): SiteLink => ({
  id: `l${Date.now().toString(36)}${linkSeq++}`,
  icon: 'link',
  title: '',
  url: '',
  ...partial,
});

export const DEMO_LINKS: SiteLink[] = [
  newLink({ icon: 'photo_camera', title: 'Instagram', url: 'https://instagram.com/' }),
  newLink({ icon: 'music_note', title: 'Listen', url: 'https://soundcloud.com/' }),
  newLink({ icon: 'shopping_bag', title: 'Shop', url: 'https://probablynothing.xyz/' }),
];

export function blankSite(): SiteConfig {
  return {
    handle: '',
    name: '',
    bio: '',
    avatar: null,
    template: 'stack',
    palette: 'acid',
    backdrop: 'grid',
    backdropImage: null,
    links: [newLink({ icon: 'photo_camera', title: 'Instagram', url: '' }), newLink({ icon: 'mail', title: 'Email', url: '' })],
    seed: 1,
    views: 0,
    clicks: 0,
  };
}

/** Placeholder content so the preview is never an empty rectangle. */
export const PLACEHOLDER = {
  handle: 'yourname',
  name: 'Your Name',
  bio: 'I make things that are probably nothing.',
};
