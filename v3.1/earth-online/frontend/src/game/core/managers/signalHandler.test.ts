/**
 * Unit Tests — Signal Handler
 * 
 * Tests for marriage, childbirth, and death signal handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMarriageSignal, useChildbirthSignal, useDeathSignal } from './signalHandler';

describe('signalHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useMarriageSignal', () => {
    it('should initialize with null marriageCandidate', () => {
      const showToast = vi.fn();
      const { result } = renderHook(() => useMarriageSignal(showToast));

      expect(result.current.marriageCandidate).toBeNull();
    });

    it('should show toast and clear signal after effect runs', async () => {
      const showToast = vi.fn();
      const { result } = renderHook(() => useMarriageSignal(showToast));

      act(() => {
        result.current.handleMarriageSignal({
          name: 'Alice',
          age: 25,
          quality: 85.5,
        });
      });

      // Wait for the useEffect to run
      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith(
          '💞 你遇到了 Alice，质量：85.5',
          'info',
        );
      });

      // Signal should be cleared after effect
      expect(result.current.marriageCandidate).toBeNull();
    });
  });

  describe('useChildbirthSignal', () => {
    it('should initialize with null childbirthEvent', () => {
      const showToast = vi.fn();
      const { result } = renderHook(() => useChildbirthSignal(showToast));

      expect(result.current.childbirthEvent).toBeNull();
    });

    it('should show toast and clear signal after effect runs', async () => {
      const showToast = vi.fn();
      const { result } = renderHook(() => useChildbirthSignal(showToast));

      act(() => {
        result.current.handleChildbirthSignal({
          name: 'Baby',
          gender: 'male',
          born_at: 10,
        });
      });

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith('👶 Baby 出生了！', 'info');
      });

      expect(result.current.childbirthEvent).toBeNull();
    });
  });

  describe('useDeathSignal', () => {
    it('should dispatch GAME_OVER on death signal', () => {
      const dispatch = vi.fn();
      const { result } = renderHook(() => useDeathSignal(dispatch));

      act(() => {
        result.current.handleDeathSignal('疾病', '传奇人生');
      });

      expect(dispatch).toHaveBeenCalledWith({
        type: 'GAME_OVER',
        payload: { reason: '疾病', title: '传奇人生', comment: '' },
      });
    });
  });
});
