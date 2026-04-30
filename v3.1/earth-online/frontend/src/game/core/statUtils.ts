/** Shared utility functions extracted from StatPanel */

const STAT_NAMES: Record<string, string> = {
  intelligence: '智力',
  creativity: '创造力',
  luck: '运气',
  charm: '魅力',
  health: '健康',
  maxHealth: '最大健康',
  energy: '精力',
  maxEnergy: '最大精力',
  money: '金钱',
  totalMoneyEarned: '总收入',
  karma: '福报',
  mood: '心情',
  skillPoints: '技能点',
};

/** Translate stat key to Chinese display name */
export function formatStatName(stat: string): string {
  return STAT_NAMES[stat] || stat;
}

/** Extract numeric deltas from a trait's effect function by passing a zeroed baseline */
export function parseTraitEffect(trait: { effect: (stats: any) => any }): Record<string, number> {
  const baseStats: Record<string, number> = {
    intelligence: 0, creativity: 0, luck: 0, charm: 0,
    health: 0, maxHealth: 0, energy: 0, maxEnergy: 0,
    money: 0, totalMoneyEarned: 0, karma: 0, mood: 0, skillPoints: 0,
  };
  const result: Record<string, number> = trait.effect(baseStats);
  const effects: Record<string, number> = {};
  
  Object.keys(result).forEach(key => {
    if (baseStats.hasOwnProperty(key) && result[key] !== baseStats[key]) {
      effects[key] = result[key] - baseStats[key];
    }
  });
  
  return effects;
}

/** Stat label mapping for choice results (extracted from ChoiceResultModal) */
const STAT_LABELS: Record<string, string> = {
  intelligence: '智力',
  creativity: '创造力',
  luck: '运气',
  charm: '魅力',
  health: '健康',
  maxHealth: '最大健康',
  energy: '精力',
  maxEnergy: '最大精力',
  money: '金钱',
  totalMoneyEarned: '总收入',
  karma: '福报',
  mood: '心情',
  skillPoints: '技能点',
  action: '行动',
};

/** Get Chinese label for a stat key */
export function getStatLabel(key: string): string {
  return STAT_LABELS[key] || key;
}

