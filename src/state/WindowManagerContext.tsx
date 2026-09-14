import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { OpenWindowOptions, WindowInstance, WindowKind } from '@/types';

let nextId = 0;
const makeId = () => `win-${++nextId}`;

interface WindowManagerContextValue {
  windows: WindowInstance[];
  /** Returns the id of the window that ends up open (new or reused, if `singleton`). */
  openWindow: (options: OpenWindowOptions) => string;
  closeWindow: (id: string) => void;
  closeAllWindows: () => void;
  focusWindow: (id: string) => void;
  isTopWindow: (id: string) => boolean;
}

const WindowManagerCtx = createContext<WindowManagerContextValue | null>(null);

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const zTop = useRef(2000);
  const winCount = useRef(0);

  const focusWindow = useCallback((id: string) => {
    setWindows((prev) => {
      const zIndex = ++zTop.current;
      return prev.map((w) => (w.id === id ? { ...w, zIndex } : w));
    });
  }, []);

  const openWindow = useCallback(
    (options: OpenWindowOptions): string => {
      let resultId = '';
      setWindows((prev) => {
        if (options.singleton) {
          const existing = prev.find((w) => w.kind === options.kind);
          if (existing) {
            resultId = existing.id;
            const zIndex = ++zTop.current;
            return prev.map((w) => (w.id === existing.id ? { ...w, zIndex } : w));
          }
        }
        const id = makeId();
        resultId = id;
        const zIndex = ++zTop.current;
        const offsetIndex = winCount.current++ % 6;
        const instance: WindowInstance = {
          id,
          kind: options.kind,
          title: options.title,
          width: options.width,
          height: options.height,
          className: options.className,
          payload: options.payload,
          zIndex,
          offsetIndex,
        };
        return [...prev, instance];
      });
      return resultId;
    },
    []
  );

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const closeAllWindows = useCallback(() => {
    setWindows([]);
  }, []);

  const isTopWindow = useCallback(
    (id: string) => {
      if (windows.length === 0) return false;
      return windows.reduce((top, w) => (w.zIndex > top.zIndex ? w : top)).id === id;
    },
    [windows]
  );

  // Mobile full-screen stacking: one open window fills the screen, two stack
  // top/bottom (ported from layoutWindows(), Tools.html:3600-3605).
  useEffect(() => {
    document.body.classList.toggle('win1', windows.length === 1);
    document.body.classList.toggle('win2', windows.length >= 2);
  }, [windows.length]);

  const value = useMemo<WindowManagerContextValue>(
    () => ({ windows, openWindow, closeWindow, closeAllWindows, focusWindow, isTopWindow }),
    [windows, openWindow, closeWindow, closeAllWindows, focusWindow, isTopWindow]
  );

  return <WindowManagerCtx.Provider value={value}>{children}</WindowManagerCtx.Provider>;
}

export function useWindowManager() {
  const ctx = useContext(WindowManagerCtx);
  if (!ctx) throw new Error('useWindowManager must be used within a WindowManagerProvider');
  return ctx;
}

/** Mobile stacking position for a window, by its index among all open windows (Tools.html:3604). */
export function stackPosition(windows: WindowInstance[], id: string): 'stack-top' | 'stack-bot' | null {
  const i = windows.findIndex((w) => w.id === id);
  if (i === -1) return null;
  if (i === windows.length - 2) return 'stack-top';
  if (i === windows.length - 1) return 'stack-bot';
  return null;
}

export type { WindowKind };
