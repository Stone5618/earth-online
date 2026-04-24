import type { PlayerStats, GameEventChoice } from '../core/types';

/**
 * 事件结果计算系统
 */

/**
 * 解析选择文本（支持函数式文本）
 */
export function resolveChoiceText(
  text: string | ((stats: PlayerStats) => string),
  stats: PlayerStats
): string {
  if (typeof text === 'function') {
    return text(stats);
  }
  return text;
}

/**
 * 解析属性变化（支持函数式变化）
 */
export function resolveStatChanges(
  statChanges: Partial<PlayerStats> | ((stats: PlayerStats) => Partial<PlayerStats>),
  stats: PlayerStats
): Partial<PlayerStats> {
  if (typeof statChanges === 'function') {
    return statChanges(stats);
  }
  return statChanges;
}

/**
 * 检查选项是否禁用
 */
export function isChoiceDisabled(
  choice: GameEventChoice,
  stats: PlayerStats
): boolean {
  if (!choice.disabled) return false;
  if (typeof choice.disabled === 'function') {
    return choice.disabled(stats);
  }
  return choice.disabled;
}

/**
 * 计算事件结果
 */
export function calculateEventResult(
  stats: PlayerStats,
  choice: GameEventChoice,
  difficultyMultiplier: { positive: number; negative: number } = { positive: 1, negative: 1 }
): {
  statChanges: Partial<PlayerStats>;
  followUp: string | null;
  resultMessage: string | null;
} {
  const resolvedChanges = resolveStatChanges(choice.statChanges, stats);
  const resolvedFollowUp = choice.followUp 
    ? (typeof choice.followUp === 'function' 
      ? choice.followUp(resolvedChanges) 
      : choice.followUp)
    : null;
  
  // 应用难度倍数
  const appliedChanges: Partial<PlayerStats> = {};
  for (const [key, value] of Object.entries(resolvedChanges)) {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      const multiplier = numValue > 0 ? difficultyMultiplier.positive : difficultyMultiplier.negative;
      appliedChanges[key as keyof PlayerStats] = Math.round(numValue * multiplier) as any;
    } else {
      appliedChanges[key as keyof PlayerStats] = value as any;
    }
  }
  
  return {
    statChanges: appliedChanges,
    followUp: resolvedFollowUp,
    resultMessage: choice.resultMessage || null
  };
}
