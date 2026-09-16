import { useRef, type ChangeEvent, type RefObject } from 'react';
import { AeroButton } from '@/components/shared/AeroButton';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { AVATAR_PRESETS, BACKDROPS, LINK_ICONS, PALETTES, TEMPLATES, getPalette, newLink } from '@/data/siteTemplates';
import { cx } from '@/lib/cx';
import type { SiteConfig, SiteLink } from '@/types';
import styles from './BuilderPanel.module.css';
import { TemplateThumb } from './TemplateThumb';

export type TourTarget = 'handle' | 'template' | 'palette' | 'avatar' | 'links';

export interface BuilderTourHooks {
  handleRef: RefObject<HTMLInputElement | null>;
  templateRef: RefObject<HTMLDivElement | null>;
  paletteRef: RefObject<HTMLDivElement | null>;
  avatarRef: RefObject<HTMLDivElement | null>;
  linksRef: RefObject<HTMLDivElement | null>;
  publishRef: RefObject<HTMLButtonElement | null>;
  onPicked: (what: TourTarget) => void;
}

interface BuilderPanelProps {
  cfg: SiteConfig;
  patch: (p: Partial<SiteConfig>) => void;
  live: boolean;
  dirty: boolean;
  isGuest: boolean;
  onPublish: () => void;
  tour: BuilderTourHooks;
}

const MAX_LINKS = 8;

function readAsDataUrl(file: File, done: (url: string) => void) {
  const reader = new FileReader();
  reader.onload = () => done(reader.result as string);
  reader.readAsDataURL(file);
}

/** The left half of the builder: every choice that feeds the preview, in the order a first-timer should meet them. */
export function BuilderPanel({ cfg, patch, live, dirty, isGuest, onPublish, tour }: BuilderPanelProps) {
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const backdropFileRef = useRef<HTMLInputElement>(null);
  const palette = getPalette(cfg.palette);

  const setLink = (id: string, p: Partial<SiteLink>) =>
    patch({ links: cfg.links.map((l) => (l.id === id ? { ...l, ...p } : l)) });

  const onAvatarFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readAsDataUrl(file, (url) => patch({ avatar: url }));
    e.target.value = '';
  };

  const onBackdropFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readAsDataUrl(file, (url) => patch({ backdrop: 'photo', backdropImage: url }));
    e.target.value = '';
  };

  return (
    <div className={styles.panel}>
      <section className={styles.section}>
        <h3 className={styles.head}>
          <span className={styles.step}>1</span> Who is this
        </h3>
        <label className={styles.label} htmlFor="pb-handle">
          Address
        </label>
        <div className={styles.handleField}>
          <input
            id="pb-handle"
            ref={tour.handleRef}
            className={styles.handleInput}
            placeholder="yourname"
            spellCheck={false}
            value={cfg.handle}
            onChange={(e) => patch({ handle: e.target.value.replace(/[^a-z0-9-]/gi, '').toLowerCase() })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') tour.onPicked('handle');
            }}
          />
          <span className={styles.suffix}>.not.online</span>
        </div>

        <label className={styles.label} htmlFor="pb-name">
          Display name
        </label>
        <input
          id="pb-name"
          className={styles.input}
          placeholder="Your Name"
          value={cfg.name}
          onChange={(e) => patch({ name: e.target.value })}
        />

        <label className={styles.label} htmlFor="pb-bio">
          One line about you
        </label>
        <textarea
          id="pb-bio"
          className={styles.textarea}
          placeholder="I make things that are probably nothing."
          maxLength={140}
          value={cfg.bio}
          onChange={(e) => patch({ bio: e.target.value })}
        />
      </section>

      <section className={styles.section} ref={tour.avatarRef}>
        <h3 className={styles.head}>
          <span className={styles.step}>2</span> Avatar
        </h3>
        <div className={styles.avatarRow}>
          <button
            type="button"
            className={cx(styles.avatarOption, styles.avatarNone, cfg.avatar === null && styles.on)}
            onClick={() => {
              patch({ avatar: null });
              tour.onPicked('avatar');
            }}
            aria-pressed={cfg.avatar === null}
          >
            <MaterialIcon name="text_fields" size={18} />
            <span>Initials</span>
          </button>
          {AVATAR_PRESETS.map((src) => (
            <button
              key={src}
              type="button"
              className={cx(styles.avatarOption, cfg.avatar === src && styles.on)}
              onClick={() => {
                patch({ avatar: src });
                tour.onPicked('avatar');
              }}
              aria-pressed={cfg.avatar === src}
              aria-label="Use this avatar"
            >
              <img src={src} alt="" />
            </button>
          ))}
          <button
            type="button"
            className={cx(styles.avatarOption, styles.avatarUpload)}
            onClick={() => avatarFileRef.current?.click()}
          >
            <MaterialIcon name="add_photo_alternate" size={18} />
            <span>Upload</span>
          </button>
          <input ref={avatarFileRef} type="file" accept="image/*" hidden onChange={onAvatarFile} />
        </div>
      </section>

      <section className={styles.section} ref={tour.templateRef}>
        <h3 className={styles.head}>
          <span className={styles.step}>3</span> Template
        </h3>
        <div className={styles.templates}>
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={cx(styles.template, cfg.template === t.id && styles.on)}
              onClick={() => {
                patch({ template: t.id });
                tour.onPicked('template');
              }}
              aria-pressed={cfg.template === t.id}
            >
              <TemplateThumb template={t.id} palette={palette} />
              <span className={styles.templateName}>{t.name}</span>
            </button>
          ))}
        </div>
        <p className={styles.blurb}>{TEMPLATES.find((t) => t.id === cfg.template)?.blurb}</p>
        {cfg.template === 'stick' && (
          <button type="button" className={styles.ghostBtn} onClick={() => patch({ seed: cfg.seed + 1 })}>
            <MaterialIcon name="shuffle" size={15} />
            Shuffle the scatter
          </button>
        )}
      </section>

      <section className={styles.section} ref={tour.paletteRef}>
        <h3 className={styles.head}>
          <span className={styles.step}>4</span> Colours
        </h3>
        <div className={styles.palettes}>
          {PALETTES.map((p) => (
            <button
              key={p.id}
              type="button"
              className={cx(styles.palette, cfg.palette === p.id && styles.on)}
              onClick={() => {
                patch({ palette: p.id });
                tour.onPicked('palette');
              }}
              aria-pressed={cfg.palette === p.id}
            >
              <span className={styles.swatch} style={{ background: p.bg }}>
                <i style={{ background: p.accent }} />
                <i style={{ background: p.accent2 }} />
                <i style={{ background: p.ink }} />
              </span>
              <span className={styles.paletteName}>{p.name}</span>
            </button>
          ))}
        </div>

        <label className={styles.label}>Background</label>
        <div className={styles.backdrops}>
          {BACKDROPS.filter((b) => b.id !== 'photo').map((b) => (
            <button
              key={b.id}
              type="button"
              className={cx(styles.chip, cfg.backdrop === b.id && styles.on)}
              onClick={() => patch({ backdrop: b.id })}
              aria-pressed={cfg.backdrop === b.id}
            >
              {b.name}
            </button>
          ))}
          <button
            type="button"
            className={cx(styles.chip, cfg.backdrop === 'photo' && styles.on)}
            onClick={() => (cfg.backdropImage ? patch({ backdrop: 'photo' }) : backdropFileRef.current?.click())}
            aria-pressed={cfg.backdrop === 'photo'}
          >
            <MaterialIcon name="image" size={14} />
            Photo
          </button>
          {cfg.backdropImage && (
            <button type="button" className={styles.chip} onClick={() => backdropFileRef.current?.click()}>
              Replace
            </button>
          )}
          <input ref={backdropFileRef} type="file" accept="image/*" hidden onChange={onBackdropFile} />
        </div>
      </section>

      <section className={styles.section} ref={tour.linksRef}>
        <h3 className={styles.head}>
          <span className={styles.step}>5</span> Links
        </h3>
        <div className={styles.links}>
          {cfg.links.map((l) => (
            <div key={l.id} className={styles.linkRow}>
              <select
                className={styles.select}
                value={l.icon}
                onChange={(e) => setLink(l.id, { icon: e.target.value })}
                aria-label="Link type"
              >
                {LINK_ICONS.map((ic) => (
                  <option key={ic.value} value={ic.value}>
                    {ic.label}
                  </option>
                ))}
              </select>
              <input
                className={styles.input}
                placeholder="Label"
                value={l.title}
                onChange={(e) => setLink(l.id, { title: e.target.value })}
              />
              <input
                className={styles.input}
                placeholder="https://…"
                value={l.url}
                onChange={(e) => setLink(l.id, { url: e.target.value })}
              />
              <button
                type="button"
                className={styles.removeLink}
                aria-label={`Remove ${l.title || 'link'}`}
                onClick={() => patch({ links: cfg.links.filter((x) => x.id !== l.id) })}
              >
                <MaterialIcon name="close" size={15} />
              </button>
            </div>
          ))}
        </div>
        <div className={styles.linkActions}>
          <button
            type="button"
            className={styles.ghostBtn}
            disabled={cfg.links.length >= MAX_LINKS}
            onClick={() => patch({ links: [...cfg.links, newLink()] })}
          >
            <MaterialIcon name="add" size={15} />
            New link
          </button>
          <button type="button" className={styles.ghostBtn} onClick={() => tour.onPicked('links')}>
            Done with links
          </button>
        </div>
      </section>

      <section className={styles.section}>
        {live && (
          <div className={styles.liveCard}>
            <div className={styles.liveHead}>
              <span className={styles.liveDot} />
              {cfg.handle || 'yourname'}.not.online is live
            </div>
            <div className={styles.stats}>
              <div>
                <span className={styles.statValue}>{cfg.views}</span>
                <span className={styles.statKey}>views</span>
              </div>
              <div>
                <span className={styles.statValue}>{cfg.clicks}</span>
                <span className={styles.statKey}>clicks</span>
              </div>
              <div>
                <span className={styles.statValue}>{cfg.links.filter((l) => l.title.trim()).length}</span>
                <span className={styles.statKey}>links</span>
              </div>
            </div>
          </div>
        )}
        <AeroButton
          ref={tour.publishRef}
          variant="lime"
          wide
          disabled={live && !dirty}
          onClick={onPublish}
          className={styles.publish}
        >
          {live ? (dirty ? 'Save changes' : 'All changes saved') : 'Publish my page'}
        </AeroButton>
        <p className={styles.fine}>
          {isGuest
            ? 'Guest demo — your page lives in this browser only. Log in to keep it.'
            : 'Custom domains are coming. For now everyone gets a .not.online.'}
        </p>
      </section>
    </div>
  );
}
