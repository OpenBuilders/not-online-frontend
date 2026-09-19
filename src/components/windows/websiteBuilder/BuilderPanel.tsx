import { useRef, type ChangeEvent, type RefObject } from 'react';
import { AeroButton } from '@/components/shared/AeroButton';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { Sticker } from '@/components/shared/Sticker';
import { AVATAR_PRESETS, FOLDER_COLORS } from '@/data/siteAssets';
import {
  BACKDROPS,
  BUTTON_COLORS,
  BUTTON_STYLES,
  PALETTES,
  TEMPLATES,
  getPalette,
  getTemplate,
  newLink,
  siteUrl,
} from '@/data/siteTemplates';
import { cx } from '@/lib/cx';
import type { SiteConfig, SiteLink } from '@/types';
import styles from './BuilderPanel.module.css';
import { BackdropSwatch } from './BackdropSwatch';
import { IconPicker } from './IconPicker';
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
  const template = getTemplate(cfg.template);

  // "Just a button" is one link by definition, so the editor shows exactly
  // one row and no way to add another.
  const visibleLinks = template.singleLink ? cfg.links.slice(0, 1) : cfg.links;
  const showAvatar = cfg.template !== 'button';

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
          <span className={styles.prefix}>not.online/</span>
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
        {showAvatar ? (
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
        ) : (
          <p className={styles.blurb}>Just a button doesn&apos;t show an avatar — that&apos;s rather the point.</p>
        )}
      </section>

      <section className={styles.section} ref={tour.templateRef}>
        <h3 className={styles.head}>
          <span className={styles.step}>3</span> Template
        </h3>
        <div className={styles.templates}>
          {TEMPLATES.map((t) => {
            // Locked templates stay on the shelf rather than disappearing:
            // a guest should be able to see what an account is for.
            const locked = isGuest && !t.guest;
            return (
              <button
                key={t.id}
                type="button"
                className={cx(styles.template, cfg.template === t.id && styles.on, locked && styles.locked)}
                disabled={locked}
                onClick={() => {
                  patch({ template: t.id });
                  tour.onPicked('template');
                }}
                aria-pressed={cfg.template === t.id}
              >
                <TemplateThumb template={t.id} palette={palette} />
                {locked && <Sticker text="For patrons" icon="lock" color="pink" rotate={-7} className={styles.lockSticker} />}
                <span className={styles.templateName}>{t.name}</span>
              </button>
            );
          })}
        </div>
        <p className={styles.blurb}>{template.blurb}</p>

        {cfg.template === 'stickers' && (
          <button type="button" className={styles.ghostBtn} onClick={() => patch({ seed: cfg.seed + 1 })}>
            <MaterialIcon name="shuffle" size={15} />
            Shuffle the shapes
          </button>
        )}

        {cfg.template === 'button' && (
          <div className={styles.pickerRow}>
            <div>
              <label className={styles.label} htmlFor="pb-btn-style">
                Button style
              </label>
              <select
                id="pb-btn-style"
                className={styles.select}
                value={cfg.buttonStyle}
                onChange={(e) => patch({ buttonStyle: e.target.value })}
              >
                {BUTTON_STYLES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.label} htmlFor="pb-btn-color">
                Button colour
              </label>
              <select
                id="pb-btn-color"
                className={styles.select}
                value={cfg.buttonColor}
                onChange={(e) => patch({ buttonColor: e.target.value })}
              >
                {BUTTON_COLORS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {cfg.template === 'folders' && (
          <>
            <label className={styles.label}>Folder colour</label>
            <div className={styles.folderRow}>
              {FOLDER_COLORS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={cx(styles.folderSwatch, cfg.folderColor === f.id && styles.on)}
                  onClick={() => patch({ folderColor: f.id })}
                  aria-pressed={cfg.folderColor === f.id}
                  title={f.name}
                  aria-label={f.name}
                >
                  <img src={f.src} alt="" />
                </button>
              ))}
            </div>
          </>
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
              className={cx(styles.backdropOption, cfg.backdrop === b.id && styles.on)}
              onClick={() => patch({ backdrop: b.id })}
              aria-pressed={cfg.backdrop === b.id}
            >
              <BackdropSwatch kind={b.id} palette={palette} />
              <span className={styles.backdropName}>{b.name}</span>
            </button>
          ))}
          <button
            type="button"
            className={cx(styles.backdropOption, cfg.backdrop === 'photo' && styles.on)}
            onClick={() => (cfg.backdropImage ? patch({ backdrop: 'photo' }) : backdropFileRef.current?.click())}
            aria-pressed={cfg.backdrop === 'photo'}
          >
            <BackdropSwatch kind="photo" palette={palette} image={cfg.backdropImage} />
            <span className={styles.backdropName}>Photo</span>
          </button>
          <input ref={backdropFileRef} type="file" accept="image/*" hidden onChange={onBackdropFile} />
        </div>
        {cfg.backdropImage && (
          <button type="button" className={styles.ghostBtn} onClick={() => backdropFileRef.current?.click()}>
            <MaterialIcon name="image" size={15} />
            Replace photo
          </button>
        )}
      </section>

      <section className={styles.section} ref={tour.linksRef}>
        <h3 className={styles.head}>
          <span className={styles.step}>5</span> {template.singleLink ? 'Your link' : 'Links'}
        </h3>
        {template.singleLink && (
          <p className={styles.notice}>
            <MaterialIcon name="info" size={15} />
            This template holds one link — that&apos;s the whole idea. Your other links are kept and come back if you
            switch template.
          </p>
        )}
        <div className={styles.links}>
          {visibleLinks.map((l) => (
            <div key={l.id} className={cx(styles.linkRow, template.noLinkIcons && styles.noIcon)}>
              {/* Hidden rather than forced to "none": these templates draw no
                  icons, so the picker would be a setting with no effect —
                  but the choice is kept, and comes back with a template
                  that does use it. */}
              {!template.noLinkIcons && <IconPicker value={l.icon} onChange={(icon) => setLink(l.id, { icon })} />}
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
              {!template.singleLink && (
                <button
                  type="button"
                  className={styles.removeLink}
                  aria-label={`Remove ${l.title || 'link'}`}
                  onClick={() => patch({ links: cfg.links.filter((x) => x.id !== l.id) })}
                >
                  <MaterialIcon name="close" size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
        {!template.singleLink && (
          <button
            type="button"
            className={styles.ghostBtn}
            disabled={cfg.links.length >= MAX_LINKS}
            onClick={() => patch({ links: [...cfg.links, newLink()] })}
          >
            <MaterialIcon name="add" size={15} />
            New link
          </button>
        )}
      </section>

      <section className={styles.section}>
        {live && (
          <div className={styles.liveCard}>
            <div className={styles.liveHead}>
              <span className={styles.liveDot} />
              {siteUrl(cfg.handle)} is live
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
        {isGuest && <p className={styles.fine}>Guest demo — your page lives in this browser only. Log in to keep it.</p>}
      </section>
    </div>
  );
}
