import type { GameState, PlayerStats } from '../types';
import { processCareerYear } from '../../systems';

export interface CareerYearResult {
  newStats: Partial<PlayerStats>;
  healthBonus: number;
  extraIncome: number;
  extraSkillPoints: number;
}

export function processCareerYearTick(stats: PlayerStats): CareerYearResult {
  const careerResult = processCareerYear(stats);
  
  return {
    newStats: careerResult.newStats,
    healthBonus: careerResult.healthBonus,
    extraIncome: careerResult.extraIncome,
    extraSkillPoints: careerResult.extraSkillPoints,
  };
}
