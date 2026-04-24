import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect, startTransition } from 'react';
import type { ReactNode } from 'react';
import {
  gameReducer,
  initialState,
} from './core/gameEngine';
import {
  saveGame,
  loadGame,
  deleteSave,
  getSaveInfo,
  hasSavedGame,
  autoSaveGame,
  checkAutoSave,
  getAutoSaveInfo,
  getSaveKey,
  AUTO_SAVE_KEY,
  validateSaveStructure,
  migrateSave
} from './core/gameSaver';
import type { GameState, GameAction, GameEvent, PlayerStats, SkillKey, ChallengeConfig } from './core/types';
import { CHALLENGES } from '../config/gameConfig';
import { eventLibrary } from './core/gameEngine';
import { EVENT_CHAIN_EVENTS } from './systems/eventChainSystem';
import { useToast } from '../components/game/ToastNotification';

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  startSpawning: (birthServer: string, birthTalent: string, familyTier: any, initialStats: PlayerStats, challenge?: ChallengeConfig) => void;
  completeSpawning: () => void;
  tickYear: (params: {
    choiceIndex: number;
    event: GameEvent;
    resolvedActionText: string;
    resolvedStatChanges: Partial<PlayerStats>;
    resolvedLogEventText: string;
  }) => void;
  restAndRecover: () => void;
  resetGame: () => void;
  saveGame: (slot?: number) => void;
  loadGame: (slot?: number) => any;
  deleteSave: (slot: number) => void;
  getSaveInfo: (slot: number) => { hasSave: boolean; age?: number; timestamp?: number };
  hasSavedGame: (slot?: number) => boolean;
  setDifficulty: (difficulty: 'easy' | 'normal' | 'hard') => void;
  setChallenge: (challenge?: ChallengeConfig) => void;
  currentEvent: GameEvent | null;
  autoSaveGame: () => void;
  checkAutoSave: () => boolean;
  getAutoSaveInfo: () => { hasSave: boolean; age?: number; timestamp?: number };
  upgradeSkill: (skill: SkillKey) => void;
  availableChallenges: ChallengeConfig[];
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { showToast } = useToast();

  const validateAndMigrate = (savedState: unknown): GameState => {
    let migrated = migrateSave(savedState);
    
    const result: GameState = {
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
      eventOccurrences: (migrated as any).eventOccurrences ?? initialState.eventOccurrences
    };
    
    return result;
  };

  useEffect(() => {
    const savedDifficulty = localStorage.getItem('earth-online-difficulty');
    const validDifficulties: Array<'easy' | 'normal' | 'hard'> = ['easy', 'normal', 'hard'];
    if (savedDifficulty && validDifficulties.includes(savedDifficulty as 'easy' | 'normal' | 'hard')) {
      dispatch({ type: 'SET_DIFFICULTY', payload: savedDifficulty as 'easy' | 'normal' | 'hard' });
    }
  }, []);

  useEffect(() => {
    const autoSaveData = localStorage.getItem(AUTO_SAVE_KEY);
    if (!autoSaveData) return;

    let autoSave: unknown;
    try {
      autoSave = JSON.parse(autoSaveData);
    } catch {
      return;
    }

    if (!validateSaveStructure(autoSave)) return;
    const validAutoSave = autoSave;

    const manualSaveData = localStorage.getItem(getSaveKey(1));
    if (manualSaveData) {
      try {
        const manualSave = JSON.parse(manualSaveData);
        if (validateSaveStructure(manualSave) && manualSave.savedAt > (validAutoSave as any).savedAt) return;
      } catch {
      }
    }

    if (confirm(`检测到自动存档（${(validAutoSave as any).stats.age}岁，${new Date((validAutoSave as any).savedAt).toLocaleString('zh-CN')}）\n是否加载？`)) {
      const processedSave = validateAndMigrate(validAutoSave);
      dispatch({ type: 'LOAD_GAME', payload: processedSave });
    }
  }, []);

  const currentEvent = useMemo(() => {
    if (state.phase !== 'PLAYING') return null;
    if (!state.currentEventId) return null;
    
    // 先在eventLibrary中找，如果找不到，再在EVENT_CHAIN_EVENTS中找
    let event = eventLibrary.find(e => e.id === state.currentEventId);
    if (!event) {
      event = EVENT_CHAIN_EVENTS[state.currentEventId as keyof typeof EVENT_CHAIN_EVENTS] as GameEvent;
    }
    return event ?? null;
  }, [state.phase, state.currentEventId]);

  const startSpawning = useCallback((birthServer: string, birthTalent: string, familyTier: any, initialStats: PlayerStats, challenge?: ChallengeConfig) => {
    dispatch({ 
      type: 'START_SPAWNING', 
      payload: { familyTier, initialStats, birthServer, birthTalent, challenge } 
    } as any);
  }, []);

  const setChallenge = useCallback((challenge?: ChallengeConfig) => {
    dispatch({ type: 'SET_CHALLENGE', payload: challenge } as any);
  }, []);

  const completeSpawning = useCallback(() => {
    dispatch({ type: 'COMPLETE_SPAWNING' });
    autoSaveGame(state);
  }, [state]);

  const determineEventType = useCallback((statChanges: Partial<PlayerStats>): 'normal' | 'positive' | 'negative' | 'milestone' => {
    let score = 0;
    const weights = { health: 3, energy: 2, money: 2, mood: 2, intelligence: 1, charm: 1, creativity: 1, luck: 1, karma: 1 };
    
    for (const [key, value] of Object.entries(statChanges)) {
      const weight = weights[key as keyof typeof weights] || 1;
      score += (Number(value) || 0) * weight;
    }
    
    if (score > 20) return 'positive';
    if (score < -20) return 'negative';
    return 'normal';
  }, []);

  const tickYear = useCallback((params: {
    choiceIndex: number;
    event: GameEvent;
    resolvedActionText: string;
    resolvedStatChanges: Partial<PlayerStats>;
    resolvedLogEventText: string;
  }) => {
    const { choiceIndex, event, resolvedActionText, resolvedStatChanges, resolvedLogEventText } = params;
    const choice = event.choices[choiceIndex];
    if (!choice) return;

    const eventType = choice.eventType || event.eventType || determineEventType(resolvedStatChanges);
    
    startTransition(() => {
      dispatch({
        type: 'TRIGGER_EVENT',
        payload: { eventId: event.id, year: state.stats.age }
      });
      
      dispatch({
        type: 'TICK_YEAR',
        payload: {
          action: resolvedActionText,
          statChanges: resolvedStatChanges,
          event: resolvedLogEventText,
          eventType
        }
      });

      autoSaveGame(state);
    });
  }, [determineEventType, state.stats]);

  const restAndRecover = useCallback(() => {
    const moneyCost = Math.max(0, Math.floor(state.stats.money * 0.1));
    const statChanges = {
      energy: 25,
      health: 5,
      mood: 5,
      money: -moneyCost
    };
    
    startTransition(() => {
      dispatch({
        type: 'TRIGGER_EVENT',
        payload: { eventId: 'rest_year', year: state.stats.age }
      });
      
      dispatch({
        type: 'TICK_YEAR',
        payload: {
          action: '休息恢复',
          statChanges,
          event: moneyCost > 0 ? '你选择休息恢复，花了些钱犒劳自己' : '你在家好好休息了一下',
          eventType: 'positive'
        }
      });
    });
  }, [state.stats.money, state.stats.age]);

  const resetGame = useCallback(() => {
    if (!confirm('确定要重置游戏吗？所有未保存的进度将会丢失')) return;
    autoSaveGame(state);
    dispatch({ type: 'RESET_GAME' });
  }, [state]);

  const setDifficulty = useCallback((difficulty: 'easy' | 'normal' | 'hard') => {
    dispatch({ type: 'SET_DIFFICULTY', payload: difficulty });
    localStorage.setItem('earth-online-difficulty', difficulty);
  }, []);

  const upgradeSkill = useCallback((skill: SkillKey) => {
    dispatch({ type: 'UPGRADE_SKILL', payload: { skill } } as any);
  }, []);

  const wrappedSaveGame = useCallback((slot?: number) => {
    try {
      saveGame(state, slot);
      showToast('游戏保存成功！', 'success');
    } catch (e) {
      console.error('保存游戏失败:', e);
      showToast('保存失败，请检查浏览器存储权限', 'error');
    }
  }, [state, showToast]);

  const wrappedLoadGame = useCallback((slot?: number) => {
    try {
      const result = loadGame(slot);
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

  const value = useMemo(
    () => ({
      state,
      dispatch,
      startSpawning,
      completeSpawning,
      tickYear,
      restAndRecover,
      resetGame,
      saveGame: wrappedSaveGame,
      loadGame: wrappedLoadGame,
      deleteSave,
      getSaveInfo,
      hasSavedGame,
      setDifficulty,
      setChallenge,
      currentEvent,
      autoSaveGame: () => autoSaveGame(state),
      checkAutoSave,
      getAutoSaveInfo,
      upgradeSkill,
      availableChallenges: CHALLENGES as ChallengeConfig[]
    }),
    [
      state,
      startSpawning,
      completeSpawning,
      tickYear,
      restAndRecover,
      resetGame,
      wrappedSaveGame,
      wrappedLoadGame,
      setDifficulty,
      setChallenge,
      currentEvent,
      checkAutoSave,
      getAutoSaveInfo,
      upgradeSkill
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
