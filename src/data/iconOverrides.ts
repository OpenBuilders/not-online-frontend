// Ported from ICON_PATHS/ICON_OVERRIDES (Tools.html:1786-1799) — custom
// artwork for a desktop icon, falling back to the built-in line icon
// (data/icons.tsx) if the image is missing or fails to load. Add an entry
// here to swap any app/folder icon's art without touching its component.
export const APP_ICON_PATHS: Partial<Record<string, string>> = {
  // The other two variants dropped alongside this one (Market_icon_2/3,
  // a "90% off" sticker and a currency bill) read as promo art for inside
  // the Market window rather than the app icon itself — not wired up here.
  market: '/assets/icons/apps/Market_icon_1.png',
  // settings_icon_1.png is actually two toggle-switch graphics stacked in
  // one tall image (795x936) — contain-fit will show both, small, inside
  // the icon box. Using it as given; flag if you meant one cropped alone.
  settings: '/assets/icons/apps/settings_icon_1.png',
};
