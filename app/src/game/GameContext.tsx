import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import {
  gameReducer,
  initialState,
  getAvailableEvents,
  type GameState,
  type GameAction,
  type GameEvent,
  type FamilyTier,
  type PlayerStats,
} from './gameState';

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  startSpawning: (birthServer: string, birthTalent: string, familyTier: FamilyTier, initialStats: PlayerStats) => void;
  completeSpawning: () => void;
  tickYear: (choiceIndex: number, event: GameEvent) => void;
  restAndRecover: () => void;
  resetGame: () => void;
  saveGame: (slot?: number) => void;
  loadGame: (slot?: number) => boolean;
  deleteSave: (slot: number) => void;
  getSaveInfo: (slot: number) => { hasSave: boolean; age?: number; timestamp?: number };
  hasSavedGame: (slot?: number) => boolean;
  setDifficulty: (difficulty: 'easy' | 'normal' | 'hard') => void;
  currentEvent: GameEvent | null;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  useEffect(() => {
    const savedDifficulty = localStorage.getItem('earth-online-difficulty');
    if (savedDifficulty && ['easy', 'normal', 'hard'].includes(savedDifficulty as any)) {
      dispatch({ type: 'SET_DIFFICULTY', payload: savedDifficulty as any });
    }
  }, []);

  const currentEvent = useMemo(() => {
    if (state.phase !== 'PLAYING') return null;
    const events = getAvailableEvents(state.stats.age, state.stats, state.familyTier, state.lastTriggeredEvents);
    if (events.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * events.length);
    return events[randomIndex];
  }, [state.phase, state.stats.age, state.stats.money, state.stats.health, state.stats.mood, state.stats.isMarried, state.familyTier, state.lastTriggeredEvents]);

  const startSpawning = useCallback((birthServer: string, birthTalent: string, familyTier: FamilyTier, initialStats: PlayerStats) => {
    dispatch({ 
      type: 'START_SPAWNING', 
      payload: { familyTier, initialStats, birthServer, birthTalent } 
    });
  }, []);

  const completeSpawning = useCallback(() => {
    dispatch({ type: 'COMPLETE_SPAWNING' });
  }, []);

  const determineEventType = useCallback((statChanges: Partial<import('./gameState').PlayerStats>): 'normal' | 'positive' | 'negative' | 'milestone' => {
    let score = 0;
    const weights = { health: 3, energy: 2, money: 2, mood: 2, intelligence: 1, charm: 1, creativity: 1, luck: 1, karma: 1 };
    
    for (const [key, value] of Object.entries(statChanges)) {
      const weight = weights[key as keyof typeof weights] || 1;
      score += (value || 0) * weight;
    }
    
    if (score > 20) return 'positive';
    if (score < -20) return 'negative';
    return 'normal';
  }, []);

  const tickYear = useCallback((choiceIndex: number, event: GameEvent) => {
    const choice = event.choices[choiceIndex];
    if (!choice) return;

    const eventType = choice.eventType || event.eventType || determineEventType(choice.statChanges);
    const logEvent = choice.followUp || event.text;
    
    dispatch({
      type: 'TRIGGER_EVENT',
      payload: { eventId: event.id, year: state.stats.age },
    });
    
    dispatch({
      type: 'TICK_YEAR',
      payload: {
        action: choice.text,
        statChanges: choice.statChanges,
        event: logEvent,
        eventType,
      },
    });
  }, [determineEventType, state.stats.age]);

  const restAndRecover = useCallback(() => {
    const moneyCost = Math.max(0, Math.floor(state.stats.money * 0.1));
    const statChanges = {
      energy: 30,
      health: 5,
      mood: 5,
      money: -moneyCost,
    };
    
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
  }, [state.stats.money, state.stats.age]);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const SAVE_VERSION = '1.0.0';
  const getSaveKey = (slot: number) => `earth-online-save-${slot}`;

  const migrateSave = (savedState: any): any => {
    return savedState;
  };

  const saveGame = useCallback((slot: number = 1) => {
    try {
      const saveData = {
        ...state,
        version: SAVE_VERSION,
        savedAt: Date.now(),
      };
      localStorage.setItem(getSaveKey(slot), JSON.stringify(saveData));
    } catch (e) {
      console.error('保存游戏失败:', e);
    }
  }, [state]);

  const loadGame = useCallback((slot: number = 1) => {
    try {
      const saved = localStorage.getItem(getSaveKey(slot));
      if (saved) {
        let savedState = JSON.parse(saved);
        if (savedState.version !== SAVE_VERSION) {
          savedState = migrateSave(savedState);
        }
        dispatch({ type: 'LOAD_GAME', payload: savedState });
        return true;
      }
    } catch (e) {
      console.error('加载游戏失败:', e);
    }
    return false;
  }, []);

  const deleteSave = useCallback((slot: number) => {
    try {
      localStorage.removeItem(getSaveKey(slot));
    } catch (e) {
      console.error('删除存档失败:', e);
    }
  }, []);

  const getSaveInfo = useCallback((slot: number) => {
    try {
      const saved = localStorage.getItem(getSaveKey(slot));
      if (saved) {
        const data = JSON.parse(saved);
        return {
          hasSave: true,
          age: data.stats?.age,
          timestamp: data.savedAt,
        };
      }
    } catch (e) {
      console.error('读取存档信息失败:', e);
    }
    return { hasSave: false };
  }, []);

  const hasSavedGame = useCallback((slot: number = 1) => {
    return localStorage.getItem(getSaveKey(slot)) !== null;
  }, []);

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
    }),
    [state, startSpawning, completeSpawning, tickYear, restAndRecover, resetGame, saveGame, loadGame, deleteSave, getSaveInfo, hasSavedGame, setDifficulty, currentEvent]
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
