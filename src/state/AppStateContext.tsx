import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { blankSite } from '@/data/siteTemplates';
import type { AppState, SiteConfig, SiteTemplateId, SmmPost, SmmState, TourId } from '@/types';

// Onboarding progress (which tours are done, whether a guest has explored the catalogue) and
// the picked background survive a reload here — for a guest and a logged-in seller alike, since
// neither is part of the real backend session (that's cookie + `/auth/me`, see useAuth.ts).
const PROGRESS_STORAGE_KEY = 'notportal:app-progress:v1';
// A links page is also cached in this browser for guests and for a quick first
// render. An authenticated user's canonical copy lives in the backend.
const SITE_STORAGE_KEY = 'notportal:site:v1';
// The media kit's posts. This is the only place a post exists — there is no
// backend behind the tool yet, which is exactly what the notice inside it
// tells a logged-out visitor, so the two have to stay true to each other.
const SMM_STORAGE_KEY = 'notportal:smm:v1';

const TOUR_IDS: TourId[] = ['market', 'settings', 'page', 'smm'];

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
      ? parsed.tours.filter((t): t is TourId => TOUR_IDS.includes(t as TourId))
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

const TEMPLATE_IDS: SiteTemplateId[] = ['poster', 'stickers', 'web1', 'button', 'bold', 'folders'];

/**
 * Reads a page saved by an older build without throwing any of it away.
 * The template set has been renamed and re-cut since pages started being
 * stored here, so anything unrecognised falls back to a default while the
 * parts people actually wrote — handle, name, bio, links — survive.
 */
function loadPersistedSite(): SiteConfig | null {
  try {
    const raw = localStorage.getItem(SITE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SiteConfig> | null;
    // Without a handle and a link array there's no page here worth keeping.
    if (!parsed || typeof parsed.handle !== 'string' || !Array.isArray(parsed.links)) return null;
    const template = TEMPLATE_IDS.includes(parsed.template as SiteTemplateId)
      ? (parsed.template as SiteTemplateId)
      : 'poster';
    return { ...blankSite(), ...parsed, template };
  } catch {
    return null;
  }
}

const EMPTY_SMM: SmmState = { posts: [], bingoCrossed: [] };

/**
 * Merged onto an empty slice rather than trusted whole: a build that adds
 * a field to SmmState would otherwise read `undefined` for it out of
 * storage the previous build wrote, and crash on first render.
 */
function loadPersistedSmm(): SmmState {
  try {
    const raw = localStorage.getItem(SMM_STORAGE_KEY);
    if (!raw) return EMPTY_SMM;
    const parsed = JSON.parse(raw) as Partial<SmmState> | null;
    return {
      posts: Array.isArray(parsed?.posts) ? parsed.posts : [],
      bingoCrossed: Array.isArray(parsed?.bingoCrossed) ? parsed.bingoCrossed : [],
    };
  } catch {
    // Unparseable, or storage blocked entirely (private windows, site data
    // switched off). Neither is worth failing a render for.
    return EMPTY_SMM;
  }
}

function buildInitialState(): AppState {
  const persisted = loadPersistedProgress();
  return {
    logged: false,
    email: null,
    invited: new URLSearchParams(window.location.search).has('invite'),
    tours: new Set(persisted.tours),
    site: loadPersistedSite(),
    cursor: 'nothing',
    wallpaper: persisted.wallpaper,
    appIcons: {},
    exploredCatalog: persisted.exploredCatalog,
    smm: loadPersistedSmm(),
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
  | { type: 'MARK_EXPLORED_CATALOG' }
  | { type: 'SMM_ADD_POST'; post: SmmPost }
  | { type: 'SMM_UPDATE_POST'; id: string; patch: Partial<SmmPost> }
  | { type: 'SMM_REMOVE_POST'; id: string }
  | { type: 'SMM_TOGGLE_BINGO'; id: string };

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
    case 'SMM_ADD_POST':
      return { ...state, smm: { ...state.smm, posts: [action.post, ...state.smm.posts] } };
    case 'SMM_UPDATE_POST':
      return {
        ...state,
        smm: {
          ...state.smm,
          posts: state.smm.posts.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p)),
        },
      };
    case 'SMM_REMOVE_POST':
      return { ...state, smm: { ...state.smm, posts: state.smm.posts.filter((p) => p.id !== action.id) } };
    case 'SMM_TOGGLE_BINGO': {
      const crossed = state.smm.bingoCrossed.includes(action.id)
        ? state.smm.bingoCrossed.filter((id) => id !== action.id)
        : [...state.smm.bingoCrossed, action.id];
      return { ...state, smm: { ...state.smm, bingoCrossed: crossed } };
    }
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
  addSmmPost: (post: SmmPost) => void;
  updateSmmPost: (id: string, patch: Partial<SmmPost>) => void;
  removeSmmPost: (id: string) => void;
  toggleSmmBingo: (id: string) => void;
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

  useEffect(() => {
    if (!state.site) return;
    try {
      localStorage.setItem(SITE_STORAGE_KEY, JSON.stringify(state.site));
    } catch {
      // Same deal as above — an uploaded image can exceed the quota, and a
      // page that stops surviving reloads beats a page that throws.
    }
  }, [state.site]);

  // Written on every change rather than on unload: a desktop tab is usually
  // closed by closing the window, and `beforeunload` is not reliably
  // delivered when it is.
  useEffect(() => {
    try {
      localStorage.setItem(SMM_STORAGE_KEY, JSON.stringify(state.smm));
    } catch {
      // Quota is the realistic failure here: a post's photos are stored as
      // data URLs, and a handful of them passes what an origin is given.
      // Losing the write beats losing the session.
    }
  }, [state.smm]);

  const login = useCallback((email: string) => dispatch({ type: 'LOGIN', email }), []);
  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);
  const completeTour = useCallback((tour: TourId) => dispatch({ type: 'COMPLETE_TOUR', tour }), []);
  const setSite = useCallback((site: SiteConfig) => dispatch({ type: 'SET_SITE', site }), []);
  const setCursor = useCallback((cursor: string) => dispatch({ type: 'SET_CURSOR', cursor }), []);
  const setWallpaper = useCallback((wallpaper: string | null) => dispatch({ type: 'SET_WALLPAPER', wallpaper }), []);
  const setAppIcon = useCallback((app: string, dataUrl: string) => dispatch({ type: 'SET_APP_ICON', app, dataUrl }), []);
  const markExploredCatalog = useCallback(() => dispatch({ type: 'MARK_EXPLORED_CATALOG' }), []);
  const addSmmPost = useCallback((post: SmmPost) => dispatch({ type: 'SMM_ADD_POST', post }), []);
  const updateSmmPost = useCallback(
    (id: string, patch: Partial<SmmPost>) => dispatch({ type: 'SMM_UPDATE_POST', id, patch }),
    []
  );
  const removeSmmPost = useCallback((id: string) => dispatch({ type: 'SMM_REMOVE_POST', id }), []);
  const toggleSmmBingo = useCallback((id: string) => dispatch({ type: 'SMM_TOGGLE_BINGO', id }), []);

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
      addSmmPost,
      updateSmmPost,
      removeSmmPost,
      toggleSmmBingo,
    }),
    [
      state,
      login,
      logout,
      completeTour,
      setSite,
      setCursor,
      setWallpaper,
      setAppIcon,
      markExploredCatalog,
      addSmmPost,
      updateSmmPost,
      removeSmmPost,
      toggleSmmBingo,
    ]
  );

  return <AppStateCtx.Provider value={value}>{children}</AppStateCtx.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateCtx);
  if (!ctx) throw new Error('useAppState must be used within an AppStateProvider');
  return ctx;
}
