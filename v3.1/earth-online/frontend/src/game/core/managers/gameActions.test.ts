/**
 * Unit Tests — Game Actions
 * 
 * Tests for tickYear, restAndRecover, determineEventType, and backend integration.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { determineEventType, restAndRecover, tickYear } from './gameActions';
import { api } from '../../../api/client';
import type { GameEvent, PlayerStats } from '../types';

// Mock dependencies
vi.mock('../../../api/client', () => ({
  api: {
    makeChoice: vi.fn(),
  },
}));

describe('gameActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('determineEventType', () => {
    it('should return "positive" when score > 20', () => {
      // health: 10 * weight 3 = 30
      expect(determineEventType({ health: 10 })).toBe('positive');
      // money: 11 * weight 2 = 22
      expect(determineEventType({ money: 11 })).toBe('positive');
    });

    it('should return "negative" when score < -20', () => {
      // health: -10 * weight 3 = -30
      expect(determineEventType({ health: -10 })).toBe('negative');
      // mood: -11 * weight 2 = -22
      expect(determineEventType({ mood: -11 })).toBe('negative');
    });

    it('should return "normal" for small changes', () => {
      // money: 5 * weight 2 = 10
      expect(determineEventType({ money: 5 })).toBe('normal');
      // health: 5 * 3 = 15, money: -2 * 2 = -4 => total 11
      expect(determineEventType({ health: 5, money: -2 })).toBe('normal');
    });

    it('should return "normal" for empty changes', () => {
      expect(determineEventType({})).toBe('normal');
    });
  });

  describe('restAndRecover', () => {
    it('should calculate costs and dispatch TICK_YEAR with changes', () => {
      const dispatch = vi.fn();
      const state = { money: 1000, age: 25 };

      restAndRecover(state, dispatch);

      // Check TRIGGER_EVENT
      expect(dispatch).toHaveBeenCalledWith({
        type: 'TRIGGER_EVENT',
        payload: { eventId: 'rest_year', year: 25 },
      });

      // Check TICK_YEAR
      expect(dispatch).toHaveBeenCalledWith({
        type: 'TICK_YEAR',
        payload: {
          action: '休息恢复',
          statChanges: {
            energy: 25,
            health: 5,
            mood: 5,
            money: -100, // 10% of 1000
          },
          event: '你选择休息恢复，花了些钱犒劳自己',
          eventType: 'positive',
        },
      });
    });

    it('should handle zero money gracefully', () => {
      const dispatch = vi.fn();
      const state = { money: 0, age: 25 };

      restAndRecover(state, dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'TICK_YEAR',
        payload: expect.objectContaining({
          statChanges: expect.objectContaining({
            energy: 25,
            health: 5,
            mood: 5,
          }),
        }),
      });

      // money should be -0 or 0 (both acceptable)
      const secondCall = dispatch.mock.calls[1][0];
      expect(Math.abs(secondCall.payload.statChanges.money)).toBeLessThanOrEqual(0);
    });
  });

  describe('tickYear', () => {
    const mockEvent: GameEvent = {
      id: 'test_event',
      minAge: 0,
      maxAge: 100,
      text: 'Test Event',
      description: 'Test Description',
      eventType: 'normal',
      choices: [
        {
          text: 'Choice 1',
          statChanges: { energy: -5 },
          followUp: 'Local result',
        },
      ],
    };

    it('should call API and process backend result when charId exists', async () => {
      const backendResponse = {
        stat_changes: { health: 10, energy: -5 },
        outcome_text: 'Backend outcome',
        event_type: 'positive',
      };
      vi.mocked(api.makeChoice).mockResolvedValue({ data: backendResponse, error: null });

      const dispatch = vi.fn();

      const result = await tickYear(
        {
          choiceIndex: 0,
          event: mockEvent,
          resolvedActionText: 'Local action',
          resolvedStatChanges: { energy: -10 },
          resolvedLogEventText: 'Local log',
          currentAge: 20,
          charId: 123,
        },
        dispatch,
      );

      expect(api.makeChoice).toHaveBeenCalledWith(123, mockEvent.text, 0);
      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'TICK_YEAR',
          payload: expect.objectContaining({
            statChanges: { health: 10, energy: -5 }, // Backend stats used
          }),
        }),
      );
      expect(result).toEqual({
        outcomeText: 'Backend outcome',
        statChanges: { health: 10, energy: -5 },
      });
    });

    it('should fallback to local logic when API fails or returns null', async () => {
      vi.mocked(api.makeChoice).mockResolvedValue({ data: null, error: { type: 'network', message: 'Failed' } });

      const dispatch = vi.fn();

      const result = await tickYear(
        {
          choiceIndex: 0,
          event: mockEvent,
          resolvedActionText: 'Local action',
          resolvedStatChanges: { energy: -10 },
          resolvedLogEventText: 'Local log',
          currentAge: 20,
          charId: 123,
        },
        dispatch,
      );

      // Should use local fallback logic via the event choices
      expect(result).toEqual({
        outcomeText: 'Local log',
        statChanges: { energy: -10 },
      });
    });
  });
});
