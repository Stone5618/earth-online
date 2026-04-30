/**
 * Signal Handler — 婚姻/出生信号处理
 * 
 * Handles backend signals for:
 * - Marriage candidate appearance
 * - Childbirth events
 * - Death events
 * 
 * Uses a signal queue pattern to prevent duplicate displays.
 */

import { useEffect, useState, useCallback } from 'react';

interface UseToastReturn {
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'loading') => void;
}

interface MarriageCandidateSignal {
  name: string;
  age: number;
  quality: number;
}

interface ChildbirthSignal {
  name: string;
  gender: 'male' | 'female' | string;
  born_at: number;
  /** Optional parent ID for tracing */
  parent_id?: string;
}

/**
 * Hook for handling marriage candidate signals
 */
export function useMarriageSignal(showToast: UseToastReturn['showToast'], dispatch?: React.Dispatch<any>) {
  const [marriageCandidate, setMarriageCandidate] = useState<MarriageCandidateSignal | null>(null);

  /**
   * Set marriage candidate signal
   */
  const handleMarriageSignal = useCallback((data: MarriageCandidateSignal) => {
    setMarriageCandidate(data);
  }, []);

  // Auto-show toast and update game state
  useEffect(() => {
    if (marriageCandidate) {
      showToast(`💞 你遇到了 ${marriageCandidate.name}，质量：${marriageCandidate.quality.toFixed(1)}`, 'info');
      // Update game state to show marriage candidate
      if (dispatch) {
        dispatch({
          type: 'UPDATE_MARRIAGE_STATUS',
          payload: {
            candidate: marriageCandidate,
            isMarried: false,
          }
        });
      }
      setMarriageCandidate(null);
    }
  }, [marriageCandidate, showToast, dispatch]);

  return { marriageCandidate, handleMarriageSignal, setMarriageCandidate };
}

/**
 * Hook for handling childbirth signals
 */
export function useChildbirthSignal(showToast: UseToastReturn['showToast']) {
  const [childbirthEvent, setChildbirthEvent] = useState<ChildbirthSignal | null>(null);

  /**
   * Set childbirth signal
   */
  const handleChildbirthSignal = useCallback((data: ChildbirthSignal | any) => {
    // Defensive: ensure data is valid before setting state
    if (!data || typeof data !== 'object') {
      console.warn('Invalid childbirth signal data:', data);
      return;
    }

    // Normalize data to ensure correct format
    const normalizedData: ChildbirthSignal = {
      name: typeof data?.name === 'string' ? data.name : (data?.name?.toString() || '新生儿'),
      gender: ['male', 'female'].includes(data?.gender) ? data.gender : 'male',
      born_at: typeof data?.born_at === 'number' ? data.born_at : (parseInt(data?.born_at, 10) || 0),
      parent_id: data?.parent_id,
    };

    setChildbirthEvent(normalizedData);
  }, []);

  // Auto-show toast and clear signal
  useEffect(() => {
    if (childbirthEvent) {
      // Defensive: ensure name is a string before rendering
      const displayName = typeof childbirthEvent.name === 'string'
        ? childbirthEvent.name
        : '新生儿';
      showToast(`👶 ${displayName} 出生了！`, 'info');
      setChildbirthEvent(null);
    }
  }, [childbirthEvent, showToast]);

  return { childbirthEvent, handleChildbirthSignal, setChildbirthEvent };
}

/**
 * Hook for handling death signals
 */
export function useDeathSignal(dispatch: React.Dispatch<any>) {
  const handleDeathSignal = useCallback((deathReason: string, finalTitle: string) => {
    // 直接 dispatch GAME_OVER action，切换到游戏结束状态
    dispatch({ 
      type: 'GAME_OVER', 
      payload: { 
        reason: deathReason, 
        title: finalTitle,
        comment: '' 
      } 
    });
  }, [dispatch]);

  return { handleDeathSignal };
}
