import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './LabelPill.module.css';

export type LabelTone = 'lime' | 'pink' | 'ink' | 'paper';

interface LabelPillProps {
  children: ReactNode;
  tone?: LabelTone;
  /** Renders the white cut-line and hard shadow that make it read as stuck on. */
  sticker?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * The brand's oval sticker, at label size.
 *
 * The desktop's whole visual language is die-cut stickers — the widgets,
 * the callouts, the "TRY ME" tab. Tags inside the windows were the one
 * place still drawing dashed outlines, which read as form chrome. This is
 * the same construction as `Sticker` (shared/Sticker.tsx) shrunk to sit
 * inline in a row of metadata, and unlike that one it is not decorative:
 * it takes children and is used for real content.
 *
 * A deterministic tone picker lives alongside it — see `toneForLabel`.
 */
export function LabelPill({ children, tone = 'paper', sticker = false, size = 'sm', className }: LabelPillProps) {
  return (
    <span className={cx(styles.pill, styles[tone], styles[size], sticker && styles.sticker, className)}>
      {children}
    </span>
  );
}

const TONES: LabelTone[] = ['lime', 'pink', 'ink'];

/**
 * Picks a colour from the tag's own text, so "process" is the same colour
 * everywhere it appears without anyone storing a colour on it. Random
 * would reshuffle on every render and make the list flicker.
 */
export function toneForLabel(tag: string): LabelTone {
  let hash = 0;
  for (let i = 0; i < tag.length; i += 1) hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  return TONES[hash % TONES.length];
}
