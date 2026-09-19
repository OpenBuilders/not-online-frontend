import { useLayoutEffect, type DependencyList, type RefObject } from 'react';

const MOBILE_BREAKPOINT = 760;

/**
 * Mobile layout for the desktop icons and widgets: below 760px, icons lay
 * out into a grid and the widgets stack full-width beneath them; above it,
 * everything reverts to its own absolute x/y. Ported from autoLayout()/
 * isMobile() (Tools.html:3670-3695) — this specific behavior was verified
 * correct earlier this session (it was wrongly flagged as broken in an
 * earlier audit pass, which turned out to be a test-methodology bug, not a
 * real one; see the redesign-audit history for that).
 *
 * One real bug in that original function *is* fixed here: its desktop
 * branch only ever reset `width`, never `left`/`top`, so resizing from
 * mobile back to desktop left icons and widgets stuck at their mobile grid
 * position. Caught by actually resizing a live instance of this port,
 * fixed by clearing the inline overrides so each element falls back to its
 * own x/y prop.
 *
 * This stays a DOM-measuring effect rather than a computed style, on
 * purpose: the widget stack's row height depends on each widget's actual
 * rendered height, which isn't known until after layout — that's true in
 * any framework, not a shortcut specific to this port. Icons and widgets
 * only need the CSS classes `.desktop-icon` and `.widget-radar`/`.widget-card`
 * respectively; gated ones should simply not be rendered rather than
 * rendered-and-hidden, so this hook never needs to know about gating itself.
 */
export function useAutoLayout(desktopRef: RefObject<HTMLElement | null>, deps: DependencyList) {
  useLayoutEffect(() => {
    const desk = desktopRef.current;
    if (!desk) return;

    function layout() {
      if (!desk) return;
      const icons = Array.from(desk.querySelectorAll<HTMLElement>('.desktop-icon'));
      const widgets = Array.from(desk.querySelectorAll<HTMLElement>('.widget-radar, .widget-card'));
      const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

      if (isMobile) {
        const W = desk.clientWidth;
        const cols = Math.max(2, Math.floor((W - 24) / 104));
        icons.forEach((el, i) => {
          el.style.left = `${14 + (i % cols) * ((W - 28) / cols)}px`;
          el.style.top = `${104 + Math.floor(i / cols) * 132}px`;
        });
        const rows = Math.ceil(icons.length / cols);
        let y = 104 + rows * 132 + 6;
        // Widgets show as a 2-column grid of square cells rather than a
        // full-width single-column stack.
        const widgetGap = 12;
        const widgetCols = 2;
        const cellSize = (W - 28 - widgetGap * (widgetCols - 1)) / widgetCols;
        widgets.forEach((el, i) => {
          const col = i % widgetCols;
          const row = Math.floor(i / widgetCols);
          el.style.left = `${14 + col * (cellSize + widgetGap)}px`;
          el.style.top = `${y + row * (cellSize + widgetGap)}px`;
          el.style.width = `${cellSize}px`;
          el.style.height = `${cellSize}px`;
        });
        const widgetRows = Math.ceil(widgets.length / widgetCols);
        y += widgetRows * (cellSize + widgetGap);
        desk.style.overflowY = 'auto';
      } else {
        // Restore each element's own desktop position from its data-x/data-y
        // (set by the component itself) rather than clearing the inline
        // style — clearing it doesn't guarantee React repaints the value,
        // since nothing forces a re-render just because this effect mutated
        // the DOM directly.
        widgets.forEach((el) => {
          el.style.width = '';
          el.style.height = '';
        });
        [...icons, ...widgets].forEach((el) => {
          if (el.dataset.y) el.style.top = `${el.dataset.y}px`;
          if (!el.dataset.x) return;
          // Seed positions are authored against a wide desktop. Clamping to
          // the container keeps a widget whole on a narrow-but-not-mobile
          // window instead of letting it run off the right edge, where its
          // action button is unreachable.
          const maxLeft = desk.clientWidth - el.offsetWidth - 16;
          el.style.left = `${Math.max(16, Math.min(Number(el.dataset.x), maxLeft))}px`;
        });
        desk.style.overflowY = '';
      }
    }

    layout();
    window.addEventListener('resize', layout);
    return () => window.removeEventListener('resize', layout);
    // `deps` is spread intentionally: callers pass whatever signals a visible
    // icon/widget changed (login state, tour progress, gating), and layout()
    // itself only ever reads the DOM, so there's nothing else to depend on.
  }, [desktopRef, ...deps]);
}
