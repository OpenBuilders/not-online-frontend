import { AeroButton } from '@/components/shared/AeroButton';
import { Sticker } from '@/components/shared/Sticker';
import { useAppState } from '@/state/AppStateContext';
import styles from './MarketCta.module.css';

interface MarketCtaProps {
  onOpen: () => void;
}

/**
 * Onboarding nudge for the Market icon: a decorative sticker (no click
 * handler of its own — matches the "soon" badge treatment) plus a real
 * button that actually opens Market. Replaces the original `ctaBubbles()` +
 * spotlight-tour combo (Tools.html:3030-3046) with a plainer "click the
 * button" affordance; MarketWindow itself decides to open on the sell step
 * from `state.tours`, so this button doesn't need to pass anything special.
 * Rendered as DesktopIcon's `extra` for the Market icon only, so it inherits
 * the icon's real position on both the desktop layout and the mobile grid.
 */
export function MarketCta({ onOpen }: MarketCtaProps) {
  const { state } = useAppState();

  if (state.logged || state.tours.has('market')) return null;

  return (
    <div className={styles.wrap}>
      <Sticker text="Try this" color="pink" rotate={-8} className={styles.sticker} />
      <AeroButton
        variant="lime"
        size="sm"
        className={styles.button}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
      >
        Click me →
      </AeroButton>
    </div>
  );
}
