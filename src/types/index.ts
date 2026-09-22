// Shared types for app-wide state. Feature-specific data shapes (Opportunity,
// Org, ToolResource, etc.) live next to the data file that introduces them
// and get re-exported here once a stage actually ports that data.

export type MarketItemStatus = 'queued' | 'live';

/** The one callout sticker a Browse-grid card can wear. At most one per item. */
export type MarketItemBadge = 'buyMe' | 'patronsOnly';

export interface MarketItem {
  id: string;
  name: string;
  contact?: string;
  price: number;
  /** Overrides the `$price` display, e.g. "Priceless" — the fixed catalogue's Nothing cap uses this. */
  priceLabel?: string;
  amount: number;
  desc: string;
  img: string | null;
  /** A short looping clip (e.g. .webm) shown instead of a static photo when set — takes priority over `img`. */
  video?: string | null;
  icon: string;
  status: MarketItemStatus;
  views: number;
  badge?: MarketItemBadge;
  /** Set on the fixed catalogue items — clicking the card opens this instead of anything in-app (this desktop doesn't handle checkout; real listings go through the moderation queue). */
  externalUrl?: string;
}

export type SiteTemplateId = 'poster' | 'stickers' | 'web1' | 'button' | 'bold' | 'folders';

export interface SiteLink {
  id: string;
  icon: string;
  title: string;
  url: string;
}

export interface SiteConfig {
  handle: string;
  name: string;
  bio: string;
  /** Data URL from an upload, a path under /assets/, or null for the initials fallback. */
  avatar: string | null;
  template: SiteTemplateId;
  palette: string;
  backdrop: string;
  /** Only read when `backdrop` is 'photo'. */
  backdropImage: string | null;
  /** Which face the 'button' template wears — see BUTTON_STYLES. */
  buttonStyle: string;
  /** Which colourway that face is painted in — see BUTTON_COLORS. */
  buttonColor: string;
  /** Which folder image the 'folders' template draws — see FOLDER_COLORS. */
  folderColor: string;
  links: SiteLink[];
  /** Shuffles the sticker template's scatter — the layout is derived, not hand-placed. */
  seed: number;
  views: number;
  clicks: number;
}

/** The guest onboarding chain unlocks these one at a time. The widget-backed
 *  'radar' step is still parked — see useGuestGating.ts. */
export type TourId = 'market' | 'settings' | 'page' | 'smm';

// ---- not media kit (the SMM tool) ----

/** The four places a post can go. Each one gets its own hints and templates. */
export type SmmPlatform = 'instagram' | 'x' | 'youtube' | 'telegram';

/**
 * Where a post is in the loop. `posted` is the end of it — those drop out
 * of the working list into a collapsed shelf, so the archive only ever
 * shows what still needs doing.
 */
export type SmmPostStatus = 'draft' | 'scheduled' | 'posted';

export interface SmmPost {
  id: string;
  title: string;
  body: string;
  platform: SmmPlatform;
  labels: string[];
  /** Data URLs, stored in this browser with the rest of the post. */
  photos: string[];
  status: SmmPostStatus;
  /**
   * `YYYY-MM-DD` once it lands in a calendar cell, null while it's a draft.
   * A day, and only a day — there is no time of day on a post. Planning a
   * month is about which days carry something; the minute a post goes out
   * is decided in the app you post from, not here.
   */
  day: string | null;
  createdAt: number;
}

export interface SmmState {
  posts: SmmPost[];
  /** Bingo squares already crossed off, by square id. */
  bingoCrossed: string[];
}

export interface AppState {
  logged: boolean;
  email: string | null;
  invited: boolean;
  tours: Set<TourId>;
  site: SiteConfig | null;
  cursor: string;
  /** Selected background's id (see `src/data/backgrounds.ts`) — null means the default. */
  wallpaper: string | null;
  appIcons: Record<string, string>;
  /** A guest has clicked out to a live catalogue item at least once — unlocks the 3rd background option. */
  exploredCatalog: boolean;
  smm: SmmState;
}

// ---- window manager ----

/** One entry per openable app/window. The remaining widget-backed windows
 *  (radar/tools/orgs/smm) are parked with the widgets themselves — add them
 *  back here when they come back. */
export type WindowKind = 'market' | 'settings' | 'websiteBuilder' | 'smm' | 'artistApply' | 'notFound' | 'blank';

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
