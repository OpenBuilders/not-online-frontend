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

/** "follow_the_white_rabbit.jpg" -> "Follow the white rabbit". The files are the source of truth for the names. */
const label = (file: string) => {
  const stem = file.replace(/\.[a-z]+$/i, '').replace(/_/g, ' ');
  return stem.charAt(0).toUpperCase() + stem.slice(1);
};

const wallpaper = (file: string, lock?: BackgroundLock): BackgroundOption => ({
  id: file.replace(/\.[a-z]+$/i, ''),
  name: label(file),
  src: `/assets/wallpapers/${file}`,
  lock,
});

/** Images live in public/assets/wallpapers/ (plus the desktop's own default at public/images/screen_1.jpg). */
export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  { id: 'default', name: 'Default', src: '/images/screen_1.jpg' },
  wallpaper('nothing_waves.jpg'),
  wallpaper('void_energy.jpg', 'market'),
  wallpaper('sugar_desert.jpg', 'catalog'),
  wallpaper('follow_the_white_rabbit.jpg', 'patron'),
  wallpaper('in_jellyfish_mouth.jpg', 'patron'),
];

/** A logged-in user is already a partner (same rule Market uses), so every option is open to them. */
export function isBackgroundUnlocked(opt: BackgroundOption, state: AppState): boolean {
  if (!opt.lock) return true;
  if (state.logged) return true;
  if (opt.lock === 'market') return state.tours.has('market');
  if (opt.lock === 'catalog') return state.exploredCatalog;
  return false; // 'patron' — only login unlocks it
}
