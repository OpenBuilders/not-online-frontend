import { useMemo } from 'react';
import { AeroButton } from '@/components/shared/AeroButton';
import { Confetti } from '@/components/shared/Confetti';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { PATRON_URL } from '@/data/links';
import { siteUrl } from '@/data/siteTemplates';
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
        <div className={styles.card}>
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
              <AeroButton
                variant="lime"
                wide
                className={styles.cta}
                onClick={() => window.open(PATRON_URL, '_blank', 'noopener')}
              >
                Become a patron
              </AeroButton>
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
