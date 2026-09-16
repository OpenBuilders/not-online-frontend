// Ported from Tools.html's `SVG` object and defaultArt() (~line 1802-1856).
// Built-in line icons for desktop icons that don't have a custom image
// override configured. One component per icon so each renders as real SVG
// rather than an injected HTML string.
import type { JSX } from 'react';

export function FolderIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 32 h20 l8 8 h44 a6 6 0 0 1 6 6 v30 a8 8 0 0 1-8 8 H14 a8 8 0 0 1-8-8 V38 a6 6 0 0 1 6-6z"
        fill="rgba(255,255,255,0.07)"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M6 52 h88" stroke="var(--c-accent)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function NotFoundIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="16"
        y="16"
        width="68"
        height="68"
        rx="18"
        fill="rgba(255,255,255,0.05)"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="3"
        strokeDasharray="2 8"
        strokeLinecap="round"
      />
      <path d="M40 42 a10 10 0 1 1 15 8.6 c-3 2-5 4-5 7.4" stroke="var(--c-accent)" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="50" cy="70" r="2.6" fill="var(--c-accent)" />
    </svg>
  );
}

export function AppIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="16" width="68" height="68" rx="20" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.85)" strokeWidth="3" />
      <g fill="var(--c-accent)">
        <circle cx="38" cy="38" r="3.4" />
        <circle cx="50" cy="38" r="3.4" />
        <circle cx="62" cy="38" r="3.4" />
        <circle cx="38" cy="50" r="3.4" />
        <circle cx="50" cy="50" r="3.4" />
        <circle cx="62" cy="50" r="3.4" />
        <circle cx="38" cy="62" r="3.4" />
        <circle cx="50" cy="62" r="3.4" />
        <circle cx="62" cy="62" r="3.4" />
      </g>
    </svg>
  );
}

export function SettingsIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="13" stroke="var(--c-accent)" strokeWidth="3.4" />
      <path
        d="M50 14 v10 M50 76 v10 M14 50 h10 M76 50 h10 M24.5 24.5 l7 7 M68.5 68.5 l7 7 M75.5 24.5 l-7 7 M31.5 68.5 l-7 7"
        stroke="rgba(255,255,255,0.92)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="50" cy="50" r="30" stroke="rgba(255,255,255,0.55)" strokeWidth="2.4" strokeDasharray="3 7" />
    </svg>
  );
}

export function MarketIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 26 h9 l10 40 h33 l10 -27 H31"
        stroke="rgba(255,255,255,0.92)"
        strokeWidth="3.2"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="46" cy="78" r="5" fill="var(--c-accent)" />
      <circle cx="72" cy="78" r="5" fill="var(--c-accent)" />
    </svg>
  );
}

export function FileIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M28 12 h30 l18 18 v54 a6 6 0 0 1-6 6 H28 a6 6 0 0 1-6-6 V18 a6 6 0 0 1 6-6z"
        fill="var(--c-paper-2)"
        stroke="var(--c-paper-2)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M58 12 v18 h18" fill="none" stroke="#c9c9cf" strokeWidth="2.5" />
      <path d="M34 48 h32 M34 60 h32 M34 72 h22" stroke="var(--c-ink)" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
}

export type DesktopIconType = 'folder' | 'file' | 'app';
export type AppIconName = 'notfound' | 'market' | 'settings';

/** Ported from defaultArt() (Tools.html:1845-1856). */
export function defaultIcon(type: DesktopIconType, app?: AppIconName | null): JSX.Element {
  if (type === 'folder') return <FolderIcon />;
  if (type === 'file') return <FileIcon />;
  if (type === 'app') {
    if (app === 'notfound') return <NotFoundIcon />;
    if (app === 'market') return <MarketIcon />;
    if (app === 'settings') return <SettingsIcon />;
    return <AppIcon />;
  }
  return <AppIcon />;
}
