import { getFolderColor } from '@/data/siteAssets';
import { siteUrl } from '@/data/siteTemplates';
import type { TemplateProps } from './SitePage';
import styles from './FoldersTemplate.module.css';
import { LinkIcon } from './LinkIcon';

/**
 * "Folders" — the page as a tidy desktop: links are folders, the type is
 * the system stack, and nothing else is on screen. The path strip at the
 * bottom is the one bit of chrome, and it says something true (where this
 * page actually lives).
 *
 * The folder is always the folder: picking a colour swaps which image in
 * public/assets/site/folders gets drawn, and a link's own icon sits *on*
 * that folder rather than replacing it. An earlier version let an icon
 * stand in for the folder entirely, which made a page of folders and a
 * page of loose icons look like the same setting.
 *
 * The icon is printed on the face rather than placed over it: multiplied
 * into the artwork at half strength, with no chip, no ring and no shadow
 * of its own. A mark with its own background would be a second object
 * lying on the folder; multiplied, it is something the folder has on it.
 */
export function FoldersTemplate({ cfg, content }: TemplateProps) {
  const { name, bio, links, avatar } = content;
  const folder = getFolderColor(cfg.folderColor);

  return (
    <div className={styles.root}>
      {/* The avatar reads as part of who this page is, so it goes inside
          the name's own outline rather than beside it — one object that
          says who this is, not a thumbnail parked next to a caption. */}
      <div className={styles.head}>
        <h1 className={styles.name}>
          {avatar && <img className={styles.avatar} src={avatar} alt="" />}
          <span className={styles.nameText}>{name}</span>
        </h1>
      </div>

      <div className={styles.shelf}>
        {links.map((l) => (
          <a
            key={l.id}
            className={styles.folder}
            href={l.url || '#'}
            target="_blank"
            rel="noreferrer"
            data-link-title={l.title}
          >
            <span className={styles.art}>
              <img className={styles.folderImg} src={folder.src} alt="" />
              <LinkIcon icon={l.icon} size={32} className={styles.badge} />
            </span>
            <span className={styles.label}>{l.title}</span>
          </a>
        ))}
      </div>

      <div className={styles.about}>
        <p className={styles.bio}>{bio}</p>
      </div>

      <div className={styles.path}>
        {siteUrl(cfg.handle)
          .split('/')
          .map((part, i, all) => (
            <span key={part} className={styles.crumb}>
              <img className={styles.crumbIcon} src={folder.src} alt="" />
              {part}
              {i < all.length - 1 && <i className={styles.sep}>›</i>}
            </span>
          ))}
      </div>
    </div>
  );
}
