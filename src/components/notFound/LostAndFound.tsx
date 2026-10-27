import { useState } from 'react';
import { Confetti } from '@/components/shared/Confetti';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { Sticker } from '@/components/shared/Sticker';
import { cx } from '@/lib/cx';
import styles from './LostAndFound.module.css';

const VIEWS = [
  { id: 'front', label: 'Front' },
  { id: 'back', label: 'Back, also blank' },
  { id: 'corner', label: 'The torn corner' },
] as const;
type View = (typeof VIEWS)[number]['id'];

const SPECS: [string, string][] = [
  ['Content', 'None'],
  ['Size', '0 KB'],
  ['Links', 'Broken'],
  ['Previous owner', 'Unknown'],
  ['Pick-up', 'Nowhere'],
  ['Warranty', 'Void'],
];

/**
 * The missing page, listed on the Market like anything else: photos,
 * condition, specs, a seller with a perfect rating. It costs nothing,
 * because it is nothing. Buying it throws confetti and takes you home.
 */
export function LostAndFound() {
  const [view, setView] = useState<View>('front');
  const [saved, setSaved] = useState(false);
  const [offer, setOffer] = useState(false);
  const [sold, setSold] = useState(false);

  return (
    <main className={styles.page}>
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <a href="/">Market</a>
        <MaterialIcon name="chevron_right" size={14} />
        <span>Pages</span>
        <MaterialIcon name="chevron_right" size={14} />
        <span aria-current="page">Used</span>
      </nav>

      <div className={styles.listing}>
        <section className={styles.gallery} aria-label="Photos">
          <div className={cx(styles.photo, styles[view])}>
            <div className={styles.sheet}>
              <span className={styles.sheetCode}>404</span>
              <span className={styles.rules} />
            </div>
            <Sticker text="€0" color="pink" rotate={8} className={styles.priceTag} />
          </div>
          <div className={styles.thumbs} role="group" aria-label="Choose a photo">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                className={cx(styles.thumb, styles[v.id], view === v.id && styles.thumbOn)}
                onClick={() => setView(v.id)}
                aria-pressed={view === v.id}
                aria-label={v.label}
              >
                <span className={styles.sheet}>
                  <span className={styles.sheetCode}>404</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.info}>
          <span className={styles.condition}>Used · slightly broken</span>
          <h1 className={styles.title}>404 page</h1>
          <p className={styles.price}>
            €0 <span>free pick-up from nowhere</span>
          </p>

          <p className={styles.desc}>
            Previously contained something. Now contains nothing. Has been looked for by several people, including you. Sold as
            seen, which is not at all.
          </p>

          <dl className={styles.specs}>
            {SPECS.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <div className={styles.seller}>
            <span className={styles.avatar} aria-hidden="true">
              N
            </span>
            <span className={styles.sellerText}>
              <b>Nothing Media</b>
              <span>Rated 5.0 for delivering nothing · replies never</span>
            </span>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.buy} onClick={() => setSold(true)}>
              Buy now
            </button>
            <button type="button" className={styles.offer} onClick={() => setOffer(true)}>
              Make an offer
            </button>
            <button
              type="button"
              className={cx(styles.save, saved && styles.saveOn)}
              onClick={() => setSaved((s) => !s)}
              aria-pressed={saved}
              aria-label={saved ? 'Remove from favourites' : 'Save to favourites'}
            >
              <MaterialIcon name="favorite" size={18} />
            </button>
          </div>
          {offer && (
            <p className={styles.note} role="status">
              The seller does not accept offers below €0.
            </p>
          )}
        </section>
      </div>

      {sold && (
        <>
          <Confetti />
          <div className={styles.scrim}>
            <section className={styles.sold} role="dialog" aria-label="Sold">
              <h2>Sold</h2>
              <p>The 404 page is yours now. It is still empty. That was always the deal.</p>
              <a className={styles.homeBtn} href="/">
                Take it home
              </a>
            </section>
          </div>
        </>
      )}
    </main>
  );
}
