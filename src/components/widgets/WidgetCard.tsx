import { type ReactNode, type RefObject } from 'react';
import { StickerWidget, type StickerColor } from '@/components/widgets/StickerWidget';
import { WidgetShell } from '@/components/widgets/WidgetShell';

interface WidgetCardProps {
  id: string;
  title: ReactNode;
  lead: ReactNode;
  sub?: ReactNode;
  buttonLabel: string;
  buttonIcon: string;
  onOpen: () => void;
  /** Initial desktop position (Tools.html seeds these inline, e.g. top:100px; left:880px). */
  x: number;
  y: number;
  desktopRef: RefObject<HTMLElement | null>;
  color: StickerColor;
  rotate?: number;
  /** Illustration behind the content, cropped to the sticker's shape. */
  art?: string;
  /** Peel-off label stuck over the top-left corner, e.g. "TRY ME". */
  badge?: string;
}

/**
 * Shared shell for the four simple card widgets (Toolbox, Orgs, SMM,
 * Website Builder). Ported from .widget-card/.wc-* (Tools.html:812-821),
 * now rendered as a StickerWidget — the widget itself is the sticker, with
 * its content on the face. Radar has its own bespoke layout and doesn't use
 * this, though it wraps its own content the same way.
 *
 * Placement and dragging live in WidgetShell, which SmmWidget also uses
 * for its own state-dependent face — this component is now only the
 * standard title/lead/sub/button treatment that most widgets want.
 */
export function WidgetCard({
  id,
  title,
  lead,
  sub,
  buttonLabel,
  buttonIcon,
  onOpen,
  x,
  y,
  desktopRef,
  color,
  rotate,
  art,
  badge,
}: WidgetCardProps) {
  return (
    <WidgetShell id={id} x={x} y={y} desktopRef={desktopRef}>
      {(hasMoved) => (
        <StickerWidget
          color={color}
          icon={buttonIcon}
          title={title}
          lead={lead}
          sub={sub}
          actionLabel={buttonLabel}
          rotate={rotate}
          art={art}
          badge={badge}
          onOpen={() => {
            // Same click-vs-drag disambiguation DesktopIcon uses — a drag
            // that happens to end on the button shouldn't also open the
            // window.
            if (hasMoved.current) {
              hasMoved.current = false;
              return;
            }
            onOpen();
          }}
        />
      )}
    </WidgetShell>
  );
}
