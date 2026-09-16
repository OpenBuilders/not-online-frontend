import type { RefObject } from 'react';
import { WidgetCard } from '@/components/widgets/WidgetCard';
import { useGuestGating } from '@/state/useGuestGating';
import { useWindowManager } from '@/state/WindowManagerContext';

interface WebsiteBuilderWidgetProps {
  desktopRef: RefObject<HTMLElement | null>;
}

/**
 * Ported from Tools.html:1688-1694. Part of the guest progressive-unlock
 * chain (key 'page') rather than login-only, so it appears on the desktop
 * once a guest has listed something and picked a background.
 */
export function WebsiteBuilderWidget({ desktopRef }: WebsiteBuilderWidgetProps) {
  const { guestUnlocked } = useGuestGating();
  const { openWindow } = useWindowManager();

  if (!guestUnlocked('page')) return null;

  return (
    <WidgetCard
      id="widgetWeb"
      desktopRef={desktopRef}
      x={980}
      y={150}
      title="◇ your .not.online"
      lead={
        <>
          a page for
          <br />
          your <b>links</b>
        </>
      }
      sub="like linktree, but nothing"
      buttonIcon="public"
      buttonLabel="Build page"
      onOpen={() =>
        openWindow({ kind: 'websiteBuilder', title: 'Your links page', width: 1040, height: 660, singleton: true })
      }
      color="pink"
      rotate={3}
    />
  );
}
