import type { CityMap } from '@/data/cityMaps';
import styles from './CityBase.module.css';

/**
 * The city on black, readable as a map before it is a poster: water in a
 * deep water-blue so it reads as water, the street network as thin acid
 * green lines (the main roads a little brighter), parks as a faint pink
 * halftone. Every line is a hairline at any zoom.
 */
export function CityLayers({ map }: { map: CityMap }) {
  return (
    <>
      <defs>
        <pattern id="radar-park-dots" width={9} height={9} patternUnits="userSpaceOnUse">
          <circle cx={4.5} cy={4.5} r={1.2} className={styles.parkDot} />
        </pattern>
      </defs>
      <g className={styles.city} aria-hidden="true">
        <path d={map.sea} className={styles.sea} />
        <path d={map.water} className={styles.water} />
        <path d={map.rivers} className={styles.rivers} />
        <path d={map.canals} className={styles.canals} />
        <path d={map.parks} className={styles.parks} />
        <path d={map.minor} className={styles.minor} />
        <path d={map.roads} className={styles.roads} />
        <path d={map.major} className={styles.major} />
      </g>
    </>
  );
}
