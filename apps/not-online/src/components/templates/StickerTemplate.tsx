import type { CSSProperties } from 'react';
import { LinkIcon } from './LinkIcon';
import type { TemplateProps } from './SitePage';
import styles from './StickerTemplate.module.css';
import { noise } from './pageContent';
import { SHAPE_PATHS, STICKER_SHAPES } from './stickerShapes';

const TONES = ['a', 'b', 'c'] as const;

/**
 * "Stickers" — every link is a die-cut sticker: the cut-line is the shape's
 * own stroke (see stickerShapes.ts), so it hugs a star as exactly as it
 * hugs a circle, and a blurred offset shadow lifts the whole thing off the
 * page. The old builder let you drag each one by hand, which was fiddly and
 * easy to make ugly; the scatter is derived from `cfg.seed` instead, so
 * "shuffle" in the setup panel re-rolls a layout that is always legible.
 */
export function StickerTemplate({ cfg, content }: TemplateProps) {
  const { name, bio, links, initials, avatar } = content;

  return (
    <div className={styles.root}>
      <div className={styles.head}>
        <div className={styles.avatar}>
          {avatar ? <img src={avatar} alt="" /> : <span className={styles.initials}>{initials}</span>}
        </div>
        <div className={styles.ribbon}>{name}</div>
        <p className={styles.bio}>{bio}</p>
      </div>

      <div className={styles.board}>
        {links.map((l, i) => {
          const shape = STICKER_SHAPES[Math.floor(noise(cfg.seed, i, 1) * STICKER_SHAPES.length)];
          const tone = TONES[i % TONES.length];
          const vars = {
            '--tilt': `${(noise(cfg.seed, i, 2) * 18 - 9).toFixed(2)}deg`,
            '--nudge-x': `${(noise(cfg.seed, i, 3) * 14 - 7).toFixed(1)}px`,
            '--nudge-y': `${(noise(cfg.seed, i, 4) * 14 - 7).toFixed(1)}px`,
          } as CSSProperties;
          return (
            <a
              key={l.id}
              className={styles.sticker}
              data-tone={tone}
              data-shape={shape}
              style={vars}
              href={l.url || '#'}
              target="_blank"
              rel="noreferrer"
            >
              <svg className={styles.shape} viewBox="0 0 100 100" aria-hidden="true">
                <path d={SHAPE_PATHS[shape]} />
              </svg>
              <span className={styles.face}>
                <LinkIcon icon={l.icon} size={30} className={styles.icon} />
                <span className={styles.label}>{l.title}</span>
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
