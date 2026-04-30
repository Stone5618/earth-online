/**
 * Unit Tests — State Manager
 * 
 * Tests for state validation, migration, and difficulty loading.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateAndMigrateState, isValidSaveData, loadInitialDifficulty } from './stateManager';
import { initialState } from '../gameEngine';

describe('stateManager', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateAndMigrateState', () => {
    it('should migrate a minimal save state with defaults', () => {
      const minimalSave = {
        phase: 'MENU' as const,
        stats: {
          health: 100, energy: 100, mood: 80,
          intelligence: 50, charm: 50, creativity: 50,
          luck: 50, karma: 50,
          money: 0, totalMoneyEarned: 0,
          maxHealth: 100, maxEnergy: 100,
          education: 'none' as const, job: 'none' as const,
          age: 0, name: 'Test',
        },
        logs: [],
        skills: [],
        achievements: [],
        flags: {},
        savedAt: Date.now(),
      };

      const result = validateAndMigrateState(minimalSave);

      expect(result.version).toBe(initialState.version);
      expect(result.endingsSeen).toEqual(initialState.endingsSeen);
      expect(result.eventChains).toEqual(initialState.eventChains);
      expect(result.stats.age).toBe(0);
      expect(result.phase).toBe('MENU');
    });

    it('should preserve existing migrated fields', () => {
      const saveWithFields = {
        phase: 'PLAYING' as const,
        stats: {
          health: 80, energy: 60, mood: 70,
          intelligence: 60, charm: 55, creativity: 45,
          luck: 50, karma: 60,
          money: 10000, totalMoneyEarned: 50000,
          maxHealth: 100, maxEnergy: 100,
          education: 'high_school' as const, job: 'none' as const,
          age: 18, name: 'Player' as any,
        },
        logs: [],
        skills: [],
        achievements: [],
        flags: {},
        version: 2,
        endingsSeen: ['ending_1'],
        playTime: 120,
        savedAt: Date.now(),
      };

      const result = validateAndMigrateState(saveWithFields);

      expect(result.version).toBe(2);
      expect(result.endingsSeen).toEqual(['ending_1']);
      expect(result.playTime).toBe(120);
      expect(result.stats.age).toBe(18);
    });

    it('should handle null/undefined save data gracefully', () => {
      // This should throw or return defaults depending on migrateSave implementation
      expect(() => validateAndMigrateState(null)).not.toThrow();
    });
  });

  describe('isValidSaveData', () => {
    it('should return true for valid save data', () => {
      const validSave = {
        phase: 'MENU',
        currentYear: 2024,
        familyTier: 1,
        version: '1.0.0',
        stats: {
          health: 100, energy: 100, mood: 80,
          intelligence: 50, charm: 50, creativity: 50,
          luck: 50, karma: 50,
          money: 0, totalMoneyEarned: 0,
          maxHealth: 100, maxEnergy: 100,
          education: 'none', job: 'none',
          age: 0, name: 'Test' as any,
        },
        logs: [],
        skills: [],
        achievements: [],
        flags: {},
        savedAt: Date.now(),
      };
      expect(isValidSaveData(validSave)).toBe(true);
    });

    it('should return false for invalid save data', () => {
      expect(isValidSaveData(null)).toBe(false);
      expect(isValidSaveData(undefined)).toBe(false);
      expect(isValidSaveData('not an object')).toBe(false);
      expect(isValidSaveData({})).toBe(false);
    });
  });

  describe('loadInitialDifficulty', () => {
    it('should dispatch SET_DIFFICULTY for valid saved difficulty', () => {
      localStorage.setItem('earth-online-difficulty', 'hard');
      const dispatch = vi.fn();

      loadInitialDifficulty(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_DIFFICULTY',
        payload: 'hard',
      });
    });

    it('should not dispatch for invalid saved difficulty', () => {
      localStorage.setItem('earth-online-difficulty', 'impossible');
      const dispatch = vi.fn();

      loadInitialDifficulty(dispatch);

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('should not dispatch when no saved difficulty', () => {
      const dispatch = vi.fn();

      loadInitialDifficulty(dispatch);

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('should handle all valid difficulty values', () => {
      const difficulties: Array<'easy' | 'normal' | 'hard'> = ['easy', 'normal', 'hard'];
      
      for (const diff of difficulties) {
        localStorage.setItem('earth-online-difficulty', diff);
        const dispatch = vi.fn();
        loadInitialDifficulty(dispatch);
        expect(dispatch).toHaveBeenCalledWith({
          type: 'SET_DIFFICULTY',
          payload: diff,
        });
      }
    });
  });
});
