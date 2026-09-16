import { useMemo } from 'react';
import { AeroButton } from '@/components/shared/AeroButton';
import { Confetti } from '@/components/shared/Confetti';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import styles from './PagePublished.module.css';

const JOKES = [
  'Estimated visitors so far: one. It was you.',
  'Somewhere, a linktree just felt a chill.',
  'You now own a corner of the internet roughly the size of a sticker.',
  'This is the part where you send the link to four people and refresh.',
];

interface PagePublishedProps {
  handle: string;
  isGuest: boolean;
  onDone: () => void;
}

/** The payoff moment after a first publish — the builder's answer to Market's PublishCelebration. */
export function PagePublished({ handle, isGuest, onDone }: PagePublishedProps) {
  const joke = useMemo(() => JOKES[Math.floor(Math.random() * JOKES.length)], []);

  return (
    <>
      {/* Sibling of `.overlay`, not a child: the overlay's backdrop-filter
          would become a containing block for the fixed-position burst and
          trap it inside this card. Same reason as PublishCelebration. */}
      <Confetti />
      <div className={styles.overlay}>
        <div className={styles.card}>
          <div className={styles.urlBadge}>
            <MaterialIcon name="public" size={17} />
            {handle || 'yourname'}.not.online
          </div>
          <h3 className={styles.title}>It&apos;s live.</h3>
          <p className={styles.joke}>{joke}</p>
          {isGuest && (
            <p className={styles.note}>
              This demo page lives in this browser only. Log in to keep it and to point a real domain at it.
            </p>
          )}
          <AeroButton variant="lime" wide onClick={onDone}>
            Keep editing
          </AeroButton>
        </div>
      </div>
    </>
  );
}
