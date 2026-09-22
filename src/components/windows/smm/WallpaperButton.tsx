import { useCallback, useEffect, useState } from 'react';
import { AeroButton } from '@/components/shared/AeroButton';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { useAppState } from '@/state/AppStateContext';
import { pickScheme, renderWallpaper, weekAhead, type WallpaperScheme } from './wallpaper';
import styles from './WallpaperButton.module.css';

/**
 * Turns the week's plan into a phone wallpaper.
 *
 * It previews before it saves, for two reasons: the colourway is picked at
 * random, so the first one is rarely the one you want, and a 1290x2796 PNG
 * that lands in Downloads unseen is a file you have to go and open to find
 * out whether it was worth making. Rerolling in place is the whole
 * interaction.
 */
interface WallpaperButtonProps {
  /** Opens the join CTA over the whole window, for a guest. */
  onJoin: (title: string, sub: string) => void;
}

export function WallpaperButton({ onJoin }: WallpaperButtonProps) {
  const { state } = useAppState();
  const guest = !state.logged;
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [scheme, setScheme] = useState<WallpaperScheme | null>(null);
  const [busy, setBusy] = useState(false);

  const days = weekAhead(state.smm.posts);
  const planned = days.reduce((n, d) => n + d.posts.length, 0);

  const make = useCallback(async () => {
    setBusy(true);
    const next = pickScheme();
    try {
      const blob = await renderWallpaper(weekAhead(state.smm.posts), next);
      // Revoking the previous object URL matters here: each reroll is a
      // ~400KB bitmap, and they would otherwise be held until reload.
      setUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(blob);
      });
      setScheme(next);
    } finally {
      setBusy(false);
    }
  }, [state.smm.posts]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  async function start() {
    // A guest gets the same door and finds out what is behind it, rather
    // than finding the door missing. The 1290x2796 canvas is never drawn
    // for them.
    if (guest) {
      onJoin('Wallpapers are a patron thing', 'Your week as a lock screen. Move the light, pick your role.');
      return;
    }
    setOpen(true);
    await make();
  }

  /**
   * A real anchor click rather than an `<a download>` in the markup: the
   * save control has to be an AeroButton to match every other action in
   * the app, and a link styled as one would still not be one.
   */
  function saveFile() {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `nothing-week-${scheme?.id ?? 'wallpaper'}.png`;
    a.click();
  }

  function close() {
    setOpen(false);
    setUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
  }

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={start}
        /* Never disabled for a guest: a greyed-out control says "not yet",
           and the honest answer here is "not without a membership". */
        disabled={!guest && planned === 0}
        title={planned === 0 ? 'Schedule something first' : 'Make a phone wallpaper from this week'}
        /* The word is dropped on a phone, where it cost the month heading
           two extra lines. The name has to survive that in the markup —
           `title` is not read out on touch. */
        aria-label="Wallpaper"
      >
        <MaterialIcon name="wallpaper" size={15} />
        <span className={styles.label}>Wallpaper</span>
      </button>

      {open && (
        <div className={styles.scrim} onClick={close}>
          <div className={styles.frame} onClick={(e) => e.stopPropagation()}>
            {/* Outside the card, on the scrim. Inside it, the button landed
                on top of the phone preview and disappeared into whatever
                the wallpaper happened to be. */}
            <button type="button" className={styles.close} onClick={close} aria-label="Close">
              <MaterialIcon name="close" size={18} />
            </button>
            <div className={styles.card}>

            <div className={styles.copy}>
              <h3 className={styles.title}>Your week, as a lock screen</h3>
              <p className={styles.sub}>
                The seven days from today with whatever is on them. {planned} post{planned === 1 ? '' : 's'} in this
                one. The colourway is picked at random — reroll until one of them is right.
              </p>
              <div className={styles.actions}>
                <AeroButton variant="lime" size="sm" onClick={() => void make()}>
                  <MaterialIcon name="casino" size={15} />
                  {busy ? 'Drawing…' : 'Reroll'}
                </AeroButton>
                {url && (
                  <AeroButton variant="pink" size="sm" onClick={saveFile}>
                    <MaterialIcon name="download" size={15} />
                    Save PNG
                  </AeroButton>
                )}
              </div>
              <p className={styles.meta}>1290 × 2796 · fits every iPhone from the 12 up</p>
            </div>

            <div className={styles.phone}>
              {url ? <img src={url} alt="Wallpaper preview" /> : <span className={styles.drawing}>drawing…</span>}
            </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
