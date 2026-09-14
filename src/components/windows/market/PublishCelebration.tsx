import { useMemo } from 'react';
import { AeroButton } from '@/components/shared/AeroButton';
import { Confetti } from '@/components/shared/Confetti';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import styles from './PublishCelebration.module.css';

interface PublishCelebrationProps {
  itemName: string;
  onDone: () => void;
}

const JOKES = [
  'Estimated earnings so far: $0. Give it time — or don’t, we’re nothing.',
  'You have officially made negative money on shipping supplies. A start.',
  'One (1) person has already looked at it. That person is you.',
  'Congratulations, you are now "a seller." Please act accordingly.',
];

/** Confetti + a funny congrats modal after a successful publish (Tools.html's applyItem() just called `confetti()` and moved on — this adds the payoff moment the onboarding needs). */
export function PublishCelebration({ itemName, onDone }: PublishCelebrationProps) {
  const joke = useMemo(() => JOKES[Math.floor(Math.random() * JOKES.length)], []);

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
          <h3 className={styles.title}>Congratulations!</h3>
          <p className={styles.sub}>
            <strong>{itemName}</strong> is live on the market.
          </p>
          <p className={styles.joke}>{joke}</p>
          <AeroButton variant="lime" wide onClick={onDone}>
            See it in the market
          </AeroButton>
        </div>
      </div>
    </>
  );
}
