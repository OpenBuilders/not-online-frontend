/**
 * Reads which kind of figure is under a point by sampling the artwork
 * itself, rather than by hand-placed hotspots that would need re-tuning
 * every time the illustration changes.
 *
 * Each coloured PNG is drawn once into a small offscreen canvas and its
 * alpha channel kept, so a lookup is an array read.
 */

export const GREEN_SRC = '/assets/cta/green_circle.png';
export const PINK_SRC = '/assets/cta/pink_circle.png';

export type Side = 'patron' | 'artist';

/** Alpha maps are sampled at this resolution — plenty for "is a figure here". */
const PROBE = 128;
/** Sampling disc, in probe pixels, matched to the beam's radius in the stylesheet. */
const PICK_R = 44;
/** Every other pixel is plenty at this radius, and a quarter of the work. */
const PICK_STEP = 2;
/** Share of the lit disc that must be a figure before it counts as one. */
const PICK_FLOOR = 0.035;

export interface AlphaMaps {
  green: Uint8ClampedArray;
  pink: Uint8ClampedArray;
}

const readAlpha = (src: string) =>
  new Promise<Uint8ClampedArray>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = PROBE;
      canvas.height = PROBE;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return reject(new Error('no 2d context'));
      ctx.drawImage(img, 0, 0, PROBE, PROBE);
      resolve(ctx.getImageData(0, 0, PROBE, PROBE).data);
    };
    img.onerror = reject;
    img.src = src;
  });

export const loadAlphaMaps = async (): Promise<AlphaMaps> => {
  const [green, pink] = await Promise.all([readAlpha(GREEN_SRC), readAlpha(PINK_SRC)]);
  return { green, pink };
};

/**
 * `nx`/`ny` are 0..1 across the drawing. Summed across the lit disc rather
 * than the single pixel under the cursor: these are thin limbs with white
 * between them, so an exact sample reads "nothing" most of the time and the
 * result flickers. Centre-weighted, so whoever the beam is actually on wins
 * over a limb clipping its edge.
 */
export function sampleSide(maps: AlphaMaps, nx: number, ny: number): Side | null {
  const px = Math.floor(nx * PROBE);
  const py = Math.floor(ny * PROBE);
  let g = 0;
  let p = 0;
  let total = 0;

  for (let dy = -PICK_R; dy <= PICK_R; dy += PICK_STEP) {
    for (let dx = -PICK_R; dx <= PICK_R; dx += PICK_STEP) {
      const d2 = dx * dx + dy * dy;
      if (d2 > PICK_R * PICK_R) continue;
      const weight = 1 - Math.sqrt(d2) / PICK_R;
      total += weight;
      const x = px + dx;
      const y = py + dy;
      if (x < 0 || y < 0 || x >= PROBE || y >= PROBE) continue;
      const i = (y * PROBE + x) * 4 + 3; // alpha byte
      g += (maps.green[i] / 255) * weight;
      p += (maps.pink[i] / 255) * weight;
    }
  }

  const floor = total * PICK_FLOOR;
  if (g < floor && p < floor) return null;
  return g >= p ? 'patron' : 'artist';
}
