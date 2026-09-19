import { DEMO_LINKS, PLACEHOLDER } from '@/data/siteTemplates';
import type { SiteConfig, SiteLink } from '@/types';

export interface PageContent {
  name: string;
  handle: string;
  bio: string;
  links: SiteLink[];
  initials: string;
  avatar: string | null;
}

/**
 * What the four templates actually draw. Empty fields fall back to
 * placeholder copy and the demo link set so the preview reads as a real
 * page from the first frame instead of an empty rectangle — the builder is
 * judged on what the preview looks like, and a blank one teaches nothing.
 */
export function pageContent(cfg: SiteConfig): PageContent {
  const named = cfg.links.filter((l) => l.title.trim());
  const name = cfg.name.trim() || cfg.handle.trim() || PLACEHOLDER.name;
  return {
    name,
    handle: cfg.handle.trim() || PLACEHOLDER.handle,
    bio: cfg.bio.trim() || PLACEHOLDER.bio,
    links: named.length ? named : DEMO_LINKS,
    initials: name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase(),
    avatar: cfg.avatar,
  };
}

/** Deterministic 0..1 noise, so a scatter layout is stable across renders but re-rolls with `seed`. */
export function noise(seed: number, i: number, salt = 0): number {
  const x = Math.sin(seed * 127.1 + i * 311.7 + salt * 74.7) * 43758.5453;
  return x - Math.floor(x);
}
