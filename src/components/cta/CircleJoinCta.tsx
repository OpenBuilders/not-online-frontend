import { CircleStage } from './CircleStage';
import { CtaPopup } from './CtaPopup';

interface CircleJoinCtaProps {
  /** Overridden where the popup answers something specific, like an email we don't know. */
  title?: string;
  sub?: string;
  onClose: () => void;
}

/** The join CTA as a dismissible popup — the login screen's route into it. */
export function CircleJoinCta({
  title = 'Join the circle',
  sub = 'Move the light. Pick your role',
  onClose,
}: CircleJoinCtaProps) {
  return (
    <CtaPopup title={title} sub={sub} tone="paper" onClose={onClose}>
      <CircleStage onClose={onClose} />
    </CtaPopup>
  );
}
