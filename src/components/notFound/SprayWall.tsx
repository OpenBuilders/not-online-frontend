import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { cx } from '@/lib/cx';
import styles from './SprayWall.module.css';
import { STICKERS } from './stickers';
import { me, newId, wallStore, type WallSticker, type WallStroke } from './wallStore';

const COLOURS = [
  { id: 'lime', value: '#a8ff1a', label: 'Lime' },
  { id: 'pink', value: '#ff1a91', label: 'Pink' },
  { id: 'ultra', value: '#1b2cff', label: 'Ultra blue' },
  { id: 'yellow', value: '#ffe500', label: 'Yellow' },
  { id: 'ink', value: '#1c1c1e', label: 'Black' },
  { id: 'white', value: '#ffffff', label: 'White' },
] as const;
const NOZZLES = [
  { id: 's', radius: 12, label: 'Fine' },
  { id: 'm', radius: 24, label: 'Medium' },
  { id: 'l', radius: 46, label: 'Fat cap' },
] as const;
const WALL = '#d6d6d8';
const MAX_UNDO = 10;

interface Placed {
  id: string;
  src: string;
  label: string;
  x: number;
  y: number;
  rot: number;
  size: number;
  /** Shared wall only: who stuck it there. */
  author?: string;
  at?: number;
}
interface Drip {
  x: number;
  y: number;
  left: number;
  speed: number;
  w: number;
  colour: string;
}
interface Snapshot {
  paint: HTMLCanvasElement;
  stickers: Placed[];
}

/** A small seeded generator, so a shared stroke replays grain for grain. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Where the printed 404 sits: its centre and its size. The shared wall measures everything from it. */
const frameOf = (w: number, h: number) => ({ cx: w / 2, cy: h * 0.46, size: Math.min(w * 0.44, h * 0.62) });

/** Gaussian-ish scatter: most paint lands near the middle of the nozzle. */
const scatter = (rnd: () => number) => Math.sqrt(-2 * Math.log(rnd() || 1e-6)) * 0.42;

function puff(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, col: string, rnd: () => number) {
  ctx.fillStyle = col;
  const n = Math.round(r * 2);
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2;
    const d = Math.min(1.25, scatter(rnd)) * r;
    const s = 0.8 + rnd() * 1.4;
    ctx.globalAlpha = 0.35 + rnd() * 0.6;
    ctx.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d, s, s);
  }
  // A faint core that builds up where the can lingers.
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 0.75);
  g.addColorStop(0, col);
  g.addColorStop(1, 'transparent');
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.75, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** One frame of a drip's run. Returns false once it has stopped and left its bead. */
function stepDrip(ctx: CanvasRenderingContext2D, d: Drip): boolean {
  ctx.strokeStyle = d.colour;
  ctx.lineWidth = d.w;
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(d.x, d.y);
  d.y += d.speed;
  d.left -= d.speed;
  d.speed *= 0.992;
  ctx.lineTo(d.x, d.y);
  ctx.stroke();
  const done = d.left <= 0 || d.speed < 0.25;
  if (done) {
    ctx.fillStyle = d.colour;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.w * 0.95, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return !done;
}

/**
 * The 404 as a wall. Spray on it, stick things to it, save it.
 *
 * Three stacked layers: the wall (concrete grain and the printed 404,
 * redrawn on resize), the paint (a canvas only the can touches, so undo
 * and wipe never take the wall with them), and the stickers (real
 * elements, so they can be picked up and moved again). Saving flattens all
 * three into one PNG.
 *
 * The can behaves like one: paint lands in a soft gaussian cloud, builds
 * up where you linger, and if you hold still long enough it drips.
 *
 * `shared` turns it into one wall for everyone who lands here: every
 * stroke is recorded (seed, puff centres, drips) through wallStore and
 * replayed for the next visitor, measured from the printed 404 so it lands
 * in the same place on any screen. Undo takes back only your own marks,
 * and there is no wipe — it is not only your wall.
 */
export function SprayWall({ shared = false }: { shared?: boolean }) {
  const wallRef = useRef<HTMLCanvasElement>(null);
  const paintRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const [colour, setColour] = useState<string>(COLOURS[0].value);
  const [nozzle, setNozzle] = useState<number>(NOZZLES[1].radius);
  const [stickers, setStickers] = useState<Placed[]>([]);
  const [undoCount, setUndoCount] = useState(0);
  const [touched, setTouched] = useState(false);
  const [stats, setStats] = useState({ marks: 0, people: 0, mine: 0 });

  // Mutable spray state lives in refs: it changes every frame.
  const spray = useRef({ on: false, x: 0, y: 0, lastX: 0, lastY: 0, still: 0 });
  const drips = useRef<Drip[]>([]);
  const raf = useRef(0);
  const undo = useRef<Snapshot[]>([]);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const rng = useRef<() => number>(Math.random);
  const live = useRef<WallStroke | null>(null);
  // The frame loop and the export read these without re-subscribing.
  const colourRef = useRef(colour);
  const nozzleRef = useRef(nozzle);
  const stickersRef = useRef(stickers);
  useEffect(() => {
    colourRef.current = colour;
    nozzleRef.current = nozzle;
    stickersRef.current = stickers;
  }, [colour, nozzle, stickers]);

  const geom = () => {
    const c = paintRef.current!;
    return frameOf(c.clientWidth, c.clientHeight);
  };

  // ---- the wall ------------------------------------------------------------

  const drawWall = useCallback(() => {
    const c = wallRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    const w = c.clientWidth;
    const h = c.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    c.width = w * dpr;
    c.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = WALL;
    ctx.fillRect(0, 0, w, h);

    // The printed 404: outlined, so it reads as something to fill in.
    const { cx: x0, cy: y0, size } = frameOf(w, h);
    ctx.font = `800 ${size}px Archivo, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    // Stroked at double width, then filled with the wall: the fill hides
    // the inner half of the stroke and the glyphs' overlapping contours.
    ctx.lineWidth = Math.max(4, size / 45);
    ctx.strokeStyle = 'rgba(28,28,30,0.55)';
    ctx.strokeText('404', x0, y0);
    ctx.fillStyle = WALL;
    ctx.fillText('404', x0, y0);
    ctx.font = `500 ${Math.max(12, Math.min(16, w / 60))}px "DM Mono", monospace`;
    ctx.fillStyle = 'rgba(28,28,30,0.6)';
    ctx.fillText(shared ? 'PAGE NOT FOUND.  EVERYONE WHO GETS LOST PAINTS HERE.' : 'PAGE NOT FOUND.  LEAVE A MARK.', x0, y0 + size * 0.44);

    // Concrete, over the print as well: a speckle of light and dark grains,
    // fixed by a seeded walk so the wall doesn't shimmer on every resize.
    const rnd = mulberry32(7);
    for (let i = 0; i < (w * h) / 55; i++) {
      ctx.fillStyle = rnd() > 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.22)';
      const s = rnd() * 1.8 + 0.4;
      ctx.fillRect(rnd() * w, rnd() * h, s, s);
    }
  }, [shared]);

  /** Size the paint canvas to its box; the solo wall keeps what was painted. */
  const sizePaint = useCallback(
    (keepPaint: boolean) => {
      const c = paintRef.current;
      if (!c) return;
      const dpr = window.devicePixelRatio || 1;
      const keep = document.createElement('canvas');
      keep.width = c.width;
      keep.height = c.height;
      if (keepPaint && c.width && c.height) keep.getContext('2d')!.drawImage(c, 0, 0);
      c.width = c.clientWidth * dpr;
      c.height = c.clientHeight * dpr;
      const ctx = c.getContext('2d')!;
      if (keepPaint) ctx.drawImage(keep, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },
    [],
  );

  // ---- the shared wall: replaying everyone's marks ----------------------------------

  const replay = useCallback((ctx: CanvasRenderingContext2D, s: WallStroke) => {
    const { cx: x0, cy: y0, size } = geom();
    const rnd = mulberry32(s.seed);
    const r = s.r * size;
    for (let i = 0; i < s.pts.length; i += 2) puff(ctx, x0 + s.pts[i] * size, y0 + s.pts[i + 1] * size, r, s.colour, rnd);
    for (let i = 0; i < s.drips.length; i += 5) {
      const d: Drip = {
        x: x0 + s.drips[i] * size,
        y: y0 + s.drips[i + 1] * size,
        left: s.drips[i + 2] * size,
        speed: s.drips[i + 3] * size,
        w: s.drips[i + 4] * size,
        colour: s.colour,
      };
      let guard = 2000;
      while (stepDrip(ctx, d) && guard-- > 0);
    }
  }, []);

  /** Everything from the store: repaint the strokes, re-place the stickers, recount. */
  const refresh = useCallback(() => {
    const c = paintRef.current;
    if (!c || !shared) return;
    const state = wallStore.load();
    const ctx = c.getContext('2d')!;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.restore();
    state.strokes.forEach((s) => replay(ctx, s));
    const { cx: x0, cy: y0, size } = geom();
    setStickers(
      state.stickers.map((s) => ({ ...s, x: x0 + s.x * size, y: y0 + s.y * size, size: s.size * size })),
    );
    const authors = new Set([...state.strokes, ...state.stickers].map((m) => m.author));
    const mine = [...state.strokes, ...state.stickers].filter((m) => m.author === me).length;
    setStats({ marks: state.strokes.length + state.stickers.length, people: authors.size, mine });
  }, [shared, replay]);

  useEffect(() => {
    drawWall();
    sizePaint(!shared);
    refresh();
    void document.fonts?.load('800 100px Archivo').then(drawWall);
    const ro = new ResizeObserver(() => {
      drawWall();
      sizePaint(!shared);
      refresh();
    });
    if (rootRef.current) ro.observe(rootRef.current);
    // Someone else painted: draw just their stroke, or redraw it all if something was taken away.
    const off = shared
      ? wallStore.subscribe((_, change) => {
          const ctx = paintRef.current?.getContext('2d');
          if (change.stroke && ctx) {
            replay(ctx, change.stroke);
            setStats((st) => ({ ...st, marks: st.marks + 1 }));
          } else refresh();
        })
      : () => {};
    return () => {
      ro.disconnect();
      off();
      cancelAnimationFrame(raf.current);
    };
  }, [drawWall, sizePaint, refresh, replay, shared]);

  // ---- the can ---------------------------------------------------------------

  const tick = useCallback(function frame() {
    const ctx = paintRef.current?.getContext('2d');
    if (!ctx) return;
    const s = spray.current;
    const r = nozzleRef.current;
    const col = colourRef.current;

    if (s.on) {
      const { cx: x0, cy: y0, size } = frameOf(paintRef.current!.clientWidth, paintRef.current!.clientHeight);
      // Fill the gap between frames so a fast stroke stays a line, not dots.
      const dist = Math.hypot(s.x - s.lastX, s.y - s.lastY);
      const steps = Math.max(1, Math.ceil(dist / (r * 0.3)));
      for (let i = 1; i <= steps; i++) {
        const px = s.lastX + ((s.x - s.lastX) * i) / steps;
        const py = s.lastY + ((s.y - s.lastY) * i) / steps;
        puff(ctx, px, py, r, col, rng.current);
        live.current?.pts.push(+((px - x0) / size).toFixed(4), +((py - y0) / size).toFixed(4));
      }
      // Held still: paint pools, and after a moment it runs.
      s.still = dist < 1.5 ? s.still + 1 : Math.max(0, s.still - 2);
      if (s.still > 22) {
        s.still = -30;
        const d = {
          x: s.x + (Math.random() - 0.5) * r * 0.7,
          y: s.y + r * 0.25,
          left: 30 + Math.random() * (60 + r * 3),
          speed: 1.6 + Math.random() * 1.6,
          w: Math.max(1.6, r / 9) * (0.7 + Math.random() * 0.6),
          colour: col,
        };
        drips.current.push(d);
        live.current?.drips.push(...[(d.x - x0) / size, (d.y - y0) / size, d.left / size, d.speed / size, d.w / size].map((v) => +v.toFixed(4)));
      }
      s.lastX = s.x;
      s.lastY = s.y;
    }

    drips.current = drips.current.filter((d) => stepDrip(ctx, d));
    raf.current = s.on || drips.current.length ? requestAnimationFrame(frame) : 0;
  }, []);

  const startLoop = () => {
    if (!raf.current) raf.current = requestAnimationFrame(tick);
  };

  /** The can lifts off: a shared stroke is sent to the wall. */
  const endStroke = () => {
    spray.current.on = false;
    const stroke = live.current;
    live.current = null;
    if (!stroke || stroke.pts.length === 0) return;
    wallStore.addStroke(stroke);
    setStats((st) => ({ marks: st.marks + 1, people: st.mine === 0 ? st.people + 1 : st.people, mine: st.mine + 1 }));
  };

  // ---- undo ------------------------------------------------------------------

  const snapshot = () => {
    setTouched(true);
    if (shared) return;
    const c = paintRef.current;
    if (!c) return;
    const copy = document.createElement('canvas');
    copy.width = c.width;
    copy.height = c.height;
    copy.getContext('2d')!.drawImage(c, 0, 0);
    undo.current = [...undo.current.slice(-(MAX_UNDO - 1)), { paint: copy, stickers: stickersRef.current }];
    setUndoCount(undo.current.length);
  };

  const restore = () => {
    if (shared) {
      // Your newest mark, stroke or sticker, comes off. Nobody else's does.
      const state = wallStore.load();
      const mine = [...state.strokes, ...state.stickers].filter((m) => m.author === me).sort((a, b) => b.at - a.at)[0];
      if (!mine) return;
      wallStore.remove(mine.id);
      drips.current = [];
      refresh();
      return;
    }
    const last = undo.current.pop();
    const c = paintRef.current;
    if (!last || !c) return;
    drips.current = [];
    const ctx = c.getContext('2d')!;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(last.paint, 0, 0);
    ctx.restore();
    setStickers(last.stickers);
    setUndoCount(undo.current.length);
  };

  const wipe = () => {
    const c = paintRef.current;
    if (!c) return;
    snapshot();
    drips.current = [];
    const ctx = c.getContext('2d')!;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.restore();
    setStickers([]);
  };

  // ---- pointer on the wall -----------------------------------------------------

  const local = (e: { clientX: number; clientY: number }) => {
    const r = paintRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const moveRing = (x: number, y: number, show: boolean) => {
    const ring = ringRef.current;
    if (!ring) return;
    ring.style.transform = `translate(${x}px, ${y}px)`;
    ring.style.opacity = show ? '1' : '0';
  };

  const onDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* a pointer the browser won't capture still sprays; the window listener ends it */
    }
    snapshot();
    if (shared) {
      const seed = Math.floor(Math.random() * 2 ** 31);
      rng.current = mulberry32(seed);
      live.current = { id: newId(), author: me, at: Date.now(), colour, r: +(nozzle / geom().size).toFixed(4), seed, pts: [], drips: [] };
    } else {
      rng.current = Math.random;
    }
    const p = local(e);
    Object.assign(spray.current, { on: true, x: p.x, y: p.y, lastX: p.x, lastY: p.y, still: 0 });
    startLoop();
  };
  const onMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const p = local(e);
    moveRing(p.x, p.y, true);
    if (!spray.current.on) return;
    spray.current.x = p.x;
    spray.current.y = p.y;
  };

  // ---- stickers --------------------------------------------------------------

  /** A sticker in 404 units, as the shared wall keeps it. */
  const toWall = (s: Placed): WallSticker => {
    const { cx: x0, cy: y0, size } = geom();
    return {
      id: s.id,
      author: s.author ?? me,
      at: s.at ?? Date.now(),
      src: s.src,
      label: s.label,
      x: +((s.x - x0) / size).toFixed(4),
      y: +((s.y - y0) / size).toFixed(4),
      rot: s.rot,
      size: +(s.size / size).toFixed(4),
    };
  };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d || !paintRef.current) return;
      const p = local(e);
      setStickers((list) => list.map((s) => (s.id === d.id ? { ...s, x: p.x - d.dx, y: p.y - d.dy } : s)));
    };
    // The drop lands where the pointer let go, even if the last move was coalesced away.
    const up = (e: PointerEvent) => {
      const d = drag.current;
      if (d && e.type === 'pointerup') {
        move(e);
        const s = stickersRef.current.find((x) => x.id === d.id);
        if (shared && s) {
          const p = local(e);
          wallStore.putSticker(toWall({ ...s, x: p.x - d.dx, y: p.y - d.dy }));
        }
      }
      drag.current = null;
      if (spray.current.on) endStroke();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    // toWall and endStroke read only refs and stable store functions.
  }, [shared]); // eslint-disable-line react-hooks/exhaustive-deps

  const place = (src: string, label: string, x: number, y: number) => {
    snapshot();
    const id = newId();
    const size = Math.round(110 + Math.random() * 50);
    const s: Placed = { id, src, label, x, y, rot: Math.round((Math.random() - 0.5) * 36), size, author: me, at: Date.now() };
    setStickers((list) => [...list, s]);
    if (shared) {
      wallStore.putSticker(toWall(s));
      setStats((st) => ({ marks: st.marks + 1, people: st.mine === 0 ? st.people + 1 : st.people, mine: st.mine + 1 }));
    }
    return id;
  };

  /** Pressing on a tray sticker peels one off and puts it in your hand. */
  const peel = (e: ReactPointerEvent, src: string, label: string) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const p = local(e);
    drag.current = { id: place(src, label, p.x, p.y), dx: 0, dy: 0 };
  };
  const peelByKey = (e: KeyboardEvent, src: string, label: string) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    const c = paintRef.current!;
    place(src, label, c.clientWidth / 2 + (Math.random() - 0.5) * 200, c.clientHeight / 2 + (Math.random() - 0.5) * 160);
  };

  const pickUp = (e: ReactPointerEvent, s: Placed) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const p = local(e);
    drag.current = { id: s.id, dx: p.x - s.x, dy: p.y - s.y };
    // Whatever you pick up comes to the top.
    setStickers((list) => [...list.filter((x) => x.id !== s.id), s]);
  };
  /** Peel a sticker off. On the shared wall, only your own come off. */
  const remove = (s: Placed) => {
    if (shared && s.author !== me) return;
    snapshot();
    setStickers((list) => list.filter((x) => x.id !== s.id));
    if (shared) {
      wallStore.remove(s.id);
      setStats((st) => ({ ...st, marks: st.marks - 1, mine: st.mine - 1 }));
    }
  };
  const nudge = (e: KeyboardEvent, s: Placed) => {
    const step = e.shiftKey ? 40 : 10;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      remove(s);
    } else if (moves[e.key]) {
      e.preventDefault();
      const [dx, dy] = moves[e.key];
      const moved = { ...s, x: s.x + dx, y: s.y + dy };
      setStickers((list) => list.map((x) => (x.id === s.id ? moved : x)));
      if (shared) wallStore.putSticker(toWall(moved));
    }
  };

  // ---- save ------------------------------------------------------------------

  /** The die-cut edge, rebuilt for the export: the cut-out filled white, stamped around it. */
  const outlined = (img: HTMLImageElement, w: number, h: number) => {
    const pad = 6;
    const c = document.createElement('canvas');
    c.width = w + pad * 2;
    c.height = h + pad * 2;
    const ctx = c.getContext('2d')!;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) ctx.drawImage(img, pad + Math.cos(a) * 3, pad + Math.sin(a) * 3, w, h);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(img, pad, pad, w, h);
    return { c, pad };
  };

  const save = () => {
    const wall = wallRef.current;
    const paint = paintRef.current;
    const root = rootRef.current;
    if (!wall || !paint || !root) return;
    const dpr = window.devicePixelRatio || 1;
    const out = document.createElement('canvas');
    out.width = wall.width;
    out.height = wall.height;
    const ctx = out.getContext('2d')!;
    ctx.drawImage(wall, 0, 0);
    ctx.drawImage(paint, 0, 0);
    ctx.scale(dpr, dpr);
    stickersRef.current.forEach((s) => {
      const img = root.querySelector<HTMLImageElement>(`img[data-sticker="${s.id}"]`);
      if (!img?.complete || !img.naturalWidth) return;
      const h = (s.size * img.naturalHeight) / img.naturalWidth;
      const { c, pad } = outlined(img, s.size, h);
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate((s.rot * Math.PI) / 180);
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 8;
      ctx.drawImage(c, -s.size / 2 - pad, -h / 2 - pad);
      ctx.restore();
    });
    const a = document.createElement('a');
    a.href = out.toDataURL('image/png');
    a.download = shared ? 'nothing-404-shared-wall.png' : 'nothing-404-wall.png';
    a.click();
  };

  // ---- render ----------------------------------------------------------------

  const canUndo = shared ? stats.mine > 0 : undoCount > 0;

  return (
    <main className={styles.page} ref={rootRef}>
      <h1 className={styles.srOnly}>
        404: page not found. {shared ? 'A wall shared by everyone who gets lost here.' : 'Spray on the wall or stick something to it.'}
      </h1>
      <canvas ref={wallRef} className={styles.wall} aria-hidden="true" />
      <canvas
        ref={paintRef}
        className={styles.paint}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
        onPointerLeave={(e) => {
          const p = local(e);
          moveRing(p.x, p.y, false);
        }}
        aria-label="Wall. Drag to spray."
        role="img"
      />
      <div ref={ringRef} className={styles.ring} style={{ width: nozzle * 2, height: nozzle * 2, marginLeft: -nozzle, marginTop: -nozzle, borderColor: colour }} />

      <div className={styles.stickerLayer}>
        {stickers.map((s) => {
          const theirs = shared && s.author !== me;
          return (
            <img
              key={s.id}
              data-sticker={s.id}
              src={s.src}
              alt={`${s.label} sticker`}
              draggable={false}
              tabIndex={0}
              className={styles.placed}
              style={{ left: s.x, top: s.y, width: s.size, transform: `translate(-50%, -50%) rotate(${s.rot}deg)` }}
              onPointerDown={(e) => pickUp(e, s)}
              onDoubleClick={() => remove(s)}
              onKeyDown={(e) => nudge(e, s)}
              title={theirs ? 'Someone else stuck this here. You can move it, not peel it off.' : 'Drag to move. Double-click to peel off.'}
            />
          );
        })}
      </div>

      {shared && (
        <div className={styles.wallStats} aria-live="polite">
          <b>
            {stats.marks} {stats.marks === 1 ? 'mark' : 'marks'}
          </b>{' '}
          by {stats.people} {stats.people === 1 ? 'person' : 'people'}
          <span>Prototype: shared between tabs in this browser</span>
        </div>
      )}

      {!touched && (
        <p className={styles.hint}>
          {shared ? 'Everyone who gets lost here paints the same wall. Add to it.' : 'Press and drag to spray. Hold still and it drips.'}
        </p>
      )}

      <div className={styles.toolbar} role="toolbar" aria-label="Spray can">
        <div className={styles.colours} role="group" aria-label="Colour">
          {COLOURS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={cx(styles.colour, colour === c.value && styles.on)}
              style={{ background: c.value }}
              onClick={() => setColour(c.value)}
              aria-pressed={colour === c.value}
              aria-label={c.label}
              title={c.label}
            />
          ))}
        </div>
        <span className={styles.sep} />
        <div className={styles.nozzles} role="group" aria-label="Nozzle">
          {NOZZLES.map((n) => (
            <button
              key={n.id}
              type="button"
              className={cx(styles.nozzle, nozzle === n.radius && styles.on)}
              onClick={() => setNozzle(n.radius)}
              aria-pressed={nozzle === n.radius}
              aria-label={n.label}
              title={n.label}
            >
              <span style={{ width: 4 + n.radius / 4, height: 4 + n.radius / 4 }} />
            </button>
          ))}
        </div>
        <span className={styles.sep} />
        <button
          type="button"
          className={styles.tool}
          onClick={restore}
          disabled={!canUndo}
          aria-label={shared ? 'Undo your last mark' : 'Undo'}
          title={shared ? 'Undo your last mark' : 'Undo'}
        >
          <MaterialIcon name="undo" size={18} />
        </button>
        {!shared && (
          <button type="button" className={styles.tool} onClick={wipe} aria-label="Wipe the wall" title="Wipe the wall">
            <MaterialIcon name="layers_clear" size={18} />
          </button>
        )}
        <button type="button" className={cx(styles.tool, styles.save)} onClick={save}>
          <MaterialIcon name="download" size={18} />
          Save
        </button>
      </div>

      <aside className={styles.tray} aria-label="Stickers">
        <span className={styles.trayLabel}>Stickers</span>
        <div className={styles.trayList}>
          {STICKERS.map((s) => (
            <button
              key={s.src}
              type="button"
              className={styles.trayItem}
              onPointerDown={(e) => peel(e, s.src, s.label)}
              onKeyDown={(e) => peelByKey(e, s.src, s.label)}
              aria-label={`Stick ${s.label} on the wall`}
              title="Drag onto the wall"
            >
              <img src={s.src} alt="" draggable={false} />
            </button>
          ))}
        </div>
      </aside>

      <a className={styles.home} href="/">
        Back to the desktop
      </a>
    </main>
  );
}
