import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { Sticker } from '@/components/shared/Sticker';
import { BACKGROUND_OPTIONS, isBackgroundUnlocked } from '@/data/backgrounds';
import { PATRON_URL } from '@/data/links';
import { cx } from '@/lib/cx';
import { useAppState } from '@/state/AppStateContext';
import styles from './BackgroundsTab.module.css';

/**
 * Big square wallpaper picker. For a guest the first option is free, the
 * second unlocks after finishing the Market demo, the third after clicking
 * out to a live catalogue item — same progression Market's own onboarding
 * already tracks. The last option is patron-only: locked, it wears the
 * "Patrons" sticker and clicking it redirects out (same as every other
 * partner-gated button); the two guest-progression locks show a plain lock
 * instead, since there's nothing to click your way past there.
 */
export function BackgroundsTab() {
  const { state, setWallpaper, completeTour } = useAppState();
  const current = state.wallpaper ?? 'default';

  return (
    <div className={styles.grid}>
      {BACKGROUND_OPTIONS.map((opt) => {
        const unlocked = isBackgroundUnlocked(opt, state);
        const selected = current === opt.id;
        const patronLocked = !unlocked && opt.lock === 'patron';

        return (
          <button
            key={opt.id}
            type="button"
            className={cx(
              styles.option,
              selected && styles.selected,
              !unlocked && styles.locked,
              patronLocked && styles.patronLocked
            )}
            onClick={() => {
              if (!unlocked) {
                if (patronLocked) window.open(PATRON_URL, '_blank', 'noopener');
                return;
              }
              setWallpaper(opt.id);
              // Actually changing the wallpaper is what finishes the
              // Settings step of the guest chain — and so reveals the
              // links-page builder on the desktop.
              completeTour('settings');
            }}
          >
            {/* The dimming for a locked/unselected option lives on this photo layer alone, not
                on `.option` itself — putting it on the button would dim the lock badge and
                "Patrons" sticker right along with the photo, when those are exactly the things
                that need to stay fully legible. */}
            <span className={styles.photo} style={{ backgroundImage: `url('${opt.src}')` }} />
            {patronLocked ? (
              <Sticker text="Patrons" icon="lock" color="pink" rotate={-6} className={styles.callout} />
            ) : !unlocked ? (
              <span className={styles.lockBadge}>
                <MaterialIcon name="lock" size={15} />
              </span>
            ) : null}
            <span className={styles.name}>{opt.name}</span>
          </button>
        );
      })}
    </div>
  );
}
