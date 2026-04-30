/**
 * GameContext — 游戏状态协调层（已重构为双 Context 架构）
 * 
 * Architecture:
 *   GameProvider (coordination)
 *     ├── GameStateContext (read-only state)
 *     └── GameActionsContext (action functions)
 * 
 * Hooks:
 *   - useGameState(): Only re-renders when state changes
 *   - useGameActions(): Only re-renders when actions change (rarely)
 *   - useGame(): Backward compatible, returns both state and actions
 */

import React, { useContext, useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import type { ReactNode, Dispatch } from 'react';
import {
  gameReducer,
  initialState,
} from './core/gameEngine';
import {
  saveGame as _saveGame,
  loadGame as _loadGame,
  deleteSave as _deleteSave,
  getSaveInfo as _getSaveInfo,
  hasSavedGame as _hasSavedGame,
} from './core/gameSaver';
import type { GameState, GameAction, GameEvent, PlayerStats, SkillKey, ChallengeConfig } from './core/types';
import { CHALLENGES } from '../config/gameConfig';
import { useToast } from '../components/game/ToastNotification';
import { GameStateContext, GameStateContextValue } from './GameStateContext';
import { GameActionsContext, GameActionsContextValue } from './GameActionsContext';

import { validateAndMigrateState, loadInitialDifficulty } from './core/managers/stateManager';
import { useEventFetcher, clearOnlineEvent } from './core/managers/eventFetcher';
import { tickYear as _tickYear, restAndRecover as _restAndRecover, determineEventType } from './core/managers/gameActions';
import { useMarriageSignal, useChildbirthSignal, useDeathSignal } from './core/managers/signalHandler';
import { useAutoSave, useAutoSaveCheck, createAutoSaveFn, checkAutoSave, getAutoSaveInfo } from './core/managers/autoSaveManager';
import { ChoiceResultData } from './core/managers/gameActions';

interface GameContextType extends GameStateContextValue, GameActionsContextValue {}

export function GameProvider({ children, charId, isPaused = false }: { children: ReactNode; charId?: number | null; isPaused?: boolean }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { showToast } = useToast();

  // Ref to access latest state in callbacks without adding state to dependencies
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  // ===== State Manager =====
  const validateAndMigrate = useCallback((savedState: unknown): GameState => {
    return validateAndMigrateState(savedState);
  }, []);

  // Load initial difficulty
  useEffect(() => {
    loadInitialDifficulty(dispatch);
  }, []);

  // Auto save checking on mount
  useAutoSaveCheck(dispatch, validateAndMigrate);

  // ===== 游戏中标记管理 =====
  useEffect(() => {
    // 当进入PLAYING阶段时设置标记，否则清除
    if (state.phase === 'PLAYING') {
      localStorage.setItem('earth-online-in-game', 'true');
    } else {
      localStorage.removeItem('earth-online-in-game');
    }
  }, [state.phase]);

  // ===== Event Fetcher =====
  const {
    currentEvent,
    backendEventResponse,
    onlineEventTitle,
    onlineEventChoices,
    setOnlineEventTitle,
    setOnlineEventChoices,
  } = useEventFetcher(state.phase, charId ?? null, showToast, isPaused);

  // ===== Signal Handlers =====
  const { marriageCandidate, handleMarriageSignal } = useMarriageSignal(showToast, dispatch);
  const { childbirthEvent, handleChildbirthSignal } = useChildbirthSignal(showToast);
  const { handleDeathSignal } = useDeathSignal(dispatch);

  const handleSignal = useCallback((signal: 'marriage' | 'childbirth', data: any) => {
    if (signal === 'marriage') handleMarriageSignal(data);
    if (signal === 'childbirth') handleChildbirthSignal(data);
  }, [handleMarriageSignal, handleChildbirthSignal]);

  const onClearOnlineEvent = useCallback(() => {
    clearOnlineEvent(setOnlineEventTitle, setOnlineEventChoices);
  }, [setOnlineEventTitle, setOnlineEventChoices]);

  // ===== Auto Save =====
  useAutoSave(state, isPaused);

  // ===== Game Actions =====
  const handleTickYear = useCallback(async (params: {
    choiceIndex: number;
    event: GameEvent;
    resolvedActionText: string;
    resolvedStatChanges: Partial<PlayerStats>;
    resolvedLogEventText: string;
  }): Promise<ChoiceResultData | null> => {
    return _tickYear(
      { ...params, currentAge: state.stats.age, charId: charId ?? null },
      dispatch,
      handleSignal,
      handleDeathSignal,
      onClearOnlineEvent,
    );
  }, [state.stats.age, handleSignal, handleDeathSignal, onClearOnlineEvent, charId]);

  const handleRestAndRecover = useCallback(() => {
    _restAndRecover(
      { money: state.stats.money, age: state.stats.age },
      dispatch,
    );
  }, [state.stats.money, state.stats.age]);

  // ===== Callbacks =====
  const startSpawning = useCallback((birthServer: string, birthTalent: string, familyTier: any, initialStats: PlayerStats, challenge?: ChallengeConfig, characterName?: string, familyName?: string, gender?: 'male' | 'female') => {
    dispatch({ 
      type: 'START_SPAWNING', 
      payload: { familyTier, initialStats, birthServer, birthTalent, challenge, characterName, familyName, gender } 
    });
  }, []);

  const setChallenge = useCallback((challenge?: ChallengeConfig) => {
    dispatch({ type: 'SET_CHALLENGE', payload: challenge });
  }, []);

  const completeSpawning = useCallback(() => {
    dispatch({ type: 'COMPLETE_SPAWNING' });
    createAutoSaveFn(stateRef.current)();
  }, []);

  const resetGame = useCallback(() => {
    if (!confirm('确定要重置游戏吗？所有未保存的进度将会丢失')) return;
    createAutoSaveFn(stateRef.current)();
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const setDifficulty = useCallback((difficulty: 'easy' | 'normal' | 'hard') => {
    dispatch({ type: 'SET_DIFFICULTY', payload: difficulty });
    localStorage.setItem('earth-online-difficulty', difficulty);
  }, []);

  const upgradeSkill = useCallback((skill: SkillKey) => {
    dispatch({ type: 'UPGRADE_SKILL', payload: { skill } });
  }, []);

  const startNGPlus = useCallback((legacyData: any) => {
    dispatch({ type: 'START_NG_PLUS', payload: { legacyData, ngPlusCount: stateRef.current.ngPlusCount || 0 } });
    showToast('新游戏+ 已开启！带着家族的荣耀重新开始', 'success');
  }, [showToast]);

  const wrappedSaveGame = useCallback((slot?: number) => {
    try {
      _saveGame(stateRef.current, slot);
      showToast('游戏保存成功！', 'success');
    } catch (e) {
      console.error('保存游戏失败:', e);
      showToast('保存失败，请检查浏览器存储权限', 'error');
    }
  }, [showToast]);

  const wrappedLoadGame = useCallback((slot?: number) => {
    try {
      const result = _loadGame(slot);
      if (result.success && result.data) {
        dispatch({ type: 'LOAD_GAME', payload: result.data });
        showToast('游戏加载成功！', 'success');
        return result;
      } else {
        const errorMessages: Record<string, string> = {
          'not_found': '没有找到存档',
          'corrupted': '加载失败，存档已损坏',
          'invalid_structure': '加载失败，存档结构不完整',
        };
        showToast(errorMessages[result.error || 'corrupted'] || '加载失败', 'error');
        return result;
      }
    } catch (e) {
      console.error('加载游戏失败:', e);
      showToast('加载失败，发生未知错误', 'error');
      return { success: false, error: 'corrupted' };
    }
  }, [showToast]);

  const autoSaveGame = useCallback(() => {
    createAutoSaveFn(stateRef.current)();
  }, []);

  // ===== Context Values =====
  const stateValue = useMemo(
    () => ({
      state,
      currentEvent,
      backendEventResponse,
      marriageCandidate,
      childbirthEvent,
      availableChallenges: CHALLENGES as ChallengeConfig[],
    }),
    [state, currentEvent, backendEventResponse, marriageCandidate, childbirthEvent]
  );

  const actionsValue = useMemo(
    () => ({
      dispatch,
      startSpawning,
      completeSpawning,
      tickYear: handleTickYear,
      restAndRecover: handleRestAndRecover,
      resetGame,
      saveGame: wrappedSaveGame,
      loadGame: wrappedLoadGame,
      deleteSave: _deleteSave,
      getSaveInfo: _getSaveInfo,
      hasSavedGame: _hasSavedGame,
      setDifficulty,
      setChallenge,
      autoSaveGame,
      checkAutoSave,
      getAutoSaveInfo,
      upgradeSkill,
      startNGPlus,
    }),
    [
      startSpawning,
      completeSpawning,
      handleTickYear,
      handleRestAndRecover,
      resetGame,
      wrappedSaveGame,
      wrappedLoadGame,
      setDifficulty,
      setChallenge,
      autoSaveGame,
      upgradeSkill,
      startNGPlus,
    ]
  );

  return (
    <GameStateContext.Provider value={stateValue}>
      <GameActionsContext.Provider value={actionsValue}>
        {children}
      </GameActionsContext.Provider>
    </GameStateContext.Provider>
  );
}

/**
 * Hook that composes both state and actions from the dual Context architecture.
 * NOTE: This hook will re-render on both state changes AND action changes.
 * For optimal performance, prefer:
 *   - useGameState() when you only need to READ state
 *   - useGameActions() when you only need to DISPATCH actions
 */
export function useGame(): GameContextType {
  const stateCtx = useContext(GameStateContext);
  const actionsCtx = useContext(GameActionsContext);
  if (!stateCtx || !actionsCtx) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return { ...stateCtx, ...actionsCtx } as GameContextType;
}

export { useGameState } from './GameStateContext';
export { useGameActions } from './GameActionsContext';
