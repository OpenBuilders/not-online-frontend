import type { TemplateProps } from './SitePage';
import styles from './Web1Template.module.css';
import { LinkIcon } from './LinkIcon';

/**
 * "Web 1.0" — a personal homepage from 1996, and nothing else. Earlier
 * passes dressed it in fake OS chrome (title bar, menu strip, bevelled
 * boxes), which made it a screenshot of a browser rather than a page you
 * are actually on. All of that is gone, along with every border and fill:
 * a real page from that era was centred text on a tiled background, and
 * its whole personality came from type, colour and rules.
 *
 * No placeholder art either. If nobody picked an avatar there simply isn't
 * one — a grey box with a symbol in it is a 2015 empty state, and it reads
 * as one.
 */
export function Web1Template({ content }: TemplateProps) {
  const { name, bio, links, avatar } = content;

  return (
    <div className={styles.root}>
      <div className={styles.sheet}>
        <p className={styles.welcome}>· · · welcome to · · ·</p>
        <h1 className={styles.h1}>{name}&apos;s home page</h1>
        <hr className={styles.rule} />

        {avatar && <img className={styles.portrait} src={avatar} alt="" />}

        <p className={styles.intro}>{bio}</p>

        <p className={styles.dingbat}>✦ ✦ ✦</p>

        <ul className={styles.list}>
          {links.map((l) => (
            <li key={l.id}>
              <a href={l.url || '#'} target="_blank" rel="noreferrer">
                <LinkIcon icon={l.icon} size={15} className={styles.icon} />
                {l.title}
              </a>
            </li>
          ))}
        </ul>

        <hr className={styles.rule} />
        <p className={styles.signoff}>thanks for visiting !!</p>
      </div>
    </div>
  );
}
