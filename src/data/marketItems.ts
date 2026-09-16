import type { MarketItem } from '@/types';
import { PATRON_URL } from './links';

/**
 * The always-present marketplace catalogue: two real Nothing products that
 * redirect out to the live site instead of opening anything in-app — this
 * desktop doesn't handle checkout, and a real listing now goes through the
 * moderation queue (see src/api/marketSubmissions.ts), not this list.
 * Rendered via ItemMedia as short looping previews; clips live at
 * public/assets/market/seed-1.webm and seed-2.webm.
 */
export const SEED_MARKET_ITEMS: MarketItem[] = [
  {
    id: 'seed-1',
    name: 'longsleeve not blank',
    price: 80,
    amount: 1,
    desc: '',
    img: null,
    video: '/assets/market/seed-1.webm',
    icon: 'checkroom',
    status: 'live',
    views: 0,
    badge: 'buyMe',
    externalUrl: 'https://probablynothing.xyz/item/longsleeve-not-blank',
  },
  {
    id: 'seed-2',
    name: 'Nothing cap',
    price: 0,
    priceLabel: 'Priceless',
    amount: 1,
    desc: '',
    img: null,
    video: '/assets/market/seed-2.webm',
    icon: 'checkroom',
    status: 'live',
    views: 0,
    badge: 'patronsOnly',
    externalUrl: PATRON_URL,
  },
];

/** Pending-review cap for a logged-in seller — matches the backend's own MAX_AUTHENTICATED_SUBMISSIONS. */
export const MAX_ITEMS = 3;
/** A guest's one-time demo run (see SellForm's `submit()`) never touches the backend and doesn't
 *  count against this — a guest still only gets 1 *real* application. */
export const GUEST_MAX_ITEMS = 1;
