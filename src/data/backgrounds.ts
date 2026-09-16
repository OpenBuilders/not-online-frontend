import type { AppState } from '@/types';

/** How a background option unlocks for a guest — a logged-in user (already a partner) has every option unlocked regardless. */
export type BackgroundLock =
  | 'market' /** finish the Market demo listing */
  | 'catalog' /** click out to a live catalogue item (longsleeve/cap) */
  | 'patron'; /** log in — shows the "Patrons" sticker and redirects there while locked */

export interface BackgroundOption {
  id: string;
  name: string;
  src: string;
  lock?: BackgroundLock;
}

/**
 * Images live in public/assets/wallpapers/. "Default" is wallpaper_1.jpg
 * itself (same file the desktop boots with at public/images/screen_1.jpg —
 * byte-identical, not a coincidence) rather than a 5th distinct image, so
 * each option here maps straight to wallpaper_<n>.jpg in order.
 */
export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  { id: 'default', name: 'Default', src: '/assets/wallpapers/wallpaper_1.jpg' },
  { id: 'wallpaper-1', name: 'Wallpaper 1', src: '/assets/wallpapers/wallpaper_2.jpg', lock: 'market' },
  { id: 'wallpaper-2', name: 'Wallpaper 2', src: '/assets/wallpapers/wallpaper_3.jpg', lock: 'catalog' },
  { id: 'wallpaper-3', name: 'Wallpaper 3', src: '/assets/wallpapers/wallpaper_4.jpg', lock: 'patron' },
];

/** A logged-in user is already a partner (same rule Market uses), so every option is open to them. */
export function isBackgroundUnlocked(opt: BackgroundOption, state: AppState): boolean {
  if (!opt.lock) return true;
  if (state.logged) return true;
  if (opt.lock === 'market') return state.tours.has('market');
  if (opt.lock === 'catalog') return state.exploredCatalog;
  return false; // 'patron' — only login unlocks it
}
