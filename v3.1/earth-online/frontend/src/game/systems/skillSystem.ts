import type { PlayerStats, SkillKey, SkillTree } from '../core/types';
import { SKILL_COSTS } from '../../config/gameConfig';

/**
 * 技能系统 - 管理技能升级、技能效果等
 */

/**
 * 技能描述
 */
export const SKILL_DESCRIPTIONS: Record<SkillKey, { name: string; description: string; icon: string }> = {
  programming: {
    name: '编程',
    description: '提高收入和工作效率',
    icon: '💻'
  },
  investing: {
    name: '投资',
    description: '提高投资收益',
    icon: '📊'
  },
  medicine: {
    name: '医学',
    description: '降低医疗费用，提高健康恢复',
    icon: '🏥'
  },
  speech: {
    name: '演讲',
    description: '提高魅力和社交效果',
    icon: '🎤'
  },
  romance: {
    name: '恋爱',
    description: '提高恋爱成功率和关系质量',
    icon: '💕'
  },
  management: {
    name: '管理',
    description: '提高职业晋升速度',
    icon: '👔'
  },
  fitness: {
    name: '健身',
    description: '提高健康和精力上限',
    icon: '💪'
  },
  driving: {
    name: '驾驶',
    description: '提高汽车效果和安全性',
    icon: '🚗'
  },
  cooking: {
    name: '烹饪',
    description: '提高心情和健康',
    icon: '🍳'
  },
  painting: {
    name: '绘画',
    description: '提高创造力和心情',
    icon: '🎨'
  },
  music: {
    name: '音乐',
    description: '提高创造力和心情',
    icon: '🎵'
  },
  entrepreneurship: {
    name: '创业',
    description: '提高创业成功率和收入',
    icon: '🚀'
  },
  academics: {
    name: '学术',
    description: '提高智力和教育效果',
    icon: '📚'
  },
  athletics: {
    name: '体育',
    description: '提高健康和精力',
    icon: '🏃'
  }
};

/**
 * 检查是否可以升级技能
 */
export function canUpgradeSkill(stats: PlayerStats, skill: SkillKey): boolean {
  const currentLevel = stats.skills[skill];
  if (currentLevel >= 5) return false;
  const cost = SKILL_COSTS[(currentLevel + 1) as keyof typeof SKILL_COSTS];
  return stats.skillPoints >= cost;
}

/**
 * 获取升级费用
 */
export function getSkillUpgradeCost(_skill: SkillKey, currentLevel: number): number {
  return SKILL_COSTS[(currentLevel + 1) as keyof typeof SKILL_COSTS];
}

/**
 * 获取技能效果值
 */
export function getSkillEffect(_skill: SkillKey, level: number): number {
  return level * 0.1; // 10% per level
}

/**
 * 获取技能流派（用于专属事件）
 */
export function getSkillSpecialization(stats: PlayerStats): SkillKey | null {
  let maxLevel = -1;
  let maxSkill: SkillKey | null = null;
  
  for (const [skill, level] of Object.entries(stats.skills)) {
    if (level > maxLevel && level >= 3) {
      maxLevel = level;
      maxSkill = skill as SkillKey;
    }
  }
  
  return maxSkill;
}

/**
 * 创建初始技能树
 */
export function createInitialSkillTree(): SkillTree {
  return {
    programming: 0,
    investing: 0,
    medicine: 0,
    speech: 0,
    romance: 0,
    management: 0,
    fitness: 0,
    driving: 0,
    cooking: 0,
    painting: 0,
    music: 0,
    entrepreneurship: 0,
    academics: 0,
    athletics: 0
  };
}

// 根据技能等级调整事件结果
export function applySkillBonusesToStatChange(statChange: any, stats: any): any {
  const newChanges = { ...statChange };
  for (const skillKey in stats.skills) {
    const skillLevel = stats.skills[skillKey];
    if (skillLevel > 0) {
      // 根据技能类型给予加成
      switch (skillKey) {
        case 'intelligence':
        case 'programming':
        case 'medicine':
        case 'academics':
          if (newChanges.intelligence) newChanges.intelligence += Math.floor(skillLevel * 2);
          if (newChanges.creativity) newChanges.creativity += Math.floor(skillLevel * 1);
          break;
        case 'social':
        case 'speech':
        case 'romance':
        case 'management':
          if (newChanges.charm) newChanges.charm += Math.floor(skillLevel * 2);
          if (newChanges.karma) newChanges.karma += Math.floor(skillLevel * 1);
          break;
        case 'survival':
        case 'fitness':
        case 'cooking':
          if (newChanges.health) newChanges.health += Math.floor(skillLevel * 3);
          if (newChanges.energy) newChanges.energy += Math.floor(skillLevel * 2);
          break;
        case 'art':
        case 'painting':
        case 'music':
          if (newChanges.creativity) newChanges.creativity += Math.floor(skillLevel * 3);
          if (newChanges.mood) newChanges.mood += Math.floor(skillLevel * 2);
          break;
        case 'entrepreneurship':
        case 'investing':
          if (newChanges.money) newChanges.money = Math.floor(newChanges.money * (1 + skillLevel * 0.1));
          break;
      }
    }
  }
  return newChanges;
}

export default {
  SKILL_DESCRIPTIONS,
  canUpgradeSkill,
  getSkillUpgradeCost,
  getSkillEffect,
  getSkillSpecialization,
  createInitialSkillTree,
  applySkillBonusesToStatChange
};
