import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type { AppState, MarketItem, SiteConfig, TourId } from '@/types';

const initialState: AppState = {
  logged: false,
  email: null,
  invited: new URLSearchParams(window.location.search).has('invite'),
  tours: new Set(),
  myItems: [],
  cart: [],
  site: null,
  cursor: 'nothing',
  wallpaper: null,
  appIcons: {},
};

type Action =
  | { type: 'LOGIN'; email: string }
  | { type: 'LOGOUT' }
  | { type: 'COMPLETE_TOUR'; tour: TourId }
  | { type: 'ADD_MARKET_ITEM'; item: MarketItem }
  | { type: 'REMOVE_MARKET_ITEM'; id: string }
  | { type: 'ADD_TO_CART'; item: MarketItem }
  | { type: 'REMOVE_FROM_CART'; index: number }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_SITE'; site: SiteConfig }
  | { type: 'SET_CURSOR'; cursor: string }
  | { type: 'SET_WALLPAPER'; wallpaper: string | null }
  | { type: 'SET_APP_ICON'; app: string; dataUrl: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, logged: true, email: action.email };
    case 'LOGOUT':
      // myItems/site/tours/cursor are local-browser state, not session state — they survive logout,
      // matching the original app (Tools.html:2874-2877 only ever cleared logged/email).
      return { ...state, logged: false, email: null };
    case 'COMPLETE_TOUR': {
      if (state.tours.has(action.tour)) return state;
      const tours = new Set(state.tours);
      tours.add(action.tour);
      return { ...state, tours };
    }
    case 'ADD_MARKET_ITEM':
      return { ...state, myItems: [...state.myItems, action.item] };
    case 'REMOVE_MARKET_ITEM':
      return { ...state, myItems: state.myItems.filter((it) => it.id !== action.id) };
    case 'ADD_TO_CART':
      return { ...state, cart: [...state.cart, action.item] };
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((_, i) => i !== action.index) };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'SET_SITE':
      return { ...state, site: action.site };
    case 'SET_CURSOR':
      return { ...state, cursor: action.cursor };
    case 'SET_WALLPAPER':
      return { ...state, wallpaper: action.wallpaper };
    case 'SET_APP_ICON':
      return { ...state, appIcons: { ...state.appIcons, [action.app]: action.dataUrl } };
    default:
      return state;
  }
}

interface AppStateContextValue {
  state: AppState;
  login: (email: string) => void;
  logout: () => void;
  completeTour: (tour: TourId) => void;
  addMarketItem: (item: MarketItem) => void;
  removeMarketItem: (id: string) => void;
  addToCart: (item: MarketItem) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  setSite: (site: SiteConfig) => void;
  setCursor: (cursor: string) => void;
  setWallpaper: (wallpaper: string | null) => void;
  setAppIcon: (app: string, dataUrl: string) => void;
}

const AppStateCtx = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const login = useCallback((email: string) => dispatch({ type: 'LOGIN', email }), []);
  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);
  const completeTour = useCallback((tour: TourId) => dispatch({ type: 'COMPLETE_TOUR', tour }), []);
  const addMarketItem = useCallback((item: MarketItem) => dispatch({ type: 'ADD_MARKET_ITEM', item }), []);
  const removeMarketItem = useCallback((id: string) => dispatch({ type: 'REMOVE_MARKET_ITEM', id }), []);
  const addToCart = useCallback((item: MarketItem) => dispatch({ type: 'ADD_TO_CART', item }), []);
  const removeFromCart = useCallback((index: number) => dispatch({ type: 'REMOVE_FROM_CART', index }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);
  const setSite = useCallback((site: SiteConfig) => dispatch({ type: 'SET_SITE', site }), []);
  const setCursor = useCallback((cursor: string) => dispatch({ type: 'SET_CURSOR', cursor }), []);
  const setWallpaper = useCallback((wallpaper: string | null) => dispatch({ type: 'SET_WALLPAPER', wallpaper }), []);
  const setAppIcon = useCallback((app: string, dataUrl: string) => dispatch({ type: 'SET_APP_ICON', app, dataUrl }), []);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      login,
      logout,
      completeTour,
      addMarketItem,
      removeMarketItem,
      addToCart,
      removeFromCart,
      clearCart,
      setSite,
      setCursor,
      setWallpaper,
      setAppIcon,
    }),
    [
      state,
      login,
      logout,
      completeTour,
      addMarketItem,
      removeMarketItem,
      addToCart,
      removeFromCart,
      clearCart,
      setSite,
      setCursor,
      setWallpaper,
      setAppIcon,
    ]
  );

  return <AppStateCtx.Provider value={value}>{children}</AppStateCtx.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateCtx);
  if (!ctx) throw new Error('useAppState must be used within an AppStateProvider');
  return ctx;
}
