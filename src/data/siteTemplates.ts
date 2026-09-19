import type { SiteConfig, SiteLink, SiteTemplateId } from '@/types';

/**
 * Everything the links-page builder offers as a choice. Ported from
 * Tools.html's TEMPLATES/COMBOS/WB_ICONS (3330-3346) and widened: each
 * template is a real designed layout now rather than three grey bars, and
 * "combo" became a named palette that also drives a separate backdrop layer.
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
  /** Templates that carry exactly one link (and hide the rest of the link editor). */
  singleLink?: boolean;
  /** Templates that draw links as pure type — the editor hides the icon picker for these. */
  noLinkIcons?: boolean;
  /** Open to a logged-out visitor. The rest are a reason to sign in. */
  guest?: boolean;
}

export const TEMPLATES: SiteTemplate[] = [
  { id: 'poster', name: 'Poster', blurb: 'Huge type, highlight blocks, links as full-width slabs', guest: true },
  { id: 'folders', name: 'Folders', blurb: 'Links as desktop folders, in the colour of your choosing', guest: true },
  { id: 'stickers', name: 'Stickers', blurb: 'Every link is a die-cut sticker with its own shape and tilt' },
  { id: 'bold', name: 'Bold', blurb: 'A numbered index in wide mono — the whole page is the list', noLinkIcons: true },
  { id: 'web1', name: 'Web 1.0', blurb: 'A homepage from 1996. No chrome, no borders, no restraint.' },
  { id: 'button', name: 'Just a button', blurb: 'One link, one enormous button. Pick its era and its colour.', singleLink: true, noLinkIcons: true },
];

export const getTemplate = (id: SiteTemplateId): SiteTemplate => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];


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

/**
 * "Just a button" is two independent choices: the face (what era of
 * interface it came from) and the colourway (what it's painted in). Keeping
 * them apart means five faces and six colours give thirty buttons rather
 * than five, and adding either side costs one line.
 */
export interface ButtonStyle {
  id: string;
  name: string;
}

export const BUTTON_STYLES: ButtonStyle[] = [
  { id: 'win95', name: 'Windows 95' },
  { id: 'aqua', name: 'Mac OS X Aqua' },
  { id: 'aero', name: 'Frutiger Aero' },
  { id: 'brutal', name: 'Brutalist' },
  { id: 'pill', name: 'Modern pill' },
  { id: 'terminal', name: 'Terminal' },
];

/** Each colourway supplies the four values every face is built from. */
export interface ButtonColor {
  id: string;
  name: string;
  /** Main fill. */
  base: string;
  /** Lighter edge / top of a gradient. */
  hi: string;
  /** Darker edge / bottom of a gradient. */
  lo: string;
  /** Text that stays legible on `base`. */
  ink: string;
}

export const BUTTON_COLORS: ButtonColor[] = [
  { id: 'silver', name: 'Silver', base: '#dcdce2', hi: '#ffffff', lo: '#9b9ba4', ink: '#16161a' },
  { id: 'lime', name: 'Lime', base: '#a8ff1a', hi: '#dcff9b', lo: '#6fa800', ink: '#0d1a00' },
  { id: 'pink', name: 'Pink', base: '#ff1a91', hi: '#ff86c4', lo: '#b00061', ink: '#ffffff' },
  { id: 'blue', name: 'Blue', base: '#2f7ff0', hi: '#a8cdff', lo: '#12489c', ink: '#ffffff' },
  { id: 'graphite', name: 'Graphite', base: '#2b2b30', hi: '#5c5c66', lo: '#0a0a0c', ink: '#ffffff' },
  { id: 'bone', name: 'Bone', base: '#f6f4ee', hi: '#ffffff', lo: '#c7c2b4', ink: '#16161a' },
];

export const getButtonColor = (id: string): ButtonColor => BUTTON_COLORS.find((c) => c.id === id) ?? BUTTON_COLORS[0];

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
    template: 'poster',
    palette: 'acid',
    backdrop: 'grid',
    backdropImage: null,
    buttonStyle: 'aqua',
    buttonColor: 'lime',
    folderColor: 'blue',
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

/** Every page lives at not.online/<handle>. */
export const siteUrl = (handle: string) => `not.online/${handle.trim() || PLACEHOLDER.handle}`;
