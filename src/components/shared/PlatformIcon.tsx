import type { SmmPlatform } from '@/types';

interface PlatformIconProps {
  platform: SmmPlatform;
  size?: number;
  className?: string;
}

/**
 * The four platform marks, drawn rather than pulled from an icon font.
 *
 * Material Symbols has no brand glyphs, and the generic stand-ins it does
 * have (a camera for Instagram, a paper plane for Telegram) are the same
 * two shapes, so a list of posts read as one platform repeated. These are
 * the recognisable geometry of each mark reduced to the stroke weight the
 * rest of the app uses — deliberately simplified, not traced logos, so
 * they sit next to the Material icons around them instead of fighting
 * them.
 *
 * `currentColor` throughout: a mark takes the colour of whatever chip,
 * card or dark cell it lands in.
 */
export function PlatformIcon({ platform, size = 16, className }: PlatformIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };

  switch (platform) {
    case 'instagram':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'x':
      // Two crossing strokes: the mark is an X, and at 16px any attempt at
      // its tapered weights turns into mud.
      return (
        <svg {...common} strokeWidth={2.2}>
          <path d="M4 4 L20 20" />
          <path d="M20 4 L4 20" />
        </svg>
      );
    case 'youtube':
      return (
        <svg {...common}>
          <rect x="2" y="5" width="20" height="14" rx="4.5" />
          <path d="M10.4 9.3 L15.2 12 L10.4 14.7 Z" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'telegram':
      // The plane, with the fold that distinguishes it from a plain
      // triangle — without that crease it reads as "send", not Telegram.
      return (
        <svg {...common}>
          <path d="M21.2 4.3 L2.9 11.4 L9.1 13.6 L11.4 20 L14.6 15.1" />
          <path d="M21.2 4.3 L17.9 19.9 L9.1 13.6 Z" />
          <path d="M9.1 13.6 L21.2 4.3" />
        </svg>
      );
  }
}
