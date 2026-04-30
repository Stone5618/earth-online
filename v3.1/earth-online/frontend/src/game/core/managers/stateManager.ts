/**
 * State Manager — 状态验证与迁移
 * 
 * Handles:
 * - Save data validation
 * - Save data migration
 * - Initial difficulty loading
 * - Game state processing for persistence
 */

import { initialState } from '../gameEngine';
import {
  validateSaveStructure,
  migrateSave,
} from '../gameSaver';
import type { GameState } from '../types';

/**
 * Validates and migrates a saved game state to the current schema
 */
export function validateAndMigrateState(savedState: unknown): GameState {
  const migrated = migrateSave(savedState);
  
  return {
    ...migrated,
    version: (migrated as any).version ?? initialState.version,
    endingsSeen: (migrated as any).endingsSeen ?? initialState.endingsSeen,
    eventChains: (migrated as any).eventChains ?? initialState.eventChains,
    secretMissions: (migrated as any).secretMissions ?? initialState.secretMissions,
    playTime: (migrated as any).playTime ?? initialState.playTime,
    challenge: (migrated as any).challenge ?? initialState.challenge,
    challengeVictory: (migrated as any).challengeVictory ?? initialState.challengeVictory,
    currentEventId: (migrated as any).currentEventId ?? null,
    rngSeed: (migrated as any).rngSeed ?? initialState.rngSeed,
    eventOccurrences: (migrated as any).eventOccurrences ?? initialState.eventOccurrences,
  };
}

/**
 * Checks if a saved state is valid
 */
export function isValidSaveData(data: unknown): boolean {
  return validateSaveStructure(data);
}

/**
 * Loads initial difficulty from localStorage
 */
export function loadInitialDifficulty(dispatch: React.Dispatch<any>): void {
  const savedDifficulty = localStorage.getItem('earth-online-difficulty');
  const validDifficulties: Array<'easy' | 'normal' | 'hard'> = ['easy', 'normal', 'hard'];
  if (savedDifficulty && validDifficulties.includes(savedDifficulty as 'easy' | 'normal' | 'hard')) {
    dispatch({ type: 'SET_DIFFICULTY', payload: savedDifficulty as 'easy' | 'normal' | 'hard' });
  }
}
