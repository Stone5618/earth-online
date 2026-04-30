import type { PlayerStats } from '../core/types';
import { ENDINGS } from '../../config/gameConfig';

/**
 * 结局判定系统 - 根据玩家属性确定合适的结局
 */

/**
 * 获取玩家的结局
 */
export function determineEnding(stats: PlayerStats) {
  const sortedEndings = [...ENDINGS].sort((a, b) => b.priority - a.priority);
  
  for (const ending of sortedEndings) {
    if (ending.condition(stats)) {
      return ending;
    }
  }
  
  return ENDINGS[ENDINGS.length - 1];
}

/**
 * 检查是否满足特定结局条件
 */
export function meetsEndingCondition(stats: PlayerStats, endingId: string): boolean {
  const ending = ENDINGS.find(e => e.id === endingId);
  if (!ending) return false;
  return ending.condition(stats);
}

/**
 * 获取所有可用结局
 */
export function getAvailableEndings() {
  return ENDINGS;
}

/**
 * 获取满足条件的结局（按优先级排序）
 */
export function getQualifiedEndings(stats: PlayerStats) {
  return ENDINGS
    .filter(ending => ending.condition(stats))
    .sort((a, b) => b.priority - a.priority);
}

/**
 * 检查是否满足人生赢家结局
 */
export function isPerfectLife(stats: PlayerStats): boolean {
  return stats.houseLevel >= 4 && 
         stats.carLevel >= 3 && 
         stats.jobLevel >= 5 && 
         stats.partner.has && 
         stats.money >= 1000000;
}

export default {
  determineEnding,
  meetsEndingCondition,
  getAvailableEndings,
  getQualifiedEndings,
  isPerfectLife
};
