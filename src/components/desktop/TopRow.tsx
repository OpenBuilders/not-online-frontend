import { AuthPill } from '@/components/desktop/AuthPill';
import { StatBar } from '@/components/desktop/StatBar';
import { useAppState } from '@/state/AppStateContext';
import styles from './TopRow.module.css';

interface TopRowProps {
  onRequestLogin?: () => void;
}

/**
 * Ported from Tools.html:1601-1627. Carries a plain `toprow` marker class
 * alongside the module class — AuthPill.module.css and StatBar.module.css
 * both reach for `:global(.toprow)` to un-absolute themselves into this row
 * on mobile, the same cross-file-marker pattern useAutoLayout uses for
 * `.desktop-icon`/`.widget-card`.
 */
export function TopRow({ onRequestLogin }: TopRowProps) {
  const { state } = useAppState();

  return (
    <div className={`${styles.toprow} toprow`}>
      {/* StatBar renders first so its `flex: 1` (mobile) claims the row's
          free space before layout — AuthPill's `margin-left: auto` only has
          space to push into when it comes after, not before, the growing
          sibling. See AuthPill.module.css / StatBar.module.css. */}
      {state.logged && <StatBar />}
      <AuthPill onRequestLogin={onRequestLogin} />
    </div>
  );
}
