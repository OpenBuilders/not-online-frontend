import { useEffect, useRef, useState } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { useAppState } from '@/state/AppStateContext';
import { useLogout } from '@/state/useAuth';
import { useWindowManager } from '@/state/WindowManagerContext';
import styles from './AuthPill.module.css';

interface AuthPillProps {
  /** Opens the login screen for a guest. Wired up once LoginScreen exists (stage 3); a no-op until then. */
  onRequestLogin?: () => void;
}

/** Ported from Tools.html:1602-1609 (markup) + the IIFE around line 2760 (open/close menu, logout). */
export function AuthPill({ onRequestLogin }: AuthPillProps) {
  const { state } = useAppState();
  const { closeAllWindows } = useWindowManager();
  const logoutMutation = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && target !== buttonRef.current) setMenuOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [menuOpen]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, { onSuccess: () => closeAllWindows() });
    setMenuOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.authbtn} ${!state.logged ? styles.guest : ''}`}
        aria-label="Account"
        onClick={(e) => {
          e.stopPropagation();
          if (state.logged) setMenuOpen((v) => !v);
          else onRequestLogin?.();
        }}
      >
        <span className={styles.who}>
          {state.logged ? (
            <>
              <b>{state.email?.split('@')[0] || 'Nothing User'}</b>
              <small>signed in</small>
            </>
          ) : (
            <>
              <b>Guest</b>
              <small>tap to log in</small>
            </>
          )}
        </span>
        <span className={styles.av}>
          <MaterialIcon name={state.logged ? 'person' : 'lock'} />
        </span>
      </button>
      {menuOpen && (
        <div ref={menuRef} className={styles.menu}>
          <button type="button" onClick={handleLogout}>
            <MaterialIcon name="logout" size={16} />
            Log out
          </button>
        </div>
      )}
    </>
  );
}
