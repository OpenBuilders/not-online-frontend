import { useEffect, useState } from 'react';
import type { CityMap } from '@/data/cityMaps';

/**
 * The city maps both Radar maps stand on — the gallery's local view and
 * Spots: loading the drawn cities, projecting onto them, and framing them
 * to what is pinned. The base layers themselves are CityBase.tsx.
 */

let mapsCache: CityMap[] | null = null;

/** The drawn cities (cityMaps.ts, ~120 KB), fetched the first time a city map is shown. */
export function useCityMaps(enabled: boolean) {
  const [maps, setMaps] = useState<CityMap[] | null>(mapsCache);
  useEffect(() => {
    if (!enabled || mapsCache) return;
    let live = true;
    void import('@/data/cityMaps').then((m) => {
      mapsCache = m.CITY_MAPS;
      if (live) setMaps(m.CITY_MAPS);
    });
    return () => {
      live = false;
    };
  }, [enabled]);
  return maps;
}

/** Lat/lng to the map's own units. */
export function projectTo(map: CityMap, lat: number, lng: number) {
  const [s, w, n, e] = map.bbox;
  return { x: ((lng - w) / (e - w)) * map.w, y: ((n - lat) / (n - s)) * map.h };
}

export interface Frame {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * A viewBox around the points: their extent plus air, never tighter than
 * `minShare` of the city, roughly the panel's shape, and slid back inside
 * the drawn city rather than past its edge.
 */
export function fitFrame(map: CityMap, pts: { x: number; y: number }[], minShare = 0.34): Frame {
  if (pts.length === 0) return { x: 0, y: 0, w: map.w, h: map.h };
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const minSpan = map.w * minShare;
  let w = Math.max(minSpan, (Math.max(...xs) - Math.min(...xs)) * 1.35);
  let h = Math.max(minSpan * 0.75, (Math.max(...ys) - Math.min(...ys)) * 1.35);
  if (w / h < 1.15) w = h * 1.15;
  else h = Math.max(h, w / 1.6);
  w = Math.min(w, map.w);
  h = Math.min(h, map.h);
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  const clamp = (v: number, size: number, max: number) => Math.max(0, Math.min(max - size, v));
  return { x: clamp(cx - w / 2, w, map.w), y: clamp(cy - h / 2, h, map.h), w, h };
}
