import { useRef } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { PLACEHOLDER } from '@/data/siteTemplates';
import { cx } from '@/lib/cx';
import { useElementSize } from '@/state/useElementSize';
import type { SiteConfig } from '@/types';
import styles from './SitePreview.module.css';
import { SitePage } from './templates/SitePage';

export type PreviewDevice = 'desktop' | 'phone';

const LOGICAL: Record<PreviewDevice, { width: number; height: number }> = {
  desktop: { width: 880, height: 620 },
  phone: { width: 390, height: 730 },
};

interface SitePreviewProps {
  cfg: SiteConfig;
  device: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
  live: boolean;
}

/**
 * The right half of the builder: real browser chrome around a real render
 * of the page. The page is laid out at a fixed logical viewport and then
 * scaled to fit whatever room the window has, so what you see is genuinely
 * the site at its own proportions — not a squashed approximation that
 * re-flows differently once it's published.
 */
export function SitePreview({ cfg, device, onDeviceChange, live }: SitePreviewProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const stage = useElementSize(stageRef);
  const logical = LOGICAL[device];

  const scale = stage.width
    ? Math.min(stage.width / logical.width, stage.height / logical.height, 1)
    : // First paint, before the observer has measured: a sane default beats
      // flashing a full-size page that then jumps to its real scale.
      0.5;

  const handle = cfg.handle.trim() || PLACEHOLDER.handle;

  return (
    <div className={styles.preview}>
      <div className={styles.bar}>
        <div className={styles.dots}>
          <i data-tone="red" />
          <i data-tone="yellow" />
          <i data-tone="green" />
        </div>
        <div className={styles.url}>
          <MaterialIcon name={live ? 'lock' : 'edit'} size={13} />
          <span>{handle}.not.online</span>
          {live && <span className={styles.liveTag}>live</span>}
        </div>
        <div className={styles.devices}>
          <button
            type="button"
            className={cx(styles.deviceBtn, device === 'desktop' && styles.on)}
            onClick={() => onDeviceChange('desktop')}
            aria-label="Desktop preview"
            aria-pressed={device === 'desktop'}
          >
            <MaterialIcon name="desktop_windows" size={16} />
          </button>
          <button
            type="button"
            className={cx(styles.deviceBtn, device === 'phone' && styles.on)}
            onClick={() => onDeviceChange('phone')}
            aria-label="Phone preview"
            aria-pressed={device === 'phone'}
          >
            <MaterialIcon name="smartphone" size={16} />
          </button>
        </div>
      </div>

      <div className={styles.stage} ref={stageRef}>
        <div
          className={cx(styles.viewport, device === 'phone' && styles.phone)}
          style={{ width: logical.width * scale, height: logical.height * scale }}
        >
          <div
            className={styles.scaler}
            style={{ width: logical.width, height: logical.height, transform: `scale(${scale})` }}
          >
            <SitePage cfg={cfg} />
          </div>
        </div>
      </div>

      <div className={styles.footNote}>
        {live ? 'Your page is live. Every edit here updates it.' : 'Live preview — nothing is published until you say so.'}
      </div>
    </div>
  );
}
