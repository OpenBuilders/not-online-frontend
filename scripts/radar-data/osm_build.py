"""Turn cached OSM extracts into compact SVG path layers: src/data/cityMaps.ts."""
import json, math, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from osm_fetch import CITIES, CACHE  # noqa: E402

# Default output: the app's data file, two levels up from here.
if len(sys.argv) < 2:
    sys.argv.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'data', 'cityMaps.ts'))

OUT = sys.argv[1]
W = 1000
EPS = 1.1  # base simplification tolerance, in viewBox units
# The poster style: shapes simplified hard, only the big things kept.
# Readable as a map: the street network back as thin lines, water close to its real outline.
STYLE_EPS = {'sea': 1.6, 'water': 1.6, 'coast': 1.6, 'parks': 2.5, 'major': 1.6, 'roads': 1.6, 'minor': 1.8, 'rivers': 1.5, 'canals': 1.5}
MIN_AREA = {'parks': 1200, 'water': 90}
MIN_LEN = {'major': 0, 'roads': 0, 'minor': 0, 'rivers': 4, 'canals': 8, 'coast': 4}  # OSM roads come in short pieces: keep them all, or the network breaks up

def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    norm = math.hypot(dx, dy) or 1e-9
    imax, dmax = 0, 0.0
    for i in range(1, len(pts) - 1):
        x, y = pts[i]
        d = abs(dy * x - dx * y + x2 * y1 - y2 * x1) / norm if norm > 1e-9 else math.hypot(x - x1, y - y1)
        if d > dmax:
            imax, dmax = i, d
    if dmax > eps:
        return rdp(pts[: imax + 1], eps)[:-1] + rdp(pts[imax:], eps)
    return [pts[0], pts[-1]]

def area(pts):
    return abs(sum(pts[i][0] * pts[i - 1][1] - pts[i - 1][0] * pts[i][1] for i in range(len(pts)))) / 2

def length(pts):
    return sum(math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) for i in range(1, len(pts)))

def stitch(segments):
    """Join open ways that share endpoints into rings (for multipolygon outers)."""
    segs = [list(s) for s in segments if len(s) > 1]
    rings, guard = [], 0
    while segs and guard < 10000:
        guard += 1
        cur = segs.pop(0)
        changed = True
        while changed and cur[0] != cur[-1]:
            changed = False
            for i, s in enumerate(segs):
                if s[0] == cur[-1]:
                    cur += s[1:]
                elif s[-1] == cur[-1]:
                    cur += s[::-1][1:]
                elif s[-1] == cur[0]:
                    cur = s[:-1] + cur
                elif s[0] == cur[0]:
                    cur = s[::-1][:-1] + cur
                else:
                    continue
                segs.pop(i)
                changed = True
                break
        rings.append(cur)
    return rings


def sea_polygons(coast_ways, s, w, n, e):
    """Land polygons from OSM coastline (land lies left of the way's direction),
    clipped to the bbox. Returns (land_rings, has_coast) in (lng, lat)."""
    We, Hn = e - w, n - s
    P = 2 * (We + Hn)
    inside = lambda p: w <= p[0] <= e and s <= p[1] <= n

    def t_of(p):
        x, y = p
        eps = 1e-9
        if abs(y - s) < eps: return x - w
        if abs(x - e) < eps: return We + (y - s)
        if abs(y - n) < eps: return We + Hn + (e - x)
        return 2 * We + Hn + (n - y)

    def clip_seg(a, b):
        """Liang-Barsky: the part of a->b inside the box, or None."""
        (x0, y0), (x1, y1) = a, b
        dx, dy = x1 - x0, y1 - y0
        t0, t1 = 0.0, 1.0
        for pp, qq in ((-dx, x0 - w), (dx, e - x0), (-dy, y0 - s), (dy, n - y0)):
            if pp == 0:
                if qq < 0: return None
                continue
            r = qq / pp
            if pp < 0:
                if r > t1: return None
                t0 = max(t0, r)
            else:
                if r < t0: return None
                t1 = min(t1, r)
        return (x0 + t0 * dx, y0 + t0 * dy), (x0 + t1 * dx, y0 + t1 * dy), t0 > 0, t1 < 1

    chains = stitch([[(g['lon'], g['lat']) for g in geom] for geom in coast_ways])
    islands, pieces = [], []
    for c in chains:
        if c[0] == c[-1] and all(inside(p) for p in c):
            islands.append(c)
            continue
        if c[0] == c[-1]:
            # a closed ring crossing the box: start it from a point outside
            k = next((i for i, p in enumerate(c) if not inside(p)), 0)
            c = c[k:-1] + c[:k + 1]
        cur, cur_ok = None, False
        for a, b in zip(c, c[1:]):
            r = clip_seg(a, b)
            if r is None:
                continue
            pa, pb, entered, left = r
            if cur is None:
                cur, cur_ok = [pa, pb], entered
            else:
                cur.append(pb)
            if left:
                if cur_ok:
                    pieces.append(cur)
                cur = None
        # a piece that ends inside the box cannot be closed against the edge: drop it
    if not pieces and not islands:
        return [], False
    corners = [(0.0, (w, s)), (We, (e, s)), (We + Hn, (e, n)), (2 * We + Hn, (w, n))]
    land, used = [], [False] * len(pieces)
    for i0 in range(len(pieces)):
        if used[i0]:
            continue
        ring, i, guard = [], i0, 0
        while guard < 500:
            guard += 1
            used[i] = True
            ring += pieces[i]
            t_exit = t_of(pieces[i][-1])
            # the next piece entering the box, walking the edge counter-clockwise
            best, best_d = None, None
            for j, pc in enumerate(pieces):
                d = (t_of(pc[0]) - t_exit) % P
                if best_d is None or d < best_d:
                    best, best_d = j, d
            # corners passed on the way
            for tc, pt in sorted(corners, key=lambda c: (c[0] - t_exit) % P):
                if 0 < (tc - t_exit) % P < best_d:
                    ring.append(pt)
            if best == i0 or used[best]:
                break
            i = best
        land.append(ring)
    if not pieces:
        # only islands: everything else is sea
        pass
    return land + islands, True

def path(polys, closed):
    """SVG path data in integer units, each shape as one absolute move and then
    relative steps: about half the size of absolute coordinates throughout."""
    out = []
    for p in polys:
        pts = [(round(x), round(y)) for x, y in p]
        d = [f'M{pts[0][0]} {pts[0][1]}']
        steps = []
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            if (x1, y1) != (x0, y0):
                steps.append(f'{x1 - x0} {y1 - y0}')
        if not steps:
            continue
        d.append('l' + ' '.join(steps).replace(' -', '-'))
        out.append(''.join(d) + ('z' if closed else ''))
    return ''.join(out)


def clip_lines(lines, W, H, pad=20):
    """Cut open lines to the frame (plus a little), keeping each run that stays inside."""
    inside = lambda q: -pad <= q[0] <= W + pad and -pad <= q[1] <= H + pad
    out = []
    for line in lines:
        run = []
        for q in line:
            if inside(q):
                run.append(q)
            else:
                if len(run) > 1:
                    run.append(q)  # one point past the edge, so the line leaves the frame rather than stopping short
                    out.append(run)
                run = [q] if run else []
                if run and not inside(run[0]):
                    run = []
        if len(run) > 1:
            out.append(run)
    return out


def chain(lines):
    """Join open lines that meet end to end into longer ones: one path command
    instead of many, and a simplifier that sees the whole street."""
    key = lambda q: (round(q[0], 1), round(q[1], 1))
    lines = [list(l) for l in lines if len(l) > 1]
    starts = {}
    for i, l in enumerate(lines):
        starts.setdefault(key(l[0]), []).append(i)
    used = [False] * len(lines)
    out = []
    for i, l in enumerate(lines):
        if used[i]:
            continue
        used[i] = True
        cur = l
        while True:
            nxt = next((j for j in starts.get(key(cur[-1]), []) if not used[j]), None)
            if nxt is None:
                break
            used[nxt] = True
            cur = cur + lines[nxt][1:]
        out.append(cur)
    return out


def build(cid):
    name, s, w, n, e = CITIES[cid]
    lat0 = (s + n) / 2
    H = round(W * (n - s) / ((e - w) * math.cos(math.radians(lat0))))
    proj = lambda lat, lng: ((lng - w) / (e - w) * W, (n - lat) / (n - s) * H)
    data = json.load(open(os.path.join(CACHE, f'{cid}.json')))

    layers = {k: [] for k in ('parks', 'water', 'rivers', 'canals', 'coast', 'major', 'roads', 'minor')}
    ring_parts = []
    seen = set()

    def pts_of(geom):
        return [proj(g['lat'], g['lon']) for g in geom]

    for el in data['elements']:
        tags = el.get('tags', {})
        if el['type'] == 'relation':
            # Outers and inners both: drawn even-odd, an island inside a river is a hole in it.
            for role in ('outer', 'inner'):
                parts = [m['geometry'] for m in el.get('members', []) if m.get('role') == role and m.get('geometry')]
                for ring in stitch([[(g['lat'], g['lon']) for g in geom] for geom in parts]):
                    if ring[0] == ring[-1]:
                        ring_parts.append([proj(a, b) for a, b in ring])
            continue
        if 'geometry' not in el or el['id'] in seen:
            continue
        seen.add(el['id'])
        p = pts_of(el['geometry'])
        closed = el['geometry'][0] == el['geometry'][-1]
        hw = tags.get('highway')
        if hw in ('motorway', 'trunk'):
            layers['major'].append(p)
        elif hw == 'primary':
            layers['roads'].append(p)
        elif hw == 'secondary':
            layers['minor'].append(p)
        elif tags.get('waterway') == 'river':
            layers['rivers'].append(p)
        elif tags.get('waterway') == 'canal':
            # Canals only where they are the city (Amsterdam); elsewhere they read as stray lines.
            if cid == 'amsterdam':
                layers['canals'].append(p)
        elif tags.get('natural') == 'coastline':
            layers['coast'].append(p)
        elif tags.get('natural') == 'water' and closed:
            ring_parts.append(p)
        elif tags.get('leisure') == 'park' and closed:
            layers['parks'].append(p)

    layers['water'] = ring_parts
    coast_geoms = [el['geometry'] for el in data['elements'] if el['type'] == 'way' and el.get('tags', {}).get('natural') == 'coastline' and 'geometry' in el]
    land, has_coast = sea_polygons(coast_geoms, s, w, n, e)
    sea = ''
    if has_coast:
        # The frame minus the land, filled even-odd: what is left is sea.
        rect = [(0, 0), (W, 0), (W, H), (0, H)]
        rings = [rdp([proj(lat, lng) for lng, lat in r], STYLE_EPS['sea']) for r in land]
        rings = [r for r in rings if len(r) >= 3 and area(r) >= 60]
        # No land ring means the coast only grazed the frame: draw no sea rather than a frame of it.
        sea = path([rect] + rings, True) if rings else ''
    result = {'id': name.lower().replace(' ', '-'), 'name': name, 'bbox': [s, w, n, e], 'w': W, 'h': H, 'sea': sea}
    for k, polys in layers.items():
        closed = k in ('parks', 'water')
        # Nothing wholly outside the frame (a lagoon's far islands, a ring road's far side).
        polys = [p for p in polys if p and max(x for x, _ in p) >= 0 and min(x for x, _ in p) <= W and max(y for _, y in p) >= 0 and min(y for _, y in p) <= H]
        if not closed:
            polys = chain(clip_lines(polys, W, H))
        simp = [rdp(p, STYLE_EPS.get(k, EPS)) for p in polys]
        if closed:
            min_area = MIN_AREA[k]
            simp = [p for p in simp if len(p) >= 4 and area(p) >= min_area]
        else:
            simp = [p for p in simp if len(p) >= 2 and length(p) >= MIN_LEN.get(k, 6)]
        result[k] = path(simp, closed)
    return result

maps = [build(cid) for cid in CITIES if os.path.exists(os.path.join(CACHE, f'{cid}.json'))]
for m in maps:
    print(m['id'], m['w'], m['h'], {k: len(m[k]) for k in ('sea', 'minor', 'parks', 'water', 'rivers', 'canals', 'coast', 'major', 'roads')})

body = ',\n'.join('  ' + json.dumps(m, ensure_ascii=False) for m in maps)
ts = f'''/**
 * Minimal city maps for Radar's local view: water, parks, coastline and
 * the main roads — enough to recognise a city, nothing to read.
 *
 * GENERATED from OpenStreetMap (Overpass extracts, simplified to a
 * 1000-unit-wide viewBox, equirectangular over each bbox) by
 * scripts/radar-data/osm_build.py (fetch with osm_fetch.py first). Map data (c) OpenStreetMap contributors, ODbL — the map
 * view credits it. Do not hand-edit; regenerate.
 */

export interface CityMap {{
  id: string;
  name: string;
  /** south, west, north, east */
  bbox: [number, number, number, number];
  w: number;
  h: number;
  /** The frame minus the land, to fill even-odd: '' where there is no coast. */
  sea: string;
  parks: string;
  water: string;
  rivers: string;
  canals: string;
  coast: string;
  major: string;
  roads: string;
  /** Secondary streets: texture more than routes. */
  minor: string;
}}

export const CITY_MAPS: CityMap[] = [
{body}
];

/** Lat/lng to the map's viewBox. */
export function projectCity(m: CityMap, lat: number, lng: number) {{
  const [s, w, n, e] = m.bbox;
  return {{ x: ((lng - w) / (e - w)) * m.w, y: ((n - lat) / (n - s)) * m.h }};
}}
'''
open(OUT, 'w').write(ts)
print(f'{os.path.getsize(OUT) // 1024} KB ->', OUT)
