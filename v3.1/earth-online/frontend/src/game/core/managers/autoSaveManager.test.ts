/**
 * Unit Tests — Auto Save Manager
 *
 * Tests for auto-save on state changes and strictmode prevention.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoSave, useAutoSaveCheck } from './autoSaveManager';
import { autoSaveGame as _autoSaveGame, validateSaveStructure, AUTO_SAVE_KEY } from '../gameSaver';
import type { GameState } from '../types';

// Mock gameSaver
vi.mock('../gameSaver', () => ({
  autoSaveGame: vi.fn(),
  checkAutoSave: vi.fn(),
  getAutoSaveInfo: vi.fn().mockReturnValue({ hasSave: false }),
  getSaveKey: vi.fn((slot) => `earth-online-save-${slot}`),
  AUTO_SAVE_KEY: 'earth-online-auto-save',
  validateSaveStructure: vi.fn(),
}));

const createMockState = (overrides: Partial<GameState> = {}): GameState => ({
  phase: 'PLAYING',
  stats: {
    age: 20,
    health: 100,
    maxHealth: 100,
    money: 0,
    energy: 100,
    maxEnergy: 100,
    mood: 50,
    intelligence: 50,
    charm: 50,
    creativity: 50,
    luck: 50,
    karma: 50,
    totalMoneyEarned: 0,
    isMarried: false,
    houseLevel: 0,
    carLevel: 0,
    jobLevel: 0,
    partner: { has: false, relationshipQuality: 50 },
    children: [],
    skillPoints: 0,
    skills: {
      programming: 0,
      investing: 0,
      medicine: 0,
      speech: 0,
      romance: 0,
      management: 0,
      fitness: 0,
      driving: 0,
      cooking: 0,
      painting: 0,
      music: 0,
      entrepreneurship: 0,
      academics: 0,
      athletics: 0,
    },
    familyOccupation: null,
    selectedTalent: null,
    selectedFlaw: null,
    healthStatus: { condition: 'healthy', duration: 0 },
    educationLevel: 'none',
    economyFactor: 1.0,
    retired: false,
    isUnemployed: true,
    career: { currentCareer: null, currentLevel: 0, totalExperience: 0, yearsInCurrentCareer: 0, previousCareers: [] },
    careerLevel: 0,
    totalAssets: 0,
    house: null,
    car: null,
    debts: [],
    familyName: null,
    familyReputation: 0,
    socialCapital: 0,
    physicalFitness: 50,
    emotionalStability: 50,
  },
  familyTier: null,
  birthServer: null,
  birthTalent: null,
  logs: [],
  currentYear: 0,
  currentEventId: null,
  rngSeed: 0,
  achievements: [],
  newlyUnlockedAchievements: [],
  deathReason: null,
  finalTitle: null,
  finalComment: null,
  consecutiveHappyYears: 0,
  difficulty: 'normal',
  lastTriggeredEvents: {},
  recentEventIds: [],
  eventLastTriggered: {},
  eventOccurrences: {},
  version: 1,
  endingsSeen: [],
  eventChains: {},
  secretMissions: [],
  playTime: 0,
  ...overrides,
});

describe('autoSaveManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useAutoSave', () => {
    it('should call autoSaveGame when logs length changes', () => {
      const state = createMockState({ logs: [{ year: 1, event: 'log1', type: 'normal' }, { year: 2, event: 'log2', type: 'normal' }] });

      const { rerender } = renderHook(
        ({ state }) => useAutoSave(state),
        { initialProps: { state } },
      );

      // Simulate state change (logs increased)
      const newState = createMockState({
        logs: [
          { year: 1, event: 'log1', type: 'normal' },
          { year: 2, event: 'log2', type: 'normal' },
          { year: 3, event: 'log3', type: 'normal' },
        ],
      });

      rerender({ state: newState });

      // Fast-forward timer
      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(_autoSaveGame).toHaveBeenCalledWith(newState);
    });

    it('should call autoSaveGame when age changes', () => {
      const state = createMockState({ logs: [{ year: 1, event: 'log1', type: 'normal' }] });

      const { rerender } = renderHook(
        ({ state }) => useAutoSave(state),
        { initialProps: { state } },
      );

      // Simulate age change
      const newState = createMockState({
        stats: { ...state.stats, age: 21 },
        logs: [{ year: 1, event: 'log1', type: 'normal' }],
      });

      rerender({ state: newState });

      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(_autoSaveGame).toHaveBeenCalledWith(newState);
    });

    it('should NOT auto-save when phase is not PLAYING', () => {
      const state = createMockState({
        phase: 'LANDING',
        logs: [{ year: 1, event: 'log1', type: 'normal' }, { year: 2, event: 'log2', type: 'normal' }],
      });

      const { rerender } = renderHook(
        ({ state }) => useAutoSave(state),
        { initialProps: { state } },
      );

      const newState = createMockState({
        phase: 'LANDING',
        logs: [
          { year: 1, event: 'log1', type: 'normal' },
          { year: 2, event: 'log2', type: 'normal' },
          { year: 3, event: 'log3', type: 'normal' },
        ],
      });

      rerender({ state: newState });

      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(_autoSaveGame).not.toHaveBeenCalled();
    });

    it('should debounce auto-save with 100ms delay', () => {
      const state = createMockState({ logs: [{ year: 1, event: 'log1', type: 'normal' }] });

      const { rerender } = renderHook(
        ({ state }) => useAutoSave(state),
        { initialProps: { state } },
      );

      const newState = createMockState({
        logs: [
          { year: 1, event: 'log1', type: 'normal' },
          { year: 2, event: 'log2', type: 'normal' },
        ],
      });

      rerender({ state: newState });

      // Before 100ms - should not save yet
      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(_autoSaveGame).not.toHaveBeenCalled();

      // After 100ms - should save
      act(() => {
        vi.advanceTimersByTime(60);
      });
      expect(_autoSaveGame).toHaveBeenCalled();
    });
  });

  describe('useAutoSaveCheck', () => {
    it('should not dispatch when no auto-save exists', () => {
      const dispatch = vi.fn();
      const validateAndMigrate = vi.fn();

      renderHook(() => useAutoSaveCheck(dispatch, validateAndMigrate));

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('should dispatch LOAD_GAME when auto-save exists and user confirms', () => {
      const autoSaveData = createMockState({
        stats: { ...createMockState().stats, age: 25, health: 100 },
        logs: [],
      });
      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(autoSaveData));

      vi.mocked(validateSaveStructure).mockReturnValue(true);

      // Mock confirm to return true
      const originalConfirm = window.confirm;
      window.confirm = vi.fn().mockReturnValue(true);

      const dispatch = vi.fn();
      const validateAndMigrate = vi.fn().mockReturnValue({ ...autoSaveData });

      renderHook(() => useAutoSaveCheck(dispatch, validateAndMigrate));

      expect(dispatch).toHaveBeenCalledWith({
        type: 'LOAD_GAME',
        payload: expect.any(Object),
      });

      window.confirm = originalConfirm;
    });

    it('should not dispatch LOAD_GAME when user cancels', () => {
      const autoSaveData = createMockState({
        stats: { ...createMockState().stats, age: 25, health: 100 },
        logs: [],
      });
      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(autoSaveData));

      vi.mocked(validateSaveStructure).mockReturnValue(true);

      const originalConfirm = window.confirm;
      window.confirm = vi.fn().mockReturnValue(false);

      const dispatch = vi.fn();
      const validateAndMigrate = vi.fn();

      renderHook(() => useAutoSaveCheck(dispatch, validateAndMigrate));

      expect(dispatch).not.toHaveBeenCalled();

      window.confirm = originalConfirm;
    });
  });
});
