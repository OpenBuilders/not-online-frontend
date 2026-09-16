import { useState } from 'react';
import { AeroButton } from '@/components/shared/AeroButton';
import { Confetti } from '@/components/shared/Confetti';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import styles from './PublishCelebration.module.css';

const CONGRAT_ICON = '/assets/market/congrats_item.png';

interface PublishCelebrationProps {
  itemName: string;
  /** The guest's free demo run (SellForm's `submit()` never sends this to the backend) —
   *  different copy: it didn't go anywhere for review, so say so, and point them at a real one. */
  isDemo?: boolean;
  onDone: () => void;
}

/** Confirmation shown after a successful submission — real (backend accepted the moderation request) or, for a guest's one-time demo, the local-only mock. */
export function PublishCelebration({ itemName, isDemo = false, onDone }: PublishCelebrationProps) {
  const [iconFailed, setIconFailed] = useState(false);

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
            {iconFailed ? (
              <MaterialIcon name="celebration" size={60} />
            ) : (
              <img src={CONGRAT_ICON} alt="" onError={() => setIconFailed(true)} />
            )}
          </div>
          {isDemo ? (
            <>
              <h3 className={styles.title}>That was the demo!</h3>
              <p className={styles.sub}>
                <strong>{itemName}</strong> was just a practice run — now you can list something real.
              </p>
              <p className={styles.joke}>Nothing was sent anywhere. Your one real application is still untouched.</p>
              <div className={styles.unlockNote}>
                <MaterialIcon name="wallpaper" size={16} />
                <span>New background unlocked — check Settings.</span>
              </div>
              <AeroButton variant="lime" wide onClick={onDone}>
                List something real
              </AeroButton>
            </>
          ) : (
            <>
              <h3 className={styles.title}>Application received</h3>
              <p className={styles.sub}>
                <strong>{itemName}</strong> was submitted for review.
              </p>
              <p className={styles.joke}>We’ll check it before anything goes live on the market.</p>
              <AeroButton variant="lime" wide onClick={onDone}>
                Back to market
              </AeroButton>
            </>
          )}
        </div>
      </div>
    </>
  );
}
