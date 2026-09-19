/**
 * Die-cut outlines for the sticker template, as SVG paths in a 0-100 box.
 *
 * These used to be CSS `border-radius` / `clip-path` on a padded white
 * wrapper, which had two problems the shapes here don't: the white edge was
 * a *separate, larger* rounded box, so its corner radius never matched the
 * inner one and every sticker read as slightly wonky; and a `clip-path`
 * shape can't take a box-shadow ring at all. One stroked path solves both —
 * the cut-line is the shape's own stroke, so it follows the outline exactly
 * at a constant width, on a circle and a star alike.
 *
 * The star is generated rather than hand-typed for the same reason: a
 * hand-placed vertex list is what made one of its points sit crooked.
 */

/** Regular n-pointed star, alternating between two radii — always symmetric. */
function star(points: number, outer: number, inner: number): string {
  const v: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    v.push(`${(50 + Math.cos(a) * r).toFixed(2)},${(50 + Math.sin(a) * r).toFixed(2)}`);
  }
  return `M${v.join('L')}Z`;
}

/** Regular n-gon, flat side down. */
function polygon(sides: number, radius: number, offset = 0): string {
  const v: string[] = [];
  for (let i = 0; i < sides; i++) {
    const a = (Math.PI * 2 * i) / sides - Math.PI / 2 + offset;
    v.push(`${(50 + Math.cos(a) * radius).toFixed(2)},${(50 + Math.sin(a) * radius).toFixed(2)}`);
  }
  return `M${v.join('L')}Z`;
}

export const STICKER_SHAPES = [
  'circle',
  'rounded',
  'squircle',
  'blob',
  'hexagon',
  'arch',
  'star',
  'seal',
  'shield',
] as const;

export type StickerShape = (typeof STICKER_SHAPES)[number];

export const SHAPE_PATHS: Record<StickerShape, string> = {
  circle: 'M50,5 A45,45 0 1,1 49.99,5 Z',
  rounded: 'M25,5 H75 A20,20 0 0,1 95,25 V75 A20,20 0 0,1 75,95 H25 A20,20 0 0,1 5,75 V25 A20,20 0 0,1 25,5 Z',
  // Superellipse: flatter sides than a circle, rounder corners than a square.
  squircle: 'M5,50 C5,17 17,5 50,5 C83,5 95,17 95,50 C95,83 83,95 50,95 C17,95 5,83 5,50 Z',
  blob: 'M50,5 C72,5 95,20 95,44 C95,70 76,95 50,95 C26,95 5,74 5,50 C5,24 26,5 50,5 Z',
  hexagon: polygon(6, 46),
  // Tombstone / arch — round top, square base.
  arch: 'M5,45 A45,45 0 0,1 95,45 V78 A17,17 0 0,1 78,95 H22 A17,17 0 0,1 5,78 Z',
  star: star(5, 46, 20),
  seal: star(12, 46, 37),
  shield: 'M50,5 L92,18 V52 C92,74 73,88 50,95 C27,88 8,74 8,52 V18 Z',
};
