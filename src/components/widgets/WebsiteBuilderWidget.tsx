import type { RefObject } from 'react';
import { WidgetCard } from '@/components/widgets/WidgetCard';
import { useWindowManager } from '@/state/WindowManagerContext';

interface WebsiteBuilderWidgetProps {
  desktopRef: RefObject<HTMLElement | null>;
}

/** Ported from Tools.html:1688-1694. Part of the guest progressive-unlock chain (`.gated`, key 'page') rather than login-only. */
export function WebsiteBuilderWidget({ desktopRef }: WebsiteBuilderWidgetProps) {
  const { openWindow } = useWindowManager();

  return (
    <WidgetCard
      id="widgetWeb"
      desktopRef={desktopRef}
      x={1140}
      y={360}
      title="◇ not.online / you"
      lead={
        <>
          a page for
          <br />
          your <b>links</b>
        </>
      }
      art="/assets/builder/cran.png"
      badge="Try me"
      buttonIcon="public"
      buttonLabel="Build page"
      openOnCardClick
      onOpen={() =>
        openWindow({ kind: 'websiteBuilder', title: 'Your links page', width: 1040, height: 660, singleton: true })
      }
      color="pink"
      rotate={3}
    />
  );
}
