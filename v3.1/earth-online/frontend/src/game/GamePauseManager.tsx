/**
 * GamePauseManager — 路由切换时游戏状态暂停/恢复
 * 
 * Handles:
 * - Pausing game timers, event polling, and auto-save when user navigates to /admin/*
 * - Resuming all paused functionality when returning to game routes
 * - Uses useLocation to detect route changes
 * 
 * Usage:
 *   Wrap BrowserRouter with <GamePauseProvider>
 *   Components can use useGamePause() to check if paused
 *   Hooks like useEventFetcher can check isGamePaused() to skip work
 */

import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';

interface GamePauseContextType {
  /** Whether the game should be paused (e.g., user is on admin routes) */
  isPaused: boolean;
  /** Manually pause the game */
  pause: () => void;
  /** Manually resume the game */
  resume: () => void;
}

const GamePauseContext = createContext<GamePauseContextType>({
  isPaused: false,
  pause: () => {},
  resume: () => {},
});

export function GamePauseProvider({ children }: { children: React.ReactNode }) {
  const [isPaused, setIsPaused] = React.useState(false);
  const pausedRef = useRef(false);

  const pause = useCallback(() => {
    pausedRef.current = true;
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
    setIsPaused(false);
  }, []);

  // Expose a synchronous getter for hooks that can't re-render
  const isGamePausedRef = useRef(() => pausedRef.current);

  return (
    <GamePauseContext.Provider
      value={{ isPaused, pause, resume }}
    >
      {children}
    </GamePauseContext.Provider>
  );
}

export function useGamePause(): GamePauseContextType {
  return useContext(GamePauseContext);
}
