import { siInstagram, siTelegram, siX, siYoutube } from 'simple-icons';
import type { SmmPlatform } from '@/types';

interface PlatformIconProps {
  platform: SmmPlatform;
  size?: number;
  className?: string;
}

/* A single maintained source keeps the four brand marks accurate and
   visually consistent. Colour remains `currentColor`, so each icon still
   inherits the palette of the card or control around it. */
const ICON_BY_PLATFORM = {
  instagram: siInstagram,
  x: siX,
  youtube: siYoutube,
  telegram: siTelegram,
  /* Not a brand, so not a brand mark: a crossed-out circle, drawn on the
     same 24px grid as the four real ones so it sits at the same weight. */
  nowhere: { path: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2c1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.96 7.96 0 0 1 12 4zm0 16a7.93 7.93 0 0 1-4.9-1.69L18.31 7.1A7.96 7.96 0 0 1 12 20z' },
} satisfies Record<SmmPlatform, { path: string }>;

export function PlatformIcon({ platform, size = 16, className }: PlatformIconProps) {
  const icon = ICON_BY_PLATFORM[platform];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d={icon.path} />
    </svg>
  );
}
