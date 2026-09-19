import { init, track } from '@plausible-analytics/tracker';

/** Self-hosted Plausible CE instance, e.g. `https://plausible.example.com`. */
const PLAUSIBLE_HOST = import.meta.env.VITE_PLAUSIBLE_HOST?.replace(/\/$/, '');
/** Site domain exactly as registered in the Plausible dashboard. */
const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN;

let enabled = false;

/** Starts pageview tracking. A no-op unless both env vars are set, so local
 *  builds without them send nothing. */
export function initAnalytics(): void {
  if (enabled || !PLAUSIBLE_HOST || !PLAUSIBLE_DOMAIN) return;
  init({
    domain: PLAUSIBLE_DOMAIN,
    endpoint: `${PLAUSIBLE_HOST}/api/event`,
    outboundLinks: true,
  });
  enabled = true;
}

/** Sends a custom event. Safe to call when analytics is disabled. */
export function trackEvent(name: string, props?: Record<string, string>): void {
  if (!enabled) return;
  track(name, { props });
}
