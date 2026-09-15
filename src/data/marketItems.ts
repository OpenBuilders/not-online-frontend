import type { MarketItem } from '@/types';

/**
 * The always-present public marketplace catalogue.
 *
 * Clips live at public/assets/market/seed-1.webm and seed-2.webm, rendered
 * via ItemMedia as short looping previews instead of static photos.
 * ItemMedia falls back to the `icon` below (same onError pattern as
 * DesktopIcon) if a file is missing or fails to load.
 */
export const SEED_MARKET_ITEMS: MarketItem[] = [
  {
    id: 'seed-1',
    name: 'Riso Print A2',
    price: 38,
    amount: 12,
    desc: 'Two-colour risograph print, edition of 50, signed.',
    img: null,
    video: '/assets/market/seed-1.webm',
    icon: 'imagesmode',
    status: 'live',
    views: 128,
  },
  {
    id: 'seed-2',
    name: 'Ceramic Mug',
    price: 28,
    amount: 6,
    desc: 'Wheel-thrown stoneware, matte glaze, slightly wrong on purpose.',
    img: null,
    video: '/assets/market/seed-2.webm',
    icon: 'coffee',
    status: 'live',
    views: 64,
  },
];
