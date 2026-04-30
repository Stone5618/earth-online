/**
 * GameStateContext - 只包含游戏状态（只读）
 * 
 * Components that only need to READ game state should use `useGameState()`
 * to avoid re-renders when action callbacks change.
 */

import { createContext, useContext } from 'react';
import type { GameState, GameEvent, ChallengeConfig } from './core/types';
import type { BackendResponse } from './core/managers/eventFetcher';

export interface GameStateContextValue {
  state: GameState;
  currentEvent: GameEvent | null;
  backendEventResponse: BackendResponse | null;
  marriageCandidate: { name: string; age: number; quality: number } | null;
  childbirthEvent: { name: string; gender: string; born_at: number } | null;
  availableChallenges: ChallengeConfig[];
}

export const GameStateContext = createContext<GameStateContextValue | null>(null);

export function useGameState(): GameStateContextValue {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}
