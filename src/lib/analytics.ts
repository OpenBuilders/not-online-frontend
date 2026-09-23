import { init, track } from '@plausible-analytics/tracker';

// This public endpoint receives anonymous browser analytics for not.online.
// Keep it in sync with apps/not-online/src/pages/[handle].astro.
const PLAUSIBLE_HOST = 'https://plausible.probablynothing.xyz';
const PLAUSIBLE_DOMAIN = 'not.online';

let enabled = false;

/** Starts pageview tracking. */
export function initAnalytics(): void {
  if (enabled) return;
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
