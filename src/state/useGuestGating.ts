import { useCallback, useEffect } from 'react';
import { useAppState } from './AppStateContext';
import type { TourId } from '@/types';

/**
 * Order a guest works through the demos (Tools.html:3628). Nothing on the
 * desktop is hidden behind it any more — Market, Settings and the links
 * page are all there from the first frame, because hiding a tool you are
 * trying to demo mostly teaches people it isn't there. What the chain still
 * does is record which demos are finished, which is what the background
 * unlocks read (see data/backgrounds.ts).
 */
export const GUEST_CHAIN: TourId[] = ['market', 'settings', 'page'];

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
