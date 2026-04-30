import type { GameState, PlayerStats } from './types';
import { initialState } from './gameInitializer';
import type { SaveData } from '../../types/save';
import { api, GameSave as CloudGameSave } from '../../api/client';

const SAVE_VERSION = '1.1.0';

export const getSaveKey = (slot: number): string => `earth-online-save-${slot}`;
export const AUTO_SAVE_KEY = 'earth-online-autosave';

export interface LoadGameResult {
  success: boolean;
  error?: 'not_found' | 'corrupted' | 'invalid_structure';
  charId?: number | null;
}

export function validateSaveStructure(s: unknown): s is SaveData {
  if (!s || typeof s !== 'object') return false;
  
  // 检查基础字段
  const hasBasicFields = ['phase', 'stats', 'logs', 'achievements', 'currentYear', 'familyTier'].every(field => field in s);
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
  
  // 基础 stats 字段检查
  const requiredStats = ['age', 'health', 'money', 'mood', 'intelligence', 'charm', 'creativity'];
  if (!requiredStats.every(field => field in (s as any).stats)) {
    return false;
  }
  
  return true;
}

export function migrateSave(savedState: unknown): SaveData {
  const migrated = { ...(savedState as SaveData) };
  
  // 基础字段迁移
  const basicFields = ['phase', 'stats', 'logs', 'achievements', 'newlyUnlockedAchievements',
                       'currentYear', 'familyTier', 'birthServer', 'birthTalent', 'difficulty', 
                       'lastTriggeredEvents', 'consecutiveHappyYears', 'recentEventIds', 
                       'eventLastTriggered', 'currentEventId', 'rngSeed', 'eventOccurrences', 
                       'endingsSeen', 'eventChains', 'secretMissions', 'playTime', 'challenge', 
                       'challengeVictory', 'ngPlusCount', 'legacyData', 'characterName', 
                       'familyName', 'gender', 'deathReason', 'finalTitle', 'finalComment'] as const;
  
  basicFields.forEach(field => {
    if (!(field in migrated)) {
      (migrated as any)[field] = (initialState as any)[field];
    }
  });
  
  // stats 迁移
  if (migrated.stats && typeof migrated.stats === 'object') {
    // 新增统计字段
    const newStatFields = ['maxHealth', 'maxEnergy', 'luck', 'karma', 'totalMoneyEarned', 
                           'isMarried', 'houseLevel', 'carLevel', 'jobLevel', 'partner', 
                           'children', 'skillPoints', 'skills', 'familyOccupation', 
                           'selectedTalent', 'selectedFlaw', 'healthStatus', 'educationLevel',
                           'economyFactor', 'retired', 'isUnemployed', 'debts'] as const;
    
    newStatFields.forEach(field => {
      if (!(field in migrated.stats)) {
        (migrated.stats as any)[field] = (initialState.stats as any)[field];
      }
    });
    
    // 职业系统迁移 - 确保 career 是对象且包含必要字段
    if (!migrated.stats.career || typeof migrated.stats.career !== 'object' || Array.isArray(migrated.stats.career)) {
      migrated.stats.career = {
        currentCareer: null,
        currentLevel: 0,
        totalExperience: 0,
        yearsInCurrentCareer: 0,
        previousCareers: [],
      };
    } else {
      const requiredCareerFields = ['currentCareer', 'currentLevel', 'totalExperience', 
                                    'yearsInCurrentCareer', 'previousCareers'];
      requiredCareerFields.forEach(field => {
        if (!(field in migrated.stats.career)) {
          (migrated.stats.career as any)[field] = {
            currentCareer: null,
            currentLevel: 0,
            totalExperience: 0,
            yearsInCurrentCareer: 0,
            previousCareers: [],
          }[field];
        }
      });
    }
  }
  
  // 数组类型字段迁移
  if (!migrated.achievements || !Array.isArray(migrated.achievements)) {
    migrated.achievements = [...initialState.achievements];
  }
  
  if (!migrated.logs || !Array.isArray(migrated.logs)) {
    migrated.logs = [];
  }
  
  if (!migrated.recentEventIds || !Array.isArray(migrated.recentEventIds)) {
    migrated.recentEventIds = [];
  }
  
  // 对象类型字段迁移
  if (!migrated.lastTriggeredEvents || typeof migrated.lastTriggeredEvents !== 'object') {
    migrated.lastTriggeredEvents = {};
  }
  
  if (!migrated.eventLastTriggered || typeof migrated.eventLastTriggered !== 'object') {
    migrated.eventLastTriggered = {};
  }

  if (!migrated.eventOccurrences || typeof migrated.eventOccurrences !== 'object') {
    migrated.eventOccurrences = {};
  }
  
  if (!migrated.endingsSeen || typeof migrated.endingsSeen !== 'object') {
    migrated.endingsSeen = {...initialState.endingsSeen};
  }
  
  if (!migrated.eventChains || typeof migrated.eventChains !== 'object') {
    migrated.eventChains = {...initialState.eventChains};
  }
  
  if (!migrated.secretMissions || !Array.isArray(migrated.secretMissions)) {
    migrated.secretMissions = [...initialState.secretMissions];
  }
  
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
      // 即使版本匹配，也需要确保所有新增字段存在
      const basicFields = ['phase', 'stats', 'logs', 'achievements', 'newlyUnlockedAchievements',
                           'currentYear', 'familyTier', 'birthServer', 'birthTalent', 'difficulty', 
                           'lastTriggeredEvents', 'consecutiveHappyYears', 'recentEventIds', 
                           'eventLastTriggered', 'endingsSeen', 'eventChains', 'secretMissions', 
                           'playTime', 'challenge', 'challengeVictory', 'ngPlusCount', 'legacyData', 
                           'characterName', 'familyName', 'gender', 'deathReason', 'finalTitle', 'finalComment'];
      
      basicFields.forEach(field => {
        if (!(field in processedSave)) {
          (processedSave as any)[field] = (initialState as any)[field];
        }
      });
      
      if (processedSave.stats && typeof processedSave.stats === 'object') {
        // 确保所有 stats 字段存在
        const newStatFields = ['maxHealth', 'maxEnergy', 'luck', 'karma', 'totalMoneyEarned',
                               'isMarried', 'houseLevel', 'carLevel', 'jobLevel', 'partner',
                               'children', 'skillPoints', 'skills', 'familyOccupation',
                               'selectedTalent', 'selectedFlaw', 'healthStatus', 'educationLevel',
                               'economyFactor', 'retired', 'isUnemployed', 'debts'];
        
        newStatFields.forEach(field => {
          if (!(field in processedSave.stats)) {
            (processedSave.stats as any)[field] = (initialState.stats as any)[field];
          }
        });
        
        // 职业系统迁移 - 确保 career 是对象且包含必要字段
        if (!processedSave.stats.career || typeof processedSave.stats.career !== 'object' || Array.isArray(processedSave.stats.career)) {
          processedSave.stats.career = {
            currentCareer: null,
            currentLevel: 0,
            totalExperience: 0,
            yearsInCurrentCareer: 0,
            previousCareers: [],
          };
        } else {
          const requiredCareerFields = ['currentCareer', 'currentLevel', 'totalExperience', 
                                        'yearsInCurrentCareer', 'previousCareers'];
          requiredCareerFields.forEach(field => {
            if (!(field in processedSave.stats.career)) {
              (processedSave.stats.career as any)[field] = {
                currentCareer: null,
                currentLevel: 0,
                totalExperience: 0,
                yearsInCurrentCareer: 0,
                previousCareers: [],
              }[field];
            }
          });
        }
      }
      
      if (!processedSave.achievements || !Array.isArray(processedSave.achievements)) {
        processedSave.achievements = [...initialState.achievements];
      }
      
      if (!processedSave.logs || !Array.isArray(processedSave.logs)) {
        processedSave.logs = [];
      }
      
      if (!processedSave.recentEventIds || !Array.isArray(processedSave.recentEventIds)) {
        processedSave.recentEventIds = [];
      }
      
      if (!processedSave.lastTriggeredEvents || typeof processedSave.lastTriggeredEvents !== 'object') {
        processedSave.lastTriggeredEvents = {};
      }
      
      if (!processedSave.eventLastTriggered || typeof processedSave.eventLastTriggered !== 'object') {
        processedSave.eventLastTriggered = {};
      }
      
      if (!processedSave.endingsSeen || typeof processedSave.endingsSeen !== 'object') {
        processedSave.endingsSeen = {...initialState.endingsSeen};
      }
      
      if (!processedSave.eventChains || typeof processedSave.eventChains !== 'object') {
        processedSave.eventChains = {...initialState.eventChains};
      }
      
      if (!processedSave.secretMissions || !Array.isArray(processedSave.secretMissions)) {
        processedSave.secretMissions = [...initialState.secretMissions];
      }
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
      characterName: (processedSave as any).characterName ?? initialState.characterName,
      familyName: (processedSave as any).familyName ?? initialState.familyName,
      gender: (processedSave as any).gender ?? initialState.gender,
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

// 云存档相关功能
export interface CloudSaveInfo {
  hasSave: boolean;
  slot: number;
  characterName?: string;
  age?: number;
  createdTime?: Date;
  updatedTime?: Date;
  save?: CloudGameSave;
}

export async function fetchCloudSaves(): Promise<CloudSaveInfo[]> {
  try {
    if (!api.isLoggedIn) {
      return [];
    }
    
    const { data, error } = await api.getSaves();
    if (error) {
      console.error('获取云存档失败:', error);
      return [];
    }
    
    const cloudSaves = data || [];
    const allSlots: CloudSaveInfo[] = [];
    
    for (let slot = 1; slot <= 3; slot++) {
      const save = cloudSaves.find(s => s.slot === slot);
      if (save) {
        allSlots.push({
          hasSave: true,
          slot,
          characterName: save.character_name || undefined,
          age: save.age || undefined,
          createdTime: save.created_at ? new Date(save.created_at) : undefined,
          updatedTime: save.updated_at ? new Date(save.updated_at) : undefined,
          save,
        });
      } else {
        allSlots.push({ hasSave: false, slot });
      }
    }
    
    return allSlots;
  } catch (e) {
    console.error('获取云存档失败:', e);
    return [];
  }
}

export async function saveToCloud(state: GameState, slot: number, charId?: number | null): Promise<boolean> {
  try {
    if (!api.isLoggedIn) {
      console.error('未登录，无法保存到云端');
      return false;
    }
    
    const processedState = migrateSave(state);
    const saveData = {
      ...processedState,
      version: SAVE_VERSION,
      savedAt: Date.now(),
    };
    
    const { data, error } = await api.saveGame({
      slot,
      save_data: saveData,
      character_name: state.characterName || '地球online玩家',
      age: state.stats.age,
      char_id: charId ?? undefined,
    });
    
    if (error) {
      console.error('保存到云端失败:', error);
      return false;
    }
    
    return !!data;
  } catch (e) {
    console.error('保存到云端失败:', e);
    return false;
  }
}

export async function loadFromCloud(slot: number): Promise<LoadGameResult & { data?: GameState }> {
  try {
    if (!api.isLoggedIn) {
      return { success: false, error: 'not_found' };
    }
    
    // 同时获取存档元数据和存档内容
    const [{ data: saveMeta, error: metaError }, { data: saveData, error: dataError }] = await Promise.all([
      api.getSave(slot),
      api.getSaveData(slot),
    ]);
    
    if (dataError || !saveData) {
      console.error('从云端加载存档失败:', dataError);
      return { success: false, error: 'not_found' };
    }
    
    const castData = saveData as unknown;
    
    if (!validateSaveStructure(castData)) {
      console.error('云存档数据结构无效');
      return { success: false, error: 'invalid_structure' };
    }
    
    let processedSave = castData;
    if ((processedSave as any).version !== SAVE_VERSION) {
      processedSave = migrateSave(processedSave);
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
      characterName: (processedSave as any).characterName ?? initialState.characterName,
      familyName: (processedSave as any).familyName ?? initialState.familyName,
      gender: (processedSave as any).gender ?? initialState.gender,
    } as unknown as GameState;
    
    // 返回 charId 用于恢复角色关联
    const charId = saveMeta?.char_id ?? null;
    
    return { success: true, data, charId };
  } catch (e) {
    console.error('从云端加载存档失败:', e);
    return { success: false, error: 'corrupted' };
  }
}

export async function deleteCloudSave(slot: number): Promise<boolean> {
  try {
    if (!api.isLoggedIn) return false;
    
    const { success, error } = await api.deleteSave(slot);
    if (error) {
      console.error('删除云存档失败:', error);
      return false;
    }
    
    return success;
  } catch (e) {
    console.error('删除云存档失败:', e);
    return false;
  }
}
