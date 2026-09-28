import { useEffect, useRef, useState, type RefObject } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { cx } from '@/lib/cx';
import { StickerFrame } from '@/components/widgets/StickerWidget';
import { WidgetShell } from '@/components/widgets/WidgetShell';
import { siteUrl } from '@/data/siteTemplates';
import { useAppState } from '@/state/AppStateContext';
import { useWindowManager } from '@/state/WindowManagerContext';
import styles from './WebsiteBuilderWidget.module.css';

interface WebsiteBuilderWidgetProps {
  desktopRef: RefObject<HTMLElement | null>;
}

/**
 * Ported from Tools.html:1688-1694. Part of the guest progressive-unlock
 * chain (`.gated`, key 'page') rather than login-only.
 *
 * On the second sticker format, like SMM: no action button, the whole face
 * is the target, and a peel-off tab in the corner. And like SMM it reports
 * rather than pitches — which face it shows depends on whether a page
 * exists, so the desktop answers "is my page up, and is anyone looking"
 * without the builder being opened.
 *
 * The published face reads `state.site`, which is set by the builder's own
 * publish step (WebsiteBuilderWindow). That is the whole mechanism for
 * "update it from anywhere": the widget subscribes to the same store the
 * builder writes to, so publishing in the window — or clearing the page
 * from here — swaps this face with no wiring between the two components.
 */
export function WebsiteBuilderWidget({ desktopRef }: WebsiteBuilderWidgetProps) {
  const { state } = useAppState();
  const { openWindow } = useWindowManager();
  const site = state.site;
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clears on unmount so a widget dragged away mid-flash doesn't leave a
  // timer setting state on something that is gone.
  useEffect(() => () => {
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
  }, []);

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Denied clipboard permission, or an insecure origin. Nothing to
      // recover — the address is on the card to be read either way.
      return;
    }
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 1400);
  }

  const open = () =>
    openWindow({ kind: 'websiteBuilder', title: 'Your links page', width: 1040, height: 660, singleton: true });

  return (
    <WidgetShell id="widgetWeb" desktopRef={desktopRef} x={1140} y={330} dragAnywhere>
      {(hasMoved) => (
        <StickerFrame
          color="pink"
          rotate={3}
          badge={site ? undefined : 'Click me'}
          // Drawn over the face, not inside it: the face is a button, and
          // a nested button is invalid HTML the browser unnests, which
          // took the whole card's markup apart.
          overlay={
            site ? (
              <button
                type="button"
                className={styles.copy}
                title="Copy the link"
                aria-label="Copy the link"
                onClick={() => void copyLink(siteUrl(site.handle))}
              >
                <MaterialIcon name={copied ? 'check' : 'content_copy'} size={12} />
              </button>
            ) : undefined
          }
          onActivate={() => {
            if (hasMoved.current) {
              hasMoved.current = false;
              return;
            }
            open();
          }}
        >
          {site ? (
            <div className={styles.face}>
              {/* The live face gets its own illustration rather than
                  reusing the pitch's. Two states of one widget wearing the
                  same picture read as the same state with the words
                  swapped — which is exactly what the flat first version of
                  this face did. */}
              <img
                className={styles.artLive}
                src="/assets/builder/page-live.png"
                alt=""
                aria-hidden="true"
                onError={hideArt}
              />
              {/* The two numbers, both set large. No "your page is live"
                  line above them: the address along the bottom already
                  says the page exists, and a card this size cannot afford
                  to say it twice. */}
              <div className={styles.stats}>
                <span className={styles.stat}>
                  <b>{site.views}</b>
                  <span className={styles.statLabel}>{site.views === 1 ? 'view' : 'views'}</span>
                </span>
                <span className={styles.stat}>
                  <b>{site.clicks}</b>
                  <span className={styles.statLabel}>{site.clicks === 1 ? 'click' : 'clicks'}</span>
                </span>
              </div>

              <div className={styles.grow} />

              {/* Pinned to the bottom edge, where an address belongs — it
                  is what you read off the card to share. The copy control
                  rides with it and stays small: this is a convenience on
                  a card whose actual job is reporting, not a second
                  action competing with opening the builder. */}
              <span className={cx(styles.link, copied && styles.linkCopied)}>
                {copied ? 'copied' : siteUrl(site.handle)}
              </span>
            </div>
          ) : (
            <div className={styles.face}>
              <img className={styles.art} src="/assets/builder/cran.png" alt="" aria-hidden="true" onError={hideArt} />
              <div className={styles.grow} />
              <div className={styles.lead}>
                a page for your <b>links</b>
              </div>
              <div className={styles.kicker}>not.online / you</div>
            </div>
          )}
        </StickerFrame>
      )}
    </WidgetShell>
  );
}

/** A widget whose artwork has not been drawn yet reads as a clean sticker. */
function hideArt(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = 'none';
}
