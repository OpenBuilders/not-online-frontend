import { AeroButton } from '@/components/shared/AeroButton';
import { Confetti } from '@/components/shared/Confetti';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import styles from './PublishCelebration.module.css';

interface PublishCelebrationProps {
  itemName: string;
  onDone: () => void;
}

/** Confirmation shown only after the backend accepts the moderation request. */
export function PublishCelebration({ itemName, onDone }: PublishCelebrationProps) {
  return (
    <>
      {/* Confetti is a sibling, not a child, of `.overlay` — `.overlay`'s
          `backdrop-filter` establishes a containing block for `position:
          fixed` descendants, which would trap the burst inside this small
          card instead of letting it cover the screen. */}
      <Confetti />
      <div className={styles.overlay}>
        <div className={styles.card}>
          <div className={styles.badge}>
            <MaterialIcon name="celebration" size={30} />
          </div>
          <h3 className={styles.title}>Application received</h3>
          <p className={styles.sub}>
            <strong>{itemName}</strong> was submitted for review.
          </p>
          <p className={styles.joke}>We’ll check it before anything goes live on the market.</p>
          <AeroButton variant="lime" wide onClick={onDone}>
            Back to market
          </AeroButton>
        </div>
      </div>
    </>
  );
}
