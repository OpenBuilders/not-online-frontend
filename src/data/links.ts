/** External destinations the desktop links out to instead of opening anything in-app. */
export const PATRON_URL = 'https://probablynothing.xyz/patrons';
/**
 * Applying as an artist happens on the main site, not on this desktop.
 * It used to open an in-app window that had never been built past its
 * placeholder, so picking "artist" in the join CTA landed on a blank
 * panel — the one route out of the CTA that went nowhere.
 */
export const ARTIST_URL = 'https://probablynothing.xyz';
