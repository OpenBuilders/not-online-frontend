import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { AppState, SiteConfig, TourId } from '@/types';

// Onboarding progress (which tours are done, whether a guest has explored the catalogue) and
// the picked background survive a reload here — for a guest and a logged-in seller alike, since
// neither is part of the real backend session (that's cookie + `/auth/me`, see useAuth.ts).
const PROGRESS_STORAGE_KEY = 'notportal:app-progress:v1';

interface PersistedProgress {
  tours: TourId[];
  exploredCatalog: boolean;
  wallpaper: string | null;
}

function loadPersistedProgress(): PersistedProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return { tours: [], exploredCatalog: false, wallpaper: null };
    const parsed = JSON.parse(raw) as Partial<PersistedProgress> | null;
    const tours = Array.isArray(parsed?.tours)
      ? parsed.tours.filter((t): t is TourId => t === 'market' || t === 'settings')
      : [];
    return {
      tours,
      exploredCatalog: Boolean(parsed?.exploredCatalog),
      wallpaper: typeof parsed?.wallpaper === 'string' ? parsed.wallpaper : null,
    };
  } catch {
    return { tours: [], exploredCatalog: false, wallpaper: null };
  }
}

function buildInitialState(): AppState {
  const persisted = loadPersistedProgress();
  return {
    logged: false,
    email: null,
    invited: new URLSearchParams(window.location.search).has('invite'),
    tours: new Set(persisted.tours),
    site: null,
    cursor: 'nothing',
    wallpaper: persisted.wallpaper,
    appIcons: {},
    exploredCatalog: persisted.exploredCatalog,
  };
}

type Action =
  | { type: 'LOGIN'; email: string }
  | { type: 'LOGOUT' }
  | { type: 'COMPLETE_TOUR'; tour: TourId }
  | { type: 'SET_SITE'; site: SiteConfig }
  | { type: 'SET_CURSOR'; cursor: string }
  | { type: 'SET_WALLPAPER'; wallpaper: string | null }
  | { type: 'SET_APP_ICON'; app: string; dataUrl: string }
  | { type: 'MARK_EXPLORED_CATALOG' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, logged: true, email: action.email };
    case 'LOGOUT':
      // site/tours/cursor are local-browser state, not session state — they survive logout,
      // matching the original app (Tools.html:2874-2877 only ever cleared logged/email).
      return { ...state, logged: false, email: null };
    case 'COMPLETE_TOUR': {
      if (state.tours.has(action.tour)) return state;
      const tours = new Set(state.tours);
      tours.add(action.tour);
      return { ...state, tours };
    }
    case 'SET_SITE':
      return { ...state, site: action.site };
    case 'SET_CURSOR':
      return { ...state, cursor: action.cursor };
    case 'SET_WALLPAPER':
      return { ...state, wallpaper: action.wallpaper };
    case 'SET_APP_ICON':
      return { ...state, appIcons: { ...state.appIcons, [action.app]: action.dataUrl } };
    case 'MARK_EXPLORED_CATALOG':
      return state.exploredCatalog ? state : { ...state, exploredCatalog: true };
    default:
      return state;
  }
}

interface AppStateContextValue {
  state: AppState;
  login: (email: string) => void;
  logout: () => void;
  completeTour: (tour: TourId) => void;
  setSite: (site: SiteConfig) => void;
  setCursor: (cursor: string) => void;
  setWallpaper: (wallpaper: string | null) => void;
  setAppIcon: (app: string, dataUrl: string) => void;
  markExploredCatalog: () => void;
}

const AppStateCtx = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);

  useEffect(() => {
    try {
      const progress: PersistedProgress = {
        tours: [...state.tours],
        exploredCatalog: state.exploredCatalog,
        wallpaper: state.wallpaper,
      };
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Storage can be unavailable (private browsing, quota) — losing persistence silently
      // is better than breaking the app over it.
    }
  }, [state.tours, state.exploredCatalog, state.wallpaper]);

  const login = useCallback((email: string) => dispatch({ type: 'LOGIN', email }), []);
  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);
  const completeTour = useCallback((tour: TourId) => dispatch({ type: 'COMPLETE_TOUR', tour }), []);
  const setSite = useCallback((site: SiteConfig) => dispatch({ type: 'SET_SITE', site }), []);
  const setCursor = useCallback((cursor: string) => dispatch({ type: 'SET_CURSOR', cursor }), []);
  const setWallpaper = useCallback((wallpaper: string | null) => dispatch({ type: 'SET_WALLPAPER', wallpaper }), []);
  const setAppIcon = useCallback((app: string, dataUrl: string) => dispatch({ type: 'SET_APP_ICON', app, dataUrl }), []);
  const markExploredCatalog = useCallback(() => dispatch({ type: 'MARK_EXPLORED_CATALOG' }), []);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      login,
      logout,
      completeTour,
      setSite,
      setCursor,
      setWallpaper,
      setAppIcon,
      markExploredCatalog,
    }),
    [state, login, logout, completeTour, setSite, setCursor, setWallpaper, setAppIcon, markExploredCatalog]
  );

  return <AppStateCtx.Provider value={value}>{children}</AppStateCtx.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateCtx);
  if (!ctx) throw new Error('useAppState must be used within an AppStateProvider');
  return ctx;
}
