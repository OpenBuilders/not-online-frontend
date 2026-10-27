/**
 * The shared 404 wall's storage. Everything the wall knows about other
 * people goes through this one module, so moving it from the browser to a
 * real backend is a change to this file and nothing else.
 *
 * Today it is a prototype: marks are kept in localStorage and passed
 * between open tabs over a BroadcastChannel, so "everyone" means every
 * tab in this browser. The page says so.
 *
 * Coordinates are stored in units of the printed 404, measured from its
 * centre — so a mark made on a phone lands on the same part of the 4 on a
 * monitor, whatever the two screens' sizes.
 */

export interface WallStroke {
  id: string;
  author: string;
  at: number;
  colour: string;
  /** Nozzle radius, in 404 units. */
  r: number;
  /** Seeds the spray's scatter, so a replay lands every grain where the original did. */
  seed: number;
  /** Puff centres, flattened: x0, y0, x1, y1, ... */
  pts: number[];
  /** Drips, flattened five at a time: x, y, length, speed, width. */
  drips: number[];
}

export interface WallSticker {
  id: string;
  author: string;
  at: number;
  src: string;
  label: string;
  x: number;
  y: number;
  rot: number;
  /** Width, in 404 units. */
  size: number;
}

export interface WallState {
  strokes: WallStroke[];
  stickers: WallSticker[];
}

const KEY = 'nothing.404.wall.v1';
const ME_KEY = 'nothing.404.wall.me.v1';
const MAX_STROKES = 400; // the oldest paint is painted over, as on a real wall
const MAX_STICKERS = 80;

const empty = (): WallState => ({ strokes: [], stickers: [] });

function read(): WallState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty(), ...(JSON.parse(raw) as WallState) } : empty();
  } catch {
    return empty();
  }
}

function write(state: WallState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* full or blocked: the wall still works for this visit */
  }
}

/** Who "you" are on the wall: a random id kept in this browser. */
export const me: string = (() => {
  try {
    const id = localStorage.getItem(ME_KEY) ?? Math.random().toString(36).slice(2, 10);
    localStorage.setItem(ME_KEY, id);
    return id;
  } catch {
    return Math.random().toString(36).slice(2, 10);
  }
})();

export const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

type Listener = (state: WallState, change: { stroke?: WallStroke }) => void;
const listeners = new Set<Listener>();
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('nothing-404-wall') : null;

// Another tab changed the wall: re-read it and tell whoever is drawing.
channel?.addEventListener('message', (e: MessageEvent<{ stroke?: WallStroke }>) => {
  const state = read();
  listeners.forEach((l) => l(state, { stroke: e.data?.stroke }));
});

function commit(next: WallState, change: { stroke?: WallStroke } = {}) {
  write(next);
  channel?.postMessage(change);
}

export const wallStore = {
  load: read,

  addStroke(stroke: WallStroke) {
    const s = read();
    commit({ ...s, strokes: [...s.strokes, stroke].slice(-MAX_STROKES) }, { stroke });
  },

  putSticker(sticker: WallSticker) {
    const s = read();
    const rest = s.stickers.filter((x) => x.id !== sticker.id);
    commit({ ...s, stickers: [...rest, sticker].slice(-MAX_STICKERS) });
  },

  /** Removes one of your own marks, stroke or sticker. Other people's stay. */
  remove(id: string) {
    const s = read();
    commit({
      strokes: s.strokes.filter((x) => !(x.id === id && x.author === me)),
      stickers: s.stickers.filter((x) => !(x.id === id && x.author === me)),
    });
  },

  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => void listeners.delete(fn);
  },
};
