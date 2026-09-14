import { AeroButton } from '@/components/shared/AeroButton';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { cx } from '@/lib/cx';
import styles from './JoinCards.module.css';

interface JoinCardsProps {
  onPatron: () => void;
  onArtist: () => void;
}

/** Ported from Tools.html:1747-1764 — shown when an email isn't recognized. */
export function JoinCards({ onPatron, onArtist }: JoinCardsProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.title}>Sorry, you're not with us yet.</div>
      <div className={styles.sub}>Wanna join?</div>
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.icon}>
            <MaterialIcon name="favorite" />
          </div>
          <h4>Become a patron of nothing</h4>
          <p>Support the void with a monthly pledge. You get the full desktop, unlockable skins, and absolutely nothing else.</p>
          <AeroButton variant="lime" wide onClick={onPatron}>
            Become a patron
          </AeroButton>
        </div>
        <div className={cx(styles.card, styles.pink)}>
          <div className={styles.icon}>
            <MaterialIcon name="palette" />
          </div>
          <h4>Apply as Artist</h4>
          <p>Show us what you make. Approved artists get a page, a market stall and the tools, free, but we read every application.</p>
          <AeroButton variant="pink" wide onClick={onArtist}>
            Apply as artist
          </AeroButton>
        </div>
      </div>
    </div>
  );
}
