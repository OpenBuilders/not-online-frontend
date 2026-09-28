import type { SmmPost } from '@/types';
import { dayKey } from './dates';

/**
 * Renders the week's plan as an iPhone wallpaper.
 *
 * Canvas rather than DOM-to-image: this needs to come out at 1290x2796,
 * and every html-to-canvas route either ships a library or produces a
 * screenshot of a 300px preview scaled up. Drawing it directly means the
 * type is crisp at full resolution and the file is a few hundred KB.
 *
 * The composition is built around where a phone actually has room. The
 * top third belongs to the clock and the bottom eighth to the dock, so
 * the plan sits in the band between them — a wallpaper you cannot read
 * because the time is sitting on it is a poster, not a wallpaper.
 */

/** iPhone 15/16 Pro Max. Scales down cleanly to every smaller phone. */
export const WALLPAPER_W = 1290;
export const WALLPAPER_H = 2796;

export interface WallpaperScheme {
  id: string;
  bg: string;
  ink: string;
  accent: string;
  /** Drawn behind the plan at low opacity. */
  wash: string;
}

const INK = '#1c1c1e';
const LIME = '#a8ff1a';
const PINK = '#ff1a91';
const PAPER = '#fafafc';
const WHITE = '#fff';

export const SCHEMES: WallpaperScheme[] = [
  { id: 'lime-on-ink', bg: INK, ink: WHITE, accent: LIME, wash: LIME },
  { id: 'pink-on-ink', bg: INK, ink: WHITE, accent: PINK, wash: PINK },
  { id: 'ink-on-lime', bg: LIME, ink: INK, accent: INK, wash: INK },
  { id: 'white-on-pink', bg: PINK, ink: WHITE, accent: INK, wash: WHITE },
  { id: 'ink-on-paper', bg: PAPER, ink: INK, accent: PINK, wash: INK },
  { id: 'lime-on-black', bg: '#0d0d0f', ink: LIME, accent: WHITE, wash: LIME },
];

/**
 * The illustrations, and where each one is meant to sit.
 *
 * The prefix on the filename is the instruction: `bot_` hangs off the
 * bottom edge, `right_` off the right, and `ok_` floats in the band beside
 * the plan the way the first ones did. Encoding placement in the name
 * means new artwork is a file drop rather than a code change — the folder
 * is the manifest.
 */
type ArtAnchor = 'bottom' | 'right' | 'free';

const ART_FILES: string[] = [
  'bot_1.png',
  'bot_2.png',
  'bot_3.png',
  'ok_1.png',
  'ok_2.png',
  'ok_3.png',
  'ok_4.png',
  'ok_5.png',
  'ok_6.png',
  'ok_7.png',
  'ok_8.png',
  'ok_9.png',
  'ok_10.png',
  'ok_11.png',
  'ok_12.png',
  'right_1.png',
];

function anchorOf(file: string): ArtAnchor {
  if (file.startsWith('bot_')) return 'bottom';
  if (file.startsWith('right_')) return 'right';
  return 'free';
}

/** Space a bullet and its gap take before a title starts. */
const BULLET = 30;

const WEEKDAY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export interface WallpaperDay {
  key: string;
  weekday: string;
  date: number;
  posts: SmmPost[];
}

/** The seven days from today, each with whatever is scheduled on it. */
export function weekAhead(posts: SmmPost[]): WallpaperDay[] {
  const now = new Date();
  const scheduled = posts.filter((p) => p.status === 'scheduled' && p.day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const key = dayKey(d);
    return {
      key,
      weekday: WEEKDAY[d.getDay()],
      date: d.getDate(),
      posts: scheduled.filter((p) => p.day === key).sort((a, b) => a.createdAt - b.createdAt),
    };
  });
}

export function pickScheme(): WallpaperScheme {
  return SCHEMES[Math.floor(Math.random() * SCHEMES.length)];
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Wraps to at most `maxLines`, ellipsising the last one. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
    } else {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines) {
    let last = lines[maxLines - 1];
    if (ctx.measureText(last).width > maxWidth) {
      while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
      lines[maxLines - 1] = `${last}…`;
    }
  }
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function renderWallpaper(days: WallpaperDay[], scheme: WallpaperScheme): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = WALLPAPER_W;
  canvas.height = WALLPAPER_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no 2d context');

  // Archivo is loaded by index.html; without this the first render falls
  // back to the system sans and looks nothing like the app.
  await document.fonts.ready.catch(() => undefined);

  ctx.fillStyle = scheme.bg;
  ctx.fillRect(0, 0, WALLPAPER_W, WALLPAPER_H);

  // One illustration, placed by its own filename. Only the chosen file is
  // fetched — loading all sixteen to throw fifteen away would cost several
  // megabytes on every reroll.
  const file = ART_FILES[Math.floor(Math.random() * ART_FILES.length)];
  const img = await loadImage(`/assets/wallpapers_icons/${file}`);
  if (img) {
    const anchor = anchorOf(file);
    const ratio = img.width / img.height;
    ctx.save();
    ctx.globalAlpha = 0.16;
    if (anchor === 'bottom') {
      // Sits on the bottom edge, wide enough to span most of the screen —
      // it reads as ground under the plan rather than as a floating mark.
      const w = WALLPAPER_W * 0.92;
      const h = w / ratio;
      ctx.drawImage(img, (WALLPAPER_W - w) / 2, WALLPAPER_H - h + 40, w, h);
    } else if (anchor === 'right') {
      // Flush to the right edge and bled past it, so it frames the plan's
      // column instead of sitting in the middle of it.
      const h = WALLPAPER_H * 0.42;
      const w = h * ratio;
      ctx.drawImage(img, WALLPAPER_W - w * 0.78, WALLPAPER_H * 0.44, w, h);
    } else {
      const h = 1150;
      const w = h * ratio;
      ctx.drawImage(img, WALLPAPER_W - w * 0.62, 1180, w, h);
    }
    ctx.restore();
  }

  const margin = 110;
  const inner = WALLPAPER_W - margin * 2;

  // ---- the band below the clock ----
  let y = 900;

  ctx.fillStyle = scheme.accent;
  ctx.font = '800 46px Archivo, sans-serif';
  ctx.textBaseline = 'alphabetic';
  const first = days[0];
  const last = days[days.length - 1];
  const range =
    `${MONTH[Number(first.key.slice(5, 7)) - 1]} ${first.date}` +
    ` — ${MONTH[Number(last.key.slice(5, 7)) - 1]} ${last.date}`;
  ctx.fillText(range, margin, y);

  y += 96;
  ctx.fillStyle = scheme.ink;
  ctx.font = '800 132px Archivo, sans-serif';
  ctx.fillText('THE WEEK', margin, y);
  y += 132;
  ctx.fillText('AHEAD', margin, y);

  y += 108;

  // ---- one row per day ----
  const rowGap = 26;
  for (const day of days) {
    const has = day.posts.length > 0;
    const titleLines = has ? Math.min(day.posts.length, 3) : 1;
    const rowH = 54 + titleLines * 46;

    if (has) {
      ctx.fillStyle = scheme.accent;
      ctx.globalAlpha = scheme.bg === INK || scheme.bg === '#0d0d0f' ? 0.14 : 0.2;
      roundRect(ctx, margin - 26, y - 46, inner + 52, rowH + 10, 28);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Weekday and date, set as one column so the rows align down the page.
    ctx.fillStyle = has ? scheme.accent : scheme.ink;
    ctx.globalAlpha = has ? 1 : 0.3;
    ctx.font = '800 34px Archivo, sans-serif';
    ctx.fillText(day.weekday, margin, y);
    ctx.font = '800 60px Archivo, sans-serif';
    ctx.fillText(String(day.date), margin, y + 56);
    ctx.globalAlpha = 1;

    const textX = margin + 150;
    const textW = inner - 150;
    if (has) {
      let ty = y + 4;
      for (const post of day.posts.slice(0, 3)) {
        // A bullet per title, on every one rather than only where a day
        // holds several. A rule between them was tried first and read as
        // a divider drawn through the row; a dot says "this is an item"
        // without claiming the space between two items means anything.
        ctx.fillStyle = scheme.accent;
        ctx.beginPath();
        ctx.arc(textX + 7, ty - 12, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = scheme.ink;
        ctx.font = '700 38px Archivo, sans-serif';
        const [line] = wrap(ctx, post.title || 'Untitled', textW - BULLET, 1);
        ctx.fillText(line, textX + BULLET, ty);
        ty += 46;
      }
      if (day.posts.length > 3) {
        ctx.fillStyle = scheme.ink;
        ctx.globalAlpha = 0.5;
        ctx.font = '600 30px Archivo, sans-serif';
        // No bullet: this is a count of what did not fit, not another item.
        ctx.fillText(`+${day.posts.length - 3} more`, textX + BULLET, ty);
        ctx.globalAlpha = 1;
      }
    } else {
      ctx.fillStyle = scheme.ink;
      ctx.globalAlpha = 0.28;
      ctx.font = '600 34px Archivo, sans-serif';
      // Indented to the same text edge as a titled row, but with no
      // bullet — an empty day is a state, not a list of one.
      ctx.fillText('nothing', textX + BULLET, y + 30);
      ctx.globalAlpha = 1;
    }

    y += rowH + rowGap;
  }

  // ---- the mark, clear of the dock ----
  ctx.fillStyle = scheme.accent;
  ctx.font = '800 40px Archivo, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('cultofnot', WALLPAPER_W / 2, WALLPAPER_H - 190);

  ctx.fillStyle = scheme.ink;
  ctx.globalAlpha = 0.4;
  ctx.font = '600 26px Archivo, sans-serif';
  ctx.fillText('made with nothing', WALLPAPER_W / 2, WALLPAPER_H - 140);
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('render failed'))), 'image/png');
  });
}
