import type { SiteLink } from '@/types';

export interface SitePalette {
  id: string;
  bg: string;
  ink: string;
  accent: string;
  accentInk: string;
  accent2: string;
}

export const PALETTES: SitePalette[] = [
  { id: 'acid', bg: '#0b0b0c', ink: '#ffffff', accent: '#a8ff1a', accentInk: '#0d1a00', accent2: '#ff1a91' },
  { id: 'lemon', bg: '#d6ff3d', ink: '#101010', accent: '#101010', accentInk: '#d6ff3d', accent2: '#ffffff' },
  { id: 'ultra', bg: '#1b2cff', ink: '#ffffff', accent: '#ffe500', accentInk: '#0a0a0a', accent2: '#ffffff' },
  { id: 'bubble', bg: '#bfe3ff', ink: '#17124a', accent: '#ff3da5', accentInk: '#ffffff', accent2: '#ffe500' },
  { id: 'paper', bg: '#ffffff', ink: '#101010', accent: '#ff1a91', accentInk: '#ffffff', accent2: '#a8ff1a' },
  { id: 'slime', bg: '#07110a', ink: '#d7ffe3', accent: '#00ff85', accentInk: '#04120a', accent2: '#ffffff' },
];

export const getPalette = (id: string): SitePalette => PALETTES.find((palette) => palette.id === id) ?? PALETTES[0];

const BUTTON_COLORS = [
  { id: 'silver', base: '#dcdce2', hi: '#ffffff', lo: '#9b9ba4', ink: '#16161a' },
  { id: 'lime', base: '#a8ff1a', hi: '#dcff9b', lo: '#6fa800', ink: '#0d1a00' },
  { id: 'pink', base: '#ff1a91', hi: '#ff86c4', lo: '#b00061', ink: '#ffffff' },
  { id: 'blue', base: '#2f7ff0', hi: '#a8cdff', lo: '#12489c', ink: '#ffffff' },
  { id: 'graphite', base: '#2b2b30', hi: '#5c5c66', lo: '#0a0a0c', ink: '#ffffff' },
  { id: 'bone', base: '#f6f4ee', hi: '#ffffff', lo: '#c7c2b4', ink: '#16161a' },
];

export const getButtonColor = (id: string) => BUTTON_COLORS.find((color) => color.id === id) ?? BUTTON_COLORS[0];

export const DEMO_LINKS: SiteLink[] = [
  { id: 'demo-instagram', icon: 'photo_camera', title: 'Instagram', url: 'https://instagram.com/' },
  { id: 'demo-listen', icon: 'music_note', title: 'Listen', url: 'https://soundcloud.com/' },
  { id: 'demo-shop', icon: 'shopping_bag', title: 'Shop', url: 'https://probablynothing.xyz/' },
];

export const PLACEHOLDER = {
  handle: 'yourname',
  name: 'Your Name',
  bio: 'I make things that are probably nothing.',
};

export const siteUrl = (handle: string) => `not.online/${handle.trim() || PLACEHOLDER.handle}`;
