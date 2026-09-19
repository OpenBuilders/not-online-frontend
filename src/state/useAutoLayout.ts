import { useLayoutEffect, type DependencyList, type RefObject } from 'react';

/**
 * Positions the desktop icons and widgets, and keeps them inside the
 * desktop when it is narrower than the layout they were authored for.
 *
 * There used to be a separate mobile branch that re-flowed the icons into a
 * grid and the widgets into resized square cells. It's gone: the same left
 * column of icons with the widget pulled against the right edge reads
 * correctly at every width, and one layout means the widget is one size, so
 * its type doesn't have to work at two.
 *
 * This stays a DOM-measuring effect rather than computed styles because
 * clamping needs each element's real rendered width, which isn't known
 * until after layout.
 *
 * Icons and widgets only need the CSS classes `.desktop-icon` and
 * `.widget-radar`/`.widget-card`; gated ones should simply not be rendered
 * rather than rendered-and-hidden, so this hook never needs to know about
 * gating itself. A draggable element also carries `data-x`/`data-y` so its
 * authored position can be restored after a resize.
 */
export function useAutoLayout(desktopRef: RefObject<HTMLElement | null>, deps: DependencyList) {
  useLayoutEffect(() => {
    const desk = desktopRef.current;
    if (!desk) return;

    function layout() {
      if (!desk) return;
      const items = Array.from(desk.querySelectorAll<HTMLElement>('.desktop-icon, .widget-radar, .widget-card'));

      items.forEach((el) => {
        if (el.dataset.y) el.style.top = `${el.dataset.y}px`;
        if (!el.dataset.x) return;
        // Seed positions are authored against a wide desktop. Clamping to
        // the container keeps everything whole on a narrow one instead of
        // letting it run off the right edge, where a widget's action button
        // would be unreachable — and on a phone it produces exactly the
        // arrangement we want anyway: the icons stay in their left column,
        // and the widget pulls in against the right edge.
        const maxLeft = desk.clientWidth - el.offsetWidth - 14;
        el.style.left = `${Math.max(14, Math.min(Number(el.dataset.x), maxLeft))}px`;
      });
    }

    layout();
    window.addEventListener('resize', layout);
    return () => window.removeEventListener('resize', layout);
    // `deps` is spread intentionally: callers pass whatever signals a visible
    // icon/widget changed (login state, tour progress, gating), and layout()
    // itself only ever reads the DOM, so there's nothing else to depend on.
  }, [desktopRef, ...deps]);
}
