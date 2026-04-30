import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getSaveKey,
  AUTO_SAVE_KEY,
  validateSaveStructure,
  migrateSave,
  saveGame,
  loadGame,
  deleteSave,
} from './gameSaver';
import { initialState } from './gameInitializer';

describe('Game Saver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('getSaveKey function', () => {
    it('should generate correct save key for slot 1', () => {
      expect(getSaveKey(1)).toBe('earth-online-save-1');
    });

    it('should generate correct save key for slot 2', () => {
      expect(getSaveKey(2)).toBe('earth-online-save-2');
    });
  });

  describe('validateSaveStructure function', () => {
    it('should return false for null/undefined', () => {
      expect(validateSaveStructure(null)).toBe(false);
      expect(validateSaveStructure(undefined)).toBe(false);
    });

    it('should return false for non-object values', () => {
      expect(validateSaveStructure('string')).toBe(false);
      expect(validateSaveStructure(123)).toBe(false);
      expect(validateSaveStructure([])).toBe(false);
    });

    it('should return false for object missing required fields', () => {
      const incompleteSave = {
        phase: 'spawn',
        stats: {},
        // missing many fields
      };
      expect(validateSaveStructure(incompleteSave)).toBe(false);
    });

    it('should validate complete save structure', () => {
      const validSave = {
        ...initialState,
        version: '1.0.0',
        savedAt: Date.now(),
      };
      expect(validateSaveStructure(validSave)).toBe(true);
    });
  });

  describe('migrateSave function', () => {
    it('should add missing required fields from initialState', () => {
      const partialSave = {
        phase: 'playing',
        stats: { intelligence: 50 },
      };
      const migrated = migrateSave(partialSave);

      // Should have all required fields
      expect(migrated.achievements).toBeDefined();
      expect(migrated.logs).toBeDefined();
      expect(migrated.currentYear).toBeDefined();
    });

    it('should ensure career structure exists', () => {
      const saveWithoutCareer = {
        ...initialState,
        stats: { ...initialState.stats },
      };
      delete (saveWithoutCareer.stats as any).career;

      const migrated = migrateSave(saveWithoutCareer);
      expect(migrated.stats.career).toBeDefined();
      expect(migrated.stats.career.currentCareer).toBe(null);
    });

    it('should handle completely empty save', () => {
      const migrated = migrateSave({});
      expect(migrated.phase).toBe('LANDING');
      expect(migrated.stats).toBeDefined();
    });
  });

  describe('saveGame function', () => {
    it('should save game to localStorage', () => {
      saveGame(initialState, 1);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'earth-online-save-1',
        expect.any(String)
      );
    });

    it('should use slot 1 by default', () => {
      saveGame(initialState);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'earth-online-save-1',
        expect.any(String)
      );
    });
  });

  describe('loadGame function', () => {
    it('should return success: false when no save exists', () => {
      const result = loadGame(99);
      expect(result.success).toBe(false);
    });

    it('should load valid save data', () => {
      const saveData = {
        ...initialState,
        version: '1.0.0',
        savedAt: Date.now(),
      };
      localStorage.setItem('earth-online-save-1', JSON.stringify(saveData));

      const result = loadGame(1);
      expect(result.success).toBe(true);
    });
  });

  describe('deleteSave function', () => {
    it('should remove save from localStorage', () => {
      localStorage.setItem('earth-online-save-1', 'test');
      deleteSave(1);

      expect(localStorage.removeItem).toHaveBeenCalledWith('earth-online-save-1');
    });
  });
});
