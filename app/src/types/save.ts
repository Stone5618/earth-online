import type { GameState } from '../game/core/types';

// 存档数据类型 - 不继承 GameState 以避免 version 类型冲突
export interface SaveData {
  version: string | number;
  savedAt: number;
  phase: GameState['phase'];
  stats: GameState['stats'];
  familyTier: GameState['familyTier'];
  birthServer: GameState['birthServer'];
  birthTalent: GameState['birthTalent'];
  logs: GameState['logs'];
  currentYear: GameState['currentYear'];
  achievements: GameState['achievements'];
  newlyUnlockedAchievements: GameState['newlyUnlockedAchievements'];
  deathReason: GameState['deathReason'];
  finalTitle: GameState['finalTitle'];
  finalComment: GameState['finalComment'];
  consecutiveHappyYears: GameState['consecutiveHappyYears'];
  difficulty: GameState['difficulty'];
  lastTriggeredEvents: GameState['lastTriggeredEvents'];
  recentEventIds: GameState['recentEventIds'];
  eventLastTriggered: GameState['eventLastTriggered'];
  endingsSeen: GameState['endingsSeen'];
  eventChains: GameState['eventChains'];
  secretMissions: GameState['secretMissions'];
  playTime: GameState['playTime'];
  challenge?: GameState['challenge'];
  challengeVictory?: GameState['challengeVictory'];
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
    (typeof data.version === 'string' || typeof data.version === 'number') &&
    typeof data.savedAt === 'number' &&
    typeof data.stats === 'object' &&
    data.stats !== null
  );
}

// 存档字段类型
export type SaveField = 'phase' | 'stats' | 'logs' | 'achievements' | 'currentYear' | 'familyTier' | 'birthServer' | 'birthTalent' | 'difficulty' | 'lastTriggeredEvents' | 'consecutiveHappyYears' | 'recentEventIds' | 'eventLastTriggered' | 'version' | 'endingsSeen' | 'eventChains' | 'secretMissions' | 'playTime' | 'challenge' | 'challengeVictory';

