/**
 * Auto Save Manager — 自动存档管理
 * 
 * Handles:
 * - Auto save on state changes (logs, age)
 * - Auto save checking on mount (with duplicate prevention)
 * - Save slot comparison (prefer newer save)
 */

import { useEffect, useRef, useCallback } from 'react';
import {
  autoSaveGame as _autoSaveGame,
  checkAutoSave as _checkAutoSave,
  getAutoSaveInfo as _getAutoSaveInfo,
  getSaveKey,
  AUTO_SAVE_KEY,
  validateSaveStructure,
} from '../gameSaver';
import type { GameState } from '../types';

/**
 * Hook for auto-saving game state on changes
 */
export function useAutoSave(state: GameState, isPaused = false) {
  const prevLogLengthRef = useRef(0);
  const prevAgeRef = useRef(0);
  const stateRef = useRef(state);
  const lastAutoSaveTimeRef = useRef(0);
  
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  useEffect(() => {
    // Skip auto-save when game is paused
    if (isPaused) return undefined;
    
    const currentTime = Date.now();
    const shouldAutoSave = state.logs.length > prevLogLengthRef.current || state.stats.age !== prevAgeRef.current;
    
    // 节流机制：每5秒最多自动保存一次
    const canAutoSave = currentTime - lastAutoSaveTimeRef.current > 5000;
    
    if (shouldAutoSave && canAutoSave) {
      prevLogLengthRef.current = state.logs.length;
      prevAgeRef.current = state.stats.age;
      
      if (state.phase === 'PLAYING') {
        lastAutoSaveTimeRef.current = currentTime;
        const timer = setTimeout(() => {
          _autoSaveGame(stateRef.current);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [state.logs.length, state.stats.age, state.phase, isPaused]);
}

/**
 * Hook for checking auto-save on mount (with React StrictMode prevention)
 */
export function useAutoSaveCheck(
  dispatch: React.Dispatch<any>,
  validateAndMigrate: (savedState: unknown) => GameState,
): void {
  const autoSaveCheckedRef = useRef(false);

  useEffect(() => {
    if (autoSaveCheckedRef.current) return;
    autoSaveCheckedRef.current = true;
    
    const autoSaveData = localStorage.getItem(AUTO_SAVE_KEY);

    let saveToLoad: unknown = null;

    // 只使用自动存档，避免与云端存档冲突
    // 手动存档（槽位1-3）仅用于用户主动保存，不应自动加载
    if (autoSaveData) {
      try {
        const autoSave = JSON.parse(autoSaveData);
        if (validateSaveStructure(autoSave)) {
          saveToLoad = autoSave;
        }
      } catch {
        return;
      }
    }

    if (saveToLoad) {
      const processedSave = validateAndMigrate(saveToLoad);
      
      // 只有在确认用户之前在游戏中时才自动加载
      // 检查是否有明确的"游戏中"标记
      const wasInGame = localStorage.getItem('earth-online-in-game') === 'true';
      
      if (processedSave.phase === 'PLAYING' && wasInGame) {
        console.log('检测到游戏进行中的存档，且用户之前在游戏中，自动恢复游戏状态');
        dispatch({ type: 'LOAD_GAME', payload: processedSave });
      } else {
        console.log('存档存在，但用户在首页，不自动加载');
      }
    }
  }, [dispatch, validateAndMigrate]);
}

/**
 * Wrapped auto save function (exposed to context)
 */
export function createAutoSaveFn(state: GameState) {
  return () => _autoSaveGame(state);
}

/**
 * Re-export for context
 */
export const checkAutoSave = _checkAutoSave;
export const getAutoSaveInfo = _getAutoSaveInfo;
