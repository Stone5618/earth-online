import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect, startTransition } from 'react';
import {
  gameReducer,
  initialState,
  selectEvent,
  resolveChoiceText,
  resolveStatChanges,
  type GameState,
  type GameAction,
  type GameEvent,
  type FamilyTier,
  type PlayerStats,
} from './gameState';
import type { SaveData } from '../types/save';
import { isSaveData } from '../types/save';

interface LoadGameResult {
  success: boolean;
  error?: 'not_found' | 'corrupted' | 'invalid_structure';
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  startSpawning: (birthServer: string, birthTalent: string, familyTier: FamilyTier, initialStats: PlayerStats) => void;
  completeSpawning: () => void;
  tickYear: (choiceIndex: number, event: GameEvent) => void;
  restAndRecover: () => void;
  resetGame: () => void;
  saveGame: (slot?: number) => void;
  loadGame: (slot?: number) => LoadGameResult;
  deleteSave: (slot: number) => void;
  getSaveInfo: (slot: number) => { hasSave: boolean; age?: number; timestamp?: number };
  hasSavedGame: (slot?: number) => boolean;
  setDifficulty: (difficulty: 'easy' | 'normal' | 'hard') => void;
  currentEvent: GameEvent | null;
  autoSaveGame: () => void;
  checkAutoSave: () => boolean;
  getAutoSaveInfo: () => { hasSave: boolean; age?: number; timestamp?: number };
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  const SAVE_VERSION = '1.0.0';
  const getSaveKey = (slot: number) => `earth-online-save-${slot}`;
  const AUTO_SAVE_KEY = 'earth-online-autosave';

  const REQUIRED_SAVE_FIELDS = [
    'phase', 'stats', 'logs', 'achievements', 'currentYear',
    'familyTier', 'birthServer', 'birthTalent', 'difficulty',
    'lastTriggeredEvents', 'consecutiveHappyYears',
    'recentEventIds', 'eventLastTriggered',
  ] as const;

  const validateSaveStructure = (s: unknown): s is SaveData => {
    if (!s || typeof s !== 'object') return false;
    return (
      REQUIRED_SAVE_FIELDS.every(field => field in s) &&
      typeof (s as any).version === 'string' &&
      typeof (s as any).savedAt === 'number' &&
      typeof (s as any).stats === 'object' &&
      (s as any).stats !== null
    );
  };

  const migrateSave = (savedState: unknown): SaveData => {
    const migrated = { ...(savedState as SaveData) };
    
    REQUIRED_SAVE_FIELDS.forEach(field => {
      if (!(field in migrated)) {
        (migrated as any)[field] = (initialState as any)[field];
      }
    });
    
    if (migrated.stats && typeof migrated.stats === 'object') {
      Object.keys(initialState.stats).forEach(statKey => {
        const key = statKey as keyof PlayerStats;
        if (!(key in migrated.stats)) {
          (migrated.stats as any)[key] = initialState.stats[key];
        }
      });
    }
    
    if (!migrated.achievements || !Array.isArray(migrated.achievements)) {
      migrated.achievements = [...initialState.achievements];
    }
    
    if (!migrated.logs || !Array.isArray(migrated.logs)) {
      migrated.logs = [];
    }
    
    if (!migrated.lastTriggeredEvents || typeof migrated.lastTriggeredEvents !== 'object') {
      migrated.lastTriggeredEvents = {};
    }
    
    if (!migrated.recentEventIds || !Array.isArray(migrated.recentEventIds)) {
      migrated.recentEventIds = [];
    }
    
    if (!migrated.eventLastTriggered || typeof migrated.eventLastTriggered !== 'object') {
      migrated.eventLastTriggered = {};
    }
    
    if (migrated.deathReason === undefined) migrated.deathReason = null;
    if (migrated.finalTitle === undefined) migrated.finalTitle = null;
    if (migrated.finalComment === undefined) migrated.finalComment = null;
    
    return migrated;
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

    if (!isSaveData(autoSave)) return;
    const validAutoSave = autoSave;

    const manualSaveData = localStorage.getItem(getSaveKey(1));
    if (manualSaveData) {
      try {
        const manualSave = JSON.parse(manualSaveData);
        if (isSaveData(manualSave) && manualSave.savedAt > validAutoSave.savedAt) return;
      } catch {
        // manual save corrupt, continue with auto save
      }
    }

    if (confirm(`检测到自动存档（${validAutoSave.stats.age}岁，${new Date(validAutoSave.savedAt).toLocaleString('zh-CN')}）\n是否加载？`)) {
      let processedSave = validAutoSave;
      if (processedSave.version !== SAVE_VERSION) {
          processedSave = migrateSave(processedSave);
        } else {
          // Fill missing fields with defaults
          REQUIRED_SAVE_FIELDS.forEach(field => {
            if (!(field in processedSave)) {
              (processedSave as any)[field] = (initialState as any)[field];
            }
          });
          if (processedSave.stats && typeof processedSave.stats === 'object') {
            Object.keys(initialState.stats).forEach(statKey => {
              const key = statKey as keyof PlayerStats;
              if (!(key in processedSave.stats)) {
                (processedSave.stats as any)[key] = initialState.stats[key];
              }
            });
          }
          if (!processedSave.achievements || !Array.isArray(processedSave.achievements)) {
            processedSave.achievements = [...initialState.achievements];
          }
          if (!processedSave.logs || !Array.isArray(processedSave.logs)) {
            processedSave.logs = [];
          }
          if (!processedSave.lastTriggeredEvents || typeof processedSave.lastTriggeredEvents !== 'object') {
            processedSave.lastTriggeredEvents = {};
          }
          if (!processedSave.recentEventIds || !Array.isArray(processedSave.recentEventIds)) {
            processedSave.recentEventIds = [];
          }
          if (!processedSave.eventLastTriggered || typeof processedSave.eventLastTriggered !== 'object') {
            processedSave.eventLastTriggered = {};
          }
          if (processedSave.deathReason === undefined) processedSave.deathReason = null;
          if (processedSave.finalTitle === undefined) processedSave.finalTitle = null;
          if (processedSave.finalComment === undefined) processedSave.finalComment = null;
        }
      dispatch({ type: 'LOAD_GAME', payload: processedSave });
    }
  }, [AUTO_SAVE_KEY, SAVE_VERSION, getSaveKey, migrateSave]);

  const currentEvent = useMemo(() => {
    if (state.phase !== 'PLAYING') return null;
    return selectEvent(
      state.stats.age,
      state.stats,
      state.familyTier,
      state.lastTriggeredEvents,
      state.recentEventIds,
      state.eventLastTriggered,
      state.currentYear
    );
  }, [state.phase, state.stats, state.familyTier, state.lastTriggeredEvents, state.recentEventIds, state.eventLastTriggered, state.currentYear]);

  const startSpawning = useCallback((birthServer: string, birthTalent: string, familyTier: FamilyTier, initialStats: PlayerStats) => {
    dispatch({ 
      type: 'START_SPAWNING', 
      payload: { familyTier, initialStats, birthServer, birthTalent } 
    });
  }, []);

  const completeSpawning = useCallback(() => {
    dispatch({ type: 'COMPLETE_SPAWNING' });
    _doAutoSave();
  }, []);

  const determineEventType = useCallback((statChanges: Partial<import('./gameState').PlayerStats>): 'normal' | 'positive' | 'negative' | 'milestone' => {
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

  const tickYear = useCallback((choiceIndex: number, event: GameEvent) => {
    const choice = event.choices[choiceIndex];
    if (!choice) return;

    const resolvedText = resolveChoiceText(choice.text, state.stats);
    const resolvedStatChanges = resolveStatChanges(choice.statChanges, state.stats);
    const eventType = choice.eventType || event.eventType || determineEventType(resolvedStatChanges);
    
    // 确保 logEvent 是 string
    let logEvent: string;
    if (choice.resultMessage) {
      logEvent = choice.resultMessage;
    } else if (choice.followUp) {
      if (typeof choice.followUp === 'function') {
        logEvent = choice.followUp(resolvedStatChanges);
      } else {
        logEvent = choice.followUp;
      }
    } else {
      logEvent = event.text;
    }
    
    startTransition(() => {
      dispatch({
        type: 'TRIGGER_EVENT',
        payload: { eventId: event.id, year: state.stats.age },
      });
      
      dispatch({
        type: 'TICK_YEAR',
        payload: {
          action: resolvedText,
          statChanges: resolvedStatChanges,
          event: logEvent,
          eventType,
        },
      });

      _doAutoSave();
    });
  }, [determineEventType, state.stats]);

  const restAndRecover = useCallback(() => {
    const moneyCost = Math.max(0, Math.floor(state.stats.money * 0.1));
    const statChanges = {
      energy: 30,
      health: 5,
      mood: 5,
      money: -moneyCost,
    };
    
    startTransition(() => {
      dispatch({
        type: 'REST_AND_RECOVER',
        payload: {
          statChanges,
        },
      });
      
      dispatch({
        type: 'ADD_LOG',
        payload: {
          year: state.stats.age,
          event: moneyCost > 0 ? '你选择休息恢复，花了些钱犒劳自己。' : '你在家好好休息了一下。',
          type: 'positive',
          statChanges,
          action: '休息恢复',
        },
      });
    });
  }, [state.stats.money, state.stats.age]);

  const resetGame = useCallback(() => {
    _doAutoSave();
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const _doAutoSave = () => {
    try {
      if (!validateSaveStructure(state)) {
        console.error('自动存档状态结构不完整，拒绝保存');
        return;
      }

      const saveData = {
        ...state,
        version: SAVE_VERSION,
        savedAt: Date.now(),
      };
      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(saveData));
    } catch (e) {
      console.error('自动保存游戏失败:', e);
    }
  };

  const saveGame = useCallback((slot: number = 1) => {
    try {
      if (!validateSaveStructure(state)) {
        console.error('存档状态结构不完整，拒绝保存');
        return;
      }

      const saveData = {
        ...state,
        version: SAVE_VERSION,
        savedAt: Date.now(),
      };
      localStorage.setItem(getSaveKey(slot), JSON.stringify(saveData));
    } catch (e) {
      console.error('保存游戏失败:', e);
    }
  }, [state, validateSaveStructure, SAVE_VERSION, getSaveKey]);

  const loadGame = useCallback((slot: number = 1): LoadGameResult => {
    try {
      const saved = localStorage.getItem(getSaveKey(slot));
      if (!saved) return { success: false, error: 'not_found' };

      let savedState: unknown;
      try {
        savedState = JSON.parse(saved);
      } catch (parseError) {
        console.error('存档JSON解析失败:', parseError);
        return { success: false, error: 'corrupted' };
      }

      if (!isSaveData(savedState)) {
        console.error('存档数据结构无效，拒绝加载');
        return { success: false, error: 'invalid_structure' };
      }
      let processedSave = savedState;

      // Fill missing fields with defaults before dispatching
      if (processedSave.version !== SAVE_VERSION) {
        processedSave = migrateSave(processedSave);
      } else {
        // Even if version matches, fill any missing fields
        REQUIRED_SAVE_FIELDS.forEach(field => {
          if (!(field in processedSave)) {
            (processedSave as any)[field] = (initialState as any)[field];
          }
        });

        if (processedSave.stats && typeof processedSave.stats === 'object') {
          Object.keys(initialState.stats).forEach(statKey => {
            const key = statKey as keyof PlayerStats;
            if (!(key in processedSave.stats)) {
              (processedSave.stats as any)[key] = initialState.stats[key];
            }
          });
        }

        if (!processedSave.achievements || !Array.isArray(processedSave.achievements)) {
          processedSave.achievements = [...initialState.achievements];
        }

        if (!processedSave.logs || !Array.isArray(processedSave.logs)) {
          processedSave.logs = [];
        }

        if (!processedSave.lastTriggeredEvents || typeof processedSave.lastTriggeredEvents !== 'object') {
          processedSave.lastTriggeredEvents = {};
        }

        if (!processedSave.recentEventIds || !Array.isArray(processedSave.recentEventIds)) {
          processedSave.recentEventIds = [];
        }

        if (!processedSave.eventLastTriggered || typeof processedSave.eventLastTriggered !== 'object') {
          processedSave.eventLastTriggered = {};
        }

        if (processedSave.deathReason === undefined) processedSave.deathReason = null;
        if (processedSave.finalTitle === undefined) processedSave.finalTitle = null;
        if (processedSave.finalComment === undefined) processedSave.finalComment = null;
      }

      dispatch({ type: 'LOAD_GAME', payload: processedSave });
      return { success: true };
    } catch (e) {
      console.error('加载游戏失败:', e);
      return { success: false, error: 'corrupted' };
    }
  }, [getSaveKey, SAVE_VERSION, migrateSave, REQUIRED_SAVE_FIELDS]);

  const deleteSave = useCallback((slot: number) => {
    try {
      localStorage.removeItem(getSaveKey(slot));
    } catch (e) {
      console.error('删除存档失败:', e);
    }
  }, [getSaveKey]);

  const getSaveInfo = useCallback((slot: number) => {
    try {
      const saved = localStorage.getItem(getSaveKey(slot));
      if (!saved) return { hasSave: false };

      let data: unknown;
      try {
        data = JSON.parse(saved);
      } catch (parseError) {
        console.warn(`存档 ${slot} 文件已损坏（JSON解析失败）`);
        return { hasSave: false };
      }

      if (!isSaveData(data)) {
        console.warn(`存档 ${slot} 文件已损坏（缺少必要字段）`);
        return { hasSave: false };
      }

      return {
        hasSave: true,
        age: data.stats.age,
        timestamp: data.savedAt,
      };
    } catch (e) {
      console.error('读取存档信息失败:', e);
      return { hasSave: false };
    }
  }, [getSaveKey]);

  const hasSavedGame = useCallback((slot: number = 1) => {
    return localStorage.getItem(getSaveKey(slot)) !== null;
  }, [getSaveKey]);

  const saveAutoSave = useCallback(() => {
    try {
      if (!validateSaveStructure(state)) {
        console.error('自动存档状态结构不完整，拒绝保存');
        return;
      }

      const saveData = {
        ...state,
        version: SAVE_VERSION,
        savedAt: Date.now(),
      };
      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(saveData));
    } catch (e) {
      console.error('自动保存游戏失败:', e);
    }
  }, [state, validateSaveStructure, SAVE_VERSION, AUTO_SAVE_KEY]);

  const getAutoSaveInfo = useCallback(() => {
    try {
      const saved = localStorage.getItem(AUTO_SAVE_KEY);
      if (!saved) return { hasSave: false };

      let data: unknown;
      try {
        data = JSON.parse(saved);
      } catch (parseError) {
        console.error('自动存档信息解析失败，存档可能已损坏:', parseError);
        return { hasSave: false };
      }

      if (!isSaveData(data)) {
        return { hasSave: false };
      }

      return {
        hasSave: true,
        age: data.stats.age,
        timestamp: data.savedAt,
      };
    } catch (e) {
      console.error('读取自动存档信息失败:', e);
      return { hasSave: false };
    }
  }, [AUTO_SAVE_KEY]);

  const checkAutoSave = useCallback(() => {
    return localStorage.getItem(AUTO_SAVE_KEY) !== null;
  }, [AUTO_SAVE_KEY]);

  const setDifficulty = useCallback((difficulty: 'easy' | 'normal' | 'hard') => {
    dispatch({ type: 'SET_DIFFICULTY', payload: difficulty });
    localStorage.setItem('earth-online-difficulty', difficulty);
  }, []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      startSpawning,
      completeSpawning,
      tickYear,
      restAndRecover,
      resetGame,
      saveGame,
      loadGame,
      deleteSave,
      getSaveInfo,
      hasSavedGame,
      setDifficulty,
      currentEvent,
      autoSaveGame: saveAutoSave,
      checkAutoSave,
      getAutoSaveInfo,
    }),
    [state, startSpawning, completeSpawning, tickYear, restAndRecover, resetGame, saveGame, loadGame, deleteSave, getSaveInfo, hasSavedGame, setDifficulty, currentEvent, saveAutoSave, checkAutoSave, getAutoSaveInfo]
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
