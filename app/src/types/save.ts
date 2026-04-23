import type { GameState } from '../game/gameState';

// 存档数据类型
export interface SaveData extends GameState {
  version: string;
  savedAt: number;
}

// 存档信息类型
export interface SaveInfo {
  hasSave: boolean;
  age?: number;
  timestamp?: number;
}

// 类型守卫函数
export function isSaveData(data: any): data is SaveData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.version === 'string' &&
    typeof data.savedAt === 'number' &&
    typeof data.stats === 'object' &&
    data.stats !== null
  );
}

// 存档字段类型
export type SaveField = 'phase' | 'stats' | 'logs' | 'achievements' | 'currentYear' | 'familyTier' | 'birthServer' | 'birthTalent' | 'difficulty' | 'lastTriggeredEvents' | 'consecutiveHappyYears' | 'recentEventIds' | 'eventLastTriggered';
