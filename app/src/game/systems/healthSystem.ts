import type { PlayerStats, HealthStatus, HealthTransition } from '../core/types';

/**
 * 健康系统 - 管理健康状态、疾病、治疗等
 */

// 健康状态转换配置
export const HEALTH_TRANSITIONS: HealthTransition[] = [
  // 刚出生到5岁前不应该生病
  { from: 'healthy', to: 'minor_ill', probability: 0.02, ageRange: [0, 5] },
  { from: 'healthy', to: 'minor_ill', probability: 0.10, ageRange: [6, 15] },
  { from: 'healthy', to: 'minor_ill', probability: 0.15, ageRange: [16, 30] },
  { from: 'healthy', to: 'minor_ill', probability: 0.20, ageRange: [31, 50] },
  { from: 'healthy', to: 'minor_ill', probability: 0.25, ageRange: [51, 120] },
  { from: 'minor_ill', to: 'healthy', probability: 0.50, ageRange: [0, 15] },
  { from: 'minor_ill', to: 'healthy', probability: 0.40, ageRange: [16, 120] },
  { from: 'minor_ill', to: 'major_ill', probability: 0.05, ageRange: [0, 15] },
  { from: 'minor_ill', to: 'major_ill', probability: 0.15, ageRange: [16, 30] },
  { from: 'minor_ill', to: 'major_ill', probability: 0.25, ageRange: [31, 120] },
  { from: 'major_ill', to: 'minor_ill', probability: 0.35, ageRange: [0, 15] },
  { from: 'major_ill', to: 'minor_ill', probability: 0.30, ageRange: [16, 120] },
  { from: 'major_ill', to: 'healthy', probability: 0.15, ageRange: [0, 15] },
  { from: 'major_ill', to: 'healthy', probability: 0.10, ageRange: [16, 120] },
  { from: 'healthy', to: 'injured', probability: 0.02, ageRange: [0, 5] },
  { from: 'healthy', to: 'injured', probability: 0.08, ageRange: [6, 40] },
  { from: 'healthy', to: 'injured', probability: 0.05, ageRange: [41, 120] },
  { from: 'injured', to: 'healthy', probability: 0.50, ageRange: [0, 15] },
  { from: 'injured', to: 'healthy', probability: 0.45, ageRange: [16, 120] },
  { from: 'injured', to: 'major_ill', probability: 0.05, ageRange: [0, 15] },
  { from: 'injured', to: 'major_ill', probability: 0.15, ageRange: [16, 120] },
  { from: 'injured', to: 'disabled', probability: 0.01, ageRange: [0, 15] },
  { from: 'injured', to: 'disabled', probability: 0.05, ageRange: [16, 120] },
  { from: 'major_ill', to: 'disabled', probability: 0.02, ageRange: [0, 15] },
  { from: 'major_ill', to: 'disabled', probability: 0.08, ageRange: [16, 120] },
  { from: 'disabled', to: 'major_ill', probability: 0.10, ageRange: [0, 120] },
];

/**
 * 获取健康状态名称
 */
export function getHealthConditionName(condition: string): string {
  const names: Record<string, string> = {
    healthy: '健康',
    minor_ill: '小病',
    major_ill: '大病',
    injured: '受伤',
    disabled: '残疾',
  };
  return names[condition] || '未知';
}

/**
 * 获取健康状态颜色
 */
export function getHealthConditionColor(condition: string): string {
  const colors: Record<string, string> = {
    healthy: '#00FF88',
    minor_ill: '#FFD700',
    major_ill: '#FF6B35',
    injured: '#FF4B4B',
    disabled: '#8B5CF6',
  };
  return colors[condition] || '#FFFFFF';
}

/**
 * 获取治疗费用
 */
export function getHealthTreatmentCost(condition: string, stats: PlayerStats): number {
  const baseCosts: Record<string, number> = {
    healthy: 0,
    minor_ill: 2000,
    major_ill: 15000,
    injured: 8000,
    disabled: 50000,
  };
  
  const medicineSkill = stats.skills?.medicine || 0;
  const costReduction = 1 - (medicineSkill * 0.15);
  
  return Math.round(baseCosts[condition] * costReduction);
}

/**
 * 计算健康状态转换
 */
export function calculateHealthTransition(
  currentHealth: HealthStatus,
  stats: PlayerStats,
  isTreated: boolean = false
): HealthStatus {
  let { condition, duration } = currentHealth;
  
  // 健康值低于30时的疾病概率增幅 2-3倍
  let illnessMultiplier = 1;
  if (stats.health < 30) {
    illnessMultiplier = 2.5;
  }
  if (stats.health < 15) {
    illnessMultiplier = 3.5;
  }
  
  // 高健康值时的恢复增幅
  const recoveryMultiplier = stats.health > 80 ? 1.8 : stats.health > 60 ? 1.3 : 1;
  
  if (isTreated) {
    const treatmentRecoveryChance: Record<string, number> = {
      healthy: 1.0,
      minor_ill: 0.98,
      major_ill: 0.92,
      injured: 0.95,
      disabled: 0.6,
    };
    
    // 健康值越低，治疗效果越显著
    const treatmentBonus = Math.max(0, (100 - stats.health) / 150);
    
    if (Math.random() < treatmentRecoveryChance[condition] + treatmentBonus) {
      const recoveryMap: Record<string, string> = {
        healthy: 'healthy',
        minor_ill: 'healthy',
        major_ill: 'healthy',
        injured: 'healthy',
        disabled: 'minor_ill',
      };
      condition = recoveryMap[condition] as any;
      duration = 0;
    }
    return { condition, duration, treatmentCost: getHealthTreatmentCost(condition, stats) };
  }
  
  if (duration > 0) {
    duration--;
    if (duration === 0 && condition !== 'healthy') {
      const naturalRecoveryMap: Record<string, string> = {
        healthy: 'healthy',
        minor_ill: 'healthy',
        major_ill: 'minor_ill',
        injured: 'healthy',
        disabled: 'injured',
      };
      condition = naturalRecoveryMap[condition] as any;
    }
  } else if (condition === 'healthy') {
    const possibleTransitions = HEALTH_TRANSITIONS.filter(
      t => t.from === 'healthy' && 
           t.ageRange[0] <= stats.age && 
           stats.age <= t.ageRange[1]
    );
    
    for (const transition of possibleTransitions) {
      const adjustedProbability = transition.probability * illnessMultiplier;
      if (Math.random() < adjustedProbability) {
        condition = transition.to;
        duration = transition.to === 'minor_ill' ? 2 : 
                   transition.to === 'major_ill' ? 4 :
                   transition.to === 'injured' ? 3 : 5;
        break;
      }
    }
  } else {
    const possibleTransitions = HEALTH_TRANSITIONS.filter(
      t => t.from === condition && 
           t.ageRange[0] <= stats.age && 
           stats.age <= t.ageRange[1]
    );
    
    for (const transition of possibleTransitions) {
      let adjustedProbability = transition.probability;
      
      // 恶化概率在健康值低时增加，恢复概率在健康值高时增加
      if (transition.to !== 'healthy') {
        adjustedProbability *= illnessMultiplier;
      } else {
        adjustedProbability *= recoveryMultiplier;
      }
      
      if (Math.random() < adjustedProbability) {
        condition = transition.to;
        duration = transition.to === 'minor_ill' ? 2 : 
                   transition.to === 'major_ill' ? 4 :
                   transition.to === 'injured' ? 3 :
                   transition.to === 'healthy' ? 0 : 5;
        break;
      }
    }
  }
  
  return { 
    condition, 
    duration,
    treatmentCost: getHealthTreatmentCost(condition, stats)
  };
}

/**
 * 获取健康状态影响
 */
export function getHealthImpact(healthStatus: HealthStatus) {
  const impacts: Record<string, {
    incomeMultiplier: number;
    moodMultiplier: number;
    energyMultiplier: number;
    statChanges: Partial<PlayerStats>;
  }> = {
    healthy: {
      incomeMultiplier: 1.0,
      moodMultiplier: 1.0,
      energyMultiplier: 1.0,
      statChanges: { health: 1 },
    },
    minor_ill: {
      incomeMultiplier: 0.85,
      moodMultiplier: 0.75,
      energyMultiplier: 0.8,
      statChanges: { health: -5, mood: -3 },
    },
    major_ill: {
      incomeMultiplier: 0.5,
      moodMultiplier: 0.4,
      energyMultiplier: 0.4,
      statChanges: { health: -15, energy: -20, mood: -8 },
    },
    injured: {
      incomeMultiplier: 0.65,
      moodMultiplier: 0.55,
      energyMultiplier: 0.5,
      statChanges: { health: -12, energy: -15, mood: -5 },
    },
    disabled: {
      incomeMultiplier: 0.25,
      moodMultiplier: 0.3,
      energyMultiplier: 0.25,
      statChanges: { health: -20, energy: -25, mood: -12, charm: -5 },
    },
  };
  return impacts[healthStatus.condition] || impacts.healthy;
}

/**
 * 根据健康值自动调整健康状态
 */
export function syncHealthStatusByValue(
  currentHealth: HealthStatus,
  healthValue: number,
  age: number = 0
): HealthStatus {
  let { condition, duration } = currentHealth;

  // 刚出生前3年，只要健康值正常应该保持健康
  if (age <= 3) {
    if (healthValue > 80 && condition !== 'healthy') {
      condition = 'healthy';
      duration = 0;
    }
    if (healthValue > 70 && (condition === 'minor_ill' || condition === 'injured')) {
      condition = 'healthy';
      duration = 0;
    }
    return {
      condition,
      duration,
      treatmentCost: getHealthTreatmentCost(condition, { health: healthValue } as any),
    };
  }
  
  // 健康值极低时强制进入不良状态
  if (healthValue < 15 && condition === 'healthy') {
    condition = 'minor_ill';
    duration = 3;
  } else if (healthValue < 8 && (condition === 'healthy' || condition === 'minor_ill')) {
    condition = 'major_ill';
    duration = 5;
  } else if (healthValue < 5 && (condition !== 'major_ill' && condition !== 'disabled')) {
    condition = 'major_ill';
    duration = 6;
  }
  
  // 健康值很高时倾向于保持健康
  if (healthValue > 92 && condition !== 'healthy' && duration === 0) {
    condition = 'healthy';
    duration = 0;
  } else if (healthValue > 85 && (condition === 'minor_ill' || condition === 'injured') && duration === 0) {
    condition = 'healthy';
    duration = 0;
  }
  
  return {
    condition,
    duration,
    treatmentCost: getHealthTreatmentCost(condition, { health: healthValue } as any)
  };
}

export default {
  HEALTH_TRANSITIONS,
  getHealthConditionName,
  getHealthConditionColor,
  getHealthTreatmentCost,
  calculateHealthTransition,
  getHealthImpact,
  syncHealthStatusByValue
};
