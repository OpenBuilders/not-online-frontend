import type { CSSProperties } from 'react';

interface MaterialIconProps {
  name: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/** Thin wrapper around the Material Symbols Outlined font, loaded in index.html. */
export function MaterialIcon({ name, size, className, style }: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined${className ? ` ${className}` : ''}`}
      style={size ? { fontSize: size, ...style } : style}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
