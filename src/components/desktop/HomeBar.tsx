import { useState } from 'react';
import { AeroButton } from '@/components/shared/AeroButton';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { useWindowManager } from '@/state/WindowManagerContext';
import styles from './HomeBar.module.css';

/**
 * Mobile-only home/apps nav. Ported from Tools.html:1714-1719 (markup),
 * .homebar/.hb (1340-1365), and toggleLauncher() (~3696-3717) — reworked so
 * "Apps" expands the same pill in place into one circular icon button per
 * app plus a pink close button, rather than opening a separate labeled-tab
 * panel above it.
 */
export function HomeBar() {
  const { openWindow, closeAllWindows } = useWindowManager();
  const [launcherOpen, setLauncherOpen] = useState(false);

  // Widget-backed apps (Radar/Toolbox/Orgs/SMM/Your page) are parked for
  // this pass — only Market and Settings actually exist right now. Both
  // are available from the start (see DesktopIconLayer).
  const apps = [
    {
      name: 'Market',
      icon: 'storefront',
      on: true,
      open: () => openWindow({ kind: 'market', title: 'Market', width: 760, height: 580, singleton: true }),
    },
    {
      name: 'Settings',
      icon: 'settings',
      on: true,
      open: () => openWindow({ kind: 'settings', title: 'Settings', width: 700, height: 520, singleton: true }),
    },
  ];

  if (!launcherOpen) {
    return (
      <div className={styles.homebar}>
        <AeroButton
          className={styles.hb}
          size="sm"
          aria-label="Home"
          title="Close all windows"
          onClick={() => closeAllWindows()}
        >
          <MaterialIcon name="home" />
        </AeroButton>
        <AeroButton
          className={styles.hb}
          variant="lime"
          size="sm"
          aria-label="Apps"
          title="Apps"
          onClick={() => setLauncherOpen(true)}
        >
          <MaterialIcon name="apps" />
        </AeroButton>
      </div>
    );
  }

  return (
    <div className={`${styles.homebar} ${styles.homebarOpen}`}>
      {apps.map((app) => (
        <AeroButton
          key={app.name}
          className={styles.hb}
          size="sm"
          variant={app.on ? 'silver' : 'ghost'}
          disabled={!app.on}
          aria-label={app.name}
          title={app.name}
          onClick={() => {
            setLauncherOpen(false);
            app.open();
          }}
        >
          <MaterialIcon name={app.icon} />
        </AeroButton>
      ))}
      <AeroButton
        className={styles.hb}
        variant="pink"
        size="sm"
        aria-label="Close"
        title="Close"
        onClick={() => setLauncherOpen(false)}
      >
        <MaterialIcon name="close" />
      </AeroButton>
    </div>
  );
}
