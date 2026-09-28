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
