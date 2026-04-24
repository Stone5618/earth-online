import type { GameState, PlayerStats } from './types';
import { initialState } from './gameInitializer';
import type { SaveData } from '../../types/save';

const SAVE_VERSION = '1.0.0';

export const getSaveKey = (slot: number): string => `earth-online-save-${slot}`;
export const AUTO_SAVE_KEY = 'earth-online-autosave';

const REQUIRED_SAVE_FIELDS = [
  'phase', 'stats', 'logs', 'achievements', 'currentYear',
  'familyTier', 'birthServer', 'birthTalent', 'difficulty',
  'lastTriggeredEvents', 'consecutiveHappyYears',
  'recentEventIds', 'eventLastTriggered', 'currentEventId', 'rngSeed',
  'eventOccurrences',
] as const;

export interface LoadGameResult {
  success: boolean;
  error?: 'not_found' | 'corrupted' | 'invalid_structure';
}

export function validateSaveStructure(s: unknown): s is SaveData {
  if (!s || typeof s !== 'object') return false;
  
  // 检查基础字段
  const hasBasicFields = REQUIRED_SAVE_FIELDS.every(field => field in s);
  if (!hasBasicFields) return false;
  
  // 检查版本和时间戳
  if (
    typeof (s as any).version !== 'string' ||
    typeof (s as any).savedAt !== 'number'
  ) {
    return false;
  }
  
  // 检查 stats 对象
  if (!(s as any).stats || typeof (s as any).stats !== 'object') {
    return false;
  }
  
  // 检查 stats 中是否包含 career 属性（新增的职业系统）
  if (!('career' in (s as any).stats)) {
    return false;
  }
  
  // 验证 career 结构
  const career = (s as any).stats.career;
  if (!career || typeof career !== 'object') {
    return false;
  }
  
  const requiredCareerFields = ['currentCareer', 'currentLevel', 'totalExperience', 'yearsInCurrentCareer', 'previousCareers'];
  if (!requiredCareerFields.every(field => field in career)) {
    return false;
  }
  
  return true;
}

export function migrateSave(savedState: unknown): SaveData {
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
    
    // 确保 career 属性存在且结构完整
    if (!migrated.stats.career || typeof migrated.stats.career !== 'object') {
      migrated.stats.career = { ...initialState.stats.career };
    } else {
      const requiredCareerFields = ['currentCareer', 'currentLevel', 'totalExperience', 'yearsInCurrentCareer', 'previousCareers'];
      requiredCareerFields.forEach(field => {
        if (!(field in migrated.stats.career)) {
          (migrated.stats.career as any)[field] = (initialState.stats.career as any)[field];
        }
      });
    }
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

  if (!(migrated as any).eventOccurrences || typeof (migrated as any).eventOccurrences !== 'object') {
    (migrated as any).eventOccurrences = {};
  }

  if (migrated.deathReason === undefined) migrated.deathReason = null;
  if (migrated.finalTitle === undefined) migrated.finalTitle = null;
  if (migrated.finalComment === undefined) migrated.finalComment = null;
  if ((migrated as any).currentEventId === undefined) (migrated as any).currentEventId = null;
  if ((migrated as any).rngSeed === undefined) (migrated as any).rngSeed = 0;
  
  return migrated;
}

export function saveGame(
  state: GameState,
  slot: number = 1
): void {
  try {
    // 先使用 migrateSave 确保状态结构完整
    const processedState = migrateSave(state);
    
    const saveData = {
      ...processedState,
      version: SAVE_VERSION,
      savedAt: Date.now(),
    };
    localStorage.setItem(getSaveKey(slot), JSON.stringify(saveData));
  } catch (e) {
    console.error('保存游戏失败:', e);
  }
}

export function autoSaveGame(state: GameState): void {
  try {
    // 先使用 migrateSave 确保状态结构完整
    const processedState = migrateSave(state);
    
    const saveData = {
      ...processedState,
      version: SAVE_VERSION,
      savedAt: Date.now(),
    };
    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(saveData));
  } catch (e) {
    console.error('自动保存游戏失败:', e);
  }
}

export function loadGame(slot: number = 1): LoadGameResult & { data?: GameState } {
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
    
    if (!validateSaveStructure(savedState)) {
      console.error('存档数据结构无效，拒绝加载');
      return { success: false, error: 'invalid_structure' };
    }
    
    let processedSave = savedState;
    if (processedSave.version !== SAVE_VERSION) {
      processedSave = migrateSave(processedSave);
    } else {
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
    
    const data = {
      ...processedSave,
      version: (processedSave as any).version ?? initialState.version,
      endingsSeen: (processedSave as any).endingsSeen ?? initialState.endingsSeen,
      eventChains: (processedSave as any).eventChains ?? initialState.eventChains,
      secretMissions: (processedSave as any).secretMissions ?? initialState.secretMissions,
      playTime: (processedSave as any).playTime ?? initialState.playTime,
      challenge: (processedSave as any).challenge ?? initialState.challenge,
      challengeVictory: (processedSave as any).challengeVictory ?? initialState.challengeVictory,
    } as unknown as GameState;
    
    return { success: true, data };
  } catch (e) {
    console.error('加载游戏失败:', e);
    return { success: false, error: 'corrupted' };
  }
}

export function deleteSave(slot: number): void {
  try {
    localStorage.removeItem(getSaveKey(slot));
  } catch (e) {
    console.error('删除存档失败:', e);
  }
}

export function getSaveInfo(slot: number): { hasSave: boolean; age?: number; timestamp?: number } {
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
    
    if (!validateSaveStructure(data)) {
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
}

export function hasSavedGame(slot: number = 1): boolean {
  return localStorage.getItem(getSaveKey(slot)) !== null;
}

export function checkAutoSave(): boolean {
  return localStorage.getItem(AUTO_SAVE_KEY) !== null;
}

export function getAutoSaveInfo(): { hasSave: boolean; age?: number; timestamp?: number } {
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
    
    if (!validateSaveStructure(data)) {
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
}
