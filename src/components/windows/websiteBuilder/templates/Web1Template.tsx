import { MaterialIcon } from '@/components/shared/MaterialIcon';
import type { TemplateProps } from './SitePage';
import styles from './Web1Template.module.css';
import { noise } from './pageContent';

const MENUS = ['File', 'Edit', 'View', 'Favorites', 'Help'];

/**
 * "Web 1.0" — the page sits inside a 1998 browser window, with a second
 * little window peeking out behind it. Everything a personal homepage had:
 * pixel type, a rule under the heading, an underlined link list, a hit
 * counter and a "best viewed in" line.
 */
export function Web1Template({ cfg, content }: TemplateProps) {
  const { name, handle, bio, links, initials, avatar } = content;
  // Stable per page, not per render — a counter that reshuffled on every
  // keystroke would read as a bug rather than a joke.
  const hits = 100000 + Math.floor(noise(cfg.seed, 7, 11) * 899999);

  return (
    <div className={styles.root}>
      <div className={styles.stack}>
      <div className={styles.behind} aria-hidden="true">
        <div className={styles.titlebar}>
          <span className={styles.titleText}>guestbook.exe</span>
          <span className={styles.controls}>
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className={styles.behindBody}>
          <p>sign my guestbook!!</p>
          <div className={styles.fakeField} />
          <div className={styles.fakeField} />
          <span className={styles.fakeBtn}>Submit</span>
        </div>
      </div>

      <div className={styles.window}>
        <div className={styles.titlebar}>
          <span className={styles.titleText}>{handle}.not.online - Nothing Explorer</span>
          <span className={styles.controls}>
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className={styles.menubar}>
          {MENUS.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        <div className={styles.addressbar}>
          <span className={styles.addressLabel}>Address</span>
          <span className={styles.addressField}>http://www.{handle}.not.online/index.html</span>
        </div>

        <div className={styles.paper}>
          <div className={styles.marquee}>
            <div className={styles.marqueeTrack}>
              <span>*** welcome to my homepage *** thanks for visiting *** </span>
              <span>*** welcome to my homepage *** thanks for visiting *** </span>
            </div>
          </div>

          <div className={styles.masthead}>
            <div className={styles.portrait}>
              {avatar ? <img src={avatar} alt="" /> : <span className={styles.initials}>{initials}</span>}
            </div>
            <div>
              <h1 className={styles.h1}>{name}&apos;s home page</h1>
              <div className={styles.rule} />
              <p className={styles.intro}>
                {bio} <span className={styles.blink}>new!</span>
              </p>
            </div>
          </div>

          <div className={styles.sectionLabel}>my links</div>
          <ul className={styles.list}>
            {links.map((l) => (
              <li key={l.id}>
                <span className={styles.bullet}>
                  <MaterialIcon name={l.icon} size={13} />
                </span>
                <a href={l.url || '#'} target="_blank" rel="noreferrer">
                  {l.title}
                </a>
              </li>
            ))}
          </ul>

          <div className={styles.footRow}>
            <div className={styles.counter}>
              <span className={styles.counterLabel}>visitors</span>
              <span className={styles.counterDigits}>
                {String(hits)
                  .split('')
                  .map((d, i) => (
                    <i key={i}>{d}</i>
                  ))}
              </span>
            </div>
            <div className={styles.badges}>
              <span className={styles.badge}>best viewed at 800 x 600</span>
              <span className={styles.badge} data-tone="accent">
                under construction
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
