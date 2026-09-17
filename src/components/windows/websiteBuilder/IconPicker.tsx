import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { ICON_PRESETS, NO_ICON, iconLabel, isImageIcon } from '@/data/siteAssets';
import { LINK_ICONS } from '@/data/siteTemplates';
import { cx } from '@/lib/cx';
import styles from './IconPicker.module.css';

type Tab = 'all' | 'icons' | 'not';

const POPOVER_WIDTH = 264;
const POPOVER_HEIGHT_EST = 260;

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'icons', label: 'Icons' },
  { id: 'not', label: 'not_icons' },
];

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

/**
 * The link's mark, picked from a grid rather than a `<select>` of names —
 * there are forty-odd illustrations now, and reading "icon_lovehands.png"
 * tells you nothing about what it looks like.
 *
 * "None" is a real choice, not a blank: a link with no icon renders without
 * an icon slot at all, rather than leaving a gap where one would be.
 *
 * The panel is portaled to the body and positioned from the trigger's rect
 * rather than absolutely positioned next to it: the settings column scrolls
 * (`overflow: auto`), which clips any popover that tries to escape it.
 */
export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('all');
  const [spot, setSpot] = useState({ top: 0, left: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const t = rootRef.current?.getBoundingClientRect();
      if (!t) return;
      const w = POPOVER_WIDTH;
      const h = popRef.current?.offsetHeight ?? POPOVER_HEIGHT_EST;
      // Flip above the trigger when there isn't room under it.
      const below = t.bottom + 6;
      const top = below + h > window.innerHeight - 8 ? Math.max(8, t.top - 6 - h) : below;
      setSpot({ top, left: Math.min(Math.max(8, t.left), window.innerWidth - w - 8) });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || popRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const symbols = tab === 'not' ? [] : LINK_ICONS;
  const images = tab === 'icons' ? [] : ICON_PRESETS;

  const pick = (icon: string) => {
    onChange(icon);
    setOpen(false);
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Choose an icon"
      >
        {value === NO_ICON ? (
          <span className={styles.none}>None</span>
        ) : isImageIcon(value) ? (
          <img src={value} alt="" />
        ) : (
          <MaterialIcon name={value} size={18} />
        )}
        <MaterialIcon name="expand_more" size={14} />
      </button>

      {open &&
        createPortal(
          <div ref={popRef} className={styles.popover} style={{ top: spot.top, left: spot.left }}>
          <div className={styles.tabs}>
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={cx(styles.tab, tab === t.id && styles.on)}
                onClick={() => setTab(t.id)}
                aria-pressed={tab === t.id}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            <button
              type="button"
              className={cx(styles.cell, styles.noneCell, value === NO_ICON && styles.picked)}
              onClick={() => pick(NO_ICON)}
              title="No icon"
            >
              <MaterialIcon name="block" size={17} />
            </button>

            {symbols.map((ic) => (
              <button
                key={ic.value}
                type="button"
                className={cx(styles.cell, value === ic.value && styles.picked)}
                onClick={() => pick(ic.value)}
                title={ic.label}
              >
                <MaterialIcon name={ic.value} size={19} />
              </button>
            ))}

            {images.map((src) => (
              <button
                key={src}
                type="button"
                className={cx(styles.cell, value === src && styles.picked)}
                onClick={() => pick(src)}
                title={iconLabel(src)}
              >
                <img src={src} alt="" />
              </button>
            ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
