import type { GameState, PlayerStats } from '../types';
import { clamp } from '../gameEngine';

export interface BaseStatChanges {
  health: number;
  energy: number;
  money: number;
  mood: number;
  intelligence: number;
  charm: number;
  creativity: number;
  luck: number;
  karma: number;
  isMarried?: boolean;
  houseLevel?: number;
  carLevel?: number;
  jobLevel?: number;
  isUnemployed?: boolean;
  career?: any;
  partner?: any;
  children?: any[];
  debts?: any;
  skills?: Partial<PlayerStats['skills']>;
  skillPoints?: number;
}

export interface CareerYearResult {
  newStats: Partial<PlayerStats>;
  healthBonus: number;
  extraIncome: number;
  extraSkillPoints: number;
}

export function extractBaseStatChanges(
  statChanges: Record<string, any>
): BaseStatChanges {
  const {
    houseLevel,
    carLevel,
    jobLevel,
    isUnemployed,
    career,
    partner,
    children,
    debts,
    skills,
    skillPoints,
    ...rest
  } = statChanges;

  return {
    health: rest.health || 0,
    energy: rest.energy || 0,
    money: rest.money || 0,
    mood: rest.mood || 0,
    intelligence: rest.intelligence || 0,
    charm: rest.charm || 0,
    creativity: rest.creativity || 0,
    luck: rest.luck || 0,
    karma: rest.karma || 0,
    isMarried: rest.isMarried,
    houseLevel,
    carLevel,
    jobLevel,
    isUnemployed,
    career,
    partner,
    children,
    debts,
    skills,
    skillPoints,
  };
}

export function calculateRawChanges(
  baseChanges: BaseStatChanges,
  healthImpact: {
    statChanges: Partial<PlayerStats>;
    incomeMultiplier: number;
    moodMultiplier: number;
    energyMultiplier: number;
  },
  careerResult: CareerYearResult
): {
  rawHealthChange: number;
  rawEnergyChange: number;
  rawMoneyChange: number;
  rawMoodChange: number;
  rawIntelligenceChange: number;
  rawCharmChange: number;
  rawCreativityChange: number;
  rawLuckChange: number;
  rawKarmaChange: number;
} {
  return {
    rawHealthChange: baseChanges.health + (healthImpact.statChanges.health || 0) + careerResult.healthBonus,
    rawEnergyChange: (baseChanges.energy || 0) + (healthImpact.statChanges.energy || 0),
    rawMoneyChange: (baseChanges.money * healthImpact.incomeMultiplier) + (healthImpact.statChanges.money || 0) + careerResult.extraIncome,
    rawMoodChange: (baseChanges.mood || 0) * healthImpact.moodMultiplier + (healthImpact.statChanges.mood || 0),
    rawIntelligenceChange: (baseChanges.intelligence || 0) + (healthImpact.statChanges.intelligence || 0),
    rawCharmChange: (baseChanges.charm || 0) + (healthImpact.statChanges.charm || 0),
    rawCreativityChange: (baseChanges.creativity || 0) + (healthImpact.statChanges.creativity || 0),
    rawLuckChange: (baseChanges.luck || 0) + (healthImpact.statChanges.luck || 0),
    rawKarmaChange: (baseChanges.karma || 0) + (healthImpact.statChanges.karma || 0),
  };
}

export function calculateIntermediateHealth(
  state: GameState,
  rawHealthChange: number,
  newAge: number,
  newHealthStatus: any
): number {
  return clamp(
    state.stats.health + rawHealthChange + (state.stats.energy <= 0 ? -10 : 0) + (newAge >= 35 ? -2 : 0),
    0,
    Math.max(state.stats.maxHealth, 999)
  );
}
