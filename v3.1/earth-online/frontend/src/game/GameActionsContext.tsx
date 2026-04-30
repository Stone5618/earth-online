/**
 * GameActionsContext - 仅包含游戏操作函数
 * 
 * Components that need to TRIGGER actions should use `useGameActions()`
 * to avoid re-renders when game state changes.
 */

import { createContext, useContext } from 'react';
import type { Dispatch } from 'react';
import type { GameAction, GameState, PlayerStats, GameEvent, SkillKey, ChallengeConfig, FamilyTier } from './core/types';
import { ChoiceResultData } from './core/managers/gameActions';

export interface GameActionsContextValue {
  dispatch: Dispatch<GameAction>;
  startSpawning: (birthServer: string, birthTalent: string, familyTier: FamilyTier, initialStats: PlayerStats, challenge?: ChallengeConfig, characterName?: string, familyName?: string, gender?: 'male' | 'female') => void;
  completeSpawning: () => void;
  tickYear: (params: {
    choiceIndex: number;
    event: GameEvent;
    resolvedActionText: string;
    resolvedStatChanges: Partial<PlayerStats>;
    resolvedLogEventText: string;
  }) => Promise<ChoiceResultData | null>;
  restAndRecover: () => void;
  resetGame: () => void;
  saveGame: (slot?: number) => void;
  loadGame: (slot?: number) => { success: boolean; data?: GameState; state?: GameState; error?: string } | null;
  deleteSave: (slot: number) => void;
  getSaveInfo: (slot: number) => { hasSave: boolean; age?: number; timestamp?: number };
  hasSavedGame: (slot?: number) => boolean;
  setDifficulty: (difficulty: 'easy' | 'normal' | 'hard') => void;
  setChallenge: (challenge?: ChallengeConfig) => void;
  autoSaveGame: () => void;
  checkAutoSave: () => boolean;
  getAutoSaveInfo: () => { hasSave: boolean; age?: number; timestamp?: number };
  upgradeSkill: (skill: SkillKey) => void;
  startNGPlus: (legacyData: { points: number; bonuses: Record<string, number> }) => void;
}

export const GameActionsContext = createContext<GameActionsContextValue | null>(null);

export function useGameActions(): GameActionsContextValue {
  const context = useContext(GameActionsContext);
  if (!context) {
    throw new Error('useGameActions must be used within a GameActionsProvider');
  }
  return context;
}
