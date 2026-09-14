import type { MarketItem } from '@/types';

/**
 * The always-present marketplace catalogue a guest sees alongside their own
 * first listing (Browse ends up showing exactly these 2 + `state.myItems`).
 * Ported in spirit from MARKET_ITEMS (Tools.html:3173-3180), trimmed to 2 so
 * the onboarding narrative — "your item plus 2 more" — stays literally true.
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

export const MAX_ITEMS = 3;
