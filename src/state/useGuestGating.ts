import { useCallback, useEffect } from 'react';
import { useAppState } from './AppStateContext';
import type { TourId } from '@/types';

/** Order the desktop reveals itself in for a guest (Tools.html:3628).
 *  Trimmed to what's actually built right now — 'radar'/'page' come back
 *  once those widgets do. */
export const GUEST_CHAIN: TourId[] = ['market', 'settings'];

/**
 * Guest progressive-unlock gating (ported from guestUnlocked/applyGating,
 * Tools.html:3629-3653). A logged-in user sees everything; a guest sees each
 * step of GUEST_CHAIN only once they've finished the tour for the step
 * before it. Each component that used to be shown/hidden imperatively by
 * applyGating() now just calls `guestUnlocked(key)` and renders (or not)
 * accordingly — no DOM queries needed.
 */
export function useGuestGating() {
  const { state } = useAppState();

  const guestUnlocked = useCallback(
    (key: TourId): boolean => {
      if (state.logged) return true;
      const i = GUEST_CHAIN.indexOf(key);
      if (i <= 0) return true;
      return state.tours.has(GUEST_CHAIN[i - 1]);
    },
    [state.logged, state.tours]
  );

  const isDemo = !state.logged;

  // A handful of existing CSS rules key off `body.demo` directly — keep that
  // in sync rather than threading the flag through every consumer as a prop.
  useEffect(() => {
    document.body.classList.toggle('demo', isDemo);
  }, [isDemo]);

  return { guestUnlocked, isDemo };
}
