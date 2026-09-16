import type { CSSProperties } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import type { TemplateProps } from './SitePage';
import styles from './StickerTemplate.module.css';
import { noise } from './pageContent';

const SHAPES = ['circle', 'rounded', 'squircle', 'burst'] as const;
const TONES = ['a', 'b', 'c'] as const;

/**
 * "Stickers" — every link is a die-cut sticker: thick white cut-line, hard
 * offset shadow, its own tilt. The old builder let you drag each one by
 * hand, which was fiddly and easy to make ugly; the scatter is derived from
 * `cfg.seed` instead, so "shuffle" in the setup panel re-rolls a layout that
 * is always legible.
 */
export function StickerTemplate({ cfg, content }: TemplateProps) {
  const { name, handle, bio, links, initials, avatar } = content;

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
          const shape = SHAPES[Math.floor(noise(cfg.seed, i, 1) * SHAPES.length)];
          const tone = TONES[i % TONES.length];
          const vars = {
            '--tilt': `${(noise(cfg.seed, i, 2) * 18 - 9).toFixed(2)}deg`,
            '--nudge-x': `${(noise(cfg.seed, i, 3) * 22 - 11).toFixed(1)}px`,
            '--nudge-y': `${(noise(cfg.seed, i, 4) * 18 - 9).toFixed(1)}px`,
          } as CSSProperties;
          return (
            <a
              key={l.id}
              className={styles.sticker}
              data-shape={shape}
              data-tone={tone}
              style={vars}
              href={l.url || '#'}
              target="_blank"
              rel="noreferrer"
            >
              <span className={styles.face}>
                <MaterialIcon name={l.icon} size={40} />
                <span className={styles.label}>{l.title}</span>
              </span>
            </a>
          );
        })}
      </div>

      <div className={styles.foot}>{handle}.not.online</div>
    </div>
  );
}
