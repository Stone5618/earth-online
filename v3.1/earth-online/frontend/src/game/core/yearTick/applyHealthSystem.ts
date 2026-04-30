import type { GameState, PlayerStats } from '../types';
import { clamp } from '../gameEngine';
import { calculateHealthTransition, syncHealthStatusByValue } from '../../systems/healthSystem';

export interface HealthSystemResult {
  newHealthStatus: any;
  healthImpact: any;
  healthStatusChanged: boolean;
  intermediateHealth: number;
}

export function applyHealthSystem(
  state: GameState,
  rawStatChanges: Partial<PlayerStats>,
  careerResult: { newStats: Partial<PlayerStats>; healthBonus: number }
): HealthSystemResult {
  const mergedStats = { ...state.stats, ...careerResult.newStats };
  let newHealthStatus = calculateHealthTransition(state.stats.healthStatus, mergedStats);
  const healthImpact = getHealthImpact(newHealthStatus);
  
  const rawHealthChange = (rawStatChanges.health || 0) + (healthImpact.statChanges.health || 0) + careerResult.healthBonus;
  const intermediateHealth = clamp(
    state.stats.health + rawHealthChange + (state.stats.energy <= 0 ? -10 : 0) + ((state.stats.age + 1) >= 35 ? -2 : 0),
    0,
    Math.max(state.stats.maxHealth, 999)
  );
  newHealthStatus = syncHealthStatusByValue(newHealthStatus, intermediateHealth);
  
  const healthStatusChanged = newHealthStatus.condition !== state.stats.healthStatus.condition;
  
  return {
    newHealthStatus,
    healthImpact,
    healthStatusChanged,
    intermediateHealth,
  };
}

function getHealthImpact(healthStatus: any) {
  const baseMultipliers = {
    healthy: { income: 1.0, mood: 1.0, energy: 1.0 },
    minor_ill: { income: 0.9, mood: 0.9, energy: 0.9 },
    major_ill: { income: 0.7, mood: 0.7, energy: 0.7 },
    injured: { income: 0.8, mood: 0.8, energy: 0.8 },
    disabled: { income: 0.6, mood: 0.85, energy: 0.6 },
  };
  
  const condition = healthStatus.condition || 'healthy';
  const multipliers = baseMultipliers[condition as keyof typeof baseMultipliers] || baseMultipliers.healthy;
  
  const statChanges: Partial<PlayerStats> = {};
  
  if (condition === 'minor_ill') {
    statChanges.health = -2;
    statChanges.energy = -3;
    statChanges.mood = -2;
  } else if (condition === 'major_ill') {
    statChanges.health = -5;
    statChanges.energy = -8;
    statChanges.mood = -5;
    statChanges.money = -200;
  } else if (condition === 'injured') {
    statChanges.health = -4;
    statChanges.energy = -6;
    statChanges.mood = -4;
    statChanges.money = -100;
  } else if (condition === 'disabled') {
    statChanges.health = -3;
    statChanges.energy = -10;
    statChanges.mood = -6;
    statChanges.money = -150;
  }
  
  return {
    incomeMultiplier: multipliers.income,
    moodMultiplier: multipliers.mood,
    energyMultiplier: multipliers.energy,
    statChanges,
  };
}
