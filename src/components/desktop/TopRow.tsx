import { AuthPill } from '@/components/desktop/AuthPill';
import styles from './TopRow.module.css';

interface TopRowProps {
  onRequestLogin?: () => void;
}

/**
 * Ported from Tools.html:1601-1627. Carries a plain `toprow` marker class
 * alongside the module class — AuthPill.module.css reaches for
 * `:global(.toprow)` to un-absolute itself into this row on mobile, the
 * same cross-file-marker pattern useAutoLayout uses for `.desktop-icon`.
 *
 * A logged-in user used to get a second bar up here (StatBar) beside
 * MySubmissions' own trigger — two floating bars saying overlapping things.
 * StatBar is still in the tree, just not mounted; MySubmissions' dropdown
 * is the one that stays.
 */
export function TopRow({ onRequestLogin }: TopRowProps) {
  return (
    <div className={`${styles.toprow} toprow`}>
      <AuthPill onRequestLogin={onRequestLogin} />
    </div>
  );
}
