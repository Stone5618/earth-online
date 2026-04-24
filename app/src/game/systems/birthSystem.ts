
import type { PlayerStats, FamilyTier, FamilyOccupation as FamilyOccupationType } from '../core/types';
import { TALENTS, FLAWS, FAMILY_OCCUPATIONS, FAMILY_OCCUPATION_TIER_BINDING } from '../../config/gameConfig';

export type FamilyOccupation = FamilyOccupationType;

export interface BirthConfig {
  familyTier: FamilyTier;
  familyOccupation: FamilyOccupation | null;
  selectedTalent: string | null;
  selectedFlaw: string | null;
}

export function getRandomFamilyOccupation(tier: FamilyTier): FamilyOccupation {
  const weights = {
    'SSR': {
      civil_servant: 15,
      teacher_family: 15,
      doctor_family: 12,
      lawyer: 12,
      engineer: 8,
      programmer_family: 10,
      scientist: 15,
      business: 18,
      finance: 20,
      entrepreneur: 25,
      military: 12,
      scholar: 18,
      artist: 15,
      athlete: 8,
      writer: 10,
      designer: 10,
      hermit: 5,
      police: 5,
      worker: 0,
      craftsman: 0,
      farmer: 0
    },
    'SR': {
      civil_servant: 15,
      teacher_family: 15,
      doctor_family: 10,
      lawyer: 10,
      engineer: 12,
      programmer_family: 10,
      scientist: 8,
      business: 18,
      finance: 15,
      entrepreneur: 12,
      military: 12,
      scholar: 15,
      artist: 15,
      athlete: 10,
      writer: 10,
      designer: 12,
      hermit: 3,
      police: 10,
      worker: 3,
      craftsman: 5,
      farmer: 3
    },
    'R': {
      civil_servant: 10,
      teacher_family: 12,
      doctor_family: 8,
      lawyer: 6,
      engineer: 12,
      programmer_family: 8,
      scientist: 6,
      business: 12,
      finance: 10,
      entrepreneur: 6,
      military: 10,
      scholar: 12,
      artist: 10,
      athlete: 10,
      writer: 10,
      designer: 10,
      hermit: 4,
      police: 10,
      worker: 15,
      craftsman: 12,
      farmer: 25
    },
    'IRON': {
      civil_servant: 5,
      teacher_family: 8,
      doctor_family: 3,
      lawyer: 3,
      engineer: 6,
      programmer_family: 4,
      scientist: 2,
      business: 6,
      finance: 4,
      entrepreneur: 2,
      military: 6,
      scholar: 6,
      artist: 6,
      athlete: 6,
      writer: 6,
      designer: 6,
      hermit: 4,
      police: 8,
      worker: 25,
      craftsman: 18,
      farmer: 60
    }
  };

  // 获取适合当前出身等级的家族职业
  const tierWeights = weights[tier];
  let totalWeight = 0;
  const entries = Object.entries(tierWeights);
  
  // 先筛选有权重的职业
  const validEntries = entries.filter(([_, weight]) => weight > 0);
  
  for (let i = 0; i < validEntries.length; i++) {
    totalWeight += validEntries[i][1];
  }
  
  // 如果没有适合的职业，回退到一些基础职业
  if (totalWeight === 0) {
    return tier === 'IRON' || tier === 'R' ? 'farmer' : 'civil_servant';
  }
  
  let random = Math.random() * totalWeight;

  for (let i = 0; i < validEntries.length; i++) {
    const [occupation, weight] = validEntries[i];
    random -= weight;
    if (random <= 0) {
      return occupation as FamilyOccupation;
    }
  }

  // 默认返回
  if (tier === 'SSR') return 'entrepreneur';
  if (tier === 'SR') return 'business';
  if (tier === 'R') return 'civil_servant';
  return 'farmer';
}

export function applyFamilyBonus(stats: PlayerStats, occupation: FamilyOccupation | null, tier?: FamilyTier): PlayerStats {
  if (!occupation) return stats;
  
  let newStats = { ...stats };
  const bonus = FAMILY_OCCUPATIONS[occupation as keyof typeof FAMILY_OCCUPATIONS];
  
  if (bonus?.statBonus) {
    const { skills, ...restBonus } = bonus.statBonus;
    
    for (const [key, value] of Object.entries(restBonus)) {
      if (key in newStats) {
        // 如果是金钱，并且有出身等级，应用倍数
        if ((key === 'money' || key === 'totalMoneyEarned') && tier) {
          const binding = FAMILY_OCCUPATION_TIER_BINDING[occupation as keyof typeof FAMILY_OCCUPATION_TIER_BINDING];
          const multiplier = binding?.moneyMultiplier[tier] || 1;
          (newStats as any)[key] = (newStats as any)[key] + Math.round((value as number) * multiplier);
        } else {
          // 其他属性正常应用
          (newStats as any)[key] = (newStats as any)[key] + (value as number);
        }
      }
    }
    
    if (skills) {
      for (const [skillKey, skillValue] of Object.entries(skills)) {
        (newStats.skills as any)[skillKey] = ((newStats.skills as any)[skillKey] || 0) + (skillValue as number);
      }
    }
  }
  
  return newStats;
}

export function getRandomTalents(excludeId?: string): Array<typeof TALENTS[0]> {
  let available = TALENTS.filter(function(t) { return t.id !== excludeId; });
  let shuffled = available.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 3);
}

export function applyTalent(stats: PlayerStats, talentId: string | null): PlayerStats {
  if (!talentId) return stats;
  
  let talent = null;
  for (let i = 0; i < TALENTS.length; i++) {
    if (TALENTS[i].id === talentId) {
      talent = TALENTS[i];
      break;
    }
  }
  if (!talent) return stats;
  
  const effect = talent.effect(stats);
  return { ...stats, ...effect };
}

export function getRandomFlaws(excludeId?: string): Array<typeof FLAWS[0]> {
  let available = FLAWS.filter(function(f) { return f.id !== excludeId; });
  let shuffled = available.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function applyFlaw(stats: PlayerStats, flawId: string | null): PlayerStats {
  if (!flawId) return stats;
  
  let flaw = null;
  for (let i = 0; i < FLAWS.length; i++) {
    if (FLAWS[i].id === flawId) {
      flaw = FLAWS[i];
      break;
    }
  }
  if (!flaw) return stats;
  
  const effect = flaw.effect(stats);
  let newStats = { ...stats, ...effect };
  
  if (newStats.skillPoints === undefined) {
    newStats.skillPoints = 0;
  }
  newStats.skillPoints += 5;
  
  return newStats;
}

export function initializeBirth(
  tier: FamilyTier,
  config?: Partial<BirthConfig>
): { stats: PlayerStats; config: BirthConfig } {
  const occupation = config?.familyOccupation || getRandomFamilyOccupation(tier);
  const talent = config?.selectedTalent || null;
  const flaw = config?.selectedFlaw || null;
  
  return {
    config: {
      familyTier: tier,
      familyOccupation: occupation,
      selectedTalent: talent,
      selectedFlaw: flaw
    },
    stats: {} as PlayerStats
  };
}

export function applyBirthEffects(
  stats: PlayerStats,
  config: BirthConfig
): PlayerStats {
  let newStats = { ...stats };
  
  newStats = applyFamilyBonus(newStats, config.familyOccupation, config.familyTier);
  newStats = applyTalent(newStats, config.selectedTalent);
  newStats = applyFlaw(newStats, config.selectedFlaw);
  
  return newStats;
}

export function getTalentById(id: string) {
  for (let i = 0; i < TALENTS.length; i++) {
    if (TALENTS[i].id === id) {
      return TALENTS[i];
    }
  }
  return undefined;
}

export function getFlawById(id: string) {
  for (let i = 0; i < FLAWS.length; i++) {
    if (FLAWS[i].id === id) {
      return FLAWS[i];
    }
  }
  return undefined;
}

export default {
  getRandomFamilyOccupation,
  applyFamilyBonus,
  getRandomTalents,
  applyTalent,
  getRandomFlaws,
  applyFlaw,
  initializeBirth,
  applyBirthEffects,
  getTalentById,
  getFlawById
};

