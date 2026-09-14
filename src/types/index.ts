// Shared types for app-wide state. Feature-specific data shapes (Opportunity,
// Org, ToolResource, etc.) live next to the data file that introduces them
// and get re-exported here once a stage actually ports that data.

export type MarketItemStatus = 'queued' | 'live';

export interface MarketItem {
  id: string;
  name: string;
  price: number;
  amount: number;
  desc: string;
  img: string | null;
  /** A short looping clip (e.g. .webm) shown instead of a static photo when set — takes priority over `img`. */
  video?: string | null;
  icon: string;
  status: MarketItemStatus;
  views: number;
}

export type SiteTemplateId = 'stack' | 'grid' | 'stick' | 'web1';

export interface SiteLink {
  icon: string;
  title: string;
  url: string;
}

export interface Sticker {
  id: string;
  shape: 'sq' | 'rd' | 'ci' | 'st' | 'bl';
  x: number;
  y: number;
  size: number;
  rot: number;
  color: string;
  img: string | null;
  title: string;
  fs: number;
}

export interface SiteConfig {
  handle: string;
  name: string;
  template: SiteTemplateId;
  combo: string;
  links: SiteLink[];
  stickers: Sticker[] | null;
  views: number;
  clicks: number;
}

/** The guest onboarding chain unlocks these one at a time. Widgets (and the
 *  'radar'/'page' steps that used to gate them) are parked for now — see
 *  useGuestGating.ts. */
export type TourId = 'market' | 'settings';

export interface AppState {
  logged: boolean;
  email: string | null;
  invited: boolean;
  tours: Set<TourId>;
  myItems: MarketItem[];
  cart: MarketItem[];
  site: SiteConfig | null;
  cursor: string;
  wallpaper: string | null;
  appIcons: Record<string, string>;
}

// ---- window manager ----

/** One entry per openable app/window. Widget-backed windows (radar/tools/
 *  orgs/smm/websiteBuilder) are parked with the widgets themselves — add
 *  them back here when they come back. */
export type WindowKind = 'market' | 'settings' | 'patron' | 'artistApply' | 'notFound' | 'blank';

export interface WindowInstance {
  id: string;
  kind: WindowKind;
  title: string;
  width: number;
  height?: number;
  className?: string;
  /** Extra data a specific window kind needs at open time (e.g. a folder name for 'blank'). */
  payload?: unknown;
  zIndex: number;
  /** Cascade position index (Tools.html's `winCount % 6`), used for the initial offset only — a drag mutates the DOM directly after that and is never written back here. */
  offsetIndex: number;
}

export interface OpenWindowOptions {
  kind: WindowKind;
  title: string;
  width: number;
  height?: number;
  className?: string;
  payload?: unknown;
  /** Reuse and focus an existing window of the same kind instead of opening a second one. */
  singleton?: boolean;
}
