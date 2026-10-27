import { useEffect, useState, type CSSProperties } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { PALETTES, getPalette } from '@/data/siteTemplates';
import { cx } from '@/lib/cx';
import styles from './PageYourWay.module.css';
import { STICKERS } from './stickers';

const BACKDROPS = ['flat', 'grid', 'dots', 'rays', 'checker', 'stripes'] as const;
const LAYOUTS = [
  { id: 'centre', label: 'Centred' },
  { id: 'giant', label: 'Giant 404' },
  { id: 'poster', label: 'Poster' },
] as const;

interface Look {
  palette: string;
  backdrop: (typeof BACKDROPS)[number];
  layout: (typeof LAYOUTS)[number]['id'];
  sticker: string;
  headline: string;
  body: string;
}

const DEFAULT_LOOK: Look = {
  palette: 'acid',
  backdrop: 'rays',
  layout: 'giant',
  sticker: STICKERS[0].src,
  headline: 'This page went offline',
  body: 'Nothing here. Around here, that is kind of the point.',
};

const KEY = 'nothing.404.look.v1';
function loadLook(): Look {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_LOOK, ...(JSON.parse(raw) as Partial<Look>) } : DEFAULT_LOOK;
  } catch {
    return DEFAULT_LOOK;
  }
}

const pickOne = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];

/**
 * The 404 as a page you dress, the way the links-page builder works: the
 * same six palettes and the same drawn backdrops, a layout, a sticker,
 * and the words. The headline and the line under it are edited in place.
 * It remembers your look in this browser.
 */
export function PageYourWay() {
  const [look, setLook] = useState<Look>(loadLook);
  // Open on a desktop; on a phone the page shows first and the dock waits.
  const [dockOpen, setDockOpen] = useState(() => window.innerWidth > 640);
  const set = (p: Partial<Look>) => setLook((l) => ({ ...l, ...p }));
  const pal = getPalette(look.palette);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(look));
    } catch {
      /* private mode: the look just won't be remembered */
    }
  }, [look]);

  const shuffle = () =>
    set({
      palette: pickOne(PALETTES).id,
      backdrop: pickOne(BACKDROPS),
      layout: pickOne(LAYOUTS).id,
      sticker: pickOne(STICKERS).src,
    });

  const vars = {
    '--bg': pal.bg,
    '--ink': pal.ink,
    '--accent': pal.accent,
    '--accent-ink': pal.accentInk,
    '--accent2': pal.accent2,
  } as CSSProperties;

  return (
    <main className={cx(styles.page, styles[look.backdrop], styles[look.layout], dockOpen && styles.withDock)} style={vars}>
      <div className={styles.stage}>
        <span className={styles.code}>404</span>
        {look.sticker && <img className={styles.sticker} src={look.sticker} alt="" draggable={false} />}
        {/* Keyed by the text, so a reset or a shuffle remounts what the
            browser has been editing instead of fighting it. */}
        <h1
          key={`h-${look.headline}`}
          className={styles.headline}
          contentEditable="plaintext-only"
          suppressContentEditableWarning
          spellCheck={false}
          aria-label="Headline, editable"
          onBlur={(e) => set({ headline: e.currentTarget.textContent?.trim() || DEFAULT_LOOK.headline })}
        >
          {look.headline}
        </h1>
        <p
          key={`b-${look.body}`}
          className={styles.body}
          contentEditable="plaintext-only"
          suppressContentEditableWarning
          spellCheck={false}
          aria-label="Message, editable"
          onBlur={(e) => set({ body: e.currentTarget.textContent?.trim() || DEFAULT_LOOK.body })}
        >
          {look.body}
        </p>
        <a className={styles.cta} href="/">
          Back to the desktop
        </a>
      </div>

      <section className={cx(styles.dock, !dockOpen && styles.dockClosed)} aria-label="Customise this page">
        <button type="button" className={styles.dockToggle} onClick={() => setDockOpen((o) => !o)} aria-expanded={dockOpen}>
          <MaterialIcon name={dockOpen ? 'expand_more' : 'palette'} size={18} />
          {dockOpen ? 'Hide' : 'Customise'}
        </button>

        {dockOpen && (
          <div className={styles.dockBody}>
            <fieldset className={styles.group}>
              <legend>Palette</legend>
              <div className={styles.row}>
                {PALETTES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={cx(styles.swatch, look.palette === p.id && styles.on)}
                    style={{ background: `linear-gradient(135deg, ${p.bg} 50%, ${p.accent} 50%)` }}
                    onClick={() => set({ palette: p.id })}
                    aria-pressed={look.palette === p.id}
                    aria-label={p.name}
                    title={p.name}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset className={styles.group}>
              <legend>Backdrop</legend>
              <div className={styles.row}>
                {BACKDROPS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    className={cx(styles.chip, look.backdrop === b && styles.on)}
                    onClick={() => set({ backdrop: b })}
                    aria-pressed={look.backdrop === b}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className={styles.group}>
              <legend>Layout</legend>
              <div className={styles.row}>
                {LAYOUTS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    className={cx(styles.chip, look.layout === l.id && styles.on)}
                    onClick={() => set({ layout: l.id })}
                    aria-pressed={look.layout === l.id}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className={cx(styles.group, styles.stickerGroup)}>
              <legend>Sticker</legend>
              <div className={styles.row}>
                <button
                  type="button"
                  className={cx(styles.thumb, styles.none, look.sticker === '' && styles.on)}
                  onClick={() => set({ sticker: '' })}
                  aria-pressed={look.sticker === ''}
                  aria-label="No sticker"
                >
                  <MaterialIcon name="block" size={16} />
                </button>
                {STICKERS.map((s) => (
                  <button
                    key={s.src}
                    type="button"
                    className={cx(styles.thumb, look.sticker === s.src && styles.on)}
                    onClick={() => set({ sticker: s.src })}
                    aria-pressed={look.sticker === s.src}
                    aria-label={s.label}
                  >
                    <img src={s.src} alt="" draggable={false} />
                  </button>
                ))}
              </div>
            </fieldset>

            <div className={styles.actions}>
              <span className={styles.hint}>Click the words to rewrite them.</span>
              <button type="button" className={styles.shuffle} onClick={shuffle}>
                <MaterialIcon name="shuffle" size={16} />
                Shuffle
              </button>
              <button type="button" className={styles.reset} onClick={() => setLook(DEFAULT_LOOK)}>
                Reset
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
