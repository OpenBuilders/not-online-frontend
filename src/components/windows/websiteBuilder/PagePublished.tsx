import { useMemo } from 'react';
import { CircleStage } from '@/components/cta/CircleStage';
import { AeroButton } from '@/components/shared/AeroButton';
import { Confetti } from '@/components/shared/Confetti';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { siteUrl } from '@/data/siteTemplates';
import { cx } from '@/lib/cx';
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

/**
 * The payoff moment after a first publish — the builder's answer to
 * Market's PublishCelebration. For a guest it is also the one place the
 * patron pitch belongs: they have just seen the thing work, which is the
 * only moment an upsell is worth reading.
 *
 * The guest's way in is the interactive ring rather than a "Become a
 * patron" button, because there are two roles on offer here and a single
 * button could only name one of them. The pitch above it and the "Keep
 * editing" way out below it both stay — the ring replaces the button, not
 * the card around it.
 */
export function PagePublished({ handle, isGuest, onDone }: PagePublishedProps) {
  const joke = useMemo(() => JOKES[Math.floor(Math.random() * JOKES.length)], []);

  return (
    <>
      {/* Sibling of `.overlay`, not a child: the overlay's backdrop-filter
          would become a containing block for the fixed-position burst and
          trap it inside this card. Same reason as PublishCelebration. */}
      <Confetti />
      <div className={styles.overlay}>
        <div className={cx(styles.card, isGuest && styles.cardJoin)}>
          <div className={styles.urlBadge}>
            <MaterialIcon name="public" size={17} />
            {siteUrl(handle)}
          </div>
          <h3 className={styles.title}>It&apos;s live.</h3>
          <p className={styles.joke}>{joke}</p>

          {isGuest ? (
            <>
              <div className={styles.pitch}>
                <span className={styles.pitchHead}>
                  <MaterialIcon name="lock_open" size={15} />
                  Four more templates, every background
                </span>
                <p>
                  This demo page lives in this browser only. Patrons keep theirs, and get the templates that are locked
                  in the picker.
                </p>
              </div>
              <div className={styles.join}>
                <span className={styles.joinTitle}>Join the circle</span>
                <span className={styles.joinSub}>Move the light. Pick your role</span>
                <CircleStage size={230} onClose={onDone} className={styles.joinStage} />
              </div>
              <button type="button" className={styles.later} onClick={onDone}>
                Keep editing
              </button>
            </>
          ) : (
            <AeroButton variant="lime" wide onClick={onDone}>
              Keep editing
            </AeroButton>
          )}
        </div>
      </div>
    </>
  );
}
