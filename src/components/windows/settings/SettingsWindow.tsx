import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { cx } from '@/lib/cx';
import { BackgroundsTab } from './BackgroundsTab';
import styles from './SettingsWindow.module.css';

/**
 * Settings shell — Backgrounds only for now (Cursors/App icons/Unlocks from
 * the original openSettings(), Tools.html:3060-3185, aren't built yet, so
 * the rail has just the one tab). Same left-rail-plus-content layout Market
 * uses.
 */
export function SettingsWindow() {
  return (
    <div className={styles.window}>
      <div className={styles.rail}>
        <div className={cx(styles.railItem, styles.on)}>
          <MaterialIcon name="wallpaper" size={17} />
          Backgrounds
        </div>
      </div>
      <div className={styles.body}>
        <BackgroundsTab />
      </div>
    </div>
  );
}
